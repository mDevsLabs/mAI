"use client";

import { motion } from "motion/react";
import { ExternalLink, Globe, Zap, MessageSquare,  Github} from "lucide-react";
import Link from "next/link";
import { GithubRelease } from "@/components/github-release";

export default function WebProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Fil d'Ariane & En-tête */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/projects" className="hover:text-purple-600 transition-colors">
            Projets
          </Link>
          <span>/</span>
          <span className="text-purple-600 font-medium">Web</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-slate-900 shadow-md flex items-center justify-center p-4">
              <Globe className="w-12 h-12 md:w-16 md:h-16 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900">
                  Web
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 uppercase tracking-widest">
                  Release Candidate
                </span>
              </div>
              <p className="text-purple-600 font-medium text-lg italic mt-2">
                &quot;L&apos;application d&apos;IA en ligne directe, accessible et intuitive.&quot;
              </p>
            </div>
          </div>
          <GithubRelease repo="mDevsLabs/Web" />
        </motion.div>
      </div>

      {/* Hero Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/20 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Discutez simplement et directement avec mAI dans votre navigateur
          </h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
            <strong>Web</strong> est l&apos;application en ligne officielle de l&apos;écosystème mAI. Conçue pour offrir une expérience de chat épurée, ultra-réactive et sans friction, elle vous permet d&apos;interagir avec tous les modèles mAI et vos LLMs préférés sans aucune configuration complexe.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Streaming en temps réel</h3>
              <p className="text-slate-500 text-xs mt-1">Génération ultra-rapide token par token avec affichage dynamique du Markdown et du code.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <Zap className="w-6 h-6 text-amber-500 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Multi-Modèles mAI</h3>
              <p className="text-slate-500 text-xs mt-1">Basculez instantanément entre les séries mAI-1.5 (Light, Apex, Opal) et vos modèles cloud favoris.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/mDevsLabs/Web"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-purple-600 transition-all shadow-md"
            >
              <Github className="w-4 h-4" />
              Voir le dépôt GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
