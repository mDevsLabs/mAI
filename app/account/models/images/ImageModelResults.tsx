"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ChevronUp, Copy, Loader2, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import type { ImageModelItem } from "./image-model-types";

type ImageCodeTab = "curl" | "python" | "ts";

type ImageModelResultsProps = {
  loading: boolean;
  models: ImageModelItem[];
  onToggle: (modelId: string) => void;
  openModelId: string | null;
};

function imageSnippet(modelId: string, tab: ImageCodeTab): string {
  if (tab === "curl") {
    return `curl -X POST https://mai.val.run/v1/images/generations \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "prompt": "Un paysage futuriste cyberpunk avec des néons sous la pluie, 8k",
    "size": "1024x1024",
    "response_format": "url"
  }'`;
  }
  if (tab === "python") {
    return `import requests

url = "https://mai.val.run/v1/images/generations"
headers = {"Authorization": "Bearer VOTRE_CLE_API", "Content-Type": "application/json"}
payload = {
    "model": "${modelId}",
    "prompt": "Un paysage futuriste cyberpunk avec des néons sous la pluie, 8k",
    "size": "1024x1024",
    "response_format": "url"
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
  }
  return `const response = await fetch("https://mai.val.run/v1/images/generations", {
  method: "POST",
  headers: {"Authorization": "Bearer VOTRE_CLE_API", "Content-Type": "application/json"},
  body: JSON.stringify({
    model: "${modelId}",
    prompt: "Un paysage futuriste cyberpunk avec des néons sous la pluie, 8k",
    size: "1024x1024",
    response_format: "url",
  }),
});
console.log(await response.json());`;
}

export function ImageModelResults({ loading, models, onToggle, openModelId }: ImageModelResultsProps) {
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, ImageCodeTab>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyId = (modelId: string) => {
    void navigator.clipboard.writeText(modelId);
    setCopiedId(modelId);
    toast.success(`ID du modèle copié : ${modelId}`);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80"><Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" /><p className="text-sm text-slate-500">Chargement des modèles d&apos;images...</p></div>;
  }
  if (models.length === 0) {
    return <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 space-y-3"><p className="font-bold text-slate-700">Aucun modèle d&apos;image trouvé</p><p className="text-xs text-slate-400">Essayez un autre mot-clé ou réinitialisez les filtres.</p></div>;
  }

  return (
    <div className="space-y-4">
      {models.map((model) => {
        const isOpen = openModelId === model.id;
        const provider = model.id.includes("/") ? model.id.split("/")[0] : model.provider || "Comet API";
        const isFlux = model.id.toLowerCase().includes("flux");
        const currentTab = activeCodeTab[model.id] || "curl";
        return (
          <div key={model.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${isOpen ? "border-purple-300 shadow-md ring-1 ring-purple-100" : "border-slate-200/80"}`}>
            <button onClick={() => onToggle(model.id)} className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/80">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isOpen ? <ChevronUp className="w-5 h-5 text-purple-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                <div className="truncate"><div className="flex items-center gap-2"><h2 className="font-bold text-slate-900 truncate">{model.name || model.id}</h2>{isFlux && <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black uppercase">Flux</span>}</div><p className="text-xs text-slate-500 font-mono truncate">{model.id}</p></div>
              </div>
              <div className="flex items-center gap-2 shrink-0"><span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Text-to-Image</span><span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white uppercase">{provider}</span></div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
                  <div><h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Description</h3><p className="text-sm text-slate-700 leading-relaxed">{model.description}</p></div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3"><h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2"><SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />Spécifications &amp; Paramètres de Requête</h4><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">{[["prompt", "Texte descriptif"], ["size", "1024x1024 / 512x512"], ["response_format", "url ou b64_json"], ["negative_prompt", "Optionnel"]].map(([name, label]) => <div key={name} className="p-2.5 rounded-lg bg-white border border-slate-200"><p className="text-slate-400 font-mono text-[10px]">{name}</p><p className="font-bold text-slate-800">{label}</p></div>)}</div></div>
                  <div className="space-y-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2">{(["curl", "python", "ts"] as const).map((tab) => <button key={tab} onClick={() => setActiveCodeTab((current) => ({ ...current, [model.id]: tab }))} className={`px-3 py-1 rounded-lg text-xs font-bold ${currentTab === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{tab === "ts" ? "TypeScript" : tab === "curl" ? "cURL" : "Python"}</button>)}</div><button onClick={() => copyId(model.id)} className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600">{copiedId === model.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}Copier l&apos;ID</button></div><div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto"><pre>{imageSnippet(model.id, currentTab)}</pre></div></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
