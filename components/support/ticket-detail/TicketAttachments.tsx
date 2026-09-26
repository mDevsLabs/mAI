"use client";

import { ExternalLink, FileText, Paperclip } from "lucide-react";
import type { SupportAttachment } from "@/app/actions/support-utils";

export function TicketAttachments({ attachments }: { attachments: SupportAttachment[] }) {
  if (attachments.length === 0) return null;
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600"><Paperclip className="h-4 w-4" aria-hidden="true" /> Pièces jointes ({attachments.length}) — Z1 Storage (8 Mo max, images/.txt/.md, 5/role)</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {attachments.map((attachment) => (
          <a key={attachment.id} href={attachment.file_url} target="_blank" rel="noreferrer" className="group flex items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 hover:border-purple-300 hover:shadow-2xs">
            {attachment.mime_type.startsWith("image/") ? <img src={attachment.file_url} alt={attachment.file_name} className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100"><FileText className="h-5 w-5 text-slate-500" aria-hidden="true" /></div>}
            <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800 group-hover:text-purple-700">{attachment.file_name}</p><p className="text-[11px] text-slate-400">{(attachment.file_size / 1024).toFixed(1)} Ko • {attachment.uploader_role}</p></div>
          </a>
        ))}
      </div>
      <p className="flex items-center gap-1 text-[10px] text-slate-400"><ExternalLink className="h-3 w-3" aria-hidden="true" /> Les liens ouvrent les fichiers Z1 dans un nouvel onglet.</p>
    </div>
  );
}
