"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import {
  Activity,
  ArrowDownToLine,
  Clock,
  Database,
  Network,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getDashboardStats } from "@/app/actions/api-stats";
import { getUserApiUsage } from "@/app/actions/api-keys";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { UsageChartPoint } from "@/components/account/usage/api-usage-charts";
import { ApiKeysUsageTable } from "@/components/account/usage/api-keys-usage-table";
import { UsageMetricCard } from "@/components/account/usage/usage-metric-card";

const ApiUsageCharts = dynamic(() => import("@/components/account/usage/api-usage-charts"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-2xl bg-slate-100" />,
});

type TimeRange = "24h" | "7d" | "30d" | "all";

interface UsageKey {
  keyRef?: string;
  prefix?: string;
  name?: string;
  plan?: string;
  requestCount?: number;
  maxLimit?: number | null;
  lastUsedAt?: string | null;
}

interface DashboardStats {
  totalRequests?: number;
  avgLatency?: number;
  successRate?: number;
  endpointsData?: Array<{ name: string; value: number; color: string }>;
  monthlyData?: UsageChartPoint[];
  hourlyData?: UsageChartPoint[];
}

export default function ApiUsagePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const userId = user?.id || user?.email || user?.username || null;

  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [keysUsage, setKeysUsage] = useState<UsageKey[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/account/login?next=%2Faccount%2Fusage");
    }
  }, [loading, isAuthenticated, router]);

  const loadStats = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    setLoadingStats(true);
    try {
      const [statsResult, keysResult] = await Promise.all([
        getDashboardStats(),
        getUserApiUsage(),
      ]);

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats as DashboardStats);
      } else {
        toast.error("Impossible de récupérer les statistiques globales.");
      }

      if (keysResult.success && keysResult.keys) {
        setKeysUsage(keysResult.keys as UsageKey[]);
      }
    } catch {
      toast.error("Erreur serveur lors de la récupération.");
    } finally {
      setLoadingStats(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const requestsData = useMemo(() => {
    const rows = stats?.monthlyData || [];
    const limits: Record<TimeRange, number> = {
      "24h": 1,
      "7d": 7,
      "30d": 30,
      all: rows.length,
    };
    return rows.slice(-Math.max(1, limits[timeRange]));
  }, [stats?.monthlyData, timeRange]);

  const latencyData = stats?.hourlyData || [];

  const handleExport = () => {
    setIsExporting(true);
    window.setTimeout(() => {
      setIsExporting(false);
      const header = "date,requests,errors\n";
      const rows = requestsData
        .map((row) => `${row.date || ""},${row.requests || 0},${row.errors || 0}`)
        .join("\n");
      const blob = new Blob([`${header}${rows}\n`], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "mai_api_usage.csv";
      anchor.click();
      window.URL.revokeObjectURL(url);
    }, 400);
  };

  if (loadingStats || !user) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const { totalRequests, avgLatency, successRate, endpointsData } = stats || {};
  const safeEndpoints = endpointsData || [];
  const errorRate = successRate === undefined ? null : Math.max(0, 100 - successRate);

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900"
          >
            Usage de <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
              l'API
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-sm md:text-base font-light max-w-xl"
          >
            Suivez la consommation de vos requêtes, analysez les performances de vos modèles et exportez vos données de diagnostic.
          </motion.p>
        </div>

        {/* Boutons d'actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => void loadStats()}
            className="p-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors cursor-pointer shadow-sm"
            title="Actualiser les données"
          >
            <Clock className="w-5 h-5" />
          </button>

          <select
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value as TimeRange)}
            className="px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
          >
            <option value="24h">Dernières 24h</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="all">Historique complet</option>
          </select>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowDownToLine className="w-4 h-4" />
            )}
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Métriques Clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <UsageMetricCard
          icon={Database}
          iconClassName="bg-purple-500/10 text-purple-600"
          label="Requêtes Totales"
          value={totalRequests?.toLocaleString("fr-FR") ?? "—"}
          badge="Actif"
          badgeClassName="text-emerald-600 bg-emerald-50"
        />
        <UsageMetricCard
          icon={Zap}
          iconClassName="bg-blue-500/10 text-blue-600"
          label="Latence Moyenne"
          value={avgLatency ?? "—"}
          suffix="ms"
          badge="Actif"
          badgeClassName="text-emerald-600 bg-emerald-50"
        />
        <UsageMetricCard
          icon={CheckCircle2}
          iconClassName="bg-emerald-500/10 text-emerald-600"
          label="Taux de Succès"
          value={successRate ?? "—"}
          suffix="%"
          badge="Actif"
          badgeClassName="text-emerald-600 bg-emerald-50"
        />
        <UsageMetricCard
          icon={AlertTriangle}
          iconClassName="bg-amber-500/10 text-amber-600"
          label="Taux d'Erreur (4xx/5xx)"
          value={errorRate === null ? "—" : errorRate.toFixed(1)}
          suffix="%"
          badge="Calculé"
          badgeClassName="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Graphiques Principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Evolution des Requêtes */}
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Évolution des Requêtes</h3>
              <p className="text-sm text-slate-500">Volume de requêtes traitées avec succès vs erreurs</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-xl">
              <Activity className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          
          <ApiUsageCharts variant="requests" data={requestsData} />
        </div>

        {/* Répartition par Route */}
        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Endpoints Utilisés</h3>
              <p className="text-sm text-slate-500">Distribution par route</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-xl">
              <Network className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          
            <div className="flex-1 flex flex-col justify-center gap-6">
              {safeEndpoints.length > 0 ? (
                safeEndpoints.map((ep, i) => {
                  const total = safeEndpoints.reduce((acc, curr) => acc + curr.value, 0);
                  const percent = Math.round((ep.value / (total || 1)) * 100);
                  
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-700 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ep.color }}></span>
                          {ep.name}
                        </span>
                        <span className="text-slate-900">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full" 
                          style={{ backgroundColor: ep.color }} 
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium text-right">{ep.value.toLocaleString()} requêtes</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 italic">Aucune donnée disponible</p>
              )}
            </div>
        </div>
      </div>

      {/* Latence et Performance */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Performance (Latence ms)</h3>
            <p className="text-sm text-slate-500">Temps de réponse de l'API sur 24h</p>
          </div>
          <div className="p-2 bg-slate-100 rounded-xl">
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
        </div>
        
        <ApiUsageCharts variant="latency" data={latencyData} />
      </div>
      
      <ApiKeysUsageTable keys={keysUsage} />

    </div>
  );
}
