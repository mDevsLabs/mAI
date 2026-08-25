"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Gauge, KeyRound, Zap, ArrowRight, ShieldCheck, Cloud, Image as ImageIcon, Volume2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface PlanItem {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  isPopular?: boolean;
  maiTokens: string;
  apiRequests: string;
  cloudStorage: string;
  dailyImages: string;
  audioTokens: string;
}

const PLANS: PlanItem[] = [
  {
    id: "free",
    name: "Free",
    subtitle: "Découvrez ce que l'IA peut faire",
    maiTokens: "1 000 000 tokens / semaine",
    apiRequests: "500 requêtes / mois",
    cloudStorage: "500 MO Cloud",
    dailyImages: "3 images / jour",
    audioTokens: "50 000 tokens / semaine",
  },
  {
    id: "plus",
    name: "Plus",
    subtitle: "Bénéficiez d'une expérience complète",
    maiTokens: "5 000 000 tokens / semaine",
    apiRequests: "1 000 requêtes / mois",
    cloudStorage: "1 GB Cloud",
    dailyImages: "5 images / jour",
    audioTokens: "150 000 tokens / semaine",
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "Maximisez votre productivité",
    badge: "POPULAIRE",
    isPopular: true,
    maiTokens: "10 000 000 tokens / semaine",
    apiRequests: "2 000 requêtes / mois",
    cloudStorage: "2 GB Cloud",
    dailyImages: "10 images / jour",
    audioTokens: "500 000 tokens / semaine",
  },
  {
    id: "max",
    name: "Max",
    subtitle: "Puissance et limites maximales",
    maiTokens: "20 000 000 tokens / semaine",
    apiRequests: "5 000 requêtes / mois",
    cloudStorage: "5 GB Cloud",
    dailyImages: "20 images / jour",
    audioTokens: "2 000 000 tokens / semaine",
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const currentTier = (user?.tier || "Free").toLowerCase().trim();

  return (
    <main className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 text-xs font-bold uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          Offres &amp; Abonnements
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
        >
          Choisissez le forfait adapté à vos besoins
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 text-base"
        >
          Débloquez des limites de consommation étendues pour vos assistants mAI et vos clés d&apos;API.
        </motion.p>
      </div>

      {/* Grid des Tarifs / Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PLANS.map((plan, index) => {
          const isCurrent = currentTier === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? "bg-gradient-to-b from-blue-50/80 to-white border-2 border-blue-500 shadow-xl scale-[1.02]"
                  : "bg-white/60 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.subtitle}</p>
                </div>

                {/* Bouton d'action */}
                <div>
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-center flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Votre forfait actuel
                    </div>
                  ) : (
                    <Link
                      href="/account#upgrade-code"
                      className={`w-full py-3 rounded-2xl font-extrabold text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                        plan.isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      Passer à {plan.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Quotas disponibles */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-purple-100 text-purple-600 mt-0.5">
                      <Gauge className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Quota mAI</p>
                      <p className="text-xs text-slate-600 font-medium">{plan.maiTokens}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-blue-100 text-blue-600 mt-0.5">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Quota API</p>
                      <p className="text-xs text-slate-600 font-medium">{plan.apiRequests}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-cyan-100 text-cyan-600 mt-0.5">
                      <Cloud className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Stockage Cloud</p>
                      <p className="text-xs text-slate-600 font-medium">{plan.cloudStorage}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-pink-100 text-pink-600 mt-0.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Quota Images</p>
                      <p className="text-xs text-slate-600 font-medium">{plan.dailyImages}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-indigo-100 text-indigo-600 mt-0.5">
                      <Volume2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Quota Audio (TTS)</p>
                      <p className="text-xs text-slate-600 font-medium">{plan.audioTokens}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Activation via Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-950 p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
      >
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-black tracking-tight">Vous possédez un code de forfait ?</h2>
          <p className="text-purple-200 text-sm max-w-xl">
            Rendez-vous dans la section d&apos;activation de votre compte pour débloquer immédiatement vos nouveaux quotas.
          </p>
        </div>
        <Link
          href="/account#upgrade-code"
          className="px-6 py-3.5 rounded-2xl bg-white text-purple-950 font-black text-sm hover:bg-purple-50 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
        >
          <Zap className="w-4 h-4 text-purple-600" />
          Activer mon code
        </Link>
      </motion.div>
    </main>
  );
}
