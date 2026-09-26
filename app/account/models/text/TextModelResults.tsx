"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ChevronUp, Copy, Layers, Loader2, Wrench, X } from "lucide-react";
import toast from "react-hot-toast";
import type { TextModelItem } from "./text-model-types";
import { formatModelTokens } from "./TextModelFilters";

function formatContextShort(tokens?: number): string {
  if (!tokens) return "—";
  if (tokens >= 1_048_576) return `${Math.round(tokens / 1_048_576)}M`;
  if (tokens >= 1024) return `${Math.round(tokens / 1024)}K`;
  return String(tokens);
}

type TextModelResultsProps = {
  hasActiveFilters: boolean;
  loading: boolean;
  models: TextModelItem[];
  onReset: () => void;
  onToggle: (modelId: string) => void;
  openModelId: string | null;
  selectedTools: string[];
  totalModels: number;
};

export function TextModelResults({
  hasActiveFilters,
  loading,
  models,
  onReset,
  onToggle,
  openModelId,
  selectedTools,
  totalModels,
}: TextModelResultsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (modelId: string) => {
    void navigator.clipboard.writeText(modelId);
    setCopiedId(modelId);
    toast.success(`ID du modèle copié : ${modelId}`);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Chargement des modèles de l&apos;API...</p>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <p className="text-base font-bold text-slate-700">Aucun modèle correspondant trouvé</p>
        <p className="text-xs text-slate-400">Essayez de modifier vos critères de recherche ou réinitialisez les filtres.</p>
        {hasActiveFilters && (
          <button onClick={onReset} className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
            <X className="w-3.5 h-3.5" /> Réinitialiser les filtres
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {models.map((model) => {
        const isOpen = openModelId === model.id;
        const provider = model.owned_by || (model.id.includes("/") ? model.id.split("/")[0] : "");
        const hasTools = (model.supported_parameters || []).includes("tools");
        const contextShort = formatContextShort(model.maxContext);
        return (
          <div key={model.id} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${isOpen ? "border-slate-300 shadow-sm ring-1 ring-slate-200" : "border-slate-200/80 hover:border-slate-300"}`}>
            <button onClick={() => onToggle(model.id)} className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">{model.name || model.id}</h2>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"><Layers className="w-3 h-3" />{contextShort}</span>
                {hasTools ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><Wrench className="w-3 h-3" /><span className="hidden sm:inline">Tools</span></span> : <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-200">Sans tools</span>}
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white border border-slate-800 uppercase tracking-wider">{provider || "—"}</span>
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="border-t border-slate-100">
                  <div className="p-6 space-y-6">
                    <p className="text-slate-600 text-sm leading-relaxed">{model.description || "Modèle de langage et d'intelligence artificielle haute performance accessible via l'API unifiée mAI."}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-blue-500" />Max context length:</p>
                        <p className="text-base font-bold text-slate-900">{formatModelTokens(model.maxContext)} tokens</p>
                        <p className="text-[11px] text-slate-400 font-medium">≈ {contextShort} contexte</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                        <p className="text-xs text-slate-500 font-medium">Max output length:</p>
                        <p className="text-base font-bold text-slate-900">{formatModelTokens(model.maxOutput)} tokens</p>
                        <p className="text-[11px] text-slate-400 font-medium">{hasTools ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><Wrench className="w-3 h-3" />Tools supportés</span> : <span className="text-slate-400">Sans function calling</span>}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 sm:col-span-2">
                        <p className="text-xs text-slate-500 font-medium">Paramètres supportés (Supported parameters):</p>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {model.supported_parameters && model.supported_parameters.length > 0 ? model.supported_parameters.map((parameter) => {
                            const isSelected = selectedTools.includes(parameter);
                            return <span key={parameter} className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg border shadow-2xs transition-colors ${parameter === "tools" ? (hasTools ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-700") : isSelected ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-slate-200 text-slate-700"}`}>{parameter}</span>;
                          }) : <span className="text-xs font-mono font-medium text-slate-500">temperature, top_p, max_tokens, stream, stop</span>}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0 flex-1"><p className="text-xs text-slate-500 font-medium">Identifiant du modèle (API ID):</p><p className="text-sm font-mono font-bold text-purple-700 mt-0.5 select-all break-all">{model.id}</p></div>
                        <button onClick={() => handleCopy(model.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all cursor-pointer shrink-0">
                          {copiedId === model.id ? <><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Copié !</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copier l&apos;ID</span></>}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <span className="sr-only">{totalModels} modèles au total</span>
    </div>
  );
}
