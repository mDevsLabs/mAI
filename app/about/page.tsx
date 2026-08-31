"use client";

import { motion } from "motion/react";
import { Target, Rocket, Heart, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 relative z-10">
      {/* Hero Section */}
      <div className="text-left space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900"
        >
          L&apos;équipe <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">
            mDevsLabs
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-base md:text-lg font-light mt-2 md:mt-4 max-w-2xl"
        >
          Une équipe passionnée qui développe des outils innovants, transparents et accessibles pour simplifier votre quotidien numérique. <Rocket className="inline w-4 h-4 align-middle" /><Sparkles className="inline w-4 h-4 align-middle" />
        </motion.p>
      </div>

      {/* Objectifs Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Notre Mission</h3>
          <p className="text-slate-500 leading-relaxed">
            Fournir des solutions technologiques de pointe qui repoussent les limites de l'expérience utilisateur, tout en garantissant des performances exceptionnelles et une simplicité d'utilisation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
            <Rocket className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">L&apos;Innovation</h3>
          <p className="text-slate-500 leading-relaxed">
            Nous croyons en un web plus rapide, plus intelligent et plus esthétique. Chaque projet que nous concevons intègre les dernières avancées pour vous offrir le meilleur de la technologie moderne.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">La Communauté</h3>
          <p className="text-slate-500 leading-relaxed">
            mDevsLabs est construit avec et pour notre communauté. Votre retour est essentiel dans notre processus de développement pour créer des outils qui répondent réellement à vos besoins.
          </p>
        </motion.div>
      </div>

      {/* CTA */}
      <div className="text-center max-w-2xl mx-auto w-full mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
        >
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-slate-900 mb-4">
            Rejoignez l&apos;aventure
          </h2>
          <p className="text-slate-500 mb-8">
            Découvrez tous nos projets actuels et ce que nous vous préparons pour l&apos;avenir.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm"
          >
            Explorer les projets
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}