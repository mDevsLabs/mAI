"use client";

import { motion } from "motion/react";
import {
  Server,
  Shield,
  Zap,
  Lock,
  Terminal,
  Globe,
  Github,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { GithubRelease } from "@/components/github-release";
import { GithubRepoStats } from "@/components/github-repo-stats";

export default function OpenProviderProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Header */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link
            href="/projects"
            className="hover:text-pink-600 transition-colors"
          >
            Projets
          </Link>
          <span>/</span>
          <span className="text-pink-600 font-medium">OpenProvider</span>
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
                  "drop-shadow(0 0 0px rgba(236, 72, 153, 0))",
                  "drop-shadow(0 0 15px rgba(236, 72, 153, 0.3))",
                  "drop-shadow(0 0 0px rgba(236, 72, 153, 0))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 md:w-28 md:h-28 rounded-3xl md:rounded-3xl bg-white/30 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center justify-center p-4"
            >
              <Image
                src="/openprovider.png"
                alt="OpenProvider logo"
                width={112}
                height={112}
                className="w-full h-full object-contain drop-shadow-md rounded-2xl"
                priority
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900 drop-shadow-sm">
                  OpenProvider
                </h1>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-600 font-bold uppercase tracking-widest">
                  CLI
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
              <p className="text-pink-600 font-medium text-lg italic mt-1">
                &quot;Rendez Codex ouvert !&quot;
              </p>
            </div>
          </div>
          <GithubRelease repo="mDevsLabs/OpenProvider" />
        </motion.div>
      </div>

      {/* Hero Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-400/30 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/30 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            Libérez vos assistants IA.
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            OpenProvider est un proxy universel de fournisseurs conçu pour OpenAI Codex, Claude Code, Claude Desktop et Grok Build.
            Il vous permet de rediriger les requêtes de vos assistants vers n&apos;importe quel LLM, tout en gardant un contrôle
            total sur l&apos;exécution locale et la sécurité.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="https://github.com/mDevsLabs/OpenProvider"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-pink-600 text-white shadow-md font-semibold text-sm sm:text-base hover:bg-pink-700 transition-colors"
            >
              Voir sur GitHub
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <Link
              href="/docs/openprovider"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm text-slate-900 font-semibold text-sm hover:bg-white transition-colors"
            >
              Documentation
              <BookOpen className="w-4 h-4 text-pink-600" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-6 h-6 text-pink-500" />
          Fonctionnalités Principales
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Globe className="w-6 h-6 text-pink-600" />}
            title="Proxy Universel"
            description="Connectez vos outils IA (Claude Code, Grok, Codex) à n'importe quel fournisseur de modèles compatible."
            delay={0.2}
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6 text-pink-600" />}
            title="Exécution Locale"
            description="S'exécute directement sur votre machine pour garantir la confidentialité et la sécurité de vos requêtes."
            delay={0.3}
          />
          <FeatureCard
            icon={<Terminal className="w-6 h-6 text-pink-600" />}
            title="Intégration CLI"
            description="Interface en ligne de commande simple et puissante pour gérer votre proxy en toute fluidité."
            delay={0.4}
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-pink-600" />}
            title="Transparence"
            description="Fonctionne en arrière-plan sans nécessiter de modification du code source de vos assistants existants."
            delay={0.5}
          />
          <FeatureCard
            icon={<Github className="w-6 h-6 text-pink-600" />}
            title="100% Open Source"
            description="Code entièrement ouvert et vérifiable. Vous gardez le contrôle total sur l'outil."
            delay={0.6}
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-pink-600" />}
            title="BYOK (Bring Your Own Key)"
            description="Utilisez vos propres clés d'API sans intermédiaire pour une flexibilité maximale."
            delay={0.7}
          />
        </div>
      </div>

      {/* GitHub Repo Live Stats */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900">Dépôt GitHub mDevsLabs/OpenProvider</h4>
          <p className="text-slate-600 text-sm font-light">
            Un projet open source auquel vous pouvez participer.
          </p>
        </div>
        <div>
          <GithubRepoStats repo="mDevsLabs/OpenProvider" />
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
      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
