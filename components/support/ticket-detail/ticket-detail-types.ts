import type { FormEvent, RefObject } from "react";
import type { AuthUser } from "@/components/auth-provider";
import type {
  SupportAttachment,
  SupportMessage,
  SupportTicket,
  SupportTicketStatus,
} from "@/app/actions/support-utils";

export type TicketDetailUser = AuthUser | null;
export type TicketReplyStatus = SupportTicketStatus | "";
export type TicketRole = "user" | "admin";

export type TicketDetailHeaderProps = {
  ticket: SupportTicket;
  isAdmin: boolean;
  attachments: SupportAttachment[];
  editingTitle: boolean;
  titleDraft: string;
  submitting: boolean;
  showDiagnostics: boolean;
  onStartTitleEdit: () => void;
  onTitleDraftChange: (value: string) => void;
  onRename: () => void;
  onCancelRename: () => void;
  onQuickStatus: (status: SupportTicketStatus) => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
  onToggleDiagnostics: () => void;
};

export type TicketTimelineProps = {
  messages: SupportMessage[];
  user: TicketDetailUser;
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

export type TicketReplyComposerProps = {
  ticket: SupportTicket;
  isAdmin: boolean;
  myRole: TicketRole;
  selectedStatus: TicketReplyStatus;
  replyText: string;
  isAiGenerated: boolean;
  submitting: boolean;
  uploading: boolean;
  canUploadMore: boolean;
  myAttachmentsCount: number;
  pendingAttachments: SupportAttachment[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSelectedStatusChange: (value: TicketReplyStatus) => void;
  onReplyTextChange: (value: string) => void;
  onAiGeneratedChange: (value: boolean) => void;
  onFilesSelected: (files: FileList | null) => void | Promise<void>;
  onRemoveAttachment: (id: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
};

export type TicketAttachmentUploadState = {
  pendingAttachments: SupportAttachment[];
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFilesSelected: (files: FileList | null) => Promise<void>;
  clearPendingAttachments: () => void;
  removePendingAttachment: (id: string) => void;
};
