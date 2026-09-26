"use client";

import { useAuth } from "@/components/auth-provider";
import { CLOUD_STORAGE_LIMITS } from "@/lib/mai-api";
import type { AuthUser } from "@/components/auth-provider";

export interface NavbarAccount {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  accountHref: string;
  accountLabel: string;
  accountInitials: string | null;
  storageLimit: number;
  storageUsed: number;
  storagePercent: number;
}

export function useNavbarAccount(): NavbarAccount {
  const { user, isAuthenticated, loading, logout, cloudStorage } = useAuth();
  const storageLimit =
    CLOUD_STORAGE_LIMITS[user?.tier || "Free"] || CLOUD_STORAGE_LIMITS["Free"];
  const storageUsed = cloudStorage?.bytes_used ?? 0;
  const storagePercent =
    cloudStorage?.percent_used ??
    (storageLimit > 0
      ? Math.min(100, Math.round((storageUsed / storageLimit) * 100))
      : 0);

  return {
    user,
    isAuthenticated,
    loading,
    logout,
    accountHref: isAuthenticated ? "/account" : "/account/login",
    accountLabel: isAuthenticated ? user?.username || "Compte" : "Compte",
    accountInitials: isAuthenticated
      ? (user?.username || user?.email || "U").slice(0, 2).toUpperCase()
      : null,
    storageLimit,
    storageUsed,
    storagePercent,
  };
}
