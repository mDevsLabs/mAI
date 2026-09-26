"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getUserApiUsage } from "@/app/actions/api-keys";
import type { UserApiKeyUsage } from "@/app/actions/api-keys";
import { useAuth } from "@/components/auth-provider";

type ModelCatalogOptions<T> = {
  emptyError: string;
  endpoint: `/api/v1/models${string}`;
  errorMessage: string;
  getModelId: (model: T) => string;
};

export function useModelCatalog<T>({
  emptyError,
  endpoint,
  errorMessage,
  getModelId,
}: ModelCatalogOptions<T>) {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const [models, setModels] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKeyRef, setActiveKeyRef] = useState<string | null>(null);
  const [availableKeys, setAvailableKeys] = useState<UserApiKeyUsage[]>([]);
  const [openModelId, setOpenModelId] = useState<string | null>(null);

  const loadModels = useCallback(async (preferredKeyRef?: string) => {
    setLoading(true);
    try {
      const usage = await getUserApiUsage();
      const activeKeys = usage.success ? usage.keys.filter((key) => key.isActive) : [];
      setAvailableKeys(activeKeys);
      const selectedKeyRef = preferredKeyRef !== undefined
        ? (activeKeys.some((key) => key.keyRef === preferredKeyRef) ? preferredKeyRef : null)
        : (activeKeys[0]?.keyRef || null);
      setActiveKeyRef(selectedKeyRef);

      const headers: Record<string, string> = {};
      if (selectedKeyRef && token) {
        headers.Authorization = `Bearer ${token}`;
        headers["x-mai-key-ref"] = selectedKeyRef;
      }
      const res = await fetch(endpoint, {
        headers,
        cache: selectedKeyRef ? "no-store" : "default",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || errorMessage);
      if (!Array.isArray(data.data)) {
        toast.error(emptyError);
        return;
      }

      const nextModels = data.data as T[];
      setModels(nextModels);
      if (nextModels.length > 0) setOpenModelId(getModelId(nextModels[0]));
    } catch (caughtError) {
      console.error(errorMessage, caughtError);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [emptyError, endpoint, errorMessage, getModelId, token]);

  useEffect(() => {
    if (isAuthenticated && token) void loadModels();
  }, [isAuthenticated, loadModels, token]);

  return {
    activeKeyRef,
    authLoading,
    availableKeys,
    isAuthenticated,
    loadModels,
    loading,
    models,
    openModelId,
    setOpenModelId,
  };
}
