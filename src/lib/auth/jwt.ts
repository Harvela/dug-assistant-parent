/** Decode JWT payload (no signature verification — server is source of truth). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(b64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function rolesFromAccessToken(token: string): string[] {
  const p = decodeJwtPayload(token);
  const roles = p?.roles;
  return Array.isArray(roles) ? roles.map(String) : [];
}
