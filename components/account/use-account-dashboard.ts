"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";
import { getUserApiUsage } from "@/app/actions/api-keys";
import { getUserImageUsage, type UserImageUsageData } from "@/app/actions/image-usage";
import { claimUserReset, getUserAvailableResets, type AvailableResetItem } from "@/app/actions/resets";
import { getAudioUsage, getTierSpeechLimit } from "@/lib/mai-api";
import { getTierQuotaLimit } from "@/lib/tiers";
import {
  getSafeKeyPrefix,
  type ApiUsageStat,
  type AudioUsageData,
} from "./account-utils";

interface ApiUsageKey {
  keyRef?: string;
  id?: string;
  prefix?: string;
  name?: string;
  plan?: string;
  requestCount?: number;
  maxLimit?: number | null;
}

export function useAccountDashboard() {
  const {
    user,
    token,
    usage,
    cloudStorage,
    loading: authLoading,
    isAuthenticated,
    refreshUsage,
    refreshCloudStorage,
  } = useAuth();

  const [apiUsageStats, setApiUsageStats] = useState<ApiUsageStat[]>([]);
  const [apiBoost, setApiBoost] = useState(0);
  const [refreshingApi, setRefreshingApi] = useState(false);

  const [imageUsage, setImageUsage] = useState<UserImageUsageData | null>(null);
  const [refreshingImages, setRefreshingImages] = useState(false);

  const [audioUsage, setAudioUsage] = useState<AudioUsageData | null>(null);
  const [refreshingAudio, setRefreshingAudio] = useState(false);

  const [availableResets, setAvailableResets] = useState<AvailableResetItem[]>([]);
  const [loadingResets, setLoadingResets] = useState(false);
  const [claimingResetId, setClaimingResetId] = useState<number | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshingStorage, setRefreshingStorage] = useState(false);

  const userId = user?.id || user?.email || user?.username || null;
  const userTier = user?.tier || "Free";

  const loadApiUsage = useCallback(async () => {
    if (!userId) return;

    const result = await getUserApiUsage();
    if (!result.success) return;

    if (typeof result.apiBoost === "number") {
      setApiBoost(result.apiBoost);
    }

    const keys = (result.keys || []) as ApiUsageKey[];
    const defaultLimit = getTierQuotaLimit(userTier);
    setApiUsageStats(
      keys.map((key, index) => {
        const legacySecret = "key" in key ? (key as ApiUsageKey & { key?: string }).key : undefined;
        const keyRef =
          key.keyRef ||
          key.id ||
          key.prefix ||
          getSafeKeyPrefix(legacySecret, `clé-api-${index + 1}`);

        return {
          keyRef,
          name: key.name || key.plan || "Clé API",
          prefix: key.prefix || getSafeKeyPrefix(legacySecret, keyRef),
          requestCount: Number(key.requestCount || 0),
          limit:
            key.maxLimit === null || key.maxLimit === undefined
              ? defaultLimit
              : Number(key.maxLimit),
        };
      }),
    );
  }, [userId, userTier]);

  const loadImagesUsage = useCallback(async () => {
    if (!userId) return;
    const result = await getUserImageUsage();
    if (result.success && result.data) {
      setImageUsage(result.data);
    }
  }, [userId]);

  const loadAudioUsage = useCallback(async () => {
    if (!userId) return;

    const defaultLimit = getTierSpeechLimit(userTier);
    if (!token) {
      setAudioUsage({
        tokensUsed: 0,
        requestsCount: 0,
        weeklyLimit: defaultLimit,
        resetAt: "",
        plan: userTier,
      });
      return;
    }

    try {
      const data = await getAudioUsage(token);
      setAudioUsage({
        tokensUsed: Number(data.tokensUsed ?? 0),
        requestsCount: Number(data.requestsCount ?? 0),
        weeklyLimit: Number(data.weeklyLimit ?? defaultLimit),
        resetAt: data.resetAt ?? "",
        plan: data.plan ?? userTier,
      });
    } catch {
      setAudioUsage((current) =>
        current || {
          tokensUsed: 0,
          requestsCount: 0,
          weeklyLimit: defaultLimit,
          resetAt: "",
          plan: userTier,
        },
      );
    }
  }, [token, userId, userTier]);

  const loadResets = useCallback(async () => {
    if (!userId) return;
    setLoadingResets(true);
    try {
      const result = await getUserAvailableResets();
      if (result.success) {
        setAvailableResets(result.resets);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réinitialisations:", error);
    } finally {
      setLoadingResets(false);
    }
  }, [userId]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [usageResult, storageResult] = await Promise.all([
        refreshUsage(),
        refreshCloudStorage(),
      ]);
      await Promise.all([
        loadApiUsage(),
        loadImagesUsage(),
        loadAudioUsage(),
        loadResets(),
      ]);
      return { usageResult, storageResult };
    } finally {
      setRefreshing(false);
    }
  }, [
    loadApiUsage,
    loadAudioUsage,
    loadImagesUsage,
    loadResets,
    refreshCloudStorage,
    refreshUsage,
  ]);

  const refreshApiUsage = useCallback(async () => {
    setRefreshingApi(true);
    try {
      await Promise.all([loadApiUsage(), refreshUsage()]);
    } finally {
      setRefreshingApi(false);
    }
  }, [loadApiUsage, refreshUsage]);

  const refreshImages = useCallback(async () => {
    setRefreshingImages(true);
    try {
      await loadImagesUsage();
    } finally {
      setRefreshingImages(false);
    }
  }, [loadImagesUsage]);

  const refreshAudio = useCallback(async () => {
    setRefreshingAudio(true);
    try {
      await loadAudioUsage();
    } finally {
      setRefreshingAudio(false);
    }
  }, [loadAudioUsage]);

  const refreshStorage = useCallback(async () => {
    setRefreshingStorage(true);
    try {
      return await refreshCloudStorage();
    } finally {
      setRefreshingStorage(false);
    }
  }, [refreshCloudStorage]);

  const claimReset = useCallback(
    async (resetId: number) => {
      if (!userId) return;
      setClaimingResetId(resetId);
      try {
        const result = await claimUserReset(resetId);
        if (!result.success) {
          toast.error(result.error || "Erreur lors de la réinitialisation");
          return;
        }

        toast.success(result.message || "Quota réinitialisé avec succès !");
        setAvailableResets((current) => current.filter((reset) => reset.id !== resetId));
        await refreshAll();
      } catch {
        toast.error("Erreur de connexion au serveur.");
      } finally {
        setClaimingResetId(null);
      }
    },
    [refreshAll, userId],
  );

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    void Promise.all([loadApiUsage(), loadImagesUsage(), loadAudioUsage(), loadResets()]);
  }, [isAuthenticated, loadApiUsage, loadAudioUsage, loadImagesUsage, loadResets, userId]);

  const maiPercent = useMemo(() => {
    if (!usage?.limit) return 0;
    return Math.min(100, Math.round((usage.tokensUsed / usage.limit) * 100));
  }, [usage]);

  return {
    user,
    usage,
    cloudStorage,
    authLoading,
    isAuthenticated,
    apiUsageStats,
    apiBoost,
    imageUsage,
    audioUsage,
    availableResets,
    loadingResets,
    claimingResetId,
    refreshing,
    refreshingApi,
    refreshingImages,
    refreshingAudio,
    refreshingStorage,
    maiPercent,
    loadResets,
    refreshAll,
    refreshApiUsage,
    refreshImages,
    refreshAudio,
    refreshStorage,
    claimReset,
  };
}
