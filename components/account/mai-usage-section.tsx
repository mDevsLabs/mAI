"use client";

import { Gauge, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

import { formatResetDate, formatTokens } from "./account-utils";

interface MaiUsage {
  tokensUsed: number;
  limit: number;
  resetAt?: string | null;
}

export function MaiUsageSection({
  usage,
  percent,
  refreshing,
  onRefresh,
}: {
  usage: MaiUsage | null;
  percent: number;
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
}) {
  return (
    <section
      id="usage-mai"
      className="scroll-mt-28 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-purple-600" /> Usage mAI
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl border border-slate-200 hover:bg-white/80 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
          title="Actualiser"
          aria-label="Actualiser l'usage mAI"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {usage ? (
        <>
          <div className="flex items-end justify-between gap-3 text-sm">
            <p className="text-slate-600">
              <span className="font-bold text-slate-900">{formatTokens(usage.tokensUsed)}</span> /{" "}
              {formatTokens(usage.limit)} tokens
            </p>
            <p className="font-semibold text-slate-900">{percent}%</p>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                percent >= 90
                  ? "bg-red-500"
                  : percent >= 70
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-purple-500 to-blue-500"
              }`}
            />
          </div>
          <p className="text-xs text-slate-500">
            Réinitialisation hebdomadaire : {formatResetDate(usage.resetAt)}
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-500">Impossible de charger le quota. Réessayez.</p>
      )}
    </section>
  );
}
