"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import type { AuthUser } from "@/components/auth-provider";
import {
  SUPPORT_ATTACHMENT_LIMITS,
  isAllowedSupportMime,
  type SupportAttachment,
} from "@/app/actions/support-utils";

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

export function useTicketAttachmentUpload(user: AuthUser | null) {
  const [pendingAttachments, setPendingAttachments] = useState<SupportAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    const remaining = SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET - pendingAttachments.length;
    if (remaining <= 0) {
      toast.error(
        `Limite atteinte : ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} fichiers max pour la création.`,
      );
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast(
        `Seuls ${remaining} fichier(s) sur ${files.length} importés (limite ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET}).`,
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
        // Pas de ticketId en création : le fichier reste pending jusqu'à l'envoi.
        try {
          const response = await fetch("/api/support/upload", { method: "POST", body: form });
          const data = (await response.json()) as UploadResponse;
          if (!response.ok || !data.success || !data.attachment) {
            toast.error(data.error || `Échec ${file.name}`);
            continue;
          }

          const attachment = data.attachment;
          const uploaded: SupportAttachment = {
            id: attachment.id,
            ticket_id: attachment.ticket_id || "",
            message_id: null,
            uploader_id: String(user.id || user.email),
            uploader_email: user.email,
            uploader_role: "user",
            file_url: attachment.file_url || data.url || "",
            file_key: attachment.file_key || data.fileKey || "",
            file_name: attachment.file_name,
            file_size: attachment.file_size ?? file.size,
            mime_type: attachment.mime_type || file.type,
            created_at: new Date().toISOString(),
          };
          setPendingAttachments((previous) => [...previous, uploaded]);
          toast.success(`${file.name} uploadé (Z1)`);
        } catch (reason: unknown) {
          toast.error(`Erreur ${file.name}: ${errorMessage(reason, "upload impossible")}`);
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return {
    pendingAttachments,
    setPendingAttachments: setPendingAttachments as Dispatch<SetStateAction<SupportAttachment[]>>,
    uploading,
    fileInputRef,
    handleFilesSelected,
  };
}
