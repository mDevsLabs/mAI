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
  uploadAvatar as apiUploadAvatar,
  type MaiUsage,
} from "@/lib/mai-api";
import {
  clearSession,
  getSession,
  setSession,
  type MaiSession,
} from "@/lib/auth-storage";

export type AuthUser = {
  id?: string | number;
  email: string;
  username: string;
  phone?: string;
  tier: string;
  avatarUrl?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  usage: MaiUsage | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (emailOrId: string, password: string) => Promise<any>;
  verifyLogin: (email: string, code: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<any>;
  verifyRegister: (email: string, username: string, password: string, code: string) => Promise<void>;
  logout: () => void;
  refreshUsage: () => Promise<MaiUsage | null>;
  verifyUpgradeCode: (code: string) => Promise<string>;
  updateProfile: (params: { username?: string; email?: string; phone?: string; password?: string; currentPassword?: string; newsletter?: boolean; notify_limits?: boolean }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionToUser(session: MaiSession, usage?: MaiUsage | null): AuthUser | null {
  const email = usage?.email || session.email;
  const username = usage?.username || session.username;
  const phone = usage?.phone;
  const tier = usage?.tier || session.tier || "Free";
  const avatarUrl = usage?.avatarUrl;
  if (!email || !username) return null;
  return { email, username, phone, tier, avatarUrl };
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
      phone: data.phone,
      tier: data.tier,
      avatarUrl: data.avatarUrl,
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
    async (emailOrId: string, password: string) => {
      return await apiLogin({ identifier: emailOrId, email: emailOrId, password });
    },
    []
  );

  const verifyLogin = useCallback(
    async (email: string, code: string) => {
      const res = await import("@/lib/mai-api").then(m => m.verifyLogin({ email, code }));
      if (!res.token) throw new Error("Token manquant dans la réponse.");
      setToken(res.token);
      setSession({ token: res.token, tier: res.tier });
      const data = await getUsage(res.token);
      applyUsage(res.token, data);
    },
    [applyUsage]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      return await apiRegister({ email, username, password });
    },
    []
  );

  const verifyRegister = useCallback(
    async (email: string, username: string, password: string, code: string) => {
      const res = await import("@/lib/mai-api").then(m => m.verifyRegister({ email, username, password, code }));
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
      return res.tier || "Free";
    },
    [applyUsage, token]
  );

  const updateProfile = useCallback(
    async (params: { username?: string; email?: string; phone?: string; password?: string; currentPassword?: string; newsletter?: boolean; notify_limits?: boolean }) => {
      if (!token) throw new Error("Non authentifié.");
      const res = await apiUpdateProfile(token, params);
      if (res.error) throw new Error(res.error);
      const data = await getUsage(token);
      applyUsage(token, data);
    },
    [applyUsage, token]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!token) throw new Error("Non authentifié.");
      const res = await apiUploadAvatar(token, file);
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
      verifyLogin,
      register,
      verifyRegister,
      logout,
      refreshUsage,
      verifyUpgradeCode,
      updateProfile,
      uploadAvatar,
    }),
    [
      user,
      token,
      usage,
      loading,
      login,
      verifyLogin,
      register,
      verifyRegister,
      logout,
      refreshUsage,
      verifyUpgradeCode,
      updateProfile,
      uploadAvatar,
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
