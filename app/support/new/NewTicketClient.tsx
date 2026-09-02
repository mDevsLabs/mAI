"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bug,
  HelpCircle,
  Send,
  Loader2,
  ArrowLeft,
  Eye,
  Edit3,
  CheckCircle2,
  Laptop,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/components/auth-provider";
import { createSupportTicket } from "@/app/actions/support";
import { SUPPORT_ATTACHMENT_LIMITS, isAllowedSupportMime, type SupportAttachment } from "@/app/actions/support-utils";

const PROJECT_OPTIONS = [
  "mAI Web",
  "Vibe",
  "mAI Pulse",
  "mAI CLI",
  "mAI Coder",
  "mSearch",
  "API & Modèles IA",
  "mOffice",
  "Autre projet",
];

const CATEGORY_OPTIONS = [
  "Bug / Anomalie technique",
  "Authentification & Sessions",
  "Modèles d'IA & Inférence",
  "Clés d'API & Quotas",
  "Facturation & Forfaits",
  "Stockage Cloud (Z1)",
  "Génération d'images",
  "Synthèse & Audio",
  "Suggestion / Évolution",
  "Autre demande",
];

const PRIORITY_OPTIONS = [
  {
    id: "low",
    name: "Faible",
    desc: "Question générale ou amélioration mineure",
    badgeColor: "border-blue-200 bg-blue-50 text-blue-700",
    activeColor: "ring-2 ring-blue-500 bg-blue-50/80 border-blue-500 text-blue-800",
  },
  {
    id: "medium",
    name: "Normale",
    desc: "Dysfonctionnement partiel ou demande standard",
    badgeColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    activeColor: "ring-2 ring-emerald-500 bg-emerald-50/80 border-emerald-500 text-emerald-800",
  },
  {
    id: "high",
    name: "Haute",
    desc: "Impact sérieux sur votre flux de travail",
    badgeColor: "border-orange-200 bg-orange-50 text-orange-700",
    activeColor: "ring-2 ring-orange-500 bg-orange-50/80 border-orange-500 text-orange-800",
  },
  {
    id: "urgent",
    name: "Critique",
    desc: "Panne bloquante ou interruption totale",
    badgeColor: "border-red-200 bg-red-50 text-red-700",
    activeColor: "ring-2 ring-red-500 bg-red-50/80 border-red-500 text-red-800",
  },
];

