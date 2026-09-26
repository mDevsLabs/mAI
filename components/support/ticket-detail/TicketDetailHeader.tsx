"use client";

import { ExternalLink, Laptop, Pencil, ShieldCheck, X, AlertTriangle, ChevronDown } from "lucide-react";
import { PRIORITY_BADGES, STATUS_CONFIG } from "@/components/support/support-config";
import { TicketActions } from "@/components/support/ticket-detail/TicketActions";
import { TicketAttachments } from "@/components/support/ticket-detail/TicketAttachments";
import type { TicketDetailHeaderProps } from "@/components/support/ticket-detail/ticket-detail-types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export function TicketDetailHeader({
  ticket,
  isAdmin,
  attachments,
  editingTitle,
  titleDraft,
  submitting,
  showDiagnostics,
  onStartTitleEdit,
  onTitleDraftChange,
  onRename,
  onCancelRename,
  onQuickStatus,
  onArchiveToggle,
  onDelete,
  onToggleDiagnostics,
}: TicketDetailHeaderProps) {
  const statusConfig = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
  const StatusIcon = statusConfig.icon;
  const priorityConfig = PRIORITY_BADGES[ticket.priority] ?? PRIORITY_BADGES.medium;
  const dateCreated = new Date(ticket.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const isTerminal = ticket.status === "resolved" || ticket.status === "closed";
  const metadata = asRecord(ticket.metadata);
  const attachmentUrl = typeof metadata?.attachment_url === "string" ? metadata.attachment_url : null;
  const diagnostics = asRecord(metadata?.diagnostics);

  return (
    <div className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-black text-purple-700">#TICK-{ticket.ticket_number || ticket.id.slice(0, 6)}</span>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">{ticket.project}</span>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{ticket.category}</span>
            <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${priorityConfig.bg}`}>{priorityConfig.label}</span>
            {ticket.is_archived ? <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white">Archivé</span> : null}
          </div>

          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={titleDraft}
                onChange={(event) => onTitleDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onRename();
                  if (event.key === "Escape") onCancelRename();
                }}
                className="min-w-0 flex-1 rounded-xl border border-purple-300 bg-white px-3 py-2 text-base font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20"
                maxLength={120}
                aria-label="Nouveau titre du ticket"
              />
              <button type="button" onClick={onRename} disabled={submitting} className="cursor-pointer rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-40">Enregistrer</button>
              <button type="button" onClick={onCancelRename} className="cursor-pointer rounded-xl bg-slate-100 p-2 hover:bg-slate-200" aria-label="Annuler la modification du titre"><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <h1 className="flex-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{ticket.title}</h1>
              <button type="button" onClick={onStartTitleEdit} className="shrink-0 cursor-pointer rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Renommer" aria-label="Renommer le ticket"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          )}

          <p className="text-xs font-medium text-slate-400">
            Ouvert le {dateCreated} • Dernier événement {new Date(ticket.updated_at).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            {isTerminal ? <> • <AlertTriangle className="mr-0.5 inline h-3 w-3 align-middle text-amber-500" aria-hidden="true" /> Ticket fermé — seule option : Réouvert (autres grisées)</> : null}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold ${statusConfig.bg}`}>
            <StatusIcon className="h-4 w-4" aria-hidden="true" /> {statusConfig.label}
          </span>
          <TicketActions ticket={ticket} isTerminal={isTerminal} submitting={submitting} onQuickStatus={onQuickStatus} onArchiveToggle={onArchiveToggle} onDelete={onDelete} />
        </div>
      </div>

      {isAdmin ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-4 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-600" aria-hidden="true" />
            <span className="font-bold text-slate-800">Demandeur :</span>
            <span className="font-medium text-slate-700">{ticket.user_name}</span>
            <span className="font-mono text-purple-700">({ticket.user_email})</span>
            <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">{ticket.user_tier}</span>
          </div>
          <a href={`mailto:${encodeURIComponent(ticket.user_email || "")}?subject=${encodeURIComponent(`Re: [Support mAI #TICK-${ticket.ticket_number}] ${ticket.title}`)}`} className="inline-flex items-center gap-1 font-bold text-purple-700 hover:underline">Écrire par e-mail <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
        </div>
      ) : null}

      <TicketAttachments attachments={attachments} />

      {attachmentUrl ? (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
          <div className="flex min-w-0 items-center gap-2"><ExternalLink className="h-4 w-4 shrink-0 text-purple-600" aria-hidden="true" /><span className="font-bold text-slate-700">Ancien lien :</span><a href={attachmentUrl} target="_blank" rel="noreferrer" className="truncate font-mono text-purple-600 hover:underline">{attachmentUrl}</a></div>
          <a href={attachmentUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold">Ouvrir</a>
        </div>
      ) : null}

      {diagnostics ? (
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <button type="button" onClick={onToggleDiagnostics} className="flex w-full cursor-pointer items-center justify-between bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100">
            <span className="flex items-center gap-2"><Laptop className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" /> Diagnostics</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDiagnostics ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {showDiagnostics ? (
            <div className="space-y-1 border-t border-slate-100 bg-white p-4 font-mono text-xs text-slate-600">
              <p><strong>Plateforme :</strong> {typeof diagnostics.platform === "string" ? diagnostics.platform : "—"}</p>
              <p><strong>Résolution :</strong> {typeof diagnostics.screenResolution === "string" ? diagnostics.screenResolution : "—"}</p>
              <p className="break-all"><strong>User-Agent :</strong> {typeof diagnostics.userAgent === "string" ? diagnostics.userAgent : "—"}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
