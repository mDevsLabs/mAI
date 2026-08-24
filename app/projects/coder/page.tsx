"use client";

import { motion } from "motion/react";
import {
  ExternalLink,
  Code2,
  Bot,
  Wrench,
  Terminal,
  Github,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { GithubRelease } from "@/components/github-release";
import { GithubRepoStats } from "@/components/github-repo-stats";

export default function CoderProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16 max-w-6xl mx-auto">
      {/* Fil d'Ariane & En-tête */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/projects" className="hover:text-purple-600 transition-colors">
            Projets
          </Link>
          <span>/</span>
          <span className="text-purple-600 font-medium">Coder</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-slate-900 shadow-md flex items-center justify-center p-4">
              <Code2 className="w-12 h-12 md:w-16 md:h-16 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900">
                  Coder
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 uppercase tracking-widest">
                  Alpha
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/60 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  Agents IA
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/60 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  MCP Tools
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/60 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  macOS / Linux / Windows
                </span>
              </div>
              <p className="text-purple-600 font-medium text-lg italic mt-2">
                &quot;IDE IA de nouvelle génération avec agents autonomes et orchestration d&apos;outils MCP.&quot;
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <GithubRelease repo="mDevsLabs/Coder" />
            <GithubRepoStats repo="mDevsLabs/Coder" />
          </div>
        </motion.div>
      </div>

      {/* Hero Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">
            L&apos;environnement de développement pensé pour l&apos;ère des Agents IA
          </h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
            <strong>mAI Coder</strong> fusionne la puissance d&apos;un éditeur de code moderne et réactif avec un système d&apos;agents autonomes capables d&apos;analyser vos dépôts, exécuter des modifications multi-fichiers, lancer des tests et interagir avec votre environnement grâce au standard <strong>MCP (Model Context Protocol)</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <Bot className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Agents IA Autonomes</h3>
              <p className="text-slate-500 text-xs mt-1">
                Déléguez des tâches complexes de refactoring, création de fonctionnalités et correction de bugs à des sous-agents spécialisés.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <Wrench className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Écosystème MCP Natif</h3>
              <p className="text-slate-500 text-xs mt-1">
                Connectez vos serveurs MCP personnalisés pour accorder à vos assistants l&apos;accès à vos bases de données, API internes et outils CLI.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <Terminal className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Terminal &amp; Exécution Sécurisée</h3>
              <p className="text-slate-500 text-xs mt-1">
                Exécution proactive de commandes, capture des logs d&apos;erreur et analyse en temps réel pour une itération instantanée.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <Cpu className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Orchestration Multi-Modèles</h3>
              <p className="text-slate-500 text-xs mt-1">
                Basculez entre modèles locaux ultra-rapides (mAI-1.5 4B/9B/27B) et modèles cloud à très large contexte selon les besoins du projet.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/mDevsLabs/Coder"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-purple-600 transition-all shadow-md text-sm"
            >
              <Github className="w-4 h-4" />
              Voir le dépôt GitHub
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              href="/downloads"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/80 border border-slate-200 text-slate-900 font-bold hover:bg-white transition-all shadow-xs text-sm"
            >
              Télécharger l&apos;IDE Coder
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
