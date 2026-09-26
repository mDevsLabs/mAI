"use client";

import { Cloud, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

import { CLOUD_STORAGE_LIMITS, formatStorageBytes } from "@/lib/mai-api";

interface CloudStorageData {
  bytes_used?: number;
  files_count?: number;
  over_limit?: boolean;
  percent_used?: number;
}

export function CloudStorageSection({
  usage,
  tier,
  refreshing,
  onRefresh,
}: {
  usage: CloudStorageData | null;
  tier?: string;
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
}) {
  const currentTier = tier || "Free";
  const limit = CLOUD_STORAGE_LIMITS[currentTier] || CLOUD_STORAGE_LIMITS.Free;
  const used = usage?.bytes_used ?? 0;
  const percent = Math.min(
    100,
    usage?.percent_used ?? (limit > 0 ? Math.round((used / limit) * 100) : 0),
  );
  const filesCount = usage?.files_count ?? 0;
  const over = usage?.over_limit || used >= limit;

  return (
    <section
      id="usage-cloud"
      className="scroll-mt-28 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-purple-600" /> Stockage Cloud
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consommation de votre espace Cloud mAI et des fichiers hébergés.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
          title="Actualiser le stockage"
          aria-label="Actualiser le stockage Cloud"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3 text-sm">
          <p className="text-slate-600">
            <span className="font-bold text-slate-900">{formatStorageBytes(used)}</span> /{" "}
            {formatStorageBytes(limit)} consommés
          </p>
          <p className={`font-semibold ${over || percent >= 90 ? "text-red-600" : "text-slate-900"}`}>
            {percent}%
          </p>
        </div>
        <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              over || percent >= 90
                ? "bg-red-500"
                : percent >= 70
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-purple-500 to-blue-500"
            }`}
          />
        </div>
        <p className="text-xs text-slate-500">
          Espace persistant calculé en temps réel selon vos fichiers hébergés.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ["Espace utilisé", formatStorageBytes(used)],
          ["Limite du forfait", formatStorageBytes(limit)],
          ["Fichiers stockés", filesCount.toLocaleString("fr-FR")],
          ["Forfait actuel", currentTier],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/60 border border-slate-200/80 p-3.5 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className={`text-base font-black ${label === "Forfait actuel" ? "text-purple-700" : "text-slate-900"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
