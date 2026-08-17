"use client";

import { motion } from "motion/react";
import { ArrowRight, Layers, Sparkles, Terminal, ShieldCheck, Zap, Cpu } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center text-center relative z-10 pt-2 pb-6">
      {/* Titre Principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center max-w-4xl"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter mb-4 leading-[0.9] md:leading-[0.85] uppercase text-slate-900 select-none"
        >
          Just <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500">build.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="text-base sm:text-xl md:text-2xl font-semibold text-slate-800 tracking-tight max-w-2xl mb-4"
        >
          L&apos;écosystème IA et outils développeur conçu par <span className="text-purple-600 font-bold">mDevsLabs</span>.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mb-8 font-normal leading-relaxed px-4"
        >
          Découvrez la suite mAI (Web, Pulse, CLI, Office, Cloud), nos modèles d&apos;IA de pointe et notre API unifiée haute performance.
        </motion.p>

        {/* Boutons d'Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0 mb-10"
        >
          <Link href="/projects" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl md:rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-slate-900 text-white font-bold flex items-center justify-center gap-2.5 shadow-[0_10px_30px_rgba(147,51,234,0.3)] hover:shadow-[0_15px_35px_rgba(147,51,234,0.4)] transition-all"
            >
              Explorer les Projets
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>

          <Link href="/playground" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl md:rounded-full bg-white/60 backdrop-blur-md border border-slate-200 text-slate-900 font-bold flex items-center justify-center gap-2.5 hover:bg-white/90 hover:border-purple-300 transition-all shadow-sm"
            >
              <Sparkles className="w-5 h-5 text-purple-600" />
              Tester le Playground
            </motion.button>
          </Link>

          <Link href="/docs" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl md:rounded-full bg-white/30 backdrop-blur-md border border-white/60 text-slate-700 font-medium flex items-center justify-center gap-2 hover:bg-white/60 transition-all"
            >
              <Terminal className="w-4 h-4" />
              Documentation
            </motion.button>
          </Link>
        </motion.div>

        {/* Grille de Statistiques / KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-full max-w-4xl">
          {[
            { label: "Modèles IA Disponibles", value: "8+", icon: Cpu, color: "text-purple-600" },
            { label: "Projets Open & Utilitaires", value: "5", icon: Layers, color: "text-blue-600" },
            { label: "Fenêtre de Contexte Max", value: "256K", icon: Zap, color: "text-emerald-600" },
            { label: "Respect de la Vie Privée", value: "100%", icon: ShieldCheck, color: "text-amber-600" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
              className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-purple-200 transition-colors"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-1.5`} />
              <span className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                {stat.value}
              </span>
              <span className="text-xs font-medium text-slate-500 mt-0.5">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
