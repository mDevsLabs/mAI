"use client";

import { motion } from "motion/react";
import { ExternalLink, Terminal,    Github} from "lucide-react";
import Link from "next/link";
import { GithubRelease } from "@/components/github-release";

export default function CliProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Fil d'Ariane & En-tête */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/projects" className="hover:text-purple-600 transition-colors">
            Projets
          </Link>
          <span>/</span>
          <span className="text-purple-600 font-medium">CLI</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-slate-900 shadow-md flex items-center justify-center p-4">
              <Terminal className="w-12 h-12 md:w-16 md:h-16 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900">
                  CLI
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 uppercase tracking-widest">
                  Bêta
                </span>
              </div>
              <p className="text-purple-600 font-medium text-lg italic mt-2">
                &quot;Discussions et séances de codage dans le terminal CLI via mAI.&quot;
              </p>
            </div>
          </div>
          <GithubRelease repo="mDevsLabs/CLI" />
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
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            L&apos;assistant IA conçu pour les développeurs en ligne de commande
          </h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
            <strong>CLI</strong> est l&apos;interface en ligne de commande professionnelle de mAI. Exécutez des commandes système en langage naturel, générez du code à la volée, analysez vos logs et résolvez les erreurs sans quitter votre terminal.
          </p>

          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-sm mb-8 overflow-x-auto shadow-inner">
            <span className="text-purple-400"># Installation rapide</span>
            <br />
            <span className="text-slate-400">$</span> npm install -g @mdevslabs/mai-cli
            <br /><br />
            <span className="text-purple-400"># Démarrer une session</span>
            <br />
            <span className="text-slate-400">$</span> mai chat
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/mDevsLabs/CLI"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-purple-600 transition-all shadow-md"
            >
              <Github className="w-4 h-4" />
              Voir le dépôt GitHub
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/80 border border-slate-200 text-slate-900 font-bold hover:bg-white transition-all shadow-xs"
            >
              Guide d&apos;utilisation CLI
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
