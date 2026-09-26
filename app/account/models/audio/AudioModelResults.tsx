"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ChevronUp, Copy, Loader2, Volume2, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import type { AudioModelItem } from "./audio-model-types";

type AudioCodeTab = "curl" | "python" | "ts";

function snippet(modelId: string, tab: AudioCodeTab): string {
  if (tab === "curl") return `curl -X POST https://mai.val.run/v1/audio/speech \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "input": "Bonjour ! Bienvenue sur la plateforme mAI.",
    "voice": "flux-alexis-en",
    "response_format": "mp3",
    "speed": 1.0
  }' --output speech.mp3`;
  if (tab === "python") return `from openai import OpenAI
client = OpenAI(api_key="VOTRE_CLE_API", base_url="https://mai.val.run/v1")
response = client.audio.speech.create(model="${modelId}", voice="flux-alexis-en", input="Bonjour ! Bienvenue sur la plateforme mAI.")
response.stream_to_file("speech.mp3")`;
  return `import OpenAI from "openai";
const client = new OpenAI({ apiKey: "VOTRE_CLE_API", baseURL: "https://mai.val.run/v1" });
const mp3 = await client.audio.speech.create({ model: "${modelId}", voice: "flux-alexis-en", input: "Bonjour ! Bienvenue sur la plateforme mAI." });`;
}

type AudioModelResultsProps = { loading: boolean; models: AudioModelItem[]; onToggle: (id: string) => void; openModelId: string | null };

export function AudioModelResults({ loading, models, onToggle, openModelId }: AudioModelResultsProps) {
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, AudioCodeTab>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyId = (id: string) => { void navigator.clipboard.writeText(id); setCopiedId(id); toast.success(`ID du modèle copié : ${id}`); window.setTimeout(() => setCopiedId(null), 2000); };
  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-3"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /><p className="text-sm text-slate-500">Chargement du catalogue des modèles audio...</p></div>;
  if (!models.length) return <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3"><Volume2 className="w-10 h-10 text-slate-300 mx-auto" /><h3 className="font-bold text-slate-900">Aucun modèle audio trouvé</h3><p className="text-sm text-slate-500">Aucun modèle audio ne correspond à vos critères.</p></div>;
  return <div className="space-y-4">{models.map((model) => {
    const isOpen = openModelId === model.id;
    const provider = model.id.includes("/") ? model.id.split("/")[0] : model.owned_by || "mAI";
    const currentTab = activeCodeTab[model.id] || "curl";
    return <div key={model.id} className={`bg-white rounded-3xl border transition-all duration-200 ${isOpen ? "border-purple-300 ring-2 ring-purple-500/10" : "border-slate-200/80"}`}>
      <button onClick={() => onToggle(model.id)} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full text-left"><div className="space-y-1.5 flex-1"><div className="flex items-center gap-2"><span className="text-lg font-black text-slate-900">{model.name}</span><span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase">{provider}</span></div><div className="flex items-center gap-2 text-xs text-slate-500"><code className="font-mono bg-slate-100 px-2 py-0.5 rounded-md">{model.id}</code><button onClick={(event) => { event.stopPropagation(); copyId(model.id); }}>{copiedId === model.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}</button></div></div>{isOpen ? <ChevronUp className="w-5 h-5 text-purple-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</button>
      <AnimatePresence initial={false}>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6"><p className="text-sm text-slate-600 leading-relaxed">{model.description}</p><div className="space-y-2"><h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-purple-600" />Paramètres API Supportés</h4><div className="flex flex-wrap gap-2">{(model.supported_parameters || ["voice", "speed", "response_format", "input"]).map((parameter) => <span key={parameter} className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60">{parameter}</span>)}</div></div><div className="space-y-3 pt-2"><div className="flex items-center justify-between"><h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Intégration dans vos applications</h4><div className="flex gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">{(["curl", "python", "ts"] as const).map((tab) => <button key={tab} onClick={() => setActiveCodeTab((current) => ({ ...current, [model.id]: tab }))} className={`px-2.5 py-1 rounded-lg ${currentTab === tab ? "bg-white text-purple-700" : "text-slate-600"}`}>{tab === "ts" ? "TS" : tab.toUpperCase()}</button>)}</div></div><div className="relative rounded-2xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto"><button onClick={() => { void navigator.clipboard.writeText(snippet(model.id, currentTab)); toast.success("Extrait de code copié !"); }} className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300"><Copy className="w-4 h-4" /></button><pre className="pr-12">{snippet(model.id, currentTab)}</pre></div></div></div></motion.div>}</AnimatePresence>
    </div>;
  })}</div>;
}
