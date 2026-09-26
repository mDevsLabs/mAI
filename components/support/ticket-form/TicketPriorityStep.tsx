"use client";

import { CheckCircle2, Laptop } from "lucide-react";
import type { RefObject } from "react";
import type { SupportAttachment } from "@/app/actions/support-utils";
import { PRIORITY_OPTIONS, type SupportPriority } from "@/components/support/support-config";
import type { TicketEnvInfo } from "@/components/support/ticket-form/ticket-form-types";
import { TicketAttachmentPicker } from "@/components/support/ticket-form/TicketAttachmentPicker";

export function TicketPriorityStep({
  priority,
  attachments,
  uploading,
  fileInputRef,
  includeDiagnostics,
  envInfo,
  onPriorityChange,
  onFilesSelected,
  onRemoveAttachment,
  onIncludeDiagnosticsChange,
}: {
  priority: SupportPriority;
  attachments: SupportAttachment[];
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  includeDiagnostics: boolean;
  envInfo: TicketEnvInfo;
  onPriorityChange: (value: SupportPriority) => void;
  onFilesSelected: (files: FileList | null) => void | Promise<void>;
  onRemoveAttachment: (id: string) => void;
  onIncludeDiagnosticsChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-700">
          Priorité <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = priority === option.id;
            return (
              <button
                type="button"
                key={option.id}
                onClick={() => onPriorityChange(option.id)}
                aria-pressed={isSelected}
                className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${isSelected ? option.activeColor : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/70"}`}
              >
                <span>
                  <span className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide">{option.name}</span>
                    {isSelected ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
                  </span>
                  <span className="block text-[11px] leading-tight opacity-80">{option.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <TicketAttachmentPicker
        attachments={attachments}
        uploading={uploading}
        fileInputRef={fileInputRef}
        onFilesSelected={onFilesSelected}
        onRemove={onRemoveAttachment}
      />

      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
        <input
          type="checkbox"
          id="includeDiagnostics"
          checked={includeDiagnostics}
          onChange={(event) => onIncludeDiagnosticsChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded text-purple-600"
        />
        <label htmlFor="includeDiagnostics" className="cursor-pointer select-none text-xs leading-relaxed text-slate-600">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <Laptop className="h-3.5 w-3.5 text-purple-600" aria-hidden="true" /> Métadonnées environnementales
          </span>
          Ajoute le navigateur ({envInfo.platform}) et la résolution pour faciliter la reproduction, sans données sensibles.
        </label>
      </div>
    </div>
  );
}
