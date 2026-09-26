"use client";

import ReactMarkdown from "react-markdown";
import { Bot, FileText, Image as ImageIcon, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import type { SupportMessage } from "@/app/actions/support-utils";
import type { TicketTimelineProps, TicketDetailUser } from "@/components/support/ticket-detail/ticket-detail-types";

function isCurrentUserMessage(message: SupportMessage, user: TicketDetailUser): boolean {
  return !!user && (message.sender_email === user.email || message.sender_id === String(user.id));
}

export function TicketTimeline({ messages, user, messagesEndRef }: TicketTimelineProps) {
  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
        <MessageSquare className="h-4 w-4" aria-hidden="true" /> Fil des échanges ({messages.length})
      </h2>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isSystem = message.sender_role === "system";
          const isFromAdmin = message.sender_role === "admin";
          const isOriginalPost = message.action_type === "created";
          if (isSystem) {
            return (
              <div key={message.id || index} className="my-4 flex justify-center">
                <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600">
                  <Sparkles className="h-3 w-3 text-purple-600" aria-hidden="true" />{message.message} • {new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          }
          const isCurrentUser = isCurrentUserMessage(message, user);
          return (
            <div key={message.id || index} className={`rounded-3xl border p-5 sm:p-6 ${isFromAdmin ? "border-purple-200 bg-gradient-to-br from-purple-50/80 to-indigo-50/40 shadow-2xs" : isOriginalPost ? "border-slate-200 bg-white shadow-2xs" : isCurrentUser ? "border-slate-200 bg-slate-50/80" : "border-slate-200 bg-white"}`}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-bold shadow-2xs ${isFromAdmin ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                    {isFromAdmin ? <ShieldCheck className="h-5 w-5" aria-hidden="true" /> : (message.sender_name || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{isFromAdmin ? "mAI" : message.sender_name}</span>
                      {isFromAdmin ? <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">mAI • Support</span> : null}
                      {isOriginalPost ? <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Demande initiale</span> : null}
                      {message.is_ai_generated ? <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800"><Bot className="h-3 w-3" aria-hidden="true" /> Contenu créé par IA</span> : null}
                    </div>
                    <p className="text-[11px] text-slate-400">{new Date(message.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              </div>
              <div className="prose prose-sm max-w-none pl-12 leading-relaxed text-slate-800"><ReactMarkdown>{message.message}</ReactMarkdown></div>
              {message.is_ai_generated ? <div className="ml-12 mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><Bot className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span><strong>Note :</strong> Ce message a été généré avec l&apos;assistance de l&apos;IA et relu par l&apos;équipe mAI. Vérifiez les informations critiques.</span></div> : null}
              {message.attachments && message.attachments.length > 0 ? <div className="ml-12 mt-3 grid grid-cols-2 gap-2">{message.attachments.map((attachment) => <a key={attachment.id} href={attachment.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-xs hover:border-purple-200">{attachment.mime_type.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-purple-600" aria-hidden="true" /> : <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />}<span className="truncate font-medium">{attachment.file_name}</span></a>)}</div> : null}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
