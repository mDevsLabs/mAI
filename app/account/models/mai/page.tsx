"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";
import { ModelNavigation } from "../shared/ModelNavigation";
import { MaiModelFilters, useMaiModelFilters } from "./MaiModelFilters";
import { MaiModelResults } from "./MaiModelResults";
import type { MaiModelItem } from "./mai-model-types";

export default function ApiMaiModelsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [models, setModels] = useState<MaiModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModelId, setOpenModelId] = useState<string | null>(null);
  const filters = useMaiModelFilters(models);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/account/login?next=%2Faccount%2Fmodels%2Fmai");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadModels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/models/mai", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.data)) {
        throw new Error("Catalogue mAI invalide");
      }
      const localModels = (data.data as MaiModelItem[]).filter(
        (model) => model.execution_mode !== "cloud_api",
      );
      setModels(localModels);
      setOpenModelId((current) =>
        localModels.some((model) => model.id === current)
          ? current
          : localModels[0]?.id || null,
      );
    } catch (error) {
      console.error("Erreur chargement modèles mAI:", error);
      toast.error("Impossible de récupérer les modèles mAI.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) void loadModels();
  }, [isAuthenticated, loadModels]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-40 min-h-[100dvh]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span>Vérification de la session...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <ModelNavigation active="mai" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900">
              Modèles <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                mAI Propriétaires
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">
              Catalogue interactif des modèles souverains développés par mDevsLabs. Filtrez par série, taille et capacités locales.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadModels()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-md">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight flex flex-wrap items-center gap-2">
                  Modèles 100% Locaux, Souverains & Gratuits
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-400/30">
                    Open Weights (GGUF / Ollama)
                  </span>
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Optimisés pour Ollama ou LM Studio, sans consommer de quota API Cloud.
                </p>
              </div>
            </div>
            <Link href="/downloads" className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-black hover:bg-purple-50 shrink-0 hidden sm:inline-flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Téléchargements
            </Link>
          </div>
        </div>

        <MaiModelFilters controller={filters} models={models} />
        <MaiModelResults
          hasActiveFilters={filters.hasActiveFilters}
          loading={loading}
          models={filters.filteredModels}
          onReset={filters.resetFilters}
          onToggle={(id) => setOpenModelId((current) => (current === id ? null : id))}
          openModelId={openModelId}
          totalModels={models.length}
        />
      </div>
    </main>
  );
}
