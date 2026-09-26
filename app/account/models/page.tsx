"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { KeyCatalogBanner } from "./shared/KeyCatalogBanner";
import { ModelNavigation } from "./shared/ModelNavigation";
import { useModelCatalog } from "./shared/useModelCatalog";
import { TextModelFilters, useTextModelFilters } from "./text/TextModelFilters";
import { TextModelResults } from "./text/TextModelResults";
import { getTextModelId, type TextModelItem } from "./text/text-model-types";

export default function ApiModelsPage() {
  const router = useRouter();
  const {
    activeKeyRef,
    authLoading,
    availableKeys,
    isAuthenticated,
    loadModels,
    loading,
    models,
    openModelId,
    setOpenModelId,
  } = useModelCatalog<TextModelItem>({
    emptyError: "Impossible de récupérer la liste des modèles.",
    endpoint: "/api/v1/models",
    errorMessage: "Erreur lors de la récupération des modèles.",
    getModelId: getTextModelId,
  });
  const filters = useTextModelFilters(models);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/account/login?next=${encodeURIComponent("/account/models")}`);
    }
  }, [authLoading, isAuthenticated, router]);

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
        <ModelNavigation active="text" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="text-left space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900">
              Modèles de <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                l&apos;API
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">
              Consultez le catalogue interactif des modèles accessibles via votre clé d&apos;API. Filtrez par laboratoire, fourchettes de contexte et outils, puis triez instantanément.
            </p>
          </div>
          <button
            onClick={() => void loadModels()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        <KeyCatalogBanner
          activeKeyRef={activeKeyRef}
          availableKeys={availableKeys}
          onSelect={(keyRef) => void loadModels(keyRef)}
        />
        <TextModelFilters controller={filters} loading={loading} />
        <TextModelResults
          hasActiveFilters={filters.hasActiveFilters}
          loading={loading}
          models={filters.filteredModels}
          onReset={filters.resetFilters}
          onToggle={(modelId) => setOpenModelId(openModelId === modelId ? null : modelId)}
          openModelId={openModelId}
          selectedTools={filters.selectedTools}
          totalModels={models.length}
        />
      </div>
    </main>
  );
}
