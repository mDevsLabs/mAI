"use client";

import { AudioWaveform, Mic } from "lucide-react";

const DEFAULT_VOICES = [
  { id: "flux-alexis-en", name: "Alexis", desc: "Voix féminine chaleureuse, naturelle et claire (FR/EN)" },
  { id: "flux-michael-en", name: "Michael", desc: "Voix masculine posée, fluide et professionnelle (FR/EN)" },
  { id: "flux-stacy-en", name: "Stacy", desc: "Voix féminine expressive, vive et dynamique (FR/EN)" },
  { id: "flux-sam-en", name: "Sam", desc: "Voix masculine profonde, idéale pour narration & podcast (FR/EN)" },
  { id: "flux-asteria-en", name: "Asteria", desc: "Voix féminine moderne, douce et mélodieuse (FR/EN)" },
  { id: "flux-orion-en", name: "Orion", desc: "Voix masculine cinématique, intense et charismatique (FR/EN)" },
];

export function AudioVoicesPanel() {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2"><Mic className="w-5 h-5 text-purple-600" /><h2 className="text-base font-bold text-slate-900">Voix Naturelles Disponibles (TTS Studio)</h2></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {DEFAULT_VOICES.map((voice) => <div key={voice.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1"><div className="flex items-center justify-between"><span className="font-black text-sm text-slate-900 flex items-center gap-1.5"><AudioWaveform className="w-3.5 h-3.5 text-purple-600" />{voice.name}</span><code className="text-[10px] font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold">{voice.id}</code></div><p className="text-xs text-slate-500">{voice.desc}</p></div>)}
      </div>
    </div>
  );
}
