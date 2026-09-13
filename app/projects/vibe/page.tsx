'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookMarked,
  Download,
  Github,
  MessagesSquare,
  Send,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import { GithubRelease } from '@/components/github-release';
import { GithubRepoStats } from '@/components/github-repo-stats';

const REPO = 'mDevsLabs/Vibe';
const RELEASE_URL = 'https://github.com/mDevsLabs/Vibe/releases/latest';

const features = [
  {
    icon: Sparkles,
    title: 'mAI intégré',
    description:
      'L’assistant lit le contexte du fil, propose des réponses, améliore vos textes et publie pour vous.',
  },
  {
    icon: Send,
    title: 'Messages privés',
    description: 'Conversations directes, réponses à la volée et brouillons assistés par mAI.',
  },
  {
    icon: Users,
    title: 'Cercles & abonnements',
    description: 'Partagez publiquement ou avec un cercle restreint, suivez les comptes qui comptent.',
  },
  {
    icon: BookMarked,
    title: 'Vibe Books',
    description: 'Organisez vos meilleures publications dans des collections thématiques.',
  },
];

const platforms = [
  { label: 'Android', device: '/devices/google.png' },
  { label: 'iOS', device: '/devices/apple.png' },
];

const glassCard =
  'bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl';

export default function VibeProjectPage() {
  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {/* Fil d'Ariane */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/projects" className="transition-colors hover:text-slate-900">
          Projets
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Vibe</span>
      </div>

      {/* En-tête */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex w-14 h-14 items-center justify-center rounded-2xl bg-slate-900 shadow-md">
            <MessagesSquare className="h-7 w-7 text-sky-400" />
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter uppercase text-slate-900">
            Vibe
          </h1>
          <span className="text-[11px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider bg-purple-500/10 border-purple-500/30 text-purple-600">
            Bêta
          </span>
        </div>

        <p className="text-slate-500 text-base md:text-lg font-light max-w-2xl">
          Le réseau social nouvelle génération avec IA intégrée : publiez, discutez et créez avec
          mAI nativement, sur le web, Android et iOS.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {platforms.map((platform) => (
            <span
              key={platform.label}
              className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-xs text-slate-800 uppercase font-bold tracking-wider"
            >
              <Image
                src={platform.device}
                alt=""
                width={12}
                height={12}
                className="h-3 w-3 object-contain"
              />
              {platform.label}
            </span>
          ))}
          <span className="inline-flex items-center text-[10px] px-2.5 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-xs text-slate-800 uppercase font-bold tracking-wider">
            Web
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-purple-600 transition-all shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Télécharger pour Android
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="hidden sm:inline">iOS</span>
          </a>
          <a
            href="https://github.com/mDevsLabs/Vibe"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200 hover:border-purple-300 text-slate-900 text-xs font-bold transition-all shadow-xs"
          >
            <Github className="h-3.5 w-3.5" />
            Voir sur GitHub
          </a>
        </div>

        <GithubRelease repo={REPO} />
      </header>

      {/* Présentation */}
      <section className={`${glassCard} p-6 md:p-8`}>
        <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-slate-900">
          Le réseau social repensé avec l&apos;IA
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          Vibe rassemble un fil personnalisé, des messages privés, des cercles de partage et des
          collections, avec mAI à chaque étape : rédaction, traduction, résumé, génération d&apos;images
          et recommandations. Vos publications restent maîtrisées, public ou restreint, et
          l&apos;assistant n&apos;écrit jamais à votre place sans validation.
        </p>
      </section>

      {/* Fonctionnalités */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-slate-900">
          Fonctionnalités clés
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/50 backdrop-blur-md border border-white/70 rounded-2xl p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-md">
                <feature.icon className="h-4.5 w-4.5 text-sky-400" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Applications mobiles */}
      <section className="flex flex-col gap-6 border-t border-slate-200 pt-12">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-slate-700" />
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-slate-900">
            Applications mobiles
          </h2>
        </div>
        <p className="max-w-2xl text-sm text-slate-500">
          Les versions Android et iOS sont publiées sur les releases GitHub. Tous les téléchargements
          pointent vers la dernière version stable.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {platforms.map((platform) => (
            <a
              key={platform.label}
              href={RELEASE_URL}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 p-5 bg-white/50 backdrop-blur-md border border-white/70 rounded-2xl shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
            >
              <span className="flex items-center gap-4">
                <Image
                  src={platform.device}
                  alt={platform.label}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <span className="flex flex-col">
                  <span className="font-bold text-slate-900">{platform.label}</span>
                  <span className="text-xs text-slate-500">
                    Dernière version · releases GitHub
                  </span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>

        <div className="mt-2">
          <GithubRepoStats repo={REPO} />
        </div>
      </section>
    </div>
  );
}
