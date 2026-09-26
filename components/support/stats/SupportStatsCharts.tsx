"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { BarChart3, Layers, PieChart as PieIcon, TrendingUp } from "lucide-react";
import type {
  SupportCategoryDatum,
  SupportPriorityDatum,
  SupportProjectDatum,
  SupportStatsData,
  SupportTimelineDatum,
} from "@/components/support/stats/stats-types";

const DONUT_COLORS = ["#9333ea", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#6366f1", "#14b8a6", "#64748b"];

export function SupportStatsCharts({ stats }: { stats: SupportStatsData }) {
  const timelineData: SupportTimelineDatum[] = stats.timeline && stats.timeline.length > 0 ? stats.timeline : [
    { date: "J-6", crees: 2, resolus: 1 },
    { date: "J-5", crees: 3, resolus: 2 },
    { date: "J-4", crees: 1, resolus: 1 },
    { date: "J-3", crees: 4, resolus: 3 },
    { date: "J-2", crees: 2, resolus: 2 },
    { date: "Hier", crees: 5, resolus: 4 },
    { date: "Aujourd'hui", crees: Math.max(1, stats.total || 1), resolus: stats.resolved || 0 },
  ];
  const projectData: SupportProjectDatum[] = stats.byProject && stats.byProject.length > 0 ? stats.byProject : [
    { name: "mAI Web", value: Math.max(1, stats.total || 1) },
    { name: "mAI Pulse", value: 0 },
    { name: "mAI CLI", value: 0 },
  ];
  const priorityData: SupportPriorityDatum[] = stats.byPriority && stats.byPriority.length > 0 ? stats.byPriority : [
    { name: "Faible", value: 1, color: "#3b82f6" },
    { name: "Normale", value: Math.max(1, stats.total || 1), color: "#10b981" },
    { name: "Haute", value: 0, color: "#f97316" },
    { name: "Critique", value: 0, color: "#ef4444" },
  ];
  const categoryData: SupportCategoryDatum[] = stats.byCategory && stats.byCategory.length > 0 ? stats.byCategory : [
    { name: "Bugs techniques", value: Math.max(1, stats.total || 1) },
    { name: "Clés d'API & Quotas", value: 0 },
    { name: "Modèles & Inférence", value: 0 },
  ];

  return (
    <>
      <section className="space-y-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><TrendingUp className="h-5 w-5 text-purple-600" /> Évolution des créations et résolutions de tickets</h2><p className="mt-0.5 text-xs text-slate-500">Suivi de la dynamique de signalement et d&apos;absorption des anomalies.</p></div></div>
        <div className="h-72 w-full pt-4"><ResponsiveContainer width="100%" height="100%"><AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="creesGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} /><stop offset="95%" stopColor="#9333ea" stopOpacity={0} /></linearGradient><linearGradient id="resolusGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} /><YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }} /><Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} /><Area type="monotone" dataKey="crees" name="Tickets créés" stroke="#9333ea" strokeWidth={2.5} fillOpacity={1} fill="url(#creesGradient)" /><Area type="monotone" dataKey="resolus" name="Tickets résolus" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#resolusGradient)" /></AreaChart></ResponsiveContainer></div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><PieIcon className="h-5 w-5 text-blue-600" /> Distribution par projet</h2><p className="mt-0.5 text-xs text-slate-500">Proportion des signalements par application de l&apos;écosystème.</p></div><div className="flex h-64 w-full items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={projectData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">{projectData.map((_: SupportProjectDatum, index: number) => <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }} /><Legend wrapperStyle={{ fontSize: "11px" }} /></PieChart></ResponsiveContainer></div></div>
        <div className="space-y-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><BarChart3 className="h-5 w-5 text-orange-600" /> Répartition par criticité</h2><p className="mt-0.5 text-xs text-slate-500">Ventilation des volumes selon l&apos;urgence déclarée.</p></div><div className="h-64 w-full pt-2"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={priorityData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" /><XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} /><YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} /><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }} /><Bar dataKey="value" name="Nombre de tickets" radius={[0, 8, 8, 0]}>{priorityData.map((entry, index) => <Cell key={`prio-${index}`} fill={entry.color || "#8b5cf6"} />)}</Bar></BarChart></ResponsiveContainer></div></div>
      </section>

      <section className="space-y-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8"><div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Layers className="h-5 w-5 text-indigo-600" /> Répartition par domaine technique / section</h2><p className="mt-0.5 text-xs text-slate-500">Identification des modules applicatifs mobilisant le plus d&apos;assistance.</p></div><div className="h-64 w-full pt-2"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" /><YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} /><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }} /><Bar dataKey="value" name="Tickets" fill="#6366f1" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
    </>
  );
}
