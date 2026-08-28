"use client";

import { motion } from "motion/react";
import {
  ExternalLink,
  Gamepad2,
  Map,
  Zap,
  Ticket,
  Palette,
  Crown,
  Download,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SnobProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Header */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link
            href="/projects"
            className="hover:text-amber-600 transition-colors"
          >
            Projets
          </Link>
          <span>/</span>
          <span className="text-amber-600 font-medium">Snob</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-6">
            <motion.div
              animate={{
                filter: [
                  "drop-shadow(0 0 0px rgba(245, 158, 11, 0))",
                  "drop-shadow(0 0 15px rgba(245, 158, 11, 0.3))",
                  "drop-shadow(0 0 0px rgba(245, 158, 11, 0))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 md:w-28 md:h-28 rounded-3xl md:rounded-full bg-white/30 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center justify-center p-4"
            >
              <Image
                src="/snob.png"
                alt="Snob logo"
                width={112}
                height={112}
                className="w-full h-full object-contain drop-shadow-md rounded-2xl"
                priority
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900 drop-shadow-sm">
                  Snob
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 font-bold uppercase tracking-widest">
                  Archivé
                </span>
              </div>
              <p className="text-amber-600 font-medium text-lg italic mt-1">
                L&apos;expérience ultime revisitée.
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
        className="relative bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/30 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-400/30 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            Le Block Blast Tactique de Prestige 💎
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-3xl">
            Snob est un jeu de puzzle de blocs alliant un design ultra-fluide et moderne à des mécaniques de jeu profondément revisitées. L&apos;interface élégante est magnifiée par des effets de particules magiques et des coloris sophistiqués.
          </p>

          <div className="flex flex-row items-center gap-2 sm:gap-3 overflow-x-auto p-4 -m-4 max-w-full whitespace-nowrap scrollbar-none">
            <a
              href="https://snob-officiel.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-full bg-amber-500 shadow-[0_8px_32px_0_rgba(245,158,11,0.2)] text-white font-semibold text-xs sm:text-sm hover:bg-amber-600 transition-colors shrink-0"
            >
              Jouer à Snob
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              href="/downloads"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-semibold text-xs sm:text-sm hover:bg-white/60 transition-colors shrink-0"
            >
              Télécharger Snob
              <Download className="w-4 h-4 text-slate-900" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Fonctionnalités Principales
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Gamepad2 className="w-6 h-6 text-amber-600" />}
            title="Mode Classique"
            description="Pas de chronomètre, pas de pression. Maximisez votre score, gérez vos pièces et battez vos records."
            delay={0.2}
          />
          <FeatureCard
            icon={<Map className="w-6 h-6 text-amber-600" />}
            title="Mode Campagne"
            description="Parcourez 100 niveaux progressifs avec des objectifs uniques (Lignes, Score, Survie)."
            delay={0.3}
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-amber-600" />}
            title="Mode Blitz"
            description="Un défi frénétique de 120 secondes. Chaque ligne effacée rajoute 2 secondes de temps. Soyez rapide !"
            delay={0.4}
          />
          <FeatureCard
            icon={<Ticket className="w-6 h-6 text-amber-600" />}
            title="Snob Pass"
            description="Débloquez 20 paliers de récompenses prestigieuses en accumulant de l'XP de saison."
            delay={0.5}
          />
          <FeatureCard
            icon={<Palette className="w-6 h-6 text-amber-600" />}
            title="Skins & Effets"
            description="Personnalisez votre jeu avec 17 skins de blocs et des traînées de particules magiques."
            delay={0.6}
          />
          <FeatureCard
            icon={<Crown className="w-6 h-6 text-amber-600" />}
            title="Prestige & Rangs"
            description="Atteignez le niveau 100 pour passer un Prestige et monter dans la hiérarchie de la haute société."
            delay={0.7}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] hover:shadow-[0_8px_24px_0_rgba(245,158,11,0.1)] hover:border-amber-500/20 transition-all group"
    >
      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
