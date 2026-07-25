"use client";

import { motion } from "motion/react";
import { ExternalLink, Terminal } from "lucide-react";
import Link from "next/link";
import { GithubRepoStats } from "@/components/github-repo-stats";
import Image from "next/image";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      <div className="text-left space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900"
        >
          Projets <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">
            mDevsLabs
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-base md:text-lg font-light mt-2 md:mt-4"
        >
          Découvrez nos outils pensés pour votre productivité.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Project 1 : mAI CLI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="group relative bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(168,85,247,0.2)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="text-6xl font-black italic tracking-tighter select-none text-slate-900">
              01
            </div>
          </div>

          <div className="flex flex-col h-full relative z-10">
            <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center bg-slate-900 text-purple-400 shadow-md">
              <Terminal className="w-9 h-9" />
            </div>

            <h2 className="text-3xl font-black mb-2 text-slate-900 flex items-center gap-2">
              mAI CLI
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold uppercase tracking-widest">
                Accès Anticipé
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                macOS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Linux
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Windows
              </span>
            </div>

            <p className="text-purple-600 font-medium mb-4 italic">
              &quot;L&apos;assistant de développement qui vit dans votre terminal.&quot;
            </p>

            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Un assistant IA natif, gratuit et BYOK, capable de relire des PRs, gérer vos tickets, exécuter des commandes et envoyer des messages (WhatsApp, Discord, X, Reddit) sans quitter le terminal.
            </p>

            <div className="flex flex-wrap items-center gap-3 my-3">
              <Link
                href="/projects/mai-cli"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-bold hover:bg-white/60 transition-all w-fit"
              >
                Découvrir mAI CLI
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-auto">
              <GithubRepoStats repo="mDevsLabs/mAI-CLI" />
            </div>
          </div>
        </motion.div>

        {/* Project 2 : mSearch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="group relative bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 hover:border-blue-500/30 transition-all overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.2)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="text-6xl font-black italic tracking-tighter select-none text-slate-900">
              02
            </div>
          </div>

          <div className="flex flex-col h-full relative z-10">
            <div className="w-16 h-16 rounded-xl mb-4 flex items-center justify-center">
              <Image
                src="/msearch.PNG"
                alt="mSearch logo"
                width={64}
                height={64}
                sizes="64px"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            <h2 className="text-3xl font-black mb-2 text-slate-900">mSearch</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Windows
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                macOS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Linux
              </span>
            </div>

            <p className="text-blue-600 font-medium mb-4 italic">
              &quot;Avec mSearch, recherchez en toute sécurité !&quot;
            </p>

            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Un outil de recherche unifié ultra-rapide, téléchargeable et natif
              pour tous vos appareils.
            </p>

            <div className="flex flex-wrap items-center gap-3 my-3">
              <Link
                href="/projects/msearch"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-bold hover:bg-white/60 transition-all w-fit"
              >
                Découvrir mSearch
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-auto">
              <GithubRepoStats repo="mDevsLabs/mSearch" />
            </div>
          </div>
        </motion.div>

        {/* Project 3 : Snob */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="group relative bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 hover:border-amber-500/30 transition-all overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.2)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="text-6xl font-black italic tracking-tighter select-none text-slate-900">
              03
            </div>
          </div>

          <div className="flex flex-col h-full relative z-10">
            <div className="w-16 h-16 rounded-xl mb-4 flex items-center justify-center">
              <Image
                src="/snob.png"
                alt="Snob logo"
                width={64}
                height={64}
                sizes="64px"
                className="w-full h-full object-contain drop-shadow-md rounded-2xl"
              />
            </div>

            <h2 className="text-3xl font-black mb-2 text-slate-900">Snob</h2>

            <div className="flex flex-row flex-wrap gap-2 mb-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Web
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Android
              </span>
            </div>

            <p className="text-amber-600 font-medium mb-4 italic">
              &quot;L&apos;expérience ultime de Block Blast revisitée.&quot;
            </p>

            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Un jeu de puzzle de prestige alliant un design élégant à des mécaniques profondément tactiques.
            </p>

            <div className="flex flex-wrap items-center gap-3 my-3">
              <Link
                href="/projects/snob"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-bold hover:bg-white/60 transition-all w-fit"
              >
                Découvrir Snob
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-auto">
              <GithubRepoStats repo="mDevsLabs/Snob" />
            </div>
          </div>
        </motion.div>

        {/* Project 4 : mAI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="group relative bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(168,85,247,0.2)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="text-6xl font-black italic tracking-tighter select-none text-slate-900">
              04
            </div>
          </div>

          <div className="flex flex-col h-full relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mb-4 flex items-center justify-center p-2.5">
              <Image
                src="/mai.png"
                alt="mAI logo"
                width={64}
                height={64}
                sizes="64px"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            <h2 className="text-3xl font-black mb-2 text-slate-900">mAI</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 font-bold uppercase tracking-widest">
                Archivé
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Web
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Windows
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                macOS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 uppercase font-bold tracking-widest">
                Linux
              </span>
            </div>

            <p className="text-purple-600 font-medium mb-4 italic">
              &quot;Avec mAI, passez à la vitesse supérieure !&quot;
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              L&apos;assistant IA de nouvelle génération, conçu pour fluidifier
              votre workflow et booster votre créativité au quotidien.
            </p>

            <div className="flex flex-wrap items-center gap-3 my-3">
              <Link
                href="/projects/mai"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-bold hover:bg-white/60 transition-all w-fit"
              >
                Découvrir mAI
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-auto">
              <GithubRepoStats repo="mDevsLabs/mAI" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}