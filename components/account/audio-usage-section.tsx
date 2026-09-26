"use client";

import { Volume2 } from "lucide-react";

import { formatResetDate, type AudioUsageData } from "./account-utils";
import { QuotaProgress } from "./quota-progress";

export function AudioUsageSection({
  usage,
  refreshing,
  onRefresh,
}: {
  usage: AudioUsageData | null;
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
}) {
  return (
    <section
      id="usage-audio"
      className="scroll-mt-28 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-600" /> Usage Audio
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Consommation hebdomadaire de tokens de synthèse vocale (TTS).
        </p>
      </div>
      {usage ? (
        <QuotaProgress
          used={usage.tokensUsed}
          limit={usage.weeklyLimit}
          label="tokens"
          resetLabel={`Réinitialisation hebdomadaire : ${formatResetDate(usage.resetAt)}`}
          refreshing={refreshing}
          onRefresh={onRefresh}
          tone="audio"
        />
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Impossible de charger l&apos;usage audio.</p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 disabled:opacity-50"
          >
            Réessayer
          </button>
        </div>
      )}
    </section>
  );
}
