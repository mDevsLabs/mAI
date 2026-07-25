"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Download, ExternalLink, Copy, Check, Sparkles } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { useRouter } from "next/navigation";
import { VscCode } from "react-icons/vsc";
import { FaChrome, FaAndroid } from "react-icons/fa";

export default function DownloadPage() {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleDownloadAndRedirect = (downloadUrl: string, docSlug: string) => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    router.push(`/docs?doc=${docSlug}`);
  };

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
          Retrouvez les liens de téléchargement et commandes d&apos;installation officielles pour nos applications et modèles IA.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Section 1 : mAI */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-3 shrink-0">
                <Image
                  src="/mai.png"
                  alt="mAI logo"
                  width={80}
                  height={80}
                  sizes="80px"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">mAI</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  L&apos;assistant IA local de nouvelle génération pour booster votre productivité au quotidien.
                </p>
                <div className="mt-3 flex flex-col gap-2 max-w-md">
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">mAI CLI (Homebrew)</span>
                    <code className="text-slate-100 font-semibold">brew install mDevsLabs/mAI-CLI/mai</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleCopy("brew install mDevsLabs/mAI-CLI/mai", "mai-cli-brew", "mAI CLI")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-md text-sm cursor-pointer"
              >
                {copiedKey === "mai-cli-brew" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    mAI CLI
                  </>
                )}
              </button>
              <a
                href="https://github.com/mDevsLabs/mAI/releases/latest"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm"
              >
                <Download className="w-4 h-4" />
                Canal Stable
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
              <a
                href="https://github.com/mDevsLabs/mAI/releases?q=Canary&expanded=true"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold transition-all shadow-sm text-sm"
              >
                <Sparkles className="w-4 h-4 text-slate-900" />
                Canal Canary
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
              <button
                onClick={() =>
                  handleDownloadAndRedirect(
                    "https://upload.fs.fr/ObQWvEwYTk.zip",
                    "guide-extension-vscode"
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold transition-all shadow-sm text-sm cursor-pointer"
              >
                <VscCode className="w-5 h-5 text-slate-900" />
                VS Code
              </button>
              <button
                onClick={() =>
                  handleDownloadAndRedirect(
                    "https://upload.fs.fr/Zn7FIHWR6M.zip",
                    "guide-extension-navigateur"
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold transition-all shadow-sm text-sm cursor-pointer"
              >
                <FaChrome className="w-5 h-5 text-slate-900" />
                Extension Navigateur
              </button>
              <button
                onClick={() =>
                  handleDownloadAndRedirect(
                    "https://upload.fs.fr/i4Bw0kQXk7.zip",
                    "guide-application-android"
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold transition-all shadow-sm text-sm cursor-pointer"
              >
                <FaAndroid className="w-5 h-5 text-slate-900" />
                Version Android (Mobile)
              </button>
            </div>
          </div>
        </motion.section>

        {/* Section 2 : mSearch */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-3 shrink-0">
                <Image
                  src="/msearch.PNG"
                  alt="mSearch logo"
                  width={80}
                  height={80}
                  sizes="80px"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">mSearch</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Un outil de recherche unifié, ultra-rapide et respectueux de votre vie privée.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <a
                href="https://github.com/mDevsLabs/mSearch/releases/latest"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm"
              >
                <Download className="w-4 h-4" />
                Canal Stable
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            </div>
          </div>
        </motion.section>

        {/* Section Snob */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-3 shrink-0">
                <Image
                  src="/snob.png"
                  alt="Snob logo"
                  width={80}
                  height={80}
                  sizes="80px"
                  className="w-full h-full object-contain drop-shadow-md rounded-xl"
                />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Snob</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Le Block Blast Tactique de Prestige. L&apos;expérience ultime revisitée.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() =>
                  handleDownloadAndRedirect(
                    "https://upload.fs.fr/HQYJvG7IxV.zip",
                    "guide-application-android"
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold transition-all shadow-sm text-sm cursor-pointer"
              >
                <FaAndroid className="w-5 h-5 text-slate-900" />
                Version Android (Mobile)
              </button>
            </div>
          </div>
        </motion.section>

        {/* Section 3 : mAI-1.2-Light */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden"
        >
          {/* Badge NEW */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow">
            ✦ NEW
          </div>
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">mAI-1.2-Light</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Assistant IA local ultra-rapide et multimodal. Vision intégrée, légèreté maximale et productivité au quotidien.
                </p>
                <div className="mt-3 flex flex-col gap-2 max-w-md">
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                    <code className="text-slate-100 font-semibold">ollama run mDevsLabs/mAI-1.2-Light</code>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                    <code className="text-slate-100 font-semibold">hf download mDevsLabs/mAI-1.2-Light</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.2-Light", "mai-1.2-light-ollama", "mAI-1.2-Light Ollama")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap"
              >
                {copiedKey === "mai-1.2-light-ollama" ? (
                  <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                ) : (
                  <><Copy className="w-4 h-4" />Ollama</>
                )}
              </button>
              <button
                onClick={() => handleCopy("hf download mDevsLabs/mAI-1.2-Light", "mai-1.2-light-hf", "mAI-1.2-Light Hugging Face")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap"
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

        {/* Section 4 : mAI-1.2-Apex */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-rose-500/30 transition-all duration-300 relative overflow-hidden"
        >
          {/* Badge NEW */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow">
            ✦ NEW
          </div>
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">mAI-1.2-Apex</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Le top tier de la famille mAI. Performances maximales, vision multimodale et raisonnement avancé — zéro cloud.
                </p>
                <div className="mt-3 flex flex-col gap-2 max-w-md">
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                    <code className="text-slate-100 font-semibold">ollama run mDevsLabs/mAI-1.2-Apex</code>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                    <code className="text-slate-100 font-semibold">hf download mDevsLabs/mAI-1.2-Apex</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.2-Apex", "mai-1.2-apex-ollama", "mAI-1.2-Apex Ollama")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap"
              >
                {copiedKey === "mai-1.2-apex-ollama" ? (
                  <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                ) : (
                  <><Copy className="w-4 h-4" />Ollama</>
                )}
              </button>
              <button
                onClick={() => handleCopy("hf download mDevsLabs/mAI-1.2-Apex", "mai-1.2-apex-hf", "mAI-1.2-Apex Hugging Face")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap"
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

        {/* Section 5 : mAI-1.2-Opal */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="group bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8 hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden"
        >
          {/* Badge NEW */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest shadow">
            ✦ NEW
          </div>
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">mAI-1.2-Opal</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Le sweet spot parfait entre rapidité et intelligence. Ultra-fluide, multimodal et 100% local via Ollama.
                </p>
                <div className="mt-3 flex flex-col gap-2 max-w-md">
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                    <code className="text-slate-100 font-semibold">ollama run mDevsLabs/mAI-1.2-Opal</code>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                    <code className="text-slate-100 font-semibold">hf download mDevsLabs/mAI-1.2-Opal</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleCopy("ollama run mDevsLabs/mAI-1.2-Opal", "mai-1.2-opal-ollama", "mAI-1.2-Opal Ollama")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap"
              >
                {copiedKey === "mai-1.2-opal-ollama" ? (
                  <><Check className="w-4 h-4 text-emerald-400" />Copié !</>
                ) : (
                  <><Copy className="w-4 h-4" />Ollama</>
                )}
              </button>
              <button
                onClick={() => handleCopy("hf download mDevsLabs/mAI-1.2-Opal", "mai-1.2-opal-hf", "mAI-1.2-Opal Hugging Face")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap"
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

        {/* Section 6 : mAI-1 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">mAI-1</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Assistant IA local puissant et multimodal. Raisonnement complexe, génération de code et analyse d&apos;images.
                </p>
                <div className="mt-3 flex flex-col gap-2 max-w-md">
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                    <code className="text-slate-100 font-semibold">ollama run mDevsLabs/mAI-1</code>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                    <code className="text-slate-100 font-semibold">hf download mDevsLabs/mAI-1</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleCopy("ollama run mDevsLabs/mAI-1", "mai-1-ollama", "mAI-1 Ollama")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap"
              >
                {copiedKey === "mai-1-ollama" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Ollama
                  </>
                )}
              </button>
              <button
                onClick={() => handleCopy("hf download mDevsLabs/mAI-1", "mai-1-hf", "mAI-1 Hugging Face")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap"
              >
                {copiedKey === "mai-1-hf" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Hugging Face
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Section 4 : mAI-1-Light */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">mAI-1-Light</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Assistant IA local ultra-léger et ultra-rapide. Optimisé pour tourner sur n&apos;importe quelle machine.
                </p>
                <div className="mt-3 flex flex-col gap-2 max-w-md">
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
                    <code className="text-slate-100 font-semibold">ollama run mDevsLabs/mAI-1-Light</code>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 shadow-inner flex flex-col gap-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
                    <code className="text-slate-100 font-semibold">hf download mDevsLabs/mAI-1-Light</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleCopy("ollama run mDevsLabs/mAI-1-Light", "mai-1-light-ollama", "mAI-1-Light Ollama")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap"
              >
                {copiedKey === "mai-1-light-ollama" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Ollama
                  </>
                )}
              </button>
              <button
                onClick={() => handleCopy("hf download mDevsLabs/mAI-1-Light", "mai-1-light-hf", "mAI-1-Light Hugging Face")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD21E] text-slate-900 font-bold hover:bg-yellow-400 transition-all shadow-md text-sm whitespace-nowrap"
              >
                {copiedKey === "mai-1-light-hf" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Hugging Face
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
