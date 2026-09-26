"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  Eye,
  Layers,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { MaiModelItem } from "./mai-model-types";

type CodeTab = "ollama" | "python";

export function MaiModelResults({
  hasActiveFilters,
  loading,
  models,
  onReset,
  onToggle,
  openModelId,
  totalModels,
}: {
  hasActiveFilters: boolean;
  loading: boolean;
  models: MaiModelItem[];
  onReset: () => void;
  onToggle: (id: string) => void;
  openModelId: string | null;
  totalModels: number;
}) {
  const [activeTabs, setActiveTabs] = useState<Record<string, CodeTab>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copié !`);
    window.setTimeout(() => setCopiedText(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
        <p className="text-sm text-slate-500">Chargement des modèles mAI...</p>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 space-y-3">
        <p className="text-base font-bold text-slate-700">Aucun modèle mAI trouvé</p>
        <p className="text-xs text-slate-400">Modifiez vos critères ou réinitialisez les filtres.</p>
        {hasActiveFilters && (
          <button type="button" onClick={onReset} className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
            <X className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {models.map((model) => {
        const isOpen = openModelId === model.id;
        const currentTab = activeTabs[model.id] || "ollama";
        const tag = model.ollama_tag || model.id;
        const ollamaCommand = `ollama run ${tag}`;
        return (
          <div key={model.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${isOpen ? "border-purple-300 shadow-md ring-1 ring-purple-100" : "border-slate-200/80 hover:border-slate-300"}`}>
            <button type="button" onClick={() => onToggle(model.id)} className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/80">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isOpen ? <ChevronUp className="w-5 h-5 text-purple-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{model.name}</h2>
                    {model.id.includes("1.5") && <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase">v1.5 Flagship</span>}
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate">{tag}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {model.parameters && <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">{model.parameters}</span>}
                {model.capabilities?.vision && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hidden sm:inline-flex items-center gap-1"><Eye className="w-3 h-3" /> Vision</span>}
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white uppercase">{(model.context_length / 1024).toFixed(0)}K</span>
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
                  <div className="space-y-1.5">
                    {model.tagline && <p className="text-xs font-bold text-purple-700">{model.tagline}</p>}
                    <p className="text-sm text-slate-700 leading-relaxed">{model.description}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Capacités prises en charge</h3>
                    <div className="flex flex-wrap gap-2">
                      {model.capabilities?.coding && <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> Développement & Code</span>}
                      {model.capabilities?.reasoning && <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Raisonnement</span>}
                      {model.capabilities?.vision && <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Vision Multimodale</span>}
                      {model.capabilities?.functionCalling && <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> Appels d&apos;Outils</span>}
                      {model.capabilities?.jsonOutput && <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">JSON Structuré</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-purple-600" /> Fenêtre de contexte</h4>
                      <p className="text-2xl font-black text-slate-900">{model.context_length.toLocaleString("fr-FR")}</p>
                      <p className="text-[11px] text-slate-500">Sortie maximale : <strong>{model.max_output_tokens?.toLocaleString("fr-FR") || "32 768"} tokens</strong></p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-purple-600" /> Matériel conseillé</h4>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-white border border-slate-200"><p className="text-[10px] text-slate-400">RAM</p><p className="font-bold">{model.recommended_hardware?.ram || "8GB"}</p></div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200"><p className="text-[10px] text-slate-400">VRAM min</p><p className="font-bold">{model.recommended_hardware?.minVram || "4GB"}</p></div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200"><p className="text-[10px] text-slate-400">VRAM rec.</p><p className="font-bold">{model.recommended_hardware?.recommendedVram || "8GB"}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {(["ollama", "python"] as CodeTab[]).map((tab) => (
                          <button type="button" key={tab} onClick={() => setActiveTabs((current) => ({ ...current, [model.id]: tab }))} className={`px-3 py-1 rounded-lg text-xs font-bold ${currentTab === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
                            {tab === "ollama" ? "Commande Ollama" : "Python (Ollama SDK)"}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={() => copy(ollamaCommand, "Commande Ollama")} className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600">
                        {copiedText === ollamaCommand ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copier
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                      {currentTab === "ollama" ? (
                        <pre>{`# Télécharger et lancer instantanément le modèle en local\n${ollamaCommand}`}</pre>
                      ) : (
                        <pre>{`import ollama\n\nresponse = ollama.chat(\n    model="${tag}",\n    messages=[{"role": "user", "content": "Bonjour ! Explique-moi le fonctionnement de ton architecture."}]\n)\n\nprint(response["message"]["content"])`}</pre>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 font-medium">Licence : {model.license || "MIT"}</span>
                    {model.huggingface_tag && (
                      <a href={`https://huggingface.co/${model.huggingface_tag}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-purple-600 hover:underline">
                        Hugging Face ({model.huggingface_tag}) <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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
