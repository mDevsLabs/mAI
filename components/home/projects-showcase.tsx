"use client";

import { motion } from "motion/react";
import { Terminal, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GithubRepoStats } from "@/components/github-repo-stats";

export function ProjectsShowcase() {
  const projects = [
    {
      id: "web",
      title: "Web",
      label: "Alpha",
      tagline: "L'application d'IA en ligne directe et intuitive.",
      description: "Application d'IA en ligne web directement et simplement pour discuter avec l'IA mAI.",
      link: "/projects/web",
      repo: "mDevsLabs/Web",
      platforms: ["Web", "Multi-plateforme"],
      highlightColor: "hover:border-purple-500/40 hover:shadow-[0_12px_32px_rgba(168,85,247,0.15)]"},
    {
      id: "pulse",
      title: "Pulse",
      label: "Bêta",
      tagline: "L'IA partout dans vos outils favoris.",
      description: "Ensemble d'extensions pour diverses applications pour discuter avec mAI directement (navigateur, VS Code...).",
      link: "/projects/pulse",
      repo: "mDevsLabs/Pulse",
      platforms: ["Navigateur", "VS Code", "Extensions"],
      highlightColor: "hover:border-indigo-500/40 hover:shadow-[0_12px_32px_rgba(99,102,241,0.15)]"},
    {
      id: "cli",
      title: "CLI",
      label: "Bêta",
      tagline: "Discussions et séances de codage dans votre terminal.",
      description: "Discussions et séances de codage dans le terminal CLI via mAI.",
      link: "/projects/cli",
      repo: "mDevsLabs/CLI",
      platforms: ["macOS", "Linux", "Windows"],
      highlightColor: "hover:border-emerald-500/40 hover:shadow-[0_12px_32px_rgba(16,185,129,0.15)]"},
    {
      id: "coder",
      title: "Coder",
      label: "Alpha",
      tagline: "L'IDE IA pensé pour les agents autonomes et les outils MCP.",
      description: "IDE IA de nouvelle génération avec agents IA autonomes, orchestration multi-modèles et support natif des outils MCP.",
      link: "/projects/coder",
      repo: "mDevsLabs/Coder",
      platforms: ["macOS", "Windows", "Linux"],
      highlightColor: "hover:border-purple-500/40 hover:shadow-[0_12px_32px_rgba(168,85,247,0.15)]"},
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
            La Suite <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500">mAI</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-light mt-1 max-w-xl">
            Quatre produits dédiés conçus pour booster votre productivité, votre créativité et vos workflows avec l&apos;IA.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900 text-white shadow-md p-2 group-hover:scale-105 transition-transform duration-200">
                  <Terminal className="w-6 h-6 text-purple-400" />
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                  project.label === 'Alpha' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' :
                  project.label === 'Bêta' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' :
                  'bg-blue-500/10 border-blue-500/30 text-blue-600'
                }`}>
                  {project.label}
                </span>
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
                {project.repo ? (
                  <GithubRepoStats repo={project.repo} />
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 italic">En conception</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
