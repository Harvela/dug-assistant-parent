import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  loadSession,
  saveSessionFromTokens,
} from '../auth/session';

export function getApiBase(): string {
  return (import.meta.env.VITE_API_URL || 'http://localhost:3010').replace(
    /\/$/,
    '',
  );
}

function buildUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  const rt = getRefreshToken();
  if (!rt) return false;
  refreshInFlight = (async () => {
    try {
      const res = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) return false;
      const body = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      const prev = loadSession();
      saveSessionFromTokens(body.accessToken, body.refreshToken, {
        email: prev?.email,
        sub: prev?.sub,
        roles: prev?.roles,
      });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export type ApiError = {
  statusCode: number;
  message: string[];
};

export async function apiRequest(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (
    init.body &&
    typeof init.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(buildUrl(path), { ...init, headers });

  if (res.status === 401 && !retried) {
    const ok = await tryRefresh();
    if (ok) return apiRequest(path, init, true);
    clearSession();
    window.dispatchEvent(new CustomEvent('dug-parent-auth-expired'));
  }

  return res;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiRequest(path, init);
  if (!res.ok) {
    let err: ApiError = {
      statusCode: res.status,
      message: [res.statusText],
    };
    try {
      const j = (await res.json()) as { statusCode?: number; message?: unknown };
      err = {
        statusCode: j.statusCode ?? res.status,
        message: Array.isArray(j.message)
          ? j.message.map(String)
          : [String(j.message ?? res.statusText)],
      };
    } catch {
      /* ignore */
    }
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiVoid(path: string, init?: RequestInit): Promise<void> {
  const res = await apiRequest(path, init);
  if (!res.ok) {
    let err: ApiError = {
      statusCode: res.status,
      message: [res.statusText],
    };
    try {
      const j = (await res.json()) as { statusCode?: number; message?: unknown };
      err = {
        statusCode: j.statusCode ?? res.status,
        message: Array.isArray(j.message)
          ? j.message.map(String)
          : [String(j.message ?? res.statusText)],
      };
    } catch {
      /* ignore */
    }
    throw err;
  }
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch(buildUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    let message = 'Login failed';
    try {
      const j = (await res.json()) as { message?: unknown };
      if (Array.isArray(j.message)) message = j.message.join(', ');
      else if (j.message) message = String(j.message);
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<{ accessToken: string; refreshToken: string }>;
}

export async function meRequest(): Promise<{
  id: string;
  email: string;
  roles: string[];
}> {
  return apiJson('/auth/me');
}
