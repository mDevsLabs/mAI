"use client";

import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";

interface QuotaProgressProps {
  used: number;
  limit: number;
  label: string;
  resetLabel?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  tone?: "purple" | "image" | "audio" | "cloud";
  dangerAt?: number;
  showSummary?: boolean;
}

const TONES = {
  purple: "from-purple-500 to-blue-500",
  image: "from-pink-500 via-purple-500 to-indigo-500",
  audio: "from-indigo-500 via-purple-500 to-pink-500",
  cloud: "from-purple-500 to-blue-500",
} as const;

export function QuotaProgress({
  used,
  limit,
  label,
  resetLabel,
  refreshing = false,
  onRefresh,
  tone = "purple",
  dangerAt = 90,
  showSummary = true,
}: QuotaProgressProps) {
  const safeLimit = Math.max(1, limit);
  const percent = Math.min(100, Math.round((used / safeLimit) * 100));
  const danger = percent >= dangerAt;
  const warning = !danger && percent >= 70;

  return (
    <div className="space-y-2">
      {showSummary && (
        <div className="flex items-end justify-between gap-3 text-sm">
          <p className="text-slate-600">
            <span className="font-bold text-slate-900">{used.toLocaleString("fr-FR")}</span> /{" "}
            {limit.toLocaleString("fr-FR")} {label}
          </p>
          <div className="flex items-center gap-2">
            <p className={`font-semibold ${danger ? "text-red-600" : "text-slate-900"}`}>{percent}%</p>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2 rounded-xl border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
                title="Actualiser"
                aria-label="Actualiser l'utilisation"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            danger ? "bg-red-500" : warning ? "bg-amber-500" : `bg-gradient-to-r ${TONES[tone]}`
          }`}
        />
      </div>
      {resetLabel && <p className="text-xs text-slate-500">{resetLabel}</p>}
    </div>
  );
}
