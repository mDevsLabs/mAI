"use client";

import { motion } from "motion/react";
import { Cloud, Sparkles, Database, FileSearch} from "lucide-react";
import Link from "next/link";

export default function CloudProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Fil d'Ariane & En-tête */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/projects" className="hover:text-cyan-600 transition-colors">
            Projets
          </Link>
          <span>/</span>
          <span className="text-cyan-600 font-medium">Cloud</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-slate-900 shadow-md flex items-center justify-center p-4">
              <Cloud className="w-12 h-12 md:w-16 md:h-16 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900">
                  Cloud
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 uppercase tracking-widest">
                  Réflexion
                </span>
              </div>
              <p className="text-cyan-600 font-medium text-lg italic mt-2">
                &quot;Stockage cloud de documents et intégration d&apos;mAI pour des résumés.&quot;
              </p>
            </div>
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
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Projet en phase de conception
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Votre coffre-fort documentaire intelligent augmenté par mAI
          </h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">
            <strong>Cloud</strong> est en cours d&apos;élaboration chez mDevsLabs. Il permettra de stocker de manière sécurisée vos fichiers et documents, tout en profitant d&apos;un agent mAI capable de générer des synthèses automatiques, de répondre à vos questions sur vos bases documentaires (RAG) et d&apos;extraire les données clés.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <Database className="w-6 h-6 text-cyan-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Stockage & Sécurité</h3>
              <p className="text-slate-500 text-xs mt-1">Chiffrement de bout en bout et hébergement flexible pour tous vos documents d&apos;équipe.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-white/80">
              <FileSearch className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Résumés & RAG Vectoriel</h3>
              <p className="text-slate-500 text-xs mt-1">Recherche sémantique instantanée et génération de synthèses automatiques à la volée.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="px-6 py-3.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm">
              🚀 Dépôt GitHub & Accès : En conception
            </div>

            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/80 border border-slate-200 text-slate-900 font-bold hover:bg-white transition-all shadow-xs"
            >
              Suivre les annonces
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
