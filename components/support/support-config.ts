import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
} from "lucide-react";
import type { SupportTicketStatus } from "@/app/actions/support-utils";

export type SupportPriority = "low" | "medium" | "high" | "urgent";

export type SupportPriorityOption = {
  id: SupportPriority;
  name: string;
  desc: string;
  badgeColor: string;
  activeColor: string;
};

export const PRIORITY_OPTIONS = [
  {
    id: "low",
    name: "Faible",
    desc: "Question générale ou amélioration mineure",
    badgeColor: "border-blue-200 bg-blue-50 text-blue-700",
    activeColor: "ring-2 ring-blue-500 bg-blue-50/80 border-blue-500 text-blue-800",
  },
  {
    id: "medium",
    name: "Normale",
    desc: "Dysfonctionnement partiel ou demande standard",
    badgeColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    activeColor: "ring-2 ring-emerald-500 bg-emerald-50/80 border-emerald-500 text-emerald-800",
  },
  {
    id: "high",
    name: "Haute",
    desc: "Impact sérieux sur votre flux de travail",
    badgeColor: "border-orange-200 bg-orange-50 text-orange-700",
    activeColor: "ring-2 ring-orange-500 bg-orange-50/80 border-orange-500 text-orange-800",
  },
  {
    id: "urgent",
    name: "Critique",
    desc: "Panne bloquante ou interruption totale",
    badgeColor: "border-red-200 bg-red-50 text-red-700",
    activeColor: "ring-2 ring-red-500 bg-red-50/80 border-red-500 text-red-800",
  },
] as const satisfies readonly SupportPriorityOption[];

export type SupportTicketStatusVisual = {
  label: string;
  bg: string;
  icon: LucideIcon;
};

export const STATUS_CONFIG: Record<SupportTicketStatus, SupportTicketStatusVisual> = {
  open: { label: "Ouvert", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  in_progress: { label: "En cours", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Zap },
  waiting_user: { label: "En attente", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: AlertCircle },
  resolved: { label: "Résolu", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  closed: { label: "Fermé", bg: "bg-slate-100 text-slate-700 border-slate-200", icon: CheckCircle2 },
  reopened: { label: "Réouvert", bg: "bg-orange-50 text-orange-700 border-orange-200", icon: RotateCcw },
  archived: { label: "Archivé", bg: "bg-slate-100 text-slate-600 border-slate-200", icon: Archive },
};

export const PRIORITY_BADGES: Record<SupportPriority, { label: string; bg: string }> = {
  urgent: { label: "Critique", bg: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "Haute", bg: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Normale", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  low: { label: "Faible", bg: "bg-blue-100 text-blue-700 border-blue-200" },
};
