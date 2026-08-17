"use client";

import { motion } from "motion/react";
import {
  ExternalLink,
  Search,
  Shield,
  Zap,
  Lock,
  Download,
  Globe,
  Github,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { GithubRelease } from "@/components/github-release";

export default function MsearchProjectPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Header */}
      <div className="text-left space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link
            href="/projects"
            className="hover:text-blue-600 transition-colors"
          >
            Projets
          </Link>
          <span>/</span>
          <span className="text-blue-600 font-medium">mSearch</span>
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
                  "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
                  "drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))",
                  "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 md:w-28 md:h-28 rounded-3xl md:rounded-full bg-white/30 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center justify-center p-4"
            >
              <Image
                src="/msearch.PNG"
                alt="mSearch logo"
                width={112}
                height={112}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900 drop-shadow-sm">
                  mSearch
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 font-bold uppercase tracking-widest">
                  Archivé
                </span>
              </div>
              <p className="text-blue-600 font-medium text-lg italic mt-1">
                Avec mSearch, recherchez en toute sécurité !
              </p>
            </div>
          </div>
          <GithubRelease repo="mDevsLabs/mSearch" />
        </motion.div>
      </div>

      {/* Hero Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/30 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/30 rounded-full blur-[80px] -z-10"></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            Rapide. Privé. Puissant.
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            mSearch est un navigateur axé sur la confidentialité et la vitesse,
            propulsé par le moteur de
            <a
              href="https://minbrowser.org/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 font-semibold ml-1 group relative transition-colors"
            >
              <span className="relative z-10 flex items-center gap-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                Min Browser <ExternalLink className="w-3 h-3 group-hover:rotate-12 transition-transform duration-300" />
              </span>
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
            . Il vous offre une expérience de navigation minimaliste, sans
            distraction, où votre vie privée est la priorité absolue.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="https://github.com/mDevsLabs/mSearch"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-semibold text-sm sm:text-base hover:bg-white/60 transition-colors"
            >
              Découvrir mSearch
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="https://github.com/mDevsLabs/mSearch"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-semibold text-sm sm:text-base hover:bg-white/60 transition-colors"
            >
              GitHub
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <Link
              href="/changelog/msearch"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-semibold text-sm sm:text-base hover:bg-white/60 transition-colors"
            >
              Changelog
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link
              href="/downloads"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-slate-900 font-semibold text-sm sm:text-base hover:bg-white/60 transition-colors"
            >
              Télécharger mSearch
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          Fonctionnalités Principales
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Lock className="w-6 h-6 text-blue-600" />}
            title="Protection de la vie privée"
            description="Bloqueur de publicités et de traqueurs intégré pour une navigation sans compromis."
            delay={0.2}
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-blue-600" />}
            title="Ultra-léger"
            description="Conçu pour consommer un minimum de ressources système, idéal pour tous les appareils."
            delay={0.3}
          />
          <FeatureCard
            icon={<Search className="w-6 h-6 text-blue-600" />}
            title="Recherche intelligente"
            description="Barre de recherche unifiée permettant d'accéder instantanément à vos moteurs favoris."
            delay={0.4}
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6 text-blue-600" />}
            title="Multi-plateforme"
            description="Disponible et optimisé pour Windows, macOS et Linux."
            delay={0.5}
          />
          <FeatureCard
            icon={<Github className="w-6 h-6 text-blue-600" />}
            title="Projet Open Source"
            description="Le code source est entièrement ouvert et accessible pour une transparence et sécurité totales."
            delay={0.6}
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6 text-blue-600" />}
            title="Propulsé par Min"
            description="Construit sur une base solide de navigateur pour une expérience optimale."
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
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}