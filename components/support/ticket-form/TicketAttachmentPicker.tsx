"use client";

import { FileText, Image as ImageIcon, Loader2, Paperclip, X } from "lucide-react";
import type { RefObject } from "react";
import type { SupportAttachment } from "@/app/actions/support-utils";
import { SUPPORT_ATTACHMENT_LIMITS } from "@/app/actions/support-utils";

export function TicketAttachmentPicker({
  attachments,
  uploading,
  fileInputRef,
  onFilesSelected,
  onRemove,
}: {
  attachments: SupportAttachment[];
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFilesSelected: (files: FileList | null) => void | Promise<void>;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Paperclip className="h-3.5 w-3.5" aria-hidden="true" /> Pièces jointes (Z1 Storage)
        </span>
        <span className="text-[11px] font-bold text-slate-500">
          {attachments.length}/{SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} • 8 Mo max
        </span>
      </div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          event.currentTarget.classList.add("border-purple-400", "bg-purple-50");
        }}
        onDragLeave={(event) => event.currentTarget.classList.remove("border-purple-400", "bg-purple-50")}
        onDrop={(event) => {
          event.preventDefault();
          event.currentTarget.classList.remove("border-purple-400", "bg-purple-50");
          void onFilesSelected(event.dataTransfer.files);
        }}
        className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-center transition-all hover:border-purple-300 hover:bg-purple-50/30"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.txt,.md,text/plain,text/markdown"
          onChange={(event) => void onFilesSelected(event.target.files)}
          aria-label="Sélectionner des pièces jointes"
          className="sr-only"
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          <ImageIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Glissez vos captures / logs ici</p>
          <p className="text-xs text-slate-500">ou</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || attachments.length >= SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Paperclip className="h-4 w-4" aria-hidden="true" />}
          {uploading ? "Upload Z1…" : "Parcourir les fichiers"}
        </button>
        <p className="text-[11px] text-slate-400">Images, .txt et .md uniquement • 8 Mo par fichier</p>
      </div>
      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white p-2">
              {attachment.mime_type.startsWith("image/") ? (
                <img src={attachment.file_url} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <FileText className="h-5 w-5 text-slate-500" aria-hidden="true" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{attachment.file_name}</p>
                <p className="text-[11px] text-slate-500">{(attachment.file_size / 1024).toFixed(1)} Ko • prêt</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(attachment.id)}
                aria-label={`Retirer ${attachment.file_name}`}
                className="cursor-pointer rounded-lg p-1 hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
