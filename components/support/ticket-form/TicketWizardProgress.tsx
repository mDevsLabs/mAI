"use client";

import { CheckCircle2 } from "lucide-react";
import { WIZARD_STEPS, type TicketStep } from "@/components/support/ticket-form/ticket-form-types";

export function TicketWizardProgress({
  step,
  onStepChange,
}: {
  step: TicketStep;
  onStepChange: (step: TicketStep) => void;
}) {
  const stepPercent = ((step + 1) / WIZARD_STEPS.length) * 100;

  return (
    <nav className="mt-6" aria-label="Étapes de création du ticket">
      <ol className="grid grid-cols-4 gap-2">
        {WIZARD_STEPS.map((wizardStep, index) => {
          const isCurrent = index === step;
          const isComplete = index < step;
          const canNavigate = index <= step;
          return (
            <li key={wizardStep.title} className="min-w-0">
              <button
                type="button"
                disabled={!canNavigate}
                onClick={() => onStepChange(index as TicketStep)}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-full text-left ${canNavigate ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      isComplete
                        ? "bg-emerald-100 text-emerald-700"
                        : isCurrent
                          ? "bg-purple-600 text-white"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isComplete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={`hidden truncate text-[11px] font-bold sm:block ${isCurrent ? "text-purple-700" : "text-slate-500"}`}>
                    {wizardStep.title}
                  </span>
                </span>
                <span className="mt-2 block h-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full ${isComplete ? "bg-emerald-400" : "bg-purple-500"}`}
                    style={{ width: isComplete || isCurrent ? "100%" : "0%" }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${stepPercent}%` }} />
      </div>
    </nav>
  );
}
