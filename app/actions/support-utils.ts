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
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  metadata?: any;
  message_count?: number;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_email: string;
  sender_name: string;
  sender_role: "user" | "admin" | "system";
  message: string;
  action_type: "message" | "status_change" | "priority_change" | "created";
  created_at: string;
}

export const ADMIN_EMAIL = "mathias.tss2012@gmail.com";

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
