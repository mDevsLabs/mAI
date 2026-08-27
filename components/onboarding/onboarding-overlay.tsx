"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingCard } from "./onboarding-card";
import { ConfettiRocket } from "./confetti-rocket";
import { Spotlight } from "./spotlight";
import type { StepDef, StepContext, Flow } from "./types";

export function OnboardingOverlay({
  open,
  flow,
  steps,
  stepIndex,
  context,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  onGoKeys,
  onGoModels,
}: {
  open: boolean;
  flow: Flow;
  steps: StepDef[];
  stepIndex: number;
  context: StepContext;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onGoKeys: () => void;
  onGoModels: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const step = steps[stepIndex] ?? steps[0];
  const showConfetti = open && (step.id === "welcome" || step.id === "unlock" || step.id === "finish" || step.id === "next");

  // lock scroll + focus trap + Esc / arrows
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        // avoid Enter double submit when typing elsewhere
        if (e.key === "Enter" && (e.target as HTMLElement)?.tagName === "INPUT") return;
        e.preventDefault();
        if (stepIndex < steps.length - 1) onNext();
        else onComplete();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (stepIndex > 0) onPrev();
      }
    };
    window.addEventListener("keydown", handleKey);

    // focus first button
    const t = window.setTimeout(() => {
      const el = overlayRef.current?.querySelector("button") as HTMLElement | null;
      el?.focus();
    }, 80);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
      clearTimeout(t);
    };
  }, [open, stepIndex, steps.length, onSkip, onNext, onPrev, onComplete]);

  // click on backdrop = skip (but not on card)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      // keep forced: still allow backdrop to pass? spec says forced but Passer always visible -> backdrop should NOT close implicitly
      // do nothing to avoid accidental dismiss
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          aria-hidden={false}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />

          {/* spotlight if any */}
          {step.spotlightSelector && <Spotlight selector={step.spotlightSelector} />}

          {/* confetti + rocket for welcome / finish */}
          <ConfettiRocket active={showConfetti} />

          {/* card container */}
          <div className="relative z-[101] w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <OnboardingCard
                key={`${flow}-${step.id}`}
                step={step}
                stepIndex={stepIndex}
                total={steps.length}
                context={context}
                onNext={onNext}
                onPrev={onPrev}
                onSkip={onSkip}
                onComplete={onComplete}
                onGoKeys={onGoKeys}
                onGoModels={onGoModels}
              />
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
