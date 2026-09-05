"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles, BookOpen, Layers, Zap, Cloud, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <div className="flex flex-col gap-6 pt-2 pb-6">
      {/* Bannière Galaxie — Introducing mAI-2 */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(76,29,149,0.35)]">
        {/* Image de fond galaxie */}
        <div className="absolute inset-0">
          <Image
            src="/mai-2/16-9-cover.png"
            alt="Galaxie mAI-2"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04040f] via-[#04040f]/55 to-[#04040f]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04040f]/70 via-transparent to-[#04040f]/50" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 py-16 sm:py-24 md:py-32">
          {/* Badge de lancement */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Nouveau · Nouvelle génération mAI
          </motion.div>

          {/* Titre Principal */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter mb-5 leading-[0.95] md:leading-[0.9] text-white select-none drop-shadow-lg max-w-4xl"
          >
            Introducing <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-300">mAI-2</span>, our best model, for&nbsp;everyone.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl font-medium text-slate-200 tracking-tight max-w-2xl mb-3"
          >
            Une intelligence de haut niveau. Plus rapide. Plus polyvalente.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl mb-8 leading-relaxed"
          >
            La plus grande avancée de notre laboratoire : raisonnement, codage, création,
            multimodal texte + images et jusqu&apos;à 1 million de tokens de contexte.
            Disponible pour tous, via l&apos;API mAI.
          </motion.p>

          {/* Boutons d'Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mb-6"
          >
            <Link href="/models/mai-2" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl md:rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white font-bold flex items-center justify-center gap-2.5 shadow-[0_10px_35px_rgba(139,92,246,0.45)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.55)] transition-all"
              >
                <Cloud className="w-5 h-5" />
                Découvrir mAI-2
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link href="/news/introducing-mai-2" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl md:rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white font-bold flex items-center justify-center gap-2.5 hover:bg-white/20 transition-all shadow-lg"
              >
                <BookOpen className="w-5 h-5 text-purple-300" />
                Lire l&apos;annonce
              </motion.button>
            </Link>

            <Link href="/models" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl md:rounded-full bg-transparent backdrop-blur-md border border-white/15 text-slate-200 font-medium flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all"
              >
                <Layers className="w-4 h-4" />
                Tous les modèles
              </motion.button>
            </Link>
          </motion.div>

          {/* Grille de Statistiques / KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 w-full max-w-4xl">
            {[
              { label: "Modèles IA Disponibles", value: "10+", icon: Layers, color: "text-purple-300" },
              { label: "Contexte mAI-2", value: "1M", icon: BookOpen, color: "text-blue-300" },
              { label: "Multimodal", value: "Texte + Images", icon: Eye, color: "text-emerald-300" },
              { label: "API performante", value: "800ms", icon: Zap, color: "text-amber-300" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.35)] hover:border-purple-300/40 transition-colors"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-1.5`} />
                <span className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-slate-300 mt-0.5">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
