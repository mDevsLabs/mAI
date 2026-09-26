"use client";

import { Bot, Lightbulb, Loader2, Send } from "lucide-react";
import type { SupportTicketStatus } from "@/app/actions/support-utils";
import { getAllowedStatusTransitions } from "@/app/actions/support-utils";
import type { TicketReplyComposerProps } from "@/components/support/ticket-detail/ticket-detail-types";
import { TicketDetailAttachmentPicker } from "@/components/support/ticket-detail/TicketDetailAttachmentPicker";

const ALL_STATUSES: Array<{ value: SupportTicketStatus; label: string }> = [
  { value: "open", label: "Ouvert" },
  { value: "in_progress", label: "En cours" },
  { value: "waiting_user", label: "En attente de l'utilisateur" },
  { value: "resolved", label: "Résolu" },
  { value: "closed", label: "Fermé" },
  { value: "reopened", label: "Réouvert" },
  { value: "archived", label: "Archivé" },
];

export function TicketReplyComposer({
  ticket,
  isAdmin,
  myRole,
  selectedStatus,
  replyText,
  isAiGenerated,
  submitting,
  uploading,
  canUploadMore,
  myAttachmentsCount,
  pendingAttachments,
  fileInputRef,
  onSelectedStatusChange,
  onReplyTextChange,
  onAiGeneratedChange,
  onFilesSelected,
  onRemoveAttachment,
  onSubmit,
}: TicketReplyComposerProps) {
  const isTerminal = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="space-y-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Send className="h-4 w-4 text-purple-600" aria-hidden="true" /> Répondre</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden font-medium text-slate-500 sm:inline">Statut :</span>
          <label htmlFor="ticket-reply-status" className="sr-only">Statut du ticket après réponse</label>
          <select id="ticket-reply-status" value={selectedStatus} onChange={(event) => onSelectedStatusChange(event.target.value as SupportTicketStatus | "")} className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-purple-500">
            {ALL_STATUSES.map((status) => {
              const isAllowed = getAllowedStatusTransitions(ticket.status).includes(status.value);
              const disabled = !isAllowed;
              return <option key={status.value} value={status.value} disabled={disabled} style={disabled ? { color: "#94a3b8" } : undefined}>{status.label} {disabled ? "— indisponible (fermé)" : ""}</option>;
            })}
          </select>
        </div>
      </div>

      {isTerminal && selectedStatus !== "reopened" && selectedStatus !== ticket.status ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Ce ticket est fermé/résolu. Seule l&apos;option <strong>Réouvert</strong> est disponible (autres options grisées).</div> : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <label htmlFor="ticket-reply-text" className="sr-only">Votre réponse</label>
        <textarea id="ticket-reply-text" rows={4} value={replyText} onChange={(event) => onReplyTextChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) onSubmit(); }} placeholder={isAdmin ? "Réponse officielle mAI… (e-mail auto)" : "Précisions ou confirmation… (Ctrl+Entrée)"} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10" />

        <TicketDetailAttachmentPicker attachments={pendingAttachments} uploading={uploading} canUploadMore={canUploadMore} myAttachmentsCount={myAttachmentsCount} role={myRole} fileInputRef={fileInputRef} onFilesSelected={onFilesSelected} onRemove={onRemoveAttachment} />

        {isAdmin ? <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"><input type="checkbox" checked={isAiGenerated} onChange={(event) => onAiGeneratedChange(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-amber-300 text-purple-600 focus:ring-purple-500" /><span className="text-xs leading-relaxed text-amber-900"><strong className="flex items-center gap-1"><Bot className="h-3.5 w-3.5" aria-hidden="true" /> Contenu créé par IA</strong>Cochez si ce message a été généré avec l&apos;assistance de l&apos;IA. Un badge sera affiché à l&apos;utilisateur indiquant que le contenu est peut-être créé par IA.</span></label> : null}

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[11px] text-slate-400"><Lightbulb className="mr-0.5 inline h-3 w-3 align-middle text-amber-400" aria-hidden="true" /> <kbd className="rounded border bg-slate-100 px-1.5 py-0.5 text-[10px]">Ctrl + Entrée</kbd> pour envoyer. Purge auto après 365j d&apos;inactivité (fichiers Z1 inclus).</p>
          <button type="submit" disabled={submitting || uploading || (!replyText.trim() && pendingAttachments.length === 0 && selectedStatus === ticket.status)} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Envoi…</> : <><Send className="h-4 w-4" aria-hidden="true" /> Envoyer la réponse</>}</button>
        </div>
      </form>
    </div>
  );
}

