"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Cpu, Eye, Wrench, ArrowRight, Copy, Check, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { modelsData } from "@/lib/models-data";

export function ModelsShowcase() {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Filter latest flagship models (mAI-1.5 series)
  const flagshipModels = modelsData.filter((m) => m.id.startsWith("mai-1.5"));

  const handleCopy = (tag: string) => {
    const cmd = `ollama run ${tag}`;
    navigator.clipboard.writeText(cmd);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2500);
  };

  return (
    <section className="w-full py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
      >
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900">
            Série <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500">mAI-1.5</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-light mt-1 max-w-xl">
            Modèles de langage et vision locaux optimisés pour Ollama, avec capacités de raisonnement avancé (thinking) et appel d&apos;outils (tools).
          </p>
        </div>

        <Link
          href="/models"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-slate-200 hover:border-purple-300 text-slate-900 text-sm font-bold transition-all shadow-sm w-fit"
        >
          Voir tous les modèles ({modelsData.length})
          <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {flagshipModels.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            className="group relative bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 hover:border-purple-400/60 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Header card avec l'image ou icône (Pleine largeur edge-to-edge) */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {model.squareImage ? (
                    <Image
                      src={model.squareImage}
                      alt={model.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <Cpu className="w-7 h-7 text-purple-400" />
                  )}
                </div>
              </div>

              {/* Titre & Badges */}
              <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                {model.name}
              </h3>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 border border-purple-500/20">
                  <Eye className="w-3 h-3" /> Vision
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20">
                  <Wrench className="w-3 h-3" /> Tools & Thinking
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  {model.context} Contexte
                </span>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                {model.tagline}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200/60">
              {/* Ollama Command box */}
              <div className="flex items-center justify-between bg-slate-900 text-slate-200 p-2.5 rounded-2xl text-xs font-mono">
                <div className="flex items-center gap-2 truncate pr-2">
                  <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate text-slate-300 select-all">ollama run {model.ollamaTag}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(model.ollamaTag)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
                  title="Copier la commande Ollama"
                >
                  {copiedTag === model.ollamaTag ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/models/${model.id}`}
                  className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-purple-600 transition-colors"
                >
                  Fiche Technique
                </Link>
                <Link
                  href="/playground"
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Tester
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
