"use client";

import { HelpCircle } from "lucide-react";
import {
  CATEGORY_OPTIONS,
  PROJECT_OPTIONS,
} from "@/components/support/ticket-form/ticket-form-types";

export function TicketCategoryStep({
  project,
  category,
  onProjectChange,
  onCategoryChange,
}: {
  project: string;
  category: string;
  onProjectChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="ticket-project" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Projet <span className="text-red-500">*</span>
          </label>
          <select
            id="ticket-project"
            name="project"
            required
            value={project}
            onChange={(event) => onProjectChange(event.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
          >
            {PROJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">Sélectionnez le produit concerné par la demande.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="ticket-category" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Section <span className="text-red-500">*</span>
          </label>
          <select
            id="ticket-category"
            name="category"
            required
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">La catégorie aide à orienter votre demande.</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
        <p>
          Une demande de bug commence par le contexte et le projet. Les étapes suivantes permettent de décrire la reproduction et son impact.
        </p>
      </div>
    </div>
  );
}
