-- ─────────────────────────────────────────────────────────────
-- MIGRATION SQL v2 POUR L'ESPACE SUPPORT (mAI)
-- Base de données : Neon Postgres (PostgreSQL 15+)
-- Fichier : scripts/support_v2_upgrade.sql
-- Exécuter APRÈS scripts/support_tables.sql
-- Idempotent : ré-exécutable sans erreur
-- ─────────────────────────────────────────────────────────────

-- 1. Étendre les statuts : ajouter 'reopened' et 'archived'
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_tickets_status_check;
ALTER TABLE support_tickets ADD CONSTRAINT support_tickets_status_check CHECK (status IN ('open','in_progress','waiting_user','resolved','closed','reopened','archived'));

-- 2. Colonnes d'archivage / soft-delete
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_support_tickets_archived ON support_tickets(is_archived);
CREATE INDEX IF NOT EXISTS idx_support_tickets_updated_at ON support_tickets(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_deleted_at ON support_tickets(deleted_at) WHERE deleted_at IS NOT NULL;

-- 3. Messages : flag IA + édition
ALTER TABLE support_ticket_messages ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE support_ticket_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE support_ticket_messages DROP CONSTRAINT IF EXISTS support_ticket_messages_action_type_check;
ALTER TABLE support_ticket_messages ADD CONSTRAINT support_ticket_messages_action_type_check CHECK (action_type IN ('message','status_change','priority_change','created','title_change','archived','unarchived','deleted'));
CREATE INDEX IF NOT EXISTS idx_support_messages_ai ON support_ticket_messages(is_ai_generated) WHERE is_ai_generated = TRUE;

-- 4. Table des pièces jointes Z1 Storage (8 Mo / fichier, 5 fichiers max par rôle)
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES support_ticket_messages(id) ON DELETE SET NULL,
  uploader_id TEXT NOT NULL,
  uploader_email TEXT NOT NULL,
  uploader_role TEXT NOT NULL CHECK (uploader_role IN ('user','admin')),
  file_url TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 8388608),
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_attachments_ticket ON support_ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_attachments_message ON support_ticket_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_support_attachments_uploader_role ON support_ticket_attachments(ticket_id, uploader_role);
CREATE INDEX IF NOT EXISTS idx_support_attachments_created_at ON support_ticket_attachments(created_at DESC);
ALTER TABLE support_ticket_attachments DROP CONSTRAINT IF EXISTS chk_support_attachments_mime;
ALTER TABLE support_ticket_attachments ADD CONSTRAINT chk_support_attachments_mime CHECK (mime_type LIKE 'image/%' OR mime_type IN ('text/plain','text/markdown','text/csv','application/octet-stream'));

-- 5. Fonction purge 365 jours
CREATE OR REPLACE FUNCTION purge_inactive_support_tickets() RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH purged AS (
    DELETE FROM support_tickets WHERE updated_at < NOW() - INTERVAL '365 days' AND deleted_at IS NULL RETURNING id
  ) SELECT COUNT(*) INTO deleted_count FROM purged;
  RETURN COALESCE(deleted_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 6. Nettoyage cohérence archived
UPDATE support_tickets SET is_archived = TRUE, archived_at = COALESCE(archived_at, NOW()) WHERE status = 'archived' AND is_archived = FALSE;
