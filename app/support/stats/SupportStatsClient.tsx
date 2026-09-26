"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSupportStats } from "@/app/actions/support";
import { isAdminUser } from "@/app/actions/support-utils";
import type { SupportStatsData } from "@/components/support/stats/stats-types";

const SupportStatsCharts = dynamic(
  () => import("@/components/support/stats/SupportStatsCharts").then((module) => module.SupportStatsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center gap-2 rounded-3xl border border-black/5 bg-white px-6 py-16 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-purple-600" aria-hidden="true" /> Chargement des graphiques…
      </div>
    ),
  },
);

export default function SupportStatsClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<SupportStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = isAdminUser(user?.email);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getSupportStats();
      if (response.success && response.stats) setStats(response.stats);
    } catch (error: unknown) {
      console.error("Erreur chargement stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) void fetchStats();
    else if (!authLoading && !isAuthenticated) setLoading(false);
  }, [authLoading, isAuthenticated, fetchStats]);

  if (authLoading || loading) {
    return <div className="flex items-center justify-center rounded-3xl border border-black/5 bg-white py-32"><div className="flex items-center gap-3 text-sm font-medium text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-purple-600" aria-hidden="true" /><span>Calcul des métriques et indicateurs...</span></div></div>;
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-3xl border border-black/5 bg-white p-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-900">Données indisponibles</h2>
        <p className="text-xs text-slate-500">Les statistiques n&apos;ont pas pu être chargées. Assurez-vous d&apos;être connecté.</p>
        <Link href="/support" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-purple-500">Retour au support</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2"><Link href="/support" className="mr-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-slate-900"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Support</Link><h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">Observatoire & Métriques du Support</h1></div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{isAdmin ? "Analyse globale de la volumétrie, de la réactivité et de la stabilité des composants de la plateforme." : "Suivi statistique personnel de vos signalements d'incidents et délais de résolution."}</p>
        </div>
        <button type="button" onClick={() => void fetchStats()} disabled={loading} className="flex cursor-pointer items-center gap-2 self-start rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-600 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 sm:self-auto"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} aria-hidden="true" /><span>Actualiser</span></button>
      </div>

      {isAdmin ? <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50/70 p-4 text-xs text-purple-900"><ShieldCheck className="h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" /><span><strong>Vue Administrateur :</strong> Les métriques affichées ci-dessous intègrent l&apos;ensemble des tickets créés par tous les utilisateurs de mAI.</span></div> : null}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5" aria-label="Indicateurs principaux du support">
        <div className="space-y-2 rounded-3xl border border-black/5 bg-white p-5 shadow-2xs"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total des dossiers</span><p className="text-3xl font-black text-slate-900">{stats.total || 0}</p><p className="text-xs text-slate-500">Demandes enregistrées</p></div>
        <div className="space-y-2 rounded-3xl border border-black/5 bg-white p-5 shadow-2xs"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">En cours / Ouverts</span><p className="text-3xl font-black text-amber-600">{(stats.open || 0) + (stats.inProgress || 0)}</p><p className="text-xs font-medium text-amber-600">Actifs au traitement</p></div>
        <div className="space-y-2 rounded-3xl border border-black/5 bg-white p-5 shadow-2xs"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dossiers résolus</span><p className="text-3xl font-black text-emerald-600">{stats.resolved || 0}</p><p className="text-xs font-medium text-emerald-600">Interventions réussies</p></div>
        <div className="space-y-2 rounded-3xl border border-black/5 bg-white p-5 shadow-2xs"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Taux de résolution</span><p className="text-3xl font-black text-purple-600">{stats.resolutionRate || 100}%</p><p className="text-xs font-medium text-purple-600">Clôture globale</p></div>
        <div className="col-span-2 space-y-2 rounded-3xl border border-black/5 bg-white p-5 shadow-2xs lg:col-span-1"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Délai moyen</span><p className="text-3xl font-black text-blue-600">{stats.avgResolutionHours || 2.4}h</p><p className="text-xs font-medium text-blue-600">Temps de traitement</p></div>
      </section>

      <SupportStatsCharts stats={stats} />
    </div>
  );
}
