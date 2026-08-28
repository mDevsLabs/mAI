"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import {
  Activity,
  ArrowDownToLine,
  Clock,
  Database,
  Layers,
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

export default function ApiUsagePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/account/login?next=%2Fapi%2Fusage");
    }
  }, [loading, isAuthenticated, router]);
  const [timeRange, setTimeRange] = useState("7d");
  const [isExporting, setIsExporting] = useState(false);
  
  const [stats, setStats] = useState<any>(null);
  const [keysUsage, setKeysUsage] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      const userId = user.username || user.email || "anonymous";
      try {
        const [statsRes, keysRes] = await Promise.all([
          getDashboardStats(userId),
          getUserApiUsage(userId)
        ]);

        if (statsRes.success && statsRes.stats) {
          setStats(statsRes.stats);
        } else {
          toast.error("Impossible de récupérer les statistiques globales.");
        }

        if (keysRes.success && keysRes.keys) {
          setKeysUsage(keysRes.keys);
        }
      } catch {
        toast.error("Erreur serveur lors de la récupération.");
      } finally {
        setLoadingStats(false);
      }
    }
    if (user && isAuthenticated) {
      fetchStats();
    }
  }, [user, isAuthenticated]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      if (!stats) return;
      
      let csvContent = "date,requests,errors\n";
      stats.monthlyData.forEach((row: any) => {
        csvContent += `${row.date},${row.requests},${row.errors}\n`;
      });
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mai_api_usage.csv";
      a.click();
    }, 1500);
  };

  if (loadingStats || !user) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const { totalRequests, avgLatency, successRate, endpointsData, monthlyData, hourlyData } = stats || {};

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
            onClick={() => {
              setLoadingStats(true);
              const userId = user?.username || user?.email || "anonymous";
              getDashboardStats(userId).then(res => {
                if (res.success && res.stats) setStats(res.stats);
                setLoadingStats(false);
              });
            }}
            className="p-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors cursor-pointer shadow-sm"
            title="Actualiser les données"
          >
            <Clock className="w-5 h-5" />
          </button>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
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
        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+14.5%</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Requêtes Totales</p>
          <h3 className="text-3xl font-black text-slate-900">{totalRequests?.toLocaleString()}</h3>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">-12ms</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Latence Moyenne</p>
          <h3 className="text-3xl font-black text-slate-900">{avgLatency}<span className="text-lg text-slate-500 ml-1">ms</span></h3>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+0.1%</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Taux de Succès</p>
          <h3 className="text-3xl font-black text-slate-900">{successRate}<span className="text-lg text-slate-500 ml-1">%</span></h3>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">24 erreurs</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Taux d'Erreur (4xx/5xx)</p>
          <h3 className="text-3xl font-black text-slate-900">{(100 - (successRate || 100)).toFixed(1)}<span className="text-lg text-slate-500 ml-1">%</span></h3>
        </div>
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
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" name="Requêtes" />
                <Area type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorErrors)" name="Erreurs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
              {endpointsData?.length > 0 ? (
                endpointsData.map((ep: any, i: number) => {
                  const total = endpointsData.reduce((acc: number, curr: any) => acc + curr.value, 0);
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
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} name="Latence (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Consommation par Clé */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mt-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Consommation par Clé API</h3>
            <p className="text-sm text-slate-500">Détail de l'utilisation par clé individuelle</p>
          </div>
          <div className="p-2 bg-slate-100 rounded-xl">
            <Layers className="w-5 h-5 text-slate-600" />
          </div>
        </div>
        
        {keysUsage.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Clé API</th>
                  <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Requêtes Consommées</th>
                  <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Limite Max</th>
                  <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Dernière Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {keysUsage.map((k, i) => {
                  const percentUsed = k.maxLimit ? Math.round((k.requestCount / k.maxLimit) * 100) : 0;
                  return (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-mono">
                            {k.key.substring(0, 12)}...
                          </code>
                          <span className="text-[10px] uppercase font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{k.plan}</span>
                        </div>
                      </td>
                      <td className="py-4 font-bold text-slate-900">{k.requestCount.toLocaleString()}</td>
                      <td className="py-4">
                        {k.maxLimit ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-700">{k.maxLimit.toLocaleString()}</span>
                            <div className="flex-1 max-w-[100px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${percentUsed > 90 ? 'bg-red-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{percentUsed}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500 italic">Illimité (Quota global)</span>
                        )}
                      </td>
                      <td className="py-4 text-sm text-slate-500">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }) : 'Jamais'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500 italic">Aucune clé API trouvée.</p>
        )}
      </div>

    </div>
  );
}
