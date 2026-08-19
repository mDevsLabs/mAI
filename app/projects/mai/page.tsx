"use client";

import { motion } from "motion/react";
import {
  ExternalLink,
  Sparkles,
  Zap,
  BrainCircuit,
  MessageSquare,
  Code,
  Layout,
  Globe,
  Github,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { GithubRelease } from "@/components/github-release";

export default function MaiProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Header */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link
            href="/projects"
            className="hover:text-purple-600 transition-colors"
          >
            Projets
          </Link>
          <span>/</span>
          <span className="text-purple-600 font-medium">mAI Web</span>
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
                  "drop-shadow(0 0 0px rgba(168, 85, 247, 0))",
                  "drop-shadow(0 0 15px rgba(168, 85, 247, 0.3))",
                  "drop-shadow(0 0 0px rgba(168, 85, 247, 0))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 md:w-28 md:h-28 rounded-3xl md:rounded-full bg-white/30 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center justify-center p-4"
            >
              <Image
                src="/mai.png"
                alt="mAI Web logo"
                width={112}
                height={112}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900 drop-shadow-sm">
                  mAI Web
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 font-bold uppercase tracking-widest">
                  Archivé
                </span>
              </div>
              <p className="text-purple-600 font-medium text-lg italic mt-1">
                Passez à la vitesse supérieure !
              </p>
            </div>
          </div>
          <GithubRelease repo="mDevsLabs/mAI" showPreRelease={true} />
        </motion.div>
      </div>

      {/* Hero Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-400/30 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/30 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            L&apos;intelligence artificielle réinventée pour vous.
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-3xl">
            mAI Web est votre assistant personnel de nouvelle génération. Il intègre les modèles de langage les plus avancés dans une interface fluide, intuitive et hautement personnalisable.
          </p>

          <div className="flex flex-row items-center gap-2 sm:gap-3 overflow-x-auto p-4 -m-4 max-w-full whitespace-nowrap scrollbar-none">
            <a
              href="https://mai-devs.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-semibold text-xs sm:text-sm hover:bg-white/60 transition-colors shrink-0"
            >
              Découvrir mAI Web
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/mDevsLabs/mAI"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-semibold text-xs sm:text-sm hover:bg-white/60 transition-colors shrink-0"
            >
              GitHub
              <Github className="w-4 h-4" />
            </a>
            <Link
              href="/changelog/mai"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-semibold text-xs sm:text-sm hover:bg-white/60 transition-colors shrink-0"
            >
              Changelog
              <BookOpen className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Fonctionnalités Principales
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BrainCircuit className="w-6 h-6 text-purple-600" />}
            title="Modèles Avancés"
            description="Accès aux derniers modèles de langage avec une compréhension contextuelle profonde."
            delay={0.2}
          />
          <FeatureCard
            icon={<Layout className="w-6 h-6 text-purple-600" />}
            title="Interface Liquid Glass"
            description="Une expérience visuelle époustouflante avec des effets de transparence et de flou."
            delay={0.3}
          />
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
            title="Discussions Fluides"
            description="Historique persistant, recherche intelligente et organisation par dossiers."
            delay={0.4}
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-purple-600" />}
            title="Performances Rapides"
            description="Temps de réponse optimisés pour une productivité sans interruption."
            delay={0.5}
          />
          <FeatureCard
            icon={<Code className="w-6 h-6 text-purple-600" />}
            title="Outils Intégrés"
            description="Coloration syntaxique, rendu markdown et exécution de code simplifiée."
            delay={0.6}
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6 text-purple-600" />}
            title="Application Web"
            description="Une expérience réactive et puissante accessible directement dans votre navigateur."
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
      className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] hover:shadow-[0_8px_24px_0_rgba(31,38,135,0.1)] transition-all group"
    >
      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}