export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "waiting_user"
  | "resolved"
  | "closed"
  | "reopened"
  | "archived";

export interface SupportTicket {
  id: string;
  ticket_number: number;
  user_id: string;
  user_email: string;
  user_name: string;
  user_tier: string;
  title: string;
  description: string;
  category: string;
  project: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: SupportTicketStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  archived_at?: string | null;
  is_archived?: boolean;
  metadata?: any;
  message_count?: number;
  attachments?: SupportAttachment[];
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_email: string;
  sender_name: string;
  sender_role: "user" | "admin" | "system";
  message: string;
  action_type: "message" | "status_change" | "priority_change" | "created" | "title_change" | "archived" | "unarchived" | "deleted";
  created_at: string;
  is_ai_generated?: boolean;
  is_edited?: boolean;
  attachments?: SupportAttachment[];
}

export interface SupportAttachment {
  id: string;
  ticket_id: string;
  message_id?: string | null;
  uploader_id: string;
  uploader_email?: string;
  uploader_role: "user" | "admin";
  file_url: string;
  file_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export const ADMIN_EMAIL = "mathias.tss2012@gmail.com";

// Limites fichiers support (Z1 Storage)
export const SUPPORT_ATTACHMENT_LIMITS = {
  MAX_FILE_SIZE: 8 * 1024 * 1024, // 8 Mo
  MAX_FILES_PER_ROLE_PER_TICKET: 5, // 5 user + 5 admin par conversation
  ALLOWED_MIMES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "text/plain",
    "text/markdown",
  ] as const,
  ALLOWED_EXTS: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".txt", ".md"] as const,
} as const;

export function isAllowedSupportMime(mime: string, fileName?: string): boolean {
  if (!mime) {
    // fallback sur extension
    if (fileName) {
      const ext = "." + (fileName.split(".").pop() || "").toLowerCase();
      return (SUPPORT_ATTACHMENT_LIMITS.ALLOWED_EXTS as readonly string[]).includes(ext);
    }
    return false;
  }
  if (mime.startsWith("image/")) return true;
  if (mime === "text/plain" || mime === "text/markdown" || mime === "text/csv") return true;
  // .md parfois détecté comme text/plain ou octet-stream → autoriser via extension
  if (fileName) {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".md") || lower.endsWith(".txt")) return true;
  }
  return false;
}

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Ouvert",
  in_progress: "En cours de traitement",
  waiting_user: "En attente de l'utilisateur",
  resolved: "Résolu",
  closed: "Fermé",
  reopened: "Réouvert",
  archived: "Archivé",
};

// Statuts terminaux : seule transition autorisée = reopened
export function isTerminalStatus(status: string): boolean {
  return status === "resolved" || status === "closed";
}

export function getAllowedStatusTransitions(currentStatus: SupportTicketStatus): SupportTicketStatus[] {
  if (isTerminalStatus(currentStatus)) {
    return ["reopened"];
  }
  if (currentStatus === "reopened") {
    // après réouverture, retour cycle normal
    return ["open", "in_progress", "waiting_user", "resolved", "closed", "archived"];
  }
  if (currentStatus === "archived") {
    return ["open", "reopened"]; // désarchiver
  }
  return ["open", "in_progress", "waiting_user", "resolved", "closed", "reopened", "archived"];
}
