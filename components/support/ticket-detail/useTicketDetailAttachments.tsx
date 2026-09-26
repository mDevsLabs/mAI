"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import type { AuthUser } from "@/components/auth-provider";
import {
  SUPPORT_ATTACHMENT_LIMITS,
  isAllowedSupportMime,
  type SupportAttachment,
  type SupportTicket,
} from "@/app/actions/support-utils";
import type { TicketAttachmentUploadState, TicketRole } from "@/components/support/ticket-detail/ticket-detail-types";

type UploadResponse = {
  success?: boolean;
  error?: string;
  attachment?: {
    id: string;
    ticket_id?: string | null;
    file_url?: string;
    file_key?: string;
    file_name: string;
    file_size?: number;
    mime_type?: string;
  };
  url?: string;
  fileKey?: string;
};

function errorMessage(reason: unknown, fallback: string): string {
  return reason instanceof Error && reason.message ? reason.message : fallback;
}

export function useTicketDetailAttachments({
  user,
  ticket,
  isAdmin,
  existingAttachments,
}: {
  user: AuthUser | null;
  ticket: SupportTicket | null;
  isAdmin: boolean;
  existingAttachments: SupportAttachment[];
}): TicketAttachmentUploadState & { myRole: TicketRole; myAttachmentsCount: number; canUploadMore: boolean } {
  const [pendingAttachments, setPendingAttachments] = useState<SupportAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const myRole: TicketRole = isAdmin ? "admin" : "user";
  const myAttachmentsCount = existingAttachments.filter((attachment) => attachment.uploader_role === myRole).length + pendingAttachments.length;
  const canUploadMore = myAttachmentsCount < SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET;

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user || !ticket) return;
    const remaining = SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET - myAttachmentsCount;
    if (remaining <= 0) {
      toast.error(`Limite atteinte : ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} fichiers max pour ${myRole === "admin" ? "l'administrateur" : "vous"} sur cette conversation.`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast(
        `Seuls ${remaining} fichier(s) sur ${files.length} seront uploadés (limite ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET}/rôle).`,
        { icon: <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" /> },
      );
    }

    setUploading(true);
    try {
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
        form.append("ticketId", ticket.id);
        form.append("uploaderId", String(user.id || user.email));
        form.append("uploaderEmail", user.email);
        form.append("uploaderName", user.username || user.email.split("@")[0]);
        try {
          const response = await fetch("/api/support/upload", { method: "POST", body: form });
          const data = (await response.json()) as UploadResponse;
          if (!response.ok || !data.success) {
            toast.error(data.error || `Échec upload ${file.name}`);
            continue;
          }

          const attachment: SupportAttachment = data.attachment
            ? {
                id: data.attachment.id,
                ticket_id: ticket.id,
                message_id: null,
                uploader_id: String(user.id || user.email),
                uploader_email: user.email,
                uploader_role: myRole,
                file_url: data.attachment.file_url || data.url || "",
                file_key: data.attachment.file_key || data.fileKey || "",
                file_name: data.attachment.file_name,
                file_size: data.attachment.file_size ?? file.size,
                mime_type: data.attachment.mime_type || file.type,
                created_at: new Date().toISOString(),
              }
            : {
                id: data.fileKey || Math.random().toString(36).slice(2),
                ticket_id: ticket.id,
                message_id: null,
                uploader_id: String(user.id || user.email),
                uploader_email: user.email,
                uploader_role: myRole,
                file_url: data.url || "",
                file_key: data.fileKey || "",
                file_name: file.name,
                file_size: file.size,
                mime_type: file.type,
                created_at: new Date().toISOString(),
              };
          setPendingAttachments((previous) => [...previous, attachment]);
          toast.success(`${file.name} uploadé en Z1 Storage`);
        } catch (reason: unknown) {
          toast.error(`Erreur upload ${file.name}: ${errorMessage(reason, "erreur inconnue")}`);
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearPendingAttachments = () => setPendingAttachments([]);
  const removePendingAttachment = (id: string) => setPendingAttachments((previous) => previous.filter((attachment) => attachment.id !== id));

  return {
    pendingAttachments,
    uploading,
    fileInputRef,
    handleFilesSelected,
    clearPendingAttachments,
    removePendingAttachment,
    myRole,
    myAttachmentsCount,
    canUploadMore,
  };
}
