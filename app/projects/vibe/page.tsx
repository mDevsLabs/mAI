"use client";

import { motion } from "motion/react";
import { ExternalLink, Users, MessagesSquare, Image as ImageIcon, ShieldCheck, Sparkles, Github } from "lucide-react";
import Link from "next/link";
import { GithubRelease } from "@/components/github-release";
import { GithubRepoStats } from "@/components/github-repo-stats";

export default function VibeProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Fil d'Ariane & En-tête */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/projects" className="hover:text-rose-600 transition-colors">
            Projets
          </Link>
          <span>/</span>
          <span className="text-rose-600 font-medium">Vibe</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-slate-900 shadow-md flex items-center justify-center p-4">
              <Users className="w-12 h-12 md:w-16 md:h-16 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900">
                  Vibe
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 uppercase tracking-widest">
                  Bêta
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/60 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  Réseau social
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/60 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  Android
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/60 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  iOS
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/60 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  IA mAI intégrée
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/60 border border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  Open Source
                </span>
              </div>
              <p className="text-rose-600 font-medium text-lg italic mt-2">
                &quot;Le réseau social où l&apos;IA mAI fait partie de la conversation.&quot;
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <GithubRelease repo="mDevsLabs/Vibe" />
            <GithubRepoStats repo="mDevsLabs/Vibe" />
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
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-400/20 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Le réseau social avec l&apos;IA intégrée, open source et sécurisé
          </h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
            <strong>Vibe</strong> est le réseau social de l&apos;écosystème mAI. Publiez, partagez et échangez avec votre communauté tandis que l&apos;IA mAI est intégrée nativement : assistante de conversation, aide à la rédaction de posts, génération d&apos;images et recommandations intelligentes. Open source et sécurisé, Vibe est disponible sur <a href="https://vibe-officiel.vercel.app" target="_blank" rel="noreferrer" className="text-rose-600 hover:text-rose-800 underline font-medium">vibe-officiel.vercel.app</a>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <MessagesSquare className="w-6 h-6 text-rose-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Feed social & conversations</h3>
              <p className="text-slate-500 text-xs mt-1">Posts, likes, commentaires et profils, avec l&apos;assistant mAI disponible au fil de votre feed.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <Sparkles className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Création assistée par IA</h3>
              <p className="text-slate-500 text-xs mt-1">Rédigez vos posts avec l&apos;aide de mAI et illustrez-les grâce à la génération d&apos;images.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Open source & sécurisé</h3>
              <p className="text-slate-500 text-xs mt-1">Code ouvert sur GitHub, modération assistée par IA et respect de vos données.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <ImageIcon className="w-6 h-6 text-amber-500 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Recommandations intelligentes</h3>
              <p className="text-slate-500 text-xs mt-1">Un feed personnalisé, adapté à vos centres d&apos;intérêt grâce aux modèles mAI.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://vibe-officiel.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-md"
            >
              Essayer Vibe
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href="https://github.com/mDevsLabs/Vibe"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-rose-600 transition-all shadow-md"
            >
              <Github className="w-4 h-4" />
              Voir le dépôt GitHub
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              href="/support/new"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/80 border border-slate-200 text-slate-900 font-bold hover:bg-white transition-all shadow-xs"
            >
              Signaler un problème
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
