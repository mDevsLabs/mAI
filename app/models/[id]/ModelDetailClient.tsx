"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Terminal,
  Cpu,
  Eye,
  EyeOff,
  Layers,
  Calendar,
  Sparkles,
  ArrowLeft,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Markdown from "react-markdown";
import { toast } from "react-hot-toast";
import type { ModelInfo } from "@/lib/models";

interface AppIntegration {
  id: string;
  name: string;
  command: string;
  filename: string;
  description: string;
}

export function ModelDetailClient({ model }: { model: ModelInfo }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mainCommand = `ollama run ${model.ollamaTag}`;
  const hfCommand = `hf download ${model.ollamaTag}`;

  const integrations: AppIntegration[] = [
    {
      id: "claude",
      name: "Claude",
      command: `ollama launch claude --model ${model.ollamaTag}`,
      filename: `launch-claude-${model.id}.sh`,
      description: "Lancez l'interface Claude connectée à votre modèle local.",
    },
    {
      id: "codex-app",
      name: "Codex App",
      command: `ollama launch codex-app --model ${model.ollamaTag}`,
      filename: `launch-codex-app-${model.id}.sh`,
      description: "Exécutez Codex App avec la puissance de ce modèle.",
    },
    {
      id: "codex-cli",
      name: "Codex CLI",
      command: `ollama launch codex --model ${model.ollamaTag}`,
      filename: `launch-codex-cli-${model.id}.sh`,
      description: "Utilisez Codex en ligne de commande avec ce modèle.",
    },
    {
      id: "hermes",
      name: "Hermes Agent",
      command: `ollama launch hermes --model ${model.ollamaTag}`,
      filename: `launch-hermes-${model.id}.sh`,
      description: "Invoquez l'agent autonome Hermes avec votre modèle.",
    },
    {
      id: "openclaw",
      name: "OpenClaw",
      command: `ollama launch openclaw --model ${model.ollamaTag}`,
      filename: `launch-openclaw-${model.id}.sh`,
      description: "Connectez OpenClaw à votre environnement local.",
    },
    {
      id: "opencode",
      name: "OpenCode",
      command: `ollama launch opencode --model ${model.ollamaTag}`,
      filename: `launch-opencode-${model.id}.sh`,
      description: "Associez OpenCode à votre modèle pour le développement.",
    },
  ];

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Commande ${label} copiée !`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleDownload = (command: string, filename: string) => {
    const fileContent = `#!/bin/bash\n# Script de lancement automatique mAI / Ollama\n# Modèle : ${model.name}\n\n${command}\n`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Script ${filename} téléchargé !`);
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 max-w-5xl mx-auto">
      {/* Bouton Retour */}
      <div>
        <Link
          href="/models"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Hub des Modèles
        </Link>
      </div>

      {/* Hero Header avec Liquid Glass style */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center p-3 shrink-0">
              <Image
                src={model.squareImage}
                alt={model.name}
                width={100}
                height={100}
                sizes="100px"
                className="w-full h-full object-cover rounded-xl drop-shadow-md"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                {model.badge}
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900">
                {model.name}
              </h1>
              <p className="text-slate-600 text-base mt-2 max-w-xl">
                {model.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: model.name,
                  text: model.tagline,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Lien de la fiche copié !");
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm text-xs font-bold text-slate-700 hover:bg-white/70 transition-all self-end md:self-center"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>

        {/* Bannière visuelle */}
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mt-8 border border-white/60 shadow-md">
          <Image
            src={model.bannerImage}
            alt={`${model.name} banner`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Spécifications techniques détaillées */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Cpu className="w-4 h-4 text-blue-500" />
              Paramètres
            </div>
            <span className="text-xl font-black text-slate-900">{model.parameters}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              {model.vision ? (
                <Eye className="w-4 h-4 text-emerald-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-400" />
              )}
              Vision
            </div>
            <span className="text-xl font-black text-slate-900">
              {model.vision ? "Oui (Multimodal)" : "Non"}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Layers className="w-4 h-4 text-blue-500" />
              Fenêtre de Contexte
            </div>
            <span className="text-xl font-black text-slate-900">{model.context}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Calendar className="w-4 h-4 text-amber-500" />
              Date de Sortie
            </div>
            <span className="text-xl font-black text-slate-900">{model.releaseDate}</span>
          </div>
        </div>
      </div>

      {/* Section Commandes d'installation principale */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Installation & Lancement Direct</h2>
            <p className="text-xs text-slate-400">
              Téléchargez et exécutez le modèle directement dans votre terminal.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 font-mono text-sm shadow-inner">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ollama</span>
              <code className="text-blue-300 font-bold select-all break-all">
                {mainCommand}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(mainCommand, "main", "Ollama")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold transition-all shadow"
              >
                {copiedKey === "main" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </button>
              <button
                onClick={() => handleDownload(mainCommand, `run-${model.id}.sh`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 shadow"
              >
                <Download className="w-4 h-4" />
                Script
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 font-mono text-sm shadow-inner">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Hugging Face CLI</span>
              <code className="text-[#FFD21E] font-bold select-all break-all">
                {hfCommand}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(hfCommand, "hf", "Hugging Face")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFD21E] hover:bg-yellow-400 active:bg-yellow-500 text-slate-900 text-xs font-semibold transition-all shadow"
              >
                {copiedKey === "hf" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Intégrations & Commandes de Lancement des 6 Applications */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Commandes de lancement par Application (6 Apps)
          </h2>
          <p className="text-slate-600 text-sm">
            Lancez automatiquement {model.name} dans vos outils et applications préférés.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-white/50 backdrop-blur-md border border-white/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 text-base">{app.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">{app.description}</p>
                <div className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                  <code>{app.command}</code>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                <button
                  onClick={() => handleCopy(app.command, app.id, app.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 border border-slate-300 hover:bg-white text-slate-800 text-xs font-semibold transition-all shadow-sm"
                >
                  {copiedKey === app.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      Copier
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload(app.command, app.filename)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Documentation README Markdown */}
      {model.readmeContent && (
        <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-10">
          <h2 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b border-black/10 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Documentation Officielle (README.md)
          </h2>

          <div className="prose max-w-none prose-headings:text-slate-900 prose-a:text-blue-600 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700">
            <Markdown
              components={{
                h1: ({ node: _node, ...props }) => (
                  <h1 className="text-3xl font-black text-slate-900 mt-6 mb-4" {...props} />
                ),
                h2: ({ node: _node, ...props }) => (
                  <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-black/5" {...props} />
                ),
                h3: ({ node: _node, ...props }) => (
                  <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3" {...props} />
                ),
                p: ({ node: _node, ...props }) => (
                  <p className="mb-4 leading-relaxed text-slate-700" {...props} />
                ),
                ul: ({ node: _node, ...props }) => (
                  <ul className="list-disc list-inside space-y-2 mb-6 text-slate-700" {...props} />
                ),
                ol: ({ node: _node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-6 text-slate-700" {...props} />
                ),
                table: ({ node: _node, ...props }) => (
                  <div className="overflow-x-auto my-6 rounded-2xl border border-white/60 shadow-sm bg-white/30 backdrop-blur-md">
                    <table className="w-full text-sm text-left text-slate-700 border-collapse" {...props} />
                  </div>
                ),
                th: ({ node: _node, ...props }) => (
                  <th className="px-4 py-3 font-bold text-slate-900 bg-slate-900/5 border-b border-black/10" {...props} />
                ),
                td: ({ node: _node, ...props }) => (
                  <td className="px-4 py-3 border-b border-black/5 text-slate-700" {...props} />
                ),
                code: ({ node: _node, className, children, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-blue-100/60 text-blue-800 px-1.5 py-0.5 rounded text-xs font-mono font-semibold" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className={`${className} font-mono text-xs`} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ node: _node, ...props }) => (
                  <pre className="bg-slate-950 text-slate-100 p-4 rounded-2xl overflow-x-auto my-6 font-mono text-xs border border-slate-800 shadow-md" {...props} />
                ),
                blockquote: ({ node: _node, ...props }) => (
                  <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 italic p-4 rounded-r-2xl my-6 text-slate-700 shadow-sm" {...props} />
                ),
                img: ({ node: _node, src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt || "Image du modèle"}
                    className="rounded-2xl border border-white/60 shadow-md my-6 max-w-full h-auto mx-auto"
                    {...props}
                  />
                ),
              }}
            >
              {model.readmeContent}
            </Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
