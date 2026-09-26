"use client";

import type { LucideIcon } from "lucide-react";

export function UsageMetricCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  suffix,
  badge,
  badgeClassName,
}: {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: string | number;
  suffix?: string;
  badge: string;
  badgeClassName: string;
}) {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClassName}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${badgeClassName}`}>{badge}</span>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900">
        {value}
        {suffix && <span className="text-lg text-slate-500 ml-1">{suffix}</span>}
      </h3>
    </div>
  );
}
