"use client";

import { Archive, ArchiveRestore, RotateCcw, Trash2 } from "lucide-react";
import type { SupportTicket, SupportTicketStatus } from "@/app/actions/support-utils";

export function TicketActions({
  ticket,
  isTerminal,
  submitting,
  onQuickStatus,
  onArchiveToggle,
  onDelete,
}: {
  ticket: SupportTicket;
  isTerminal: boolean;
  submitting: boolean;
  onQuickStatus: (status: SupportTicketStatus) => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}) {
  const isArchived = ticket.is_archived || ticket.status === "archived";

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {isTerminal ? (
        <button
          type="button"
          onClick={() => onQuickStatus("reopened")}
          disabled={submitting}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 hover:bg-orange-100 disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Rouvrir
        </button>
      ) : ticket.status !== "resolved" && ticket.status !== "closed" ? (
        <button
          type="button"
          onClick={() => onQuickStatus("resolved")}
          disabled={submitting}
          className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
        >
          Marquer résolu
        </button>
      ) : null}
      <button
        type="button"
        onClick={onArchiveToggle}
        disabled={submitting}
        className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
      >
        {isArchived ? <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" /> : <Archive className="h-3.5 w-3.5" aria-hidden="true" />}
        {isArchived ? "Désarchiver" : "Archiver"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={submitting}
        className="cursor-pointer rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 disabled:opacity-40"
        title="Supprimer définitivement"
        aria-label="Supprimer définitivement"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
