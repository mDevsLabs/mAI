/**
 * Script de migration adapté à la VRAIE structure de la base Neon
 * Basé sur l'audit du 2026-09-02 :
 *   - usage_logs.user_id est UUID (pas INTEGER)
 *   - weekly_usage existe sans updated_at
 *   - user_settings manque 5 colonnes
 *   - users et profiles manquent is_verified
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const eq = line.indexOf('=');
  if (eq < 0 || line.trim().startsWith('#')) continue;
  const key = line.substring(0, eq).trim();
  let val = line.substring(eq + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  envVars[key] = val;
}

const sql = neon(envVars.DATABASE_URL);

async function runAlter(name, query) {
  try {
    await sql.unsafe(query);
    console.log(`  ✅ ${name}`);
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('does not exist') || e.message.includes('duplicate')) {
      console.log(`  ⏭️  ${name} — déjà appliqué`);
    } else {
      console.error(`  ❌ ${name} — ERREUR: ${e.message}`);
    }
  }
}

async function migrate() {
  console.log('\n🚀 MIGRATION RÉELLE — Basée sur audit de la base Neon\n');
  console.log('═'.repeat(60));

  // ─────────────────────────────────────────────────────────────
  // 1. users — Ajouter is_verified
  // ─────────────────────────────────────────────────────────────
  console.log('\n👤 TABLE users:');
  await runAlter(
    'users.is_verified',
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`
  );

  // ─────────────────────────────────────────────────────────────
  // 2. profiles — Ajouter is_verified
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 TABLE profiles:');
  await runAlter(
    'profiles.is_verified',
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`
  );
  await runAlter(
    'profiles.updated_at',
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
  );

  // ─────────────────────────────────────────────────────────────
  // 3. user_settings — Ajouter les 5 colonnes manquantes
  // ─────────────────────────────────────────────────────────────
  console.log('\n⚙️  TABLE user_settings:');
  await runAlter(
    'user_settings.feed_default_mode',
    `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS feed_default_mode VARCHAR(32) DEFAULT 'for_you'`
  );
  await runAlter(
    'user_settings.hide_reposts',
    `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS hide_reposts BOOLEAN DEFAULT FALSE`
  );
  await runAlter(
    'user_settings.blocked_keywords',
    `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS blocked_keywords TEXT[] DEFAULT '{}'`
  );
  await runAlter(
    'user_settings.two_factor_auth',
    `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS two_factor_auth BOOLEAN DEFAULT FALSE`
  );
  await runAlter(
    'user_settings.allow_mentions',
    `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS allow_mentions VARCHAR(32) DEFAULT 'everyone'`
  );
  await runAlter(
    'user_settings.allow_dms_from',
    `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS allow_dms_from VARCHAR(20) DEFAULT 'everyone'`
  );
  await runAlter(
    'user_settings.mai_auto_approve_tools',
    `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS mai_auto_approve_tools BOOLEAN DEFAULT FALSE`
  );
  await runAlter(
    'user_settings.posts_ai_generated_by_default',
    `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS posts_ai_generated_by_default BOOLEAN DEFAULT FALSE`
  );

  // ─────────────────────────────────────────────────────────────
  // 4. usage_logs — Ajouter colonne endpoint (manquante selon schéma)
  // Note: user_id est UUID dans cette table (pas INTEGER) — NORMAL
  // ─────────────────────────────────────────────────────────────
  console.log('\n📊 TABLE usage_logs:');
  await runAlter(
    'usage_logs.endpoint',
    `ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS endpoint TEXT`
  );

  // ─────────────────────────────────────────────────────────────
  // 5. weekly_usage — Ajouter updated_at
  // ─────────────────────────────────────────────────────────────
  console.log('\n📈 TABLE weekly_usage:');
  await runAlter(
    'weekly_usage.updated_at',
    `ALTER TABLE weekly_usage ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
  );

  // ─────────────────────────────────────────────────────────────
  // 6. posts — Ajouter parent_post_id et is_repost
  // ─────────────────────────────────────────────────────────────
  console.log('\n📝 TABLE posts:');
  await runAlter(
    'posts.parent_post_id',
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS parent_post_id UUID REFERENCES posts(id) ON DELETE SET NULL`
  );
  await runAlter(
    'posts.is_repost',
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT FALSE`
  );
  await runAlter(
    'posts.ai_generated',
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE`
  );
  await runAlter(
    'posts.quoted_post_id',
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS quoted_post_id UUID REFERENCES posts(id) ON DELETE SET NULL`
  );
  await runAlter(
    'post_format.article',
    `ALTER TYPE post_format ADD VALUE IF NOT EXISTS 'article'`
  );
  await runAlter(
    'post_format.media',
    `ALTER TYPE post_format ADD VALUE IF NOT EXISTS 'media'`
  );
  await runAlter(
    'post_format.mai_generation',
    `ALTER TYPE post_format ADD VALUE IF NOT EXISTS 'mai_generation'`
  );

  // ─────────────────────────────────────────────────────────────
  // 7. notifications — Assurer is_read
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔔 TABLE notifications:');
  await runAlter(
    'notifications.is_read',
    `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE`
  );

  // ─────────────────────────────────────────────────────────────
  // 8. direct_messages — Assurer read_at
  // ─────────────────────────────────────────────────────────────
  console.log('\n💬 TABLE direct_messages:');
  await runAlter(
    'direct_messages.read_at',
    `ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE`
  );

  // ─────────────────────────────────────────────────────────────
  // 8b. comments — Colonnes réponses imbriquées + likes
  // ─────────────────────────────────────────────────────────────
  console.log('\n💬 TABLE comments:');
  await runAlter(
    'comments.parent_comment_id',
    `ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE`
  );
  await runAlter(
    'comments.depth',
    `ALTER TABLE comments ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0`
  );
  await runAlter(
    'comments.likes_count',
    `ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0`
  );
  await runAlter(
    'comments.is_hidden',
    `ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE`
  );
  await runAlter(
    'table comment_likes',
    `CREATE TABLE IF NOT EXISTS comment_likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id BIGINT NOT NULL,
      comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (user_id, comment_id)
    )`
  );

  // ─────────────────────────────────────────────────────────────
  // 8c. direct_messages — Réponses + réactions DM
  // ─────────────────────────────────────────────────────────────
  await runAlter(
    'direct_messages.reply_to_id',
    `ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL`
  );
  await runAlter(
    'table dm_reactions',
    `CREATE TABLE IF NOT EXISTS dm_reactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
      user_id BIGINT NOT NULL,
      emoji VARCHAR(16) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (message_id, user_id, emoji)
    )`
  );

  // ─────────────────────────────────────────────────────────────
  // 9. Bot account — Créer @bot si absent
  // ─────────────────────────────────────────────────────────────
  console.log('\n🤖 COMPTE @bot:');
  try {
    const existing = await sql`SELECT id FROM users WHERE username = 'bot' LIMIT 1`;
    if (existing.length === 0) {
      const botUser = await sql`
        INSERT INTO users (username, email, password_hash, tier, avatar_url, is_verified)
        VALUES (
          'bot',
          'bot@vibe.ai',
          '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
          'Pro',
          'https://api.dicebear.com/7.x/bottts/svg?seed=vibe-bot',
          TRUE
        )
        ON CONFLICT (username) DO UPDATE SET is_verified = TRUE, avatar_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=vibe-bot'
        RETURNING id
      `;
      const botId = botUser[0]?.id;
      if (botId) {
        await sql`
          INSERT INTO profiles (user_id, display_name, bio, avatar_url, is_verified)
          VALUES (${botId}, 'Bot', 'Compte officiel de test Vibe 🤖', 'https://api.dicebear.com/7.x/bottts/svg?seed=vibe-bot', TRUE)
          ON CONFLICT (user_id) DO UPDATE SET display_name = 'Bot', is_verified = TRUE
        `;
        // Posts de test
        const postCount = await sql`SELECT COUNT(*) as n FROM posts WHERE author_id = ${botId}`;
        if (Number(postCount[0].n) < 2) {
          await sql`
            INSERT INTO posts (author_id, content, format, visibility, toxicity_score, created_via)
            VALUES (${botId}, 'Bienvenue sur Vibe ! 🚀 Je suis le bot de test officiel @bot. Vous pouvez liker, commenter ou m''envoyer un message en DM !', 'micro_text', 'public', 0.01, 'mai_agent')
          `;
          await sql`
            INSERT INTO posts (author_id, content, format, visibility, toxicity_score, created_via)
            VALUES (${botId}, 'Test de publication avec #mAI sur Vibe ! Intelligence artificielle intégrée ✨🤖 #Vibe #Innovation', 'micro_text', 'public', 0.01, 'mai_agent')
          `;
        }
        console.log(`  ✅ Compte @bot créé (id: ${botId})`);
      }
    } else {
      // Mettre à jour is_verified si la colonne vient d'être ajoutée
      await sql`UPDATE users SET is_verified = TRUE WHERE username = 'bot'`;
      await sql`UPDATE profiles SET is_verified = TRUE WHERE user_id = ${existing[0].id}`;
      console.log(`  ⏭️  @bot existe déjà (id: ${existing[0].id}) — is_verified mis à TRUE`);
    }
  } catch (e) {
    console.error(`  ❌ Erreur bot: ${e.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 10. Index de performance
  // ─────────────────────────────────────────────────────────────
  console.log('\n⚡ INDEX DE PERFORMANCE:');
  await runAlter(
    'idx_posts_published_at',
    `CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC)`
  );
  await runAlter(
    'idx_posts_visibility_published',
    `CREATE INDEX IF NOT EXISTS idx_posts_visibility_published ON posts(visibility, published_at DESC)`
  );
  await runAlter(
    'extension_pg_trgm',
    `CREATE EXTENSION IF NOT EXISTS pg_trgm`
  );
  await runAlter(
    'idx_posts_content_trgm',
    `CREATE INDEX IF NOT EXISTS idx_posts_content_trgm ON posts USING gin (content gin_trgm_ops)`
  );
  await runAlter(
    'idx_users_username_trgm',
    `CREATE INDEX IF NOT EXISTS idx_users_username_trgm ON users USING gin (username gin_trgm_ops)`
  );
  await runAlter(
    'idx_post_interactions_lookup',
    `CREATE INDEX IF NOT EXISTS idx_post_interactions_lookup ON post_interactions(post_id, interaction_type, user_id)`
  );
  await runAlter(
    'idx_notifications_unread',
    `CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read)`
  );

  // ─────────────────────────────────────────────────────────────
  // MODÉRATION DM + PERSONNALISATION (ajout 2026-09-02)
  // ─────────────────────────────────────────────────────────────
  console.log('\n🛡️  TABLES DM & PERSONNALISATION:');
  await runAlter(
    'TABLE blocked_users',
    `CREATE TABLE IF NOT EXISTS blocked_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id BIGINT NOT NULL,
      blocked_user_id BIGINT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, blocked_user_id)
    )`
  );
  await runAlter(
    'TABLE dm_reports',
    `CREATE TABLE IF NOT EXISTS dm_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id BIGINT NOT NULL,
      reported_user_id BIGINT,
      message_id UUID,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
  );
  await runAlter(
    'TABLE dm_conv_meta',
    `CREATE TABLE IF NOT EXISTS dm_conv_meta (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id BIGINT NOT NULL,
      partner_id BIGINT NOT NULL,
      custom_name TEXT,
      UNIQUE (user_id, partner_id)
    )`
  );
  await runAlter(
    'TABLE dm_reactions',
    `CREATE TABLE IF NOT EXISTS dm_reactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID NOT NULL,
      user_id BIGINT NOT NULL,
      emoji TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (message_id, user_id, emoji)
    )`
  );
  await runAlter('direct_messages.reply_to_id', `ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID`);
  await runAlter('user_settings.accent_color', `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS accent_color TEXT`);
  await runAlter('user_settings.font_size', `ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS font_size TEXT`);
  await runAlter('idx_blocked_users_user', `CREATE INDEX IF NOT EXISTS idx_blocked_users_user ON blocked_users(user_id)`);
  await runAlter('idx_dm_unread', `CREATE INDEX IF NOT EXISTS idx_dm_unread ON direct_messages(conversation_id, recipient_id, is_read)`);

  // ─────────────────────────────────────────────────────────────
  // VÉRIFICATION FINALE
  // ─────────────────────────────────────────────────────────────
  console.log('\n═'.repeat(60));
  console.log('📋 VÉRIFICATION FINALE:');
  const checks = [
    ['users.is_verified', `SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_verified'`],
    ['profiles.is_verified', `SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_verified'`],
    ['user_settings.feed_default_mode', `SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='feed_default_mode'`],
    ['user_settings.hide_reposts', `SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='hide_reposts'`],
    ['user_settings.blocked_keywords', `SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='blocked_keywords'`],
    ['user_settings.two_factor_auth', `SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='two_factor_auth'`],
    ['user_settings.allow_mentions', `SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='allow_mentions'`],
    ['usage_logs.endpoint', `SELECT 1 FROM information_schema.columns WHERE table_name='usage_logs' AND column_name='endpoint'`],
  ];

  for (const [name, q] of checks) {
    const r = await sql.unsafe(q);
    console.log(`  ${r.length > 0 ? '✅' : '❌'} ${name}`);
  }

  console.log('\n🎉 Migration terminée !\n');
}

migrate().catch(e => { console.error('💥 Erreur fatale:', e.message); process.exit(1); });
