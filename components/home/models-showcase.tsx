"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Eye, Wrench, ArrowRight, Copy, Check, Cloud, Layers } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { modelsData } from "@/lib/models-data";

export function ModelsShowcase() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Nouvelle génération cloud mAI-2
  const flagshipModels = modelsData.filter((m) => m.cloud);

  const handleCopy = (id: string) => {
    const apiId = `mai/${id}`;
    navigator.clipboard.writeText(apiId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-[10px] font-black uppercase tracking-widest mb-3">
            <Layers className="w-3 h-3" /> Nouvelle génération
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
            Introducing{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-300">
              mAI-2
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light mt-1 max-w-xl">
            Notre meilleure génération, pour tous : raisonnement, codage, création, multimodal
            texte + images et jusqu&apos;à 1M tokens de contexte. Exclusivement via l&apos;API mAI.
          </p>
        </div>

        <Link
          href="/models"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 hover:border-purple-300/50 text-white text-sm font-bold transition-all shadow-lg w-fit"
        >
          Voir tous les modèles ({modelsData.length})
          <ArrowRight className="w-4 h-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {flagshipModels.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            className="group relative bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-purple-400/40 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.25)] flex flex-col justify-between"
          >
            {/* Bannière galaxie du modèle */}
            <div className="relative w-full h-44 sm:h-52 overflow-hidden">
              <Image
                src={model.bannerImage}
                alt={model.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1f] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-white/20 shadow-lg">
                  {model.squareImage ? (
                    <Image
                      src={model.squareImage}
                      alt={model.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Cloud className="w-6 h-6 text-purple-300 m-auto" />
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-purple-300 transition-colors drop-shadow-md">
                  {model.name}
                </h3>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/25">
                    <Eye className="w-3 h-3" /> Vision
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/25">
                    <Wrench className="w-3 h-3" /> Tools
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                    {model.context} Contexte
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/25">
                    <Cloud className="w-3 h-3" /> API mAI
                  </span>
                </div>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {model.tagline}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10">
                {/* Identifiant API */}
                <div className="flex items-center justify-between bg-slate-950/80 border border-white/10 text-slate-200 p-2.5 rounded-2xl text-xs font-mono">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Cloud className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate text-slate-300 select-all">mai/{model.id}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopy(model.id)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Copier l'identifiant API"
                  >
                    {copiedId === model.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </motion.button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/models/${model.id}`}
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs hover:from-purple-400 hover:to-indigo-400 transition-all shadow-md"
                  >
                    Découvrir {model.name}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
