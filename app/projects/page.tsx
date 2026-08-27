"use client";

import { motion } from "motion/react";
import { ExternalLink, Terminal, Globe, Cpu, FileText, Archive, Search, Layers, Gamepad2, Code2 } from "lucide-react";
import Link from "next/link";
import { GithubRepoStats } from "@/components/github-repo-stats";
import Image from "next/image";

export default function ProjectsPage() {
  const activeProjects = [
    {
      id: "web",
      number: "01",
      name: "Web",
      label: "Bêta",
      labelColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
      icon: Globe,
      iconColor: "text-amber-400",
      tagline: "Application d'IA en ligne web directe et intuitive.",
      description: "Application d'IA en ligne web directement et simplement pour discuter avec l'IA mAI.",
      link: "/projects/web",
      repo: "mDevsLabs/Web",
      platforms: ["Web", "Multi-plateforme"],
      borderHover: "hover:border-emerald-500/30 hover:shadow-[0_8px_32px_0_rgba(160,185,129,0.15)]",
    },
    {
      id: "pulse",
      number: "02",
      name: "Pulse",
      label: "Bêta",
      labelColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
      icon: Cpu,
      iconColor: "text-emerald-400",
      tagline: "L'IA intégrée directement dans vos outils du quotidien.",
      description: "Ensemble d'extensions pour diverses applications pour discuter avec mAI directement (navigateur, VS Code...).",
      link: "/projects/pulse",
      repo: "mDevsLabs/Pulse",
      platforms: ["Navigateur", "VS Code", "Extensions"],
      borderHover: "hover:border-emerald-500/30 hover:shadow-[0_8px_32px_0_rgba(160,185,129,0.15)]",
    },
    {
      id: "cli",
      number: "03",
      name: "CLI",
      label: "Release Candidate",
      labelColor: "bg-blue-500/10 border-blue-500/30 text-blue-600",
      icon: Terminal,
      iconColor: "text-purple-400",
      tagline: "L'assistant de développement qui vit dans votre terminal.",
      description: "Discussions et séances de codage dans le terminal CLI via mAI.",
      link: "/projects/cli",
      repo: "mDevsLabs/CLI",
      platforms: ["macOS", "Linux", "Windows"],
      borderHover: "hover:border-blue-500/30 hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.15)]",
    },
    {
      id: "coder",
      number: "04",
      name: "Coder",
      label: "Bêta",
      labelColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
      icon: Code2,
      iconColor: "text-purple-400",
      tagline: "L'IDE IA pensé pour les agents autonomes et les outils MCP.",
      description: "IDE IA de nouvelle génération avec agents IA autonomes, orchestration multi-modèles et support natif des outils MCP.",
      link: "/projects/coder",
      repo: "mDevsLabs/Coder",
      platforms: ["macOS", "Windows", "Linux"],
      borderHover: "hover:border-emerald-500/30 hover:shadow-[0_8px_32px_0_rgba(160,185,129,0.15)]",
    },
  ];

  const archivedProjects = [
    {
      id: "office",
      name: "Office",
      icon: FileText,
      description: "Création de documents et présentations assistée par l'IA.",
      link: "/projects/office",
      repo: "mDevsLabs/Office",
      platforms: ["macOS", "Windows"],
    },
    {
      id: "mai-legacy",
      name: "mAI Web (Legacy)",
      icon: Layers,
      description: "Ancienne version web de mAI avec intégration locale et cloud.",
      link: "/projects/mai",
      repo: "mDevsLabs/mAI",
      platforms: ["Web"],
    },
    {
      id: "mai-cli-legacy",
      name: "mAI CLI (Legacy)",
      icon: Terminal,
      description: "Première itération de l'assistant terminal et messageries.",
      link: "/projects/mai-cli",
      repo: "mDevsLabs/mAI-CLI",
      platforms: ["CLI"],
    },
    {
      id: "msearch",
      name: "mSearch",
      icon: Search,
      image: "/msearch.PNG",
      description: "Moteur de recherche sémantique et d'indexation vectorielle unifié.",
      link: "/projects/msearch",
      repo: "mDevsLabs/mSearch",
      platforms: ["Windows", "macOS", "Linux"],
    },
    {
      id: "openprovider",
      name: "OpenProvider",
      image: "/openprovider.png",
      description: "Proxy universel de routage de modèles LLM et compatibilité Codex.",
      link: "/projects/openprovider",
      repo: "mDevsLabs/OpenProvider",
      platforms: ["CLI", "Proxy"],
    },
    {
      id: "snob",
      name: "Snob",
      icon: Gamepad2,
      image: "/snob.png",
      description: "Jeu de réflexion et puzzle inspiré de Block Blast.",
      link: "/projects/snob",
      repo: "mDevsLabs/Snob",
      platforms: ["Web", "Android"],
    },
  ];

  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* En-tête de la page */}
      <div className="text-left space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900"
        >
          Projets <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500">
            Suite mAI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-base md:text-lg font-light mt-2 md:mt-4 max-w-2xl"
        >
          Découvrez la suite officielle des 4 projets mAI développés par mDevsLabs pour révolutionner votre façon de travailler avec l&apos;intelligence artificielle.
        </motion.p>
      </div>

      {/* Grille des 4 Nouveaux Projets Actifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeProjects.map((project, idx) => {
          const IconComponent = project.icon;
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              className={`group relative bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 transition-all overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] ${project.borderHover} flex flex-col justify-between`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <div className="text-6xl font-black italic tracking-tighter select-none text-slate-900">
                  {project.number}
                </div>
              </div>

              <div className="flex flex-col relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-900 shadow-md">
                    <IconComponent className={`w-8 h-8 ${project.iconColor}`} />
                  </div>
                  <span className={`text-[11px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${project.labelColor}`}>
                    {project.label}
                  </span>
                </div>

                <h2 className="text-3xl font-black mb-1 text-slate-900 flex items-center gap-2">
                  {project.name}
                </h2>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.platforms.map((plat) => (
                    <span
                      key={plat}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-xs text-slate-800 uppercase font-bold tracking-wider"
                    >
                      {plat}
                    </span>
                  ))}
                </div>

                <p className="text-purple-600 font-medium text-xs sm:text-sm mb-3 italic">
                  &quot;{project.tagline}&quot;
                </p>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-slate-200/60 mt-auto">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <Link
                    href={project.link}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-purple-600 transition-all shadow-xs"
                  >
                    Découvrir {project.name}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {project.repo ? (
                  <GithubRepoStats repo={project.repo} />
                ) : (
                  <div className="text-xs font-bold text-slate-400 italic py-1">
                    Dépôt GitHub : En conception
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────
          SECTION PROJETS ARCHIVÉS
      ───────────────────────────────────────────── */}
      <div className="pt-8 border-t border-slate-200">
        <div className="text-left space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold uppercase tracking-wider">
            <Archive className="w-3.5 h-3.5" />
            Historique & Archives
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">
            Projets <span className="text-slate-500">Archivés</span>
          </h2>
          <p className="text-slate-500 text-sm font-light">
            Ces projets ne reçoivent plus de mises à jour majeures mais restent accessibles à des fins de documentation et d&apos;archive technique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white/30 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between opacity-80 hover:opacity-100 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center p-2 border border-slate-200">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : project.icon ? (
                      <project.icon className="w-5 h-5 text-slate-600" />
                    ) : (
                      <Archive className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 font-bold uppercase tracking-widest">
                    Archivé
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">{project.name}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {project.platforms.map((p) => (
                    <span key={p} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                <Link
                  href={project.link}
                  className="text-xs font-semibold text-slate-700 hover:text-purple-600 flex items-center gap-1 transition-colors"
                >
                  Voir l&apos;archive
                  <ExternalLink className="w-3 h-3" />
                </Link>
                {project.repo && <GithubRepoStats repo={project.repo} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}