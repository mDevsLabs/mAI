"use client";

import { motion } from "motion/react";
import { Cpu, Eye, EyeOff, Layers, Calendar, ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const models15 = [
  {
    id: "mai-1.5-light",
    name: "mAI-1.5-Light",
    num: "01",
    badge: "4B • Vision • Tools • 256K",
    description:
      "Assistant IA local ultra-rapide et multimodal de nouvelle génération 1.5. Léger (4B), équipé de la vision, du raisonnement approfondi (thinking) et des appels d'outils (tools) 100% en local.",
    tagline: "Ultra-rapide, vision, thinking & tools (4B).",
    parameters: "4B",
    vision: true,
    context: "256K tokens",
    releaseDate: "28/08/2026",
    bannerImage: "/mai-1.5-light/mAI-1.5-Light.png",
    squareImage: "/mai-1.5-light/mAI-1.5-Light.png",
    color: "from-cyan-400 to-blue-500",
    shadowHover: "hover:shadow-[0_8px_32px_0_rgba(6,182,212,0.25)]",
    borderHover: "hover:border-cyan-400/40",
    tags: ["4B Paramètres", "Vision Multimodale", "Thinking", "Tools", "Contexte 256K"],
    serieColor: "text-cyan-600",
    serieBg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    id: "mai-1.5-apex",
    name: "mAI-1.5-Apex",
    num: "02",
    badge: "9B • Vision • Tools • 256K",
    description:
      "Le modèle Flagship d'élite de la série 1.5. Avec 9 milliards de paramètres, il combine une puissance de calcul maximale, la vision haute précision, le raisonnement (thinking) et l'exécution d'outils.",
    tagline: "Le sommet de la gamme. Flagship, vision, thinking & tools.",
    parameters: "9B",
    vision: true,
    context: "256K tokens",
    releaseDate: "28/08/2026",
    bannerImage: "/mai-1.5-apex/mAI-1.5-Apex.png",
    squareImage: "/mai-1.5-apex/mAI-1.5-Apex.png",
    color: "from-amber-500 to-rose-600",
    shadowHover: "hover:shadow-[0_8px_32px_0_rgba(245,158,11,0.25)]",
    borderHover: "hover:border-amber-500/40",
    tags: ["9B Paramètres", "Flagship", "Vision", "Thinking", "Tools"],
    serieColor: "text-amber-600",
    serieBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "mai-1.5-opal",
    name: "mAI-1.5-Opal",
    num: "03",
    badge: "27B • Vision • Tools • 256K",
    description:
      "L'équilibre parfait entre vélocité et haute intelligence. Modèle 27B surpuissant avec vision multimodale, raisonnement pas-à-pas (thinking) et function calling (tools) pour les projets exigeants.",
    tagline: "Haute intelligence (27B), vision, thinking & tools.",
    parameters: "27B",
    vision: true,
    context: "256K tokens",
    releaseDate: "28/08/2026",
    bannerImage: "/mai-1.5-opal/mAI-1.5-Opal.png",
    squareImage: "/mai-1.5-opal/mAI-1.5-Opal.png",
    color: "from-indigo-500 to-purple-600",
    shadowHover: "hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.25)]",
    borderHover: "hover:border-indigo-500/40",
    tags: ["27B Paramètres", "Haute Intelligence", "Vision", "Thinking", "Tools"],
    serieColor: "text-indigo-600",
    serieBg: "bg-indigo-500/10 border-indigo-500/20",
  },
];

const models12 = [
  {
    id: "mai-1.2-light",
    name: "mAI-1.2-Light",
    num: "04",
    badge: "3B • Vision • 256K",
    description:
      "Assistant IA local ultra-rapide et multimodal. Léger, capable de voir tes visuels et de gérer tes requêtes au quotidien — productivité, code, résumé et analyse d'images sans envoyer tes données dans le cloud.",
    tagline: "Légèreté maximale, vision intégrée, productivité au quotidien.",
    parameters: "3B",
    vision: true,
    context: "256K tokens",
    releaseDate: "22/07/2026",
    bannerImage: "/mai-1.2-light/mai-1.2-light.png",
    squareImage: "/mai-1.2-light/mai-1.2-light.png",
    color: "from-emerald-400 to-teal-500",
    shadowHover: "hover:shadow-[0_8px_32px_0_rgba(52,211,153,0.25)]",
    borderHover: "hover:border-emerald-400/40",
    tags: ["3B Paramètres", "Vision Multimodale", "Contexte 256K", "Local-first"],
    serieColor: "text-emerald-600",
    serieBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "mai-1.2-apex",
    name: "mAI-1.2-Apex",
    num: "02",
    badge: "9B • Vision • 256K",
    description:
      "Le top tier de la famille mAI. Conçu pour les performances maximales avec vision multimodale, raisonnement avancé, code complexe et RAG lourd — tout en gardant 100% de tes données en local.",
    tagline: "Puissance brute, zéro cloud, performances Apex.",
    parameters: "9B",
    vision: true,
    context: "256K tokens",
    releaseDate: "22/07/2026",
    bannerImage: "/mai-1.2-apex/mai-1.2-apex.png",
    squareImage: "/mai-1.2-apex/mai-1.2-apex.png",
    color: "from-rose-500 to-orange-500",
    shadowHover: "hover:shadow-[0_8px_32px_0_rgba(244,63,94,0.25)]",
    borderHover: "hover:border-rose-500/40",
    tags: ["9B Paramètres", "Vision Multimodale", "Contexte 256K", "Haut de gamme"],
    serieColor: "text-rose-600",
    serieBg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    id: "mai-1.2-opal",
    name: "mAI-1.2-Opal",
    num: "03",
    badge: "33B • Vision • 256K",
    description:
      "Le sweet spot parfait entre rapidité et intelligence. Ultra-fluide et multimodal, il gère aussi bien tes textes que tes images — productivité, code, résumé, RAG et analyse d'images sans envoyer tes données dans le cloud.",
    tagline: "L'équilibre parfait : puissance, fluidité et vision.",
    parameters: "33B",
    vision: true,
    context: "256K tokens",
    releaseDate: "22/07/2026",
    bannerImage: "/mai-1.2-opal/mai-1.2-opal.png",
    squareImage: "/mai-1.2-opal/mai-1.2-opal.png",
    color: "from-violet-500 to-purple-600",
    shadowHover: "hover:shadow-[0_8px_32px_0_rgba(139,92,246,0.25)]",
    borderHover: "hover:border-violet-500/40",
    tags: ["33B Paramètres", "Vision Multimodale", "Contexte 256K", "Équilibré"],
    serieColor: "text-violet-600",
    serieBg: "bg-violet-500/10 border-violet-500/20",
  },
];

const models1 = [
  {
    id: "mai-1",
    name: "mAI-1",
    num: "04",
    badge: "12B • Vision • 256K",
    description:
      "Assistant IA local puissant, multimodal et orienté productivité. Propulsé par Gemma 4 12B, conçu pour le raisonnement, le code et l'analyse d'images.",
    tagline: "La version complète et surpuissante de la famille mAI.",
    parameters: "12B",
    vision: true,
    context: "256K tokens",
    releaseDate: "11/07/2026",
    bannerImage: "/mai-1/mai-1.png",
    squareImage: "/mai-1/mai-1-carre.png",
    color: "from-purple-500 to-indigo-600",
    shadowHover: "hover:shadow-[0_8px_32px_0_rgba(168,85,247,0.25)]",
    borderHover: "hover:border-purple-500/40",
    tags: ["12B Paramètres", "Vision Multimodale", "Contexte 256K", "Local-first"],
    serieColor: "text-purple-600",
    serieBg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "mai-1-light",
    name: "mAI-1-Light",
    num: "05",
    badge: "3B • Rapide • 128K",
    description:
      "Assistant IA local ultra-léger et rapide. Propulsé par IBM Granite 4.1 3B, adapté aux machines modestes pour les réponses instantanées et le travail quotidien.",
    tagline: "Vitesse, efficacité et légèreté sur n'importe quel ordinateur.",
    parameters: "3B",
    vision: false,
    context: "128K tokens",
    releaseDate: "11/07/2026",
    bannerImage: "/mai-1-light/mai-1-light.png",
    squareImage: "/mai-1-light/mai-1-light-carre.png",
    color: "from-blue-500 to-cyan-500",
    shadowHover: "hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.25)]",
    borderHover: "hover:border-blue-500/40",
    tags: ["3B Paramètres", "Texte Uniquement", "Contexte 128K", "Léger & Rapide"],
    serieColor: "text-blue-600",
    serieBg: "bg-blue-500/10 border-blue-500/20",
  },
];

function ModelCard({ model, index }: { model: typeof models12[0]; index: number }) {
  return (
    <motion.div
      key={model.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className={`group relative bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 ${model.borderHover} transition-all duration-300 overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] ${model.shadowHover} flex flex-col justify-between`}
    >
      {/* Numéro décoratif */}
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <div className="text-7xl font-black italic tracking-tighter select-none text-slate-900">
          {model.num}
        </div>
      </div>

      <div className="relative z-10">
        {/* En-tête avec image et titre */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Image
              src={model.squareImage}
              alt={`${model.name} logo`}
              width={80}
              height={80}
              sizes="80px"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {model.name}
            </h2>
          </div>
        </div>

        {/* Image Bannière */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-6 border border-white/60 shadow-sm group-hover:shadow-md transition-all">
          <Image
            src={model.bannerImage}
            alt={`${model.name} banner`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-3">
            <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-medium shadow">
              {model.badge}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {model.description}
        </p>

        {/* Spécifications techniques */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/50">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <Cpu className="w-4 h-4 text-purple-500 shrink-0" />
            <span>Paramètres : <strong>{model.parameters}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            {model.vision ? (
              <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span>Vision : <strong>{model.vision ? "Oui (Multimodal)" : "Non (Texte)"}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <Layers className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Contexte : <strong>{model.context}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Sortie : <strong>{model.releaseDate}</strong></span>
          </div>
        </div>
      </div>

      {/* Actions / Liens */}
      <div className="relative z-10 pt-4 border-t border-black/5 flex items-center justify-between">
        <Link
          href={`/models/${model.id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md group-hover:shadow-lg text-sm"
        >
          Découvrir {model.name}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function ModelsPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-16">
      {/* Hero Section */}
      <div className="text-left space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900"
        >
          Modèles <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">
            mDevsLabs
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-base md:text-lg font-light mt-2 md:mt-4 max-w-2xl"
        >
          Explorez nos modèles de langage open-weights exécutables localement via Ollama. Performance, confidentialité et autonomie.
        </motion.p>
      </div>

      {/* ─── Section mAI-1.5 (Nouvelle Génération 1.5) ───────────────────────── */}
      <motion.section
        id="mai-1.5"
        className="scroll-mt-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Bandeau série */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-amber-500/10 to-indigo-500/10 border border-cyan-500/20 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-500" />
            Nouvelle Génération 1.5
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3 h-3" /> NEW
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
        </div>

        <div className="mb-3">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Série <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-amber-500 to-indigo-600">mAI-1.5</span>
          </h2>
          <p className="text-slate-500 text-sm font-light mt-1 max-w-2xl">
            La toute dernière génération mAI : vision multimodale intégrée, mode thinking (raisonnement étape par étape) et support natif des appels d'outils (tools) 100% en local.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          {models15.map((model, index) => (
            <ModelCard key={model.id} model={model} index={index} />
          ))}
        </div>
      </motion.section>

      {/* ─── Section mAI-1.2 (Génération 1.2) ─────────────────────────── */}
      <motion.section
        id="mai-1.2"
        className="scroll-mt-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Bandeau série */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-rose-500/10 border border-emerald-500/20 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Génération 1.2
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
        </div>

        <div className="mb-3">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Série <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-violet-500 to-rose-500">mAI-1.2</span>
          </h2>
          <p className="text-slate-500 text-sm font-light mt-1 max-w-2xl">
            Multimodaux dès le départ, rapides et intelligents. Tous les modèles mAI-1.2 intègrent la vision et tournent 100% en local via Ollama.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          {models12.map((model, index) => (
            <ModelCard key={model.id} model={model} index={index} />
          ))}
        </div>
      </motion.section>

      {/* ─── Section mAI-1 (Première Génération) ───────────────────────────── */}
      <motion.section
        id="mai-1"
        className="scroll-mt-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Bandeau série */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Première Génération
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/20 to-transparent" />
        </div>

        <div className="mb-3">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Série <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">mAI-1</span>
          </h2>
          <p className="text-slate-500 text-sm font-light mt-1 max-w-2xl">
            La première génération de modèles locaux mDevsLabs. Robustes, éprouvés et toujours disponibles via Ollama.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {models1.map((model, index) => (
            <ModelCard key={model.id} model={model} index={index} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
