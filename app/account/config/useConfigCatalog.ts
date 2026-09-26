"use client";

import { useEffect, useMemo, useState } from "react";
import { maiModelsList } from "@/lib/mai-models";
import type { ApiKeyMetadata } from "@/lib/api-key-types";
import { useAuth } from "@/components/auth-provider";
import {
  DEFAULT_CLOUD_MODEL,
  DEFAULT_LOCAL_MODEL,
  type ConfigHostTarget,
} from "./config-data";

export type ConfigModelOption = {
  id: string;
  name: string;
  type: "mai" | "cloud";
};

export function useConfigCatalog() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CLOUD_MODEL);
  const [hostTarget, setHostTarget] = useState<ConfigHostTarget>("cloud");
  const [userKeys, setUserKeys] = useState<ApiKeyMetadata[]>([]);
  const [selectedKeyRef, setSelectedKeyRef] = useState("");
  const [cloudModels, setCloudModels] = useState<ConfigModelOption[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelsRetry, setModelsRetry] = useState(0);
  const [keysLoading, setKeysLoading] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) {
      setUserKeys([]);
      setSelectedKeyRef("");
      return;
    }

    let cancelled = false;
    async function loadKeys() {
      setKeysLoading(true);
      setKeysError(null);
      try {
        const res = await fetch("/api/dev-keys", {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !Array.isArray(data.keys)) {
          throw new Error(data.error?.message || "Métadonnées indisponibles.");
        }
        const activeKeys = (data.keys as ApiKeyMetadata[]).filter((key) => key.isActive);
        if (cancelled) return;
        setUserKeys(activeKeys);
        setSelectedKeyRef((current) => {
          if (current && activeKeys.some((key) => key.keyRef === current)) return current;
          return activeKeys[0]?.keyRef || "";
        });
      } catch (error) {
        if (cancelled) return;
        setUserKeys([]);
        setSelectedKeyRef("");
        setKeysError(error instanceof Error ? error.message : "Impossible de charger les clés.");
      } finally {
        if (!cancelled) setKeysLoading(false);
      }
    }
    void loadKeys();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, token]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    async function loadModels() {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const headers: Record<string, string> = {};
        if (selectedKeyRef) {
          if (!token) throw new Error("Session expirée. Reconnectez-vous pour utiliser une clé.");
          headers["x-mai-key-ref"] = selectedKeyRef;
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch("/api/v1/models", {
          headers,
          credentials: "include",
          cache: selectedKeyRef ? "no-store" : "default",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Le catalogue de modèles est indisponible.");
        if (!Array.isArray(data.data)) throw new Error("Réponse de catalogue invalide.");

        // Le groupe Cloud n'affiche que les modèles réellement reçus de
        // `GET /api/v1/models` : aucune liste de secours locale n'est fusionnée.
        const received = new Map<string, ConfigModelOption>();
        for (const model of data.data as Array<Record<string, unknown>>) {
          if (!model?.id) continue;
          const id = String(model.id);
          received.set(id, {
            id,
            name: `${String(model.name || id)} (${id})`,
            type: "cloud",
          });
        }
        if (cancelled) return;
        const models = Array.from(received.values());
        setCloudModels(models);
        // Sélection par défaut : le premier modèle reçu, sinon aucun.
        setSelectedModel((current) =>
          current && models.some((model) => model.id === current) ? current : models[0]?.id ?? "",
        );
      } catch (error) {
        if (cancelled) return;
        setCloudModels([]);
        setModelsError(error instanceof Error ? error.message : "Erreur de chargement des modèles.");
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    }
    void loadModels();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, modelsRetry, selectedKeyRef, token]);

  useEffect(() => {
    const isLocalModel = Boolean(maiModelsList.find((model) => model.ollamaTag === selectedModel)?.ollamaTag);
    if (hostTarget === "cloud" && isLocalModel) {
      setSelectedModel(cloudModels[0]?.id ?? DEFAULT_CLOUD_MODEL);
    } else if (hostTarget !== "cloud" && !isLocalModel) {
      setSelectedModel(DEFAULT_LOCAL_MODEL);
    }
  }, [cloudModels, hostTarget, selectedModel]);

  const allModels = useMemo<ConfigModelOption[]>(
    () => [
      ...maiModelsList
        .filter((model) => model.ollamaTag)
        .map((model) => ({
          id: model.ollamaTag as string,
          name: `${model.name} (mAI Local)`,
          type: "mai" as const,
        })),
      ...cloudModels,
    ],
    [cloudModels],
  );

  return {
    allModels,
    cloudModels,
    hostTarget,
    isAuthenticated,
    keysError,
    keysLoading,
    modelsError,
    modelsLoading,
    selectedKeyRef,
    selectedModel,
    setHostTarget,
    setModelsRetry,
    setSelectedKeyRef,
    setSelectedModel,
    token,
    userKeys,
  };
}
