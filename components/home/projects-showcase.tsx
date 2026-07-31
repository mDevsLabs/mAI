"use client";

import { motion } from "motion/react";
import { Terminal, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GithubRepoStats } from "@/components/github-repo-stats";

export function ProjectsShowcase() {
  const projects = [
    {
      id: "mai-cli",
      title: "mAI CLI",
      tagline: "L'assistant de développement qui vit dans votre terminal.",
      description: "Un assistant IA natif, gratuit et respectueux de votre vie privée, capable de relire des PRs, gérer vos tickets, exécuter des commandes et envoyer des messages sans quitter le terminal.",
      link: "/projects/mai-cli",
      repo: "mDevsLabs/mAI-CLI",
      platforms: ["macOS", "Linux", "Windows"],
      highlightColor: "hover:border-purple-500/40 hover:shadow-[0_12px_32px_rgba(168,85,247,0.15)]",
    },
    {
      id: "openprovider",
      title: "OpenProvider",
      tagline: "Rendez Codex ouvert !",
      description: "Proxy universel de fournisseurs pour OpenAI Codex, Claude Code, Claude Desktop et Grok Build.",
      link: "/projects/openprovider",
      repo: "mDevsLabs/OpenProvider",
      image: "/openprovider.png",
      platforms: ["CLI", "Windows", "macOS", "Linux"],
      highlightColor: "hover:border-pink-500/40 hover:shadow-[0_12px_32px_rgba(236,72,153,0.15)]",
    },
    {
      id: "msearch",
      title: "mSearch",
      tagline: "Recherchez en toute sécurité !",
      description: "Un outil de recherche unifié ultra-rapide, téléchargeable et natif pour tous vos appareils.",
      link: "/projects/msearch",
      repo: "mDevsLabs/mSearch",
      image: "/msearch.png",
      platforms: ["Windows", "macOS", "Linux"],
      highlightColor: "hover:border-blue-500/40 hover:shadow-[0_12px_32px_rgba(59,130,246,0.15)]",
    },
    {
      id: "snob",
      title: "Snob",
      tagline: "L'expérience ultime de Block Blast revisitée.",
      description: "Un jeu de puzzle de prestige alliant un design élégant à des mécaniques profondément tactiques.",
      link: "/projects/snob",
      repo: "mDevsLabs/Snob",
      image: "/snob.png",
      platforms: ["Web", "Android"],
      highlightColor: "hover:border-amber-500/40 hover:shadow-[0_12px_32px_rgba(245,158,11,0.15)]",
    },
  ];

  return (
    <section className="w-full py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4"
      >
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900">
            Nos Projets <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Phares</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-light mt-1 max-w-xl">
            Des outils natifs conçus pour améliorer la productivité des développeurs et simplifier l&apos;usage de l&apos;IA au quotidien.
          </p>
        </div>

        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200 hover:border-blue-300 text-slate-900 text-sm font-bold transition-all shadow-xs w-fit"
        >
          Tous les projets
          <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
            className={`group relative bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-7 transition-colors duration-200 shadow-xs flex flex-col justify-between overflow-hidden ${project.highlightColor}`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="text-6xl sm:text-7xl font-black italic tracking-tighter select-none text-slate-900">
                0{index + 1}
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-900 text-white shadow-md overflow-hidden p-2 group-hover:scale-105 transition-transform duration-200">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Terminal className="w-7 h-7 text-purple-400" />
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                {project.title}
              </h3>

              <p className="text-xs font-semibold text-slate-500 italic mb-2.5">
                &quot;{project.tagline}&quot;
              </p>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-normal">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {project.platforms.map((plat) => (
                  <span
                    key={plat}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/80 text-slate-700 font-bold uppercase tracking-wider"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-3.5 border-t border-slate-200/60 flex items-center justify-between gap-3 flex-wrap">
              <Link
                href={project.link}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-purple-600 transition-colors shadow-xs"
              >
                Découvrir {project.title}
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="shrink-0">
                <GithubRepoStats repo={project.repo} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
