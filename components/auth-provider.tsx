"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getUsage,
  login as apiLogin,
  register as apiRegister,
  verifyCode as apiVerifyCode,
  updateProfile as apiUpdateProfile,
  type MaiUsage,
} from "@/lib/mai-api";
import {
  clearSession,
  getSession,
  setSession,
  type MaiSession,
} from "@/lib/auth-storage";

export type AuthUser = {
  email: string;
  username: string;
  tier: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  usage: MaiUsage | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refreshUsage: () => Promise<MaiUsage | null>;
  verifyUpgradeCode: (code: string) => Promise<string>;
  updateProfile: (params: { username?: string; password?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionToUser(session: MaiSession, usage?: MaiUsage | null): AuthUser | null {
  const email = usage?.email || session.email;
  const username = usage?.username || session.username;
  const tier = usage?.tier || session.tier || "Free";
  if (!email || !username) return null;
  return { email, username, tier };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [usage, setUsage] = useState<MaiUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const applyUsage = useCallback((tok: string, data: MaiUsage) => {
    setUsage(data);
    setUser({
      email: data.email,
      username: data.username,
      tier: data.tier,
    });
    setSession({
      token: tok,
      email: data.email,
      username: data.username,
      tier: data.tier,
    });
  }, []);

  const refreshUsage = useCallback(async (): Promise<MaiUsage | null> => {
    const session = getSession();
    const tok = session?.token || token;
    if (!tok) {
      setUsage(null);
      return null;
    }
    try {
      const data = await getUsage(tok);
      applyUsage(tok, data);
      return data;
    } catch {
      clearSession();
      setToken(null);
      setUser(null);
      setUsage(null);
      return null;
    }
  }, [applyUsage, token]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const session = getSession();
      if (!session?.token) {
        if (!cancelled) setLoading(false);
        return;
      }

      setToken(session.token);
      const partial = sessionToUser(session);
      if (partial) setUser(partial);

      try {
        const data = await getUsage(session.token);
        if (cancelled) return;
        applyUsage(session.token, data);
      } catch {
        if (cancelled) return;
        clearSession();
        setToken(null);
        setUser(null);
        setUsage(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [applyUsage]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin({ email, password });
      if (!res.token) throw new Error("Token manquant dans la réponse.");
      setToken(res.token);
      setSession({ token: res.token, tier: res.tier, email });
      const data = await getUsage(res.token);
      applyUsage(res.token, data);
    },
    [applyUsage]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const res = await apiRegister({ email, username, password });
      if (!res.token) throw new Error("Token manquant dans la réponse.");
      setToken(res.token);
      setSession({
        token: res.token,
        tier: res.tier,
        email,
        username,
      });
      const data = await getUsage(res.token);
      applyUsage(res.token, data);
    },
    [applyUsage]
  );

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    setUsage(null);
  }, []);

  const verifyUpgradeCode = useCallback(
    async (code: string) => {
      if (!token) throw new Error("Non authentifié.");
      const res = await apiVerifyCode(token, code);
      if (!res.token) throw new Error("Token manquant dans la réponse.");
      setToken(res.token);
      const data = await getUsage(res.token);
      applyUsage(res.token, data);
      return res.tier;
    },
    [applyUsage, token]
  );

  const updateProfile = useCallback(
    async (params: { username?: string; password?: string }) => {
      if (!token) throw new Error("Non authentifié.");
      const res = await apiUpdateProfile(token, params);
      if (res.error) throw new Error(res.error);
      const data = await getUsage(token);
      applyUsage(token, data);
    },
    [applyUsage, token]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      usage,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      refreshUsage,
      verifyUpgradeCode,
      updateProfile,
    }),
    [
      user,
      token,
      usage,
      loading,
      login,
      register,
      logout,
      refreshUsage,
      verifyUpgradeCode,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider.");
  }
  return ctx;
}
