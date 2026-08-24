"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Download,
  ExternalLink,
  Copy,
  Check,
  Monitor,
  Globe,
  Terminal,
  Cpu,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface AppDownload {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: any;
  iconColor: string;
  borderHover: string;
  releaseUrl: string;
  platforms?: {
    label: string;
    url: string;
  }[];
  terminalCommand?: {
    label: string;
    command: string;
    key: string;
  };
}

const OFFICIAL_APPS: AppDownload[] = [
  {
    id: "desktop",
    name: "mAI Desktop",
    tagline: "L'application native pour votre poste de travail et appareils mobiles.",
    description:
      "Accédez à la puissance de mAI avec accélération matérielle locale, multi-fenêtres et synchronisation complète de vos sessions.",
    icon: Monitor,
    iconColor: "text-purple-400",
    borderHover: "hover:border-purple-500/30",
    releaseUrl: "https://github.com/mDevsLabs/Desktop/releases/latest",
    platforms: [
      { label: "Windows", url: "https://github.com/mDevsLabs/Desktop/releases/latest" },
      { label: "macOS", url: "https://github.com/mDevsLabs/Desktop/releases/latest" },
      { label: "Linux", url: "https://github.com/mDevsLabs/Desktop/releases/latest" },
      { label: "Android", url: "https://github.com/mDevsLabs/Desktop/releases/latest" },
      { label: "iOS", url: "https://github.com/mDevsLabs/Desktop/releases/latest" },
    ],
  },
  {
    id: "web",
    name: "mAI Web",
    tagline: "L'assistant IA Web direct, accessible depuis n'importe quel navigateur.",
    description:
      "Interface web réactive et progressive pour échanger avec vos modèles, générer du code et synchroniser vos projets dans le Cloud.",
    icon: Globe,
    iconColor: "text-blue-400",
    borderHover: "hover:border-blue-500/30",
    releaseUrl: "https://github.com/mDevsLabs/Web/releases/latest",
    platforms: [
      { label: "Windows", url: "https://github.com/mDevsLabs/Web/releases/latest" },
      { label: "macOS", url: "https://github.com/mDevsLabs/Web/releases/latest" },
      { label: "Linux", url: "https://github.com/mDevsLabs/Web/releases/latest" },
      { label: "Android", url: "https://github.com/mDevsLabs/Web/releases/latest" },
      { label: "iOS", url: "https://github.com/mDevsLabs/Web/releases/latest" },
    ],
  },
  {
    id: "cli",
    name: "mAI CLI",
    tagline: "Discussions et sessions de codage assistées directement dans votre terminal.",
    description:
      "Outil CLI professionnel ultra-rapide pour développeurs : analyse de code, scripts automatisés et pipelines CI/CD.",
    icon: Terminal,
    iconColor: "text-emerald-400",
    borderHover: "hover:border-emerald-500/30",
    releaseUrl: "https://github.com/mDevsLabs/CLI/releases/latest",
    terminalCommand: {
      label: "mAI CLI (Homebrew)",
      command: "brew install mDevsLabs/mAI-CLI/mai",
      key: "cli-brew",
    },
  },
  {
    id: "pulse",
    name: "mAI Pulse",
    tagline: "L'IA intégrée directement dans vos outils du quotidien.",
    description:
      "Ensemble d'extensions pour navigateurs et éditeurs (VS Code) pour invoquer mAI instantanément dans votre contexte de travail.",
    icon: Cpu,
    iconColor: "text-amber-400",
    borderHover: "hover:border-amber-500/30",
    releaseUrl: "https://github.com/mDevsLabs/Pulse/releases/latest",
    platforms: [
      { label: "Windows", url: "https://github.com/mDevsLabs/Pulse/releases/latest" },
      { label: "macOS", url: "https://github.com/mDevsLabs/Pulse/releases/latest" },
      { label: "Linux", url: "https://github.com/mDevsLabs/Pulse/releases/latest" },
    ],
  },
];

