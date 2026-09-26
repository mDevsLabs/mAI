"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { KeyCatalogBanner } from "../shared/KeyCatalogBanner";
import { ModelNavigation } from "../shared/ModelNavigation";
import { useModelCatalog } from "../shared/useModelCatalog";
import { getAudioModelId, type AudioModelItem } from "./audio-model-types";
import { AudioModelFilters, useAudioModelFilters } from "./AudioModelFilters";
import { AudioModelResults } from "./AudioModelResults";
import { AudioVoicesPanel } from "./AudioVoicesPanel";

export default function ApiAudioModelsPage() {
  const router = useRouter();
  const { activeKeyRef, authLoading, availableKeys, isAuthenticated, loadModels, loading, models, openModelId, setOpenModelId } = useModelCatalog<AudioModelItem>({
    emptyError: "Impossible de récupérer la liste des modèles audio.",
    endpoint: "/api/v1/models/audio",
    errorMessage: "Erreur lors de la récupération des modèles audio.",
    getModelId: getAudioModelId,
  });
  const filters = useAudioModelFilters(models);
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace(`/account/login?next=${encodeURIComponent("/account/models/audio")}`);
  }, [authLoading, isAuthenticated, router]);
  if (authLoading || !isAuthenticated) return <div className="flex justify-center items-center py-40 min-h-[100dvh]"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>;

  return <main className="min-h-[100dvh] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8"><div className="max-w-5xl mx-auto space-y-8">
    <ModelNavigation active="audio" />
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2"><div className="text-left space-y-3"><h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900">Modèles de <br className="hidden sm:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500">Synthèse Vocale &amp; Audio</span></h1><p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">Consultez le catalogue interactif des modèles Text-to-Speech (TTS) compatibles OpenAI SDK &amp; Google Cloud TTS accessibles avec votre clé d&apos;API mAI.</p></div><button onClick={() => void loadModels()} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold disabled:opacity-50 self-start"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Actualiser</button></div>
    <KeyCatalogBanner activeKeyRef={activeKeyRef} availableKeys={availableKeys} onSelect={(keyRef) => void loadModels(keyRef)} />
    <AudioVoicesPanel />
    <AudioModelFilters controller={filters} />
    <AudioModelResults loading={loading} models={filters.filteredModels} onToggle={(modelId) => setOpenModelId(openModelId === modelId ? null : modelId)} openModelId={openModelId} />
  </div></main>;
}
