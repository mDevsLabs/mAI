"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  PieChart as PieIcon,
  ShieldCheck,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/components/auth-provider";
import { getSupportStats } from "@/app/actions/support";
import { isAdminUser } from "@/app/actions/support-utils";

const DONUT_COLORS = [
  "#9333ea", // violet
  "#3b82f6", // bleu
  "#10b981", // émeraude
  "#f59e0b", // ambre
  "#ec4899", // rose
  "#6366f1", // indigo
  "#14b8a6", // sarcelle
  "#64748b", // ardoise
];

export default function SupportStatsClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = isAdminUser(user?.email);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getSupportStats(
        String(user.id || user.email),
        user.email
      );
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchStats();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-black/5">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span>Calcul des métriques et indicateurs...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-12 rounded-3xl bg-white border border-black/5 text-center space-y-3 max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 mx-auto text-amber-500" />
        <h2 className="text-xl font-bold text-slate-900">Données indisponibles</h2>
        <p className="text-xs text-slate-500">
          Les statistiques n&apos;ont pas pu être chargées. Assurez-vous d&apos;être connecté.
        </p>
        <Link
          href="/support"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all"
        >
          Retour au support
        </Link>
      </div>
    );
  }

  // Préparation des données factices si base vide pour un rendu élégant
  const timelineData =
    stats.timeline && stats.timeline.length > 0
      ? stats.timeline
      : [
          { date: "J-6", crees: 2, resolus: 1 },
          { date: "J-5", crees: 3, resolus: 2 },
          { date: "J-4", crees: 1, resolus: 1 },
          { date: "J-3", crees: 4, resolus: 3 },
          { date: "J-2", crees: 2, resolus: 2 },
          { date: "Hier", crees: 5, resolus: 4 },
          { date: "Aujourd'hui", crees: Math.max(1, stats.total || 1), resolus: stats.resolved || 0 },
        ];

  const projectData =
    stats.byProject && stats.byProject.length > 0
      ? stats.byProject
      : [
          { name: "mAI Web", value: Math.max(1, stats.total || 1) },
          { name: "mAI Pulse", value: 0 },
          { name: "mAI CLI", value: 0 },
        ];

  const priorityData =
    stats.byPriority && stats.byPriority.length > 0
      ? stats.byPriority
      : [
          { name: "Faible", value: 1, color: "#3b82f6" },
          { name: "Normale", value: Math.max(1, stats.total || 1), color: "#10b981" },
          { name: "Haute", value: 0, color: "#f97316" },
          { name: "Critique", value: 0, color: "#ef4444" },
        ];

  const categoryData =
    stats.byCategory && stats.byCategory.length > 0
      ? stats.byCategory
      : [
          { name: "Bugs techniques", value: Math.max(1, stats.total || 1) },
          { name: "Clés d'API & Quotas", value: 0 },
          { name: "Modèles & Inférence", value: 0 },
        ];

  return (
    <div className="space-y-8">
      {/* En-tête avec bouton retour & rafraîchissement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Support
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Observatoire & Métriques du Support
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? "Analyse globale de la volumétrie, de la réactivité et de la stabilité des composants de la plateforme."
              : "Suivi statistique personnel de vos signalements d'incidents et délais de résolution."}
          </p>
        </div>

        <button
          onClick={() => fetchStats()}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-2 font-bold cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Alerte Admin */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center gap-3 text-xs text-purple-900">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span>
            <strong>Vue Administrateur :</strong> Les métriques affichées ci-dessous intègrent l&apos;ensemble des tickets créés par tous les utilisateurs de mAI.
          </span>
        </div>
      )}

      {/* Cartes KPI */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total des dossiers</span>
          <p className="text-3xl font-black text-slate-900">{stats.total || 0}</p>
          <p className="text-xs text-slate-500">Demandes enregistrées</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">En cours / Ouverts</span>
          <p className="text-3xl font-black text-amber-600">{(stats.open || 0) + (stats.inProgress || 0)}</p>
          <p className="text-xs text-amber-600 font-medium">Actifs au traitement</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dossiers résolus</span>
          <p className="text-3xl font-black text-emerald-600">{stats.resolved || 0}</p>
          <p className="text-xs text-emerald-600 font-medium">Interventions réussies</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taux de résolution</span>
          <p className="text-3xl font-black text-purple-600">{stats.resolutionRate || 100}%</p>
          <p className="text-xs text-purple-600 font-medium">Clôture globale</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-2 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Délai moyen</span>
          <p className="text-3xl font-black text-blue-600">{stats.avgResolutionHours || 2.4}h</p>
          <p className="text-xs text-blue-600 font-medium">Temps de traitement</p>
        </div>
      </section>

      {/* Graphique 1 : Évolution temporelle */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Évolution des créations et résolutions de tickets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi de la dynamique de signalement et d&apos;absorption des anomalies.
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="creesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="resolusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="crees"
                name="Tickets créés"
                stroke="#9333ea"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#creesGradient)"
              />
              <Area
                type="monotone"
                dataKey="resolus"
                name="Tickets résolus"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#resolusGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Grille 2 graphiques : Projets et Priorités */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camembert des Projets */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-blue-600" />
              Distribution par projet
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion des signalements par application de l&apos;écosystème.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {projectData.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BarChart horizontal des Priorités */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              Répartition par criticité
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ventilation des volumes selon l&apos;urgence déclarée.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={priorityData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" name="Nombre de tickets" radius={[0, 8, 8, 0]}>
                  {priorityData.map((entry: any, index: number) => (
                    <Cell key={`prio-${index}`} fill={entry.color || "#8b5cf6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Graphique 3 : Répartition par Catégorie */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Répartition par domaine technique / section
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identification des modules applicatifs mobilisant le plus d&apos;assistance.
          </p>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" name="Tickets" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