export default function DownloadPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (command: string, key: string, label: string) => {
    navigator.clipboard.writeText(command);
    setCopiedKey(key);
    toast.success(`Commande ${label} copiée !`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-10 md:gap-16 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-left space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900"
        >
          Télécharger
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-base md:text-lg font-light mt-2 md:mt-4 max-w-2xl"
        >
          Retrouvez les liens de téléchargement officiels pour nos applications et les commandes d&apos;installation de nos modèles d&apos;IA.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* ─────────────────────────────────────────────
            SECTION 1 : APPLICATIONS OFFICIELLES
        ───────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="border-b border-slate-200/80 pb-3">
            <h2 className="text-2xl font-black italic tracking-tight uppercase text-slate-900">
              Applications <span className="text-purple-600">Bureau &amp; Mobile</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Installez les applications officielles mAI sur tous vos appareils.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {OFFICIAL_APPS.map((app, idx) => {
              const IconComponent = app.icon;
              return (
                <motion.section
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 ${app.borderHover} transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-start md:items-center gap-5">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900 shadow-md flex items-center justify-center p-3 shrink-0">
                        <IconComponent className={`w-8 h-8 md:w-10 md:h-10 ${app.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                          {app.name}
                        </h3>
                        <p className="text-slate-600 text-sm mt-1 max-w-xl">
                          {app.description}
                        </p>

                        {/* Commande de terminal si applicable */}
                        {app.terminalCommand && (
                          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 max-w-lg">
                            <div className="p-2.5 px-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex items-center gap-2 flex-1">
                              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                {app.terminalCommand.label}
                              </span>
                              <code className="text-slate-100 font-semibold select-all">
                                {app.terminalCommand.command}
                              </code>
                            </div>
                            <button
                              onClick={() =>
                                handleCopy(
                                  app.terminalCommand!.command,
                                  app.terminalCommand!.key,
                                  app.name
                                )
                              }
                              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              {copiedKey === app.terminalCommand.key ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Copié !</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copier</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Boutons par plateforme avec lien releases/latest */}
                    {app.platforms && app.platforms.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                        {app.platforms.map((plat) => (
                          <a
                            key={plat.label}
                            href={plat.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white font-bold transition-all shadow-xs text-xs"
                          >
                            <Download className="w-3.5 h-3.5 opacity-70" />
                            <span>{plat.label}</span>
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            SECTION 2 : MODÈLES IA (mAI 1.5, 1.2, 1)
        ───────────────────────────────────────────── */}
        <div className="space-y-6 pt-4 border-t border-slate-200/80">
          <div className="border-b border-slate-200/80 pb-3">
            <h2 className="text-2xl font-black italic tracking-tight uppercase text-slate-900">
              Modèles <span className="text-blue-600">mAI Locaux</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Commandes d&apos;exécution et de téléchargement local via Ollama et Hugging Face CLI.
            </p>
          </div>

          {/* Section mAI-1.5-Light */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest shadow">
              ✦ NEW
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <Image
                    src="/mai-1.5-light/mAI-1.5-Light.png"
                    alt="mAI-1.5-Light logo"
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">mAI-1.5-Light</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Assistant IA local 4B ultra-rapide et multimodal. Vision intégrée, thinking & tools pour une agilité quotidienne maximale.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 max-w-md">
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                      <code className="text-slate-100 font-semibold select-all">ollama run mDevsLabs/mAI-1.5-Light</code>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                      <code className="text-slate-100 font-semibold select-all">hf download mDevsLabs/mAI-1.5-Light</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.5-Light", "mai-1.5-light-ollama", "mAI-1.5-Light Ollama")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.5-light-ollama" ? (
                    <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Ollama</>
                  )}
                </button>
                <button
                  onClick={() => handleCopy("hf download mDevsLabs/mAI-1.5-Light", "mai-1.5-light-hf", "mAI-1.5-Light Hugging Face")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.5-light-hf" ? (
                    <><Check className="w-4 h-4 text-emerald-700" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Hugging Face</>
                  )}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Section mAI-1.5-Apex */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow">
              ✦ NEW
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <Image
                    src="/mai-1.5-apex/mAI-1.5-Apex.png"
                    alt="mAI-1.5-Apex logo"
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">mAI-1.5-Apex</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Le top tier Flagship 9B de la famille mAI. Puissance maximale, vision multimodale, raisonnement approfondi et outils — zéro cloud.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 max-w-md">
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                      <code className="text-slate-100 font-semibold select-all">ollama run mDevsLabs/mAI-1.5-Apex</code>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                      <code className="text-slate-100 font-semibold select-all">hf download mDevsLabs/mAI-1.5-Apex</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.5-Apex", "mai-1.5-apex-ollama", "mAI-1.5-Apex Ollama")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.5-apex-ollama" ? (
                    <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Ollama</>
                  )}
                </button>
                <button
                  onClick={() => handleCopy("hf download mDevsLabs/mAI-1.5-Apex", "mai-1.5-apex-hf", "mAI-1.5-Apex Hugging Face")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.5-apex-hf" ? (
                    <><Check className="w-4 h-4 text-emerald-700" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Hugging Face</>
                  )}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Section mAI-1.5-Opal */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow">
              ✦ NEW
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <Image
                    src="/mai-1.5-opal/mAI-1.5-Opal.png"
                    alt="mAI-1.5-Opal logo"
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">mAI-1.5-Opal</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Le sweet spot 27B ultime entre vélocité et haute intelligence. Multimodal avec vision, thinking et tools 100% local.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 max-w-md">
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                      <code className="text-slate-100 font-semibold select-all">ollama run mDevsLabs/mAI-1.5-Opal</code>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                      <code className="text-slate-100 font-semibold select-all">hf download mDevsLabs/mAI-1.5-Opal</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.5-Opal", "mai-1.5-opal-ollama", "mAI-1.5-Opal Ollama")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.5-opal-ollama" ? (
                    <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Ollama</>
                  )}
                </button>
                <button
                  onClick={() => handleCopy("hf download mDevsLabs/mAI-1.5-Opal", "mai-1.5-opal-hf", "mAI-1.5-Opal Hugging Face")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.5-opal-hf" ? (
                    <><Check className="w-4 h-4 text-emerald-700" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Hugging Face</>
                  )}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Section mAI-1.2-Light */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <Image
                    src="/mai-1.2-light/mai-1.2-light.png"
                    alt="mAI-1.2-Light logo"
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">mAI-1.2-Light</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Assistant IA local ultra-rapide et multimodal. Vision intégrée, légèreté maximale et productivité au quotidien.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 max-w-md">
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                      <code className="text-slate-100 font-semibold select-all">ollama run mDevsLabs/mAI-1.2-Light</code>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                      <code className="text-slate-100 font-semibold select-all">hf download mDevsLabs/mAI-1.2-Light</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.2-Light", "mai-1.2-light-ollama", "mAI-1.2-Light Ollama")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.2-light-ollama" ? (
                    <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Ollama</>
                  )}
                </button>
                <button
                  onClick={() => handleCopy("hf download mDevsLabs/mAI-1.2-Light", "mai-1.2-light-hf", "mAI-1.2-Light Hugging Face")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.2-light-hf" ? (
                    <><Check className="w-4 h-4 text-emerald-700" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Hugging Face</>
                  )}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Section mAI-1.2-Apex */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-rose-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <Image
                    src="/mai-1.2-apex/mai-1.2-apex.png"
                    alt="mAI-1.2-Apex logo"
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">mAI-1.2-Apex</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Le top tier de la famille mAI. Performances maximales, vision multimodale et raisonnement avancé — zéro cloud.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 max-w-md">
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                      <code className="text-slate-100 font-semibold select-all">ollama run mDevsLabs/mAI-1.2-Apex</code>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                      <code className="text-slate-100 font-semibold select-all">hf download mDevsLabs/mAI-1.2-Apex</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.2-Apex", "mai-1.2-apex-ollama", "mAI-1.2-Apex Ollama")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.2-apex-ollama" ? (
                    <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Ollama</>
                  )}
                </button>
                <button
                  onClick={() => handleCopy("hf download mDevsLabs/mAI-1.2-Apex", "mai-1.2-apex-hf", "mAI-1.2-Apex Hugging Face")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.2-apex-hf" ? (
                    <><Check className="w-4 h-4 text-emerald-700" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Hugging Face</>
                  )}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Section mAI-1.2-Opal */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <Image
                    src="/mai-1.2-opal/mai-1.2-opal.png"
                    alt="mAI-1.2-Opal logo"
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">mAI-1.2-Opal</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Le sweet spot parfait entre rapidité et intelligence. Ultra-fluide, multimodal et 100% local via Ollama.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 max-w-md">
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                      <code className="text-slate-100 font-semibold select-all">ollama run mDevsLabs/mAI-1.2-Opal</code>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                      <code className="text-slate-100 font-semibold select-all">hf download mDevsLabs/mAI-1.2-Opal</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.2-Opal", "mai-1.2-opal-ollama", "mAI-1.2-Opal Ollama")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.2-opal-ollama" ? (
                    <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Ollama</>
                  )}
                </button>
                <button
                  onClick={() => handleCopy("hf download mDevsLabs/mAI-1.2-Opal", "mai-1.2-opal-hf", "mAI-1.2-Opal Hugging Face")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1.2-opal-hf" ? (
                    <><Check className="w-4 h-4 text-emerald-700" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Hugging Face</>
                  )}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Section mAI-1 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-3 shrink-0">
                  <Image
                    src="/mai-1/mai-1-carre.png"
                    alt="mAI-1 logo"
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">mAI-1</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Assistant IA local puissant et multimodal. Raisonnement complexe, génération de code et analyse d&apos;images.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 max-w-md">
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                      <code className="text-slate-100 font-semibold select-all">ollama run mDevsLabs/mAI-1</code>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                      <code className="text-slate-100 font-semibold select-all">hf download mDevsLabs/mAI-1</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleCopy("ollama run mDevsLabs/mAI-1", "mai-1-ollama", "mAI-1 Ollama")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1-ollama" ? (
                    <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Ollama</>
                  )}
                </button>
                <button
                  onClick={() => handleCopy("hf download mDevsLabs/mAI-1", "mai-1-hf", "mAI-1 Hugging Face")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1-hf" ? (
                    <><Check className="w-4 h-4 text-emerald-700" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Hugging Face</>
                  )}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Section mAI-1-Light */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-3 shrink-0">
                  <Image
                    src="/mai-1-light/mai-1-light-carre.png"
                    alt="mAI-1-Light logo"
                    width={80}
                    height={80}
                    sizes="80px"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">mAI-1-Light</h3>
                  <p className="text-slate-600 text-sm mt-1 max-w-xl">
                    Assistant IA local ultra-léger et ultra-rapide. Optimisé pour tourner sur n&apos;importe quelle machine.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 max-w-md">
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                      <code className="text-slate-100 font-semibold select-all">ollama run mDevsLabs/mAI-1-Light</code>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                      <code className="text-slate-100 font-semibold select-all">hf download mDevsLabs/mAI-1-Light</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleCopy("ollama run mDevsLabs/mAI-1-Light", "mai-1-light-ollama", "mAI-1-Light Ollama")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1-light-ollama" ? (
                    <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Ollama</>
                  )}
                </button>
                <button
                  onClick={() => handleCopy("hf download mDevsLabs/mAI-1-Light", "mai-1-light-hf", "mAI-1-Light Hugging Face")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap cursor-pointer"
                >
                  {copiedKey === "mai-1-light-hf" ? (
                    <><Check className="w-4 h-4 text-emerald-700" />Copié !</>
                  ) : (
                    <><Copy className="w-4 h-4" />Hugging Face</>
                  )}
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
