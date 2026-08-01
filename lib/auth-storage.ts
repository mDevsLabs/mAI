/**
 * Persistance de la session mAI (localStorage + Cookies sécurisés).
 */

export type MaiSession = {
  token: string;
  email?: string;
  username?: string;
  tier?: string;
};

export const MAI_AUTH_KEY = "mai_auth";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
  return null;
}

function setCookie(name: string, value: string, days: number = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getSession(): MaiSession | null {
  if (typeof window === "undefined") return null;
  try {
    // 1. Essayer depuis localStorage
    const raw = localStorage.getItem(MAI_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MaiSession;
      if (parsed?.token && typeof parsed.token === "string") return parsed;
    }

    // 2. Sinon essayer depuis les cookies du navigateur
    const cookieUser = getCookie("mai_user");
    if (cookieUser) {
      const parsed = JSON.parse(cookieUser) as MaiSession;
      if (parsed?.token) {
        localStorage.setItem(MAI_AUTH_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function setSession(session: MaiSession): void {
  if (typeof window === "undefined") return;
  const str = JSON.stringify(session);
  localStorage.setItem(MAI_AUTH_KEY, str);
  setCookie("mai_user", str, 30);
  setCookie("mai_token", session.token, 30);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MAI_AUTH_KEY);
  deleteCookie("mai_user");
  deleteCookie("mai_token");
}

export function updateSession(partial: Partial<Omit<MaiSession, "token">> & { token?: string }): MaiSession | null {
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