export default function NewTicketClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type");

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [project, setProject] = useState("mAI Web");
  const [category, setCategory] = useState(
    initialType === "bug" ? "Bug / Anomalie technique" : "Modèles d'IA & Inférence"
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">(
    initialType === "bug" ? "medium" : "low"
  );
  const [description, setDescription] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Upload fichiers Z1
  const [pendingAttachments, setPendingAttachments] = useState<SupportAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [envInfo, setEnvInfo] = useState({
    userAgent: "",
    platform: "",
    screenResolution: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEnvInfo({
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform || "Inconnu",
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      });
    }
  }, []);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || !user) return;
    const remaining = SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET - pendingAttachments.length;
    if (remaining <= 0) {
      toast.error(`Limite atteinte : ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} fichiers max pour la création.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) toast(`Seuls ${remaining} fichier(s) sur ${files.length} importés (limite ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET}).`, { icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> });

    setUploading(true);
    for (const file of toUpload) {
      if (file.size > SUPPORT_ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
        toast.error(`${file.name} dépasse 8 Mo`);
        continue;
      }
      if (!isAllowedSupportMime(file.type, file.name)) {
        toast.error(`${file.name} : type non autorisé (images, .txt, .md uniquement)`);
        continue;
      }
      const form = new FormData();
      form.append("file", file);
      // pas de ticketId en création => pending
      form.append("uploaderId", String(user.id || user.email));
      form.append("uploaderEmail", user.email);
      form.append("uploaderName", user.username || user.email.split("@")[0]);
      try {
        const res = await fetch("/api/support/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.error || `Échec ${file.name}`);
          continue;
        }
        const att: SupportAttachment = {
          id: data.attachment.id,
          ticket_id: data.attachment.ticket_id || "",
          message_id: null,
          uploader_id: String(user.id || user.email),
          uploader_email: user.email,
          uploader_role: "user",
          file_url: data.attachment.file_url || data.url,
          file_key: data.attachment.file_key || data.fileKey,
          file_name: data.attachment.file_name,
          file_size: data.attachment.file_size,
          mime_type: data.attachment.mime_type,
          created_at: new Date().toISOString(),
        };
        setPendingAttachments((p) => [...p, att]);
        toast.success(`${file.name} uploadé (Z1)`);
      } catch (e: any) {
        toast.error(`Erreur ${file.name}: ${e?.message}`);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error("Veuillez vous connecter pour soumettre un ticket.");
      router.push(`/account/login?next=${encodeURIComponent("/support/new")}`);
      return;
    }
    if (!title.trim()) {
      toast.error("Veuillez renseigner un titre.");
      return;
    }
    if (title.trim().length < 3 || title.trim().length > 120) {
      toast.error("Titre 3-120 caractères.");
      return;
    }
    if (description.trim().length < 15) {
      toast.error("Veuillez détailler davantage (au moins 15 caractères).");
      return;
    }

    setSubmitting(true);
    try {
      const metadata: Record<string, any> = {};
      if (includeDiagnostics) metadata.diagnostics = envInfo;

      const res = await createSupportTicket({
        userId: String(user.id || user.email),
        userEmail: user.email,
        userName: user.username || user.email.split("@")[0],
        userTier: user.tier || "Free",
        title: title.trim(),
        description: description.trim(),
        category,
        project,
        priority,
        metadata,
        attachmentIds: pendingAttachments.map((a) => a.id),
      });

      if (res.success && res.ticket) {
        toast.success("Ticket créé ! L'équipe mAI a été notifiée.");
        router.push(`/support/tickets/${res.ticket.id}`);
      } else {
        toast.error(res.error || "Erreur lors de la création.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Impossible de créer le ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-black/5">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span>Vérification de la session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-black/5 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Authentification requise</h2>
        <p className="text-sm text-slate-500 leading-relaxed">Pour créer un ticket et recevoir un suivi personnalisé, connectez-vous.</p>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account/login?next=/support/new" className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">Se connecter</Link>
          <Link href="/account/register?next=/support/new" className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold">Créer un compte</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/support" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Retour au centre de support
        </Link>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-black/5 shadow-sm space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {initialType === "bug" ? <><Bug className="w-7 h-7 text-red-500" /> Signaler un incident</> : <><Sparkles className="w-7 h-7 text-purple-600" /> Créer une nouvelle demande</>}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Un e-mail sera immédiatement transmis à l&apos;équipe mAI. Joignez captures ou logs si besoin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Objet / Titre <span className="text-red-500">*</span></label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Erreur HTTP 429 sur /v1/chat/completions…" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-sm text-slate-900 placeholder:text-slate-400 outline-none" maxLength={120} />
            <p className="text-[11px] text-slate-400 text-right">{title.length}/120</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Projet <span className="text-red-500">*</span></label>
              <select value={project} onChange={(e) => setProject(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 text-sm text-slate-900 outline-none font-medium cursor-pointer">
                {PROJECT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Section <span className="text-red-500">*</span></label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 text-sm text-slate-900 outline-none font-medium cursor-pointer">
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Priorité <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {PRIORITY_OPTIONS.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button type="button" key={p.id} onClick={() => setPriority(p.id as any)} className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected ? p.activeColor : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700"}`}>
                    <div>
                      <div className="flex items-center justify-between mb-1"><span className="text-xs font-bold uppercase tracking-wide">{p.name}</span>{isSelected && <CheckCircle2 className="w-4 h-4" />}</div>
                      <p className="text-[11px] opacity-80 leading-tight">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Description <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setPreviewMode(false)} className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${!previewMode ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}><Edit3 className="w-3.5 h-3.5" /> Rédiger</button>
                <button type="button" onClick={() => setPreviewMode(true)} className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${previewMode ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}><Eye className="w-3.5 h-3.5" /> Aperçu</button>
              </div>
            </div>
            {previewMode ? (
              <div className="w-full min-h-[220px] p-4 rounded-2xl bg-slate-50 border border-slate-200 prose prose-sm max-w-none text-slate-800">{description.trim() ? <ReactMarkdown>{description}</ReactMarkdown> : <p className="text-slate-400 italic text-xs">Aucun texte.</p>}</div>
            ) : (
              <textarea rows={8} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez : 1. Que faisiez-vous ? 2. Erreur ? 3. Commandes…" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 text-sm text-slate-900 placeholder:text-slate-400 outline-none leading-relaxed" />
            )}
          </div>

          {/* Upload fichiers Z1 */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> Pièces jointes (Z1 Storage)</span>
              <span className="text-[11px] font-bold text-slate-500">{pendingAttachments.length}/{SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} • 8 Mo max • images / .txt / .md</span>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-purple-400", "bg-purple-50"); }}
              onDragLeave={(e) => e.currentTarget.classList.remove("border-purple-400", "bg-purple-50")}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-purple-400", "bg-purple-50"); handleFilesSelected(e.dataTransfer.files); }}
              className="p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-purple-300 hover:bg-purple-50/30 flex flex-col items-center gap-3 text-center transition-all"
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*,.txt,.md,text/plain,text/markdown" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><ImageIcon className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Glissez vos captures / logs ici</p>
                <p className="text-xs text-slate-500">ou</p>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || pendingAttachments.length >= SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-2">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />} {uploading ? "Upload Z1…" : "Parcourir les fichiers"}
              </button>
              <p className="text-[11px] text-slate-400">Stockage Z1 Storage • 8 Mo max par fichier • 5 fichiers max à la création</p>
            </div>
            {pendingAttachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pendingAttachments.map((a) => (
                  <div key={a.id} className="p-2 rounded-xl bg-white border border-purple-200 flex items-center gap-2">
                    {a.mime_type.startsWith("image/") ? <img src={a.file_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-slate-500" /></div>}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{a.file_name}</p>
                      <p className="text-[11px] text-slate-500">{(a.file_size / 1024).toFixed(1)} Ko • prêt</p>
                    </div>
                    <button type="button" onClick={() => setPendingAttachments((p) => p.filter((x) => x.id !== a.id))} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4 text-slate-500" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <input type="checkbox" id="includeDiagnostics" checked={includeDiagnostics} onChange={(e) => setIncludeDiagnostics(e.target.checked)} className="mt-0.5 w-4 h-4 rounded text-purple-600 cursor-pointer" />
            <label htmlFor="includeDiagnostics" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
              <span className="font-bold text-slate-800 flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5 text-purple-600" /> Métadonnées environnementales</span>
              Ajoute navigateur ({envInfo.platform}) et résolution pour reproduction sans données sensibles.
            </label>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">Demandeur : <strong className="text-slate-800">{user?.username || user?.email}</strong> (Forfait {user?.tier || "Free"})</div>
            <button type="submit" disabled={submitting || uploading} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</> : <><Send className="w-4 h-4" /> Envoyer au support mAI</>}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center">Les tickets inactifs sont supprimés après 365 jours (purge Z1 incluse).</p>
        </form>
      </div>
    </div>
  );
}
