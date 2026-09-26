"use client";

import ReactMarkdown from "react-markdown";
import { CheckCircle2, FileText } from "lucide-react";
import type { SupportAttachment } from "@/app/actions/support-utils";
import { PRIORITY_OPTIONS, type SupportPriority } from "@/components/support/support-config";

export function TicketReviewStep({
  title,
  project,
  category,
  priority,
  description,
  attachments,
}: {
  title: string;
  project: string;
  category: string;
  priority: SupportPriority;
  description: string;
  attachments: SupportAttachment[];
}) {
  const priorityName = PRIORITY_OPTIONS.find((option) => option.id === priority)?.name;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Objet</p>
        <p className="mt-1 text-base font-bold text-slate-900">{title.trim()}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projet</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{project}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catégorie</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{category}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priorité</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{priorityName}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</p>
        <div className="prose prose-sm max-w-none rounded-2xl border border-slate-200 bg-white p-4 text-slate-800">
          <ReactMarkdown>{description.trim()}</ReactMarkdown>
        </div>
      </div>

      {attachments.length > 0 ? (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pièces jointes ({attachments.length})</p>
          <ul className="space-y-2">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">{attachment.file_name}</span>
                <span className="ml-auto shrink-0 text-[10px] text-slate-400">prête</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
        <p>La demande sera enregistrée avec votre compte et les pièces seront rattachées au ticket après l&apos;envoi.</p>
      </div>
    </div>
  );
}
