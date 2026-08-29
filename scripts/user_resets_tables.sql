-- ==============================================================================
-- Table des réinitialisations de quotas pour les utilisateurs de mAI
-- Utilisé pour stocker les réinitialisations offertes / programmées par l'admin
-- ==============================================================================

CREATE TABLE IF NOT EXISTS user_pending_resets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  reset_type VARCHAR(50) NOT NULL, -- 'all', 'api', 'mai', 'images', 'audio'
  expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = illimité, sinon date d'expiration
  status VARCHAR(20) NOT NULL DEFAULT 'available', -- 'available', 'used', 'expired'
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour accélérer la recherche des réinitialisations actives d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_user_pending_resets_user_status 
  ON user_pending_resets (user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_pending_resets_expires_at 
  ON user_pending_resets (expires_at);
