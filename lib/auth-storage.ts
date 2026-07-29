/**
 * Persistance de la session mAI (localStorage).
 */

export type MaiSession = {
  token: string;
  email?: string;
  username?: string;
  tier?: string;
};

export const MAI_AUTH_KEY = "mai_auth";

export function getSession(): MaiSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MAI_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MaiSession;
    if (!parsed?.token || typeof parsed.token !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: MaiSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MAI_AUTH_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MAI_AUTH_KEY);
}

export function updateSession( partial: Partial<Omit<MaiSession, "token">> & { token?: string }): MaiSession | null {
  const current = getSession();
  if (!current && !partial.token) return null;
  const next: MaiSession = {
    token: partial.token || current!.token,
    email: partial.email ?? current?.email,
    username: partial.username ?? current?.username,
    tier: partial.tier ?? current?.tier,
  };
  setSession(next);
  return next;
}
