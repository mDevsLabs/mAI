"use client";

import { motion } from "motion/react";

export function OnboardingProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
        <span className="text-slate-500">
          Étape {current + 1} / {total}
        </span>
        <span className="text-purple-600">{percent}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"
        />
      </div>
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: i === current ? 1.25 : 1,
              opacity: i === current ? 1 : 0.45,
            }}
            transition={{ duration: 0.2 }}
            className={`h-2 rounded-full transition-colors ${
              i === current
                ? "w-6 bg-purple-600"
                : i < current
                  ? "w-2 bg-purple-300"
                  : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
