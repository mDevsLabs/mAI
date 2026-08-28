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
      {/* Bannière d'en-tête du Support */}
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 mb-8 shadow-xl">
        {/* Glow orbs en arrière-plan */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5" />
            Centre d&apos;assistance mAI
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Support & Signalement de bugs
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
            Une anomalie sur un modèle, un problème de quota ou une question technique ? Notre équipe prend en charge vos demandes avec un suivi en temps réel et des alertes immédiates.
          </p>
        </div>

        {/* Navigation secondaire du Support */}
        <nav className="relative z-10 flex flex-wrap gap-2 pt-6 mt-6 border-t border-white/10 text-xs sm:text-sm font-semibold">
          <Link
            href="/support"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
          >
            <LifeBuoy className="w-4 h-4 text-purple-400" />
            Vue d&apos;ensemble
          </Link>
          <Link
            href="/support/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition-all font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            Créer un ticket
          </Link>
          <Link
            href="/support/tickets"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            Mes tickets & Historique
          </Link>
          <Link
            href="/support/stats"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Statistiques
          </Link>
        </nav>
      </section>

      {/* Contenu principal */}
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
