import { decodeJwtPayload, rolesFromAccessToken } from './jwt';

const KEY = 'dug_parent_auth_session_v1';

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  email: string;
  sub: string;
  roles: string[];
};

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AuthSession;
    if (!data.accessToken || !data.refreshToken) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveSessionFromTokens(
  accessToken: string,
  refreshToken: string,
  profile?: { email?: string; sub?: string; roles?: string[] },
): AuthSession {
  const fromJwt = decodeJwtPayload(accessToken) ?? {};
  const session: AuthSession = {
    accessToken,
    refreshToken,
    email: profile?.email ?? String(fromJwt.email ?? ''),
    sub: profile?.sub ?? String(fromJwt.sub ?? ''),
    roles: profile?.roles?.length
      ? profile.roles
      : rolesFromAccessToken(accessToken),
  };
  localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent('dug-parent-auth-changed'));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('dug-parent-auth-changed'));
}

export function getAccessToken(): string | null {
  return loadSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return loadSession()?.refreshToken ?? null;
}
