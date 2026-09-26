"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  HelpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";
import { createSupportTicket } from "@/app/actions/support";
import { PRIORITY_OPTIONS, type SupportPriority } from "@/components/support/support-config";
import { TicketCategoryStep } from "@/components/support/ticket-form/TicketCategoryStep";
import { TicketPriorityStep } from "@/components/support/ticket-form/TicketPriorityStep";
import { TicketProblemStep } from "@/components/support/ticket-form/TicketProblemStep";
import { TicketReviewStep } from "@/components/support/ticket-form/TicketReviewStep";
import { TicketWizardFooter } from "@/components/support/ticket-form/TicketWizardFooter";
import { TicketWizardProgress } from "@/components/support/ticket-form/TicketWizardProgress";
import {
  BUG_CATEGORY,
  DEFAULT_CATEGORY,
  WIZARD_STEPS,
  type TicketEnvInfo,
  type TicketStep,
} from "@/components/support/ticket-form/ticket-form-types";
import { useTicketAttachmentUpload } from "@/components/support/ticket-form/useTicketAttachmentUpload";

export default function NewTicketClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type");
  const isBug = initialType === "bug";
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [step, setStep] = useState<TicketStep>(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState<string>("Web");
  const [category, setCategory] = useState(isBug ? BUG_CATEGORY : DEFAULT_CATEGORY);
  const [priority, setPriority] = useState<SupportPriority>(isBug ? "medium" : "low");
  const [description, setDescription] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [envInfo, setEnvInfo] = useState<TicketEnvInfo>({
    userAgent: "",
    platform: "",
    screenResolution: "",
  });
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const {
    pendingAttachments,
    setPendingAttachments,
    uploading,
    fileInputRef,
    handleFilesSelected,
  } = useTicketAttachmentUpload(user);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEnvInfo({
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform || "Inconnu",
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      });
    }
  }, []);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step, authLoading, isAuthenticated]);

  const getStepValidationMessage = (stepToValidate: TicketStep): string | null => {
    if (stepToValidate === 0) {
      if (!project || !category) return "Choisissez un projet et une catégorie.";
      return null;
    }
    if (stepToValidate === 1) {
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      if (!trimmedTitle) return "Veuillez renseigner un titre.";
      if (trimmedTitle.length < 3 || trimmedTitle.length > 120) return "Titre 3-120 caractères.";
      if (trimmedDescription.length < 15) return "Veuillez détailler davantage (au moins 15 caractères).";
      return null;
    }
    if (stepToValidate === 2) {
      if (uploading) return "Attendez la fin de l'envoi des pièces jointes avant de continuer.";
      if (!PRIORITY_OPTIONS.some((option) => option.id === priority)) return "Choisissez une priorité.";
      return null;
    }
    return null;
  };

  const goToStep = (nextStep: number) => {
    setStepError(null);
    setStep(Math.max(0, Math.min(WIZARD_STEPS.length - 1, nextStep)) as TicketStep);
  };

  const handleNext = () => {
    const message = getStepValidationMessage(step);
    if (message) {
      setStepError(message);
      return;
    }
    goToStep(step + 1);
  };

  const submitTicket = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Veuillez vous connecter pour soumettre un ticket.");
      router.push(`/account/login?next=${encodeURIComponent("/support/new")}`);
      return;
    }
    if (uploading) {
      setStep(2);
      setStepError("Attendez la fin de l'envoi des pièces jointes avant de soumettre le ticket.");
      return;
    }

    for (let index = 0; index < WIZARD_STEPS.length - 1; index += 1) {
      const message = getStepValidationMessage(index as TicketStep);
      if (message) {
        setStep(index as TicketStep);
        setStepError(message);
        return;
      }
    }

    setSubmitting(true);
    try {
      const metadata: Record<string, unknown> = {};
      if (includeDiagnostics) metadata.diagnostics = envInfo;

      const response = await createSupportTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        project,
        priority,
        metadata,
        attachmentIds: pendingAttachments.map((attachment) => attachment.id),
      });

      if (response.success && response.ticket) {
        toast.success("Ticket créé ! L'équipe mAI a été notifiée.");
        router.push(`/support/tickets/${response.ticket.id}`);
      } else {
        toast.error(response.error || "Erreur lors de la création.");
      }
    } catch (reason: unknown) {
      console.error(reason);
      toast.error("Impossible de créer le ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < WIZARD_STEPS.length - 1) {
      handleNext();
      return;
    }
    void submitTicket();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-black/5 bg-white py-32 text-sm font-medium text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-purple-600" aria-hidden="true" />
        <span>Vérification de la session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-3xl border border-black/5 bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
          <HelpCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Authentification requise</h2>
        <p className="text-sm leading-relaxed text-slate-500">Pour créer un ticket et recevoir un suivi personnalisé, connectez-vous.</p>
        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Link href="/account/login?next=/support/new" className="rounded-xl bg-purple-600 px-6 py-3 text-xs font-bold text-white hover:bg-purple-500">Se connecter</Link>
          <Link href="/account/register?next=/support/new" className="rounded-xl bg-slate-100 px-6 py-3 text-xs font-bold text-slate-800 hover:bg-slate-200">Créer un compte</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/support" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour au centre de support
      </Link>

      <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
                {isBug ? <><Bug className="h-7 w-7 text-red-500" aria-hidden="true" /> Signaler un incident</> : <><Sparkles className="h-7 w-7 text-purple-600" aria-hidden="true" /> Créer une nouvelle demande</>}
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">Un e-mail sera transmis à l&apos;équipe mAI. Vous pourrez suivre la demande et échanger directement avec elle.</p>
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">{step + 1} / {WIZARD_STEPS.length}</span>
          </div>
          <TicketWizardProgress step={step} onStepChange={goToStep} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          <div>
            <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-extrabold text-slate-900 outline-none">{WIZARD_STEPS[step].title}</h2>
            <p className="mt-1 text-xs text-slate-500">{WIZARD_STEPS[step].description}</p>
          </div>

          {stepError ? (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{stepError}</span>
            </div>
          ) : null}

          {step === 0 ? <TicketCategoryStep project={project} category={category} onProjectChange={setProject} onCategoryChange={setCategory} /> : null}
          {step === 1 ? <TicketProblemStep title={title} description={description} previewMode={previewMode} onTitleChange={setTitle} onDescriptionChange={setDescription} onPreviewModeChange={setPreviewMode} /> : null}
          {step === 2 ? <TicketPriorityStep priority={priority} attachments={pendingAttachments} uploading={uploading} fileInputRef={fileInputRef} includeDiagnostics={includeDiagnostics} envInfo={envInfo} onPriorityChange={setPriority} onFilesSelected={handleFilesSelected} onRemoveAttachment={(id) => setPendingAttachments((previous) => previous.filter((item) => item.id !== id))} onIncludeDiagnosticsChange={setIncludeDiagnostics} /> : null}
          {step === 3 ? <TicketReviewStep title={title} project={project} category={category} priority={priority} description={description} attachments={pendingAttachments} /> : null}

          <TicketWizardFooter step={step} submitting={submitting} uploading={uploading} onBack={() => goToStep(step - 1)} onNext={handleNext} />
        </form>
      </div>
    </div>
  );
}
