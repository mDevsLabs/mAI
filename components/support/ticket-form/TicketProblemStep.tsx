"use client";

import ReactMarkdown from "react-markdown";
import { Edit3, Eye } from "lucide-react";

export function TicketProblemStep({
  title,
  description,
  previewMode,
  onTitleChange,
  onDescriptionChange,
  onPreviewModeChange,
}: {
  title: string;
  description: string;
  previewMode: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPreviewModeChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="ticket-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Objet / titre <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400" aria-live="polite">
            {title.length}/120
          </span>
        </div>
        <input
          id="ticket-title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Ex. Erreur HTTP 429 sur /v1/chat/completions…"
          maxLength={120}
          aria-describedby="ticket-title-help"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
        />
        <p id="ticket-title-help" className="text-[11px] text-slate-400">
          Résumez le problème en 3 à 120 caractères.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="ticket-description" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Mode de saisie de la description">
            <button
              type="button"
              onClick={() => onPreviewModeChange(false)}
              aria-pressed={!previewMode}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold ${!previewMode ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" /> Rédiger
            </button>
            <button
              type="button"
              onClick={() => onPreviewModeChange(true)}
              aria-pressed={previewMode}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold ${previewMode ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Aperçu
            </button>
          </div>
        </div>
        {previewMode ? (
          <div className="min-h-[220px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 prose prose-sm max-w-none" aria-label="Aperçu Markdown de la description">
            {description.trim() ? <ReactMarkdown>{description}</ReactMarkdown> : <p className="text-xs italic text-slate-400">Aucun texte.</p>}
          </div>
        ) : (
          <textarea
            id="ticket-description"
            name="description"
            rows={8}
            required
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Décrivez : 1. Que faisiez-vous ? 2. Quel résultat attendiez-vous ? 3. Quelle erreur est apparue ?"
            aria-describedby="ticket-description-help"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
          />
        )}
        <p id="ticket-description-help" className="text-[11px] text-slate-400">
          Markdown accepté : listes, gras et blocs de code facilitent la reproduction. 15 caractères minimum.
        </p>
      </div>
    </div>
  );
}
