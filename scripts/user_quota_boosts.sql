-- ─────────────────────────────────────────────
-- Table des augmentations temporaires de quotas (Boosts)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_quota_boosts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL, -- 'all' pour tous les utilisateurs, ou ID / email / username spécifique
  quota_type VARCHAR(50) NOT NULL, -- 'mai', 'api', 'images', 'audio'
  boost_amount NUMERIC NOT NULL, -- Quantité ajoutée au quota
  boost_mode VARCHAR(20) NOT NULL DEFAULT 'add', -- 'add' (relatif) ou 'set' (plafond fixe)
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour requêtes performantes sur les quotas actifs
CREATE INDEX IF NOT EXISTS idx_quota_boosts_active 
  ON user_quota_boosts (user_id, quota_type, starts_at, expires_at, is_active);
