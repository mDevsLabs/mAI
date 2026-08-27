"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, X, Sparkles } from "lucide-react";
import { OnboardingProgress } from "./onboarding-progress";
import type { StepDef, StepContext } from "./types";
import Link from "next/link";
import {
  TIER_TOKEN_LIMITS,
  TIER_REQUEST_LIMITS,
  TIER_DAILY_IMAGE_LIMITS,
  STORAGE_LIMITS_BYTES,
  formatStorageBytes,
} from "@/lib/tiers";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return String(n);
}

function TierCompare({
  tier,
  prevTier,
}: {
  tier: string;
  prevTier?: string | null;
}) {
  const tok = TIER_TOKEN_LIMITS[tier] ?? TIER_TOKEN_LIMITS.Free;
  const req = TIER_REQUEST_LIMITS[tier] ?? TIER_REQUEST_LIMITS.Free;
  const img = TIER_DAILY_IMAGE_LIMITS[tier] ?? TIER_DAILY_IMAGE_LIMITS.Free;
  const stor = STORAGE_LIMITS_BYTES[tier] ?? STORAGE_LIMITS_BYTES.Free;

  const prevTok = prevTier ? (TIER_TOKEN_LIMITS[prevTier] ?? null) : null;

  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {[
        { label: "Tokens / semaine", value: `${formatTokens(tok)}`, sub: prevTok ? `avant ${formatTokens(prevTok)}` : undefined, grad: "from-purple-500 to-blue-500" },
        { label: "Requêtes / mois", value: `${req.toLocaleString("fr-FR")}`, grad: "from-blue-500 to-indigo-500" },
        { label: "Images / jour", value: `${img}`, grad: "from-pink-500 to-purple-500" },
        { label: "Storage Cloud", value: formatStorageBytes(stor), grad: "from-emerald-500 to-teal-500" },
      ].map((c) => (
        <div key={c.label} className="rounded-2xl bg-white border border-slate-200 p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{c.label}</p>
          <p className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${c.grad}`}>{c.value}</p>
          {c.sub && <p className="text-[11px] text-slate-400">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function KeysSystemVisual() {
  const steps = [
    { n: "1", t: "Génération mp-…", d: "Secret aléatoire 48 hex, préfixe mp-", c: "bg-purple-600" },
    { n: "2", t: "Affichage unique", d: "Visible une seule fois, à copier aussitôt", c: "bg-amber-500" },
    { n: "3", t: "Hash SHA-256", d: "Seul le hash est stocké côté serveur", c: "bg-blue-600" },
    { n: "4", t: "Préfixe visible", d: "mp-•••••••• pour identifier, révocable", c: "bg-emerald-600" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      {steps.map((s, i) => (
        <motion.div
          key={s.n}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-3"
        >
          <div className={`w-8 h-8 rounded-xl ${s.c} text-white font-black text-sm flex items-center justify-center shrink-0`}>{s.n}</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-none">{s.t}</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-1">{s.d}</p>
          </div>
        </motion.div>
      ))}
      <div className="sm:col-span-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] font-medium text-amber-900 flex items-center gap-2">
        <ShieldDot />
        Astuce : en-tête <code className="bg-white border px-1 py-0.5 rounded font-mono text-[11px]">Authorization: Bearer mp-…</code> sur chaque requête.
      </div>
    </div>
  );
}

function ShieldDot() {
  return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />;
}

function ModelsHubVisual() {
  const items = [
    { name: "Modèles Texte", href: "/account/models", desc: "Contexte, tools, :free vs premium", col: "from-blue-500 to-purple-600" },
    { name: "Modèles Images", href: "/account/models/images", desc: "Text-to-Image, Flux, tailles", col: "from-pink-500 to-purple-600" },
    { name: "Modèles Audio", href: "/account/models/audio", desc: "TTS 6 voix naturelles", col: "from-indigo-500 to-pink-500" },
    { name: "Modèles mAI", href: "/account/models/mai", desc: "Souverains, Ollama / HF", col: "from-slate-900 to-indigo-900" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      {items.map((it) => (
        <Link
          key={it.name}
          href={it.href}
          className="group rounded-2xl border border-slate-200 bg-white p-3 hover:border-purple-300 hover:shadow-sm transition-all"
        >
          <div className={`inline-flex px-2 py-0.5 rounded-full bg-gradient-to-r ${it.col} text-white text-[10px] font-black uppercase tracking-wider`}>
            {it.name}
          </div>
          <p className="text-xs font-semibold text-slate-700 mt-1.5 group-hover:text-purple-700">{it.desc}</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1 group-hover:underline">Ouvrir →</p>
        </Link>
      ))}
    </div>
  );
}

function QuotasVisual({ tier }: { tier: string }) {
  return <TierCompare tier={tier} />;
}

function UpgradeVisual({ tier, prevTier }: { tier: string; prevTier?: string | null }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-[1px]">
        <div className="rounded-2xl bg-white p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forfait</span>
          <span className="inline-flex items-center gap-2">
            {prevTier && <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold line-through">{prevTier}</span>}
            <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-black">{tier}</span>
          </span>
        </div>
      </div>
      <TierCompare tier={tier} prevTier={prevTier} />
    </div>
  );
}

export function OnboardingCard({
  step,
  stepIndex,
  total,
  context,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  onGoKeys,
  onGoModels,
}: {
  step: StepDef;
  stepIndex: number;
  total: number;
  context: StepContext;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onGoKeys: () => void;
  onGoModels: () => void;
}) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;
  const Icon = step.icon;

  let body: ReactNode = null;
  if (step.renderBody) {
    body = step.renderBody(context);
  } else {
    // default body per id
    if (step.id === "keys-system") body = <KeysSystemVisual />;
    else if (step.id === "models-hub") body = <ModelsHubVisual />;
    else if (step.id === "quotas") body = <QuotasVisual tier={context.tier} />;
    else if (step.id === "unlock" || step.id === "quotas-up") body = <UpgradeVisual tier={context.tier} prevTier={context.prevTier} />;
    else if (step.id === "welcome" && context.username) {
      body = (
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 border border-purple-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white font-black flex items-center justify-center shrink-0">
            {context.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{context.username}</p>
            <p className="text-xs text-slate-600 truncate">{context.email}</p>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full bg-purple-600 text-white text-[11px] font-black uppercase tracking-wider">
            {context.tier}
          </span>
        </div>
      );
    } else if (step.id === "finish" || step.id === "next") {
      body = (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={onGoKeys}
            className="rounded-2xl bg-slate-900 text-white p-4 text-left hover:bg-slate-800 transition-colors"
          >
            <p className="text-sm font-black flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Créer une clé
            </p>
            <p className="text-xs text-slate-300 mt-1">Génère ton token Bearer sécurisé</p>
          </button>
          <button
            onClick={onGoModels}
            className="rounded-2xl bg-white border border-slate-200 p-4 text-left hover:border-purple-300 hover:bg-purple-50/50 transition-colors"
          >
            <p className="text-sm font-black text-slate-900">Explorer les modèles</p>
            <p className="text-xs text-slate-500 mt-1">4 catalogues filtrés par ta clé</p>
          </button>
        </div>
      );
    }
  }

  const handlePrimary = () => {
    if (step.ctaAction === "goKeys") onGoKeys();
    else if (step.ctaAction === "goModels") onGoModels();
    else if (isLast) onComplete();
    else onNext();
  };

  const primaryLabel = step.ctaLabel || (isLast ? "Terminer" : "Suivant");

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="w-full max-w-[560px] rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onb-title"
    >
      {/* top gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-400" />

      <div className="p-6 sm:p-7 space-y-5">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="onb-title" className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                {step.title} {step.titleAccent && <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{step.titleAccent}</span>}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">{step.description}</p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Passer le tutoriel"
            title="Passer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* progress */}
        <OnboardingProgress current={stepIndex} total={total} />

        {/* body */}
        {body && <div className="pt-1">{body}</div>}

        {/* nav */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onSkip}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Passer le tutoriel
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </button>
            )}
            <button
              onClick={handlePrimary}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-black shadow-md hover:shadow-lg transition-all"
            >
              {primaryLabel}
              {!isLast ? <ArrowRight className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
