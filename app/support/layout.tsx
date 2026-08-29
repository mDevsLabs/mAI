import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, PlusCircle, MessageSquare, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Centre de Support & Assistance | mAI",
  description:
    "Espace officiel d'assistance technique, signalement d'anomalies et suivi des tickets pour l'écosystème mAI et mDevsLabs.",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header type Requêtes - remplace la grande bannière */}
      <div className="max-w-7xl mx-auto w-full space-y-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="text-left space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900">
              Centre de <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                Support mAI
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">
              Une anomalie sur un modèle, un problème de quota ou une question technique ? Créez un ticket, suivez
              l&apos;avancement en temps réel et échangez directement avec l&apos;équipe{" "}
              <span className="font-semibold text-slate-700">mAI</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/support/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Créer un ticket
            </Link>
          </div>
        </div>

        {/* Navigation secondaire compacte (style épuré, pas de bannière sombre) */}
        <nav className="flex flex-wrap gap-2 text-xs font-semibold">
          <Link
            href="/support"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-200 hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition-all shadow-2xs"
          >
            <LifeBuoy className="w-4 h-4 text-purple-600" />
            Vue d&apos;ensemble
          </Link>
          <Link
            href="/support/tickets"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all shadow-2xs"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Mes tickets & Historique
          </Link>
          <Link
            href="/support/stats"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-200 hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-all shadow-2xs"
          >
            <BarChart3 className="w-4 h-4 text-amber-600" />
            Statistiques
          </Link>
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 w-full max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
