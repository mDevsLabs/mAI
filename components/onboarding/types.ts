"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type Flow = "main" | "upgrade";

export type StepDef = {
  id: string;
  title: string;
  titleAccent?: string;
  description: string;
  icon: LucideIcon;
  spotlightSelector?: string; // CSS selector for highlight, optional
  renderBody?: (ctx: StepContext) => ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  ctaAction?: "next" | "complete" | "goKeys" | "goModels" | "custom";
};

export type StepContext = {
  flow: Flow;
  tier: string;
  username: string;
  email: string;
  prevTier?: string | null;
};

export type OnboardingState = {
  flow: Flow | null;
  open: boolean;
  stepIndex: number;
  tier: string;
  username: string;
  email: string;
  prevTier: string | null;
};
