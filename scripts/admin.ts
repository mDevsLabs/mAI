import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs';
import path from 'path';
import { sendEmail, runNewsletterStudio } from './newsletter-send';

// ─────────────────────────────────────────────
// Chargement automatique des variables d'environnement
// ─────────────────────────────────────────────
function loadEnv() {
  if (!process.env.DATABASE_URL) {
    const envPaths = ['.env', '.env.local'];
    for (const envPath of envPaths) {
      const fullPath = path.resolve(process.cwd(), envPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, ...vals] = trimmed.split('=');
            let val = vals.join('=').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ Erreur : DATABASE_URL est introuvable dans votre environnement ou vos fichiers .env.");
  process.exit(1);
}

const sql = neon(dbUrl);

// ─────────────────────────────────────────────
// Styles & Palette ANSI CLI
// ─────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  cyan: "\x1b[36m",
  brightCyan: "\x1b[96m",
  green: "\x1b[32m",
  brightGreen: "\x1b[92m",
  yellow: "\x1b[33m",
  brightYellow: "\x1b[93m",
  red: "\x1b[31m",
  brightRed: "\x1b[91m",
  magenta: "\x1b[35m",
  brightMagenta: "\x1b[95m",
  white: "\x1b[37m",
  brightWhite: "\x1b[97m",
  bgPurple: "\x1b[48;5;55m",
};

// ─────────────────────────────────────────────
// Initialisation de la table des réinitialisations en attente
// ─────────────────────────────────────────────
export async function initPendingResetsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_pending_resets (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      reset_type VARCHAR(50) NOT NULL, -- 'all', 'api', 'mai', 'images', 'audio'
      expires_at TIMESTAMP WITH TIME ZONE NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'available', -- 'available', 'used', 'expired'
      used_at TIMESTAMP WITH TIME ZONE NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_user_pending_resets_user_status 
      ON user_pending_resets (user_id, status);
  `;
}

// ─────────────────────────────────────────────
// Initialisation de la table des augmentations temporaires (Boosts)
// ─────────────────────────────────────────────
export async function initQuotaBoostsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_quota_boosts (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL, -- 'all' ou identifiant utilisateur
      quota_type VARCHAR(50) NOT NULL, -- 'mai', 'api', 'images', 'audio'
      boost_amount NUMERIC NOT NULL,
      boost_mode VARCHAR(20) NOT NULL DEFAULT 'add',
      starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      reason VARCHAR(255) NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_quota_boosts_active 
      ON user_quota_boosts (user_id, quota_type, starts_at, expires_at, is_active);
  `;
}

// ─────────────────────────────────────────────
// Template d'E-mail de Réinitialisation de Quotas
// ─────────────────────────────────────────────
function buildQuotaEmailHtml(params: {
  title: string;
  username: string;
  quotasDescription: string;
  timingDescription: string;
  badgeLabel: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${params.title}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9;">
      <div style="max-width:560px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
        
        <!-- Header & Logo -->
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%); padding:36px 24px 28px 24px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:44px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:20px; font-weight:800; margin:16px 0 0 0; letter-spacing:-0.5px;">${params.title}</h1>
        </div>

        <!-- Body Content -->
        <div style="padding:32px 28px; line-height:1.7; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0; font-size:16px; font-weight:600; color:#ffffff;">Bonjour <strong>${params.username}</strong>,</p>
          <p>${params.quotasDescription}</p>
          <div style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); border-radius:12px; padding:14px 18px; margin:18px 0; color:#93c5fd; font-size:14px;">
            ${params.timingDescription}
          </div>
          
          <div style="background:linear-gradient(180deg, #131d31 0%, #0c1322 100%); border:1px solid #334155; border-radius:16px; padding:22px; text-align:center; margin:24px 0;">
            <span style="display:inline-block; background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.35); font-weight:800; font-size:13px; padding:6px 18px; border-radius:100px; text-transform:uppercase; letter-spacing:0.5px;">
              ${params.badgeLabel}
            </span>
            <p style="font-size:13px; color:#94a3b8; margin:12px 0 0 0;">Accédez à votre espace compte mAI pour suivre l'état de votre consommation en temps réel.</p>
          </div>

          <p style="font-size:12px; color:#64748b; margin-top:24px;">Cet e-mail est adressé à tous les utilisateurs concernés lors d'une mise à jour de leurs quotas d'utilisation.</p>
        </div>

        <!-- Footer -->
        <div style="background-color:#070a12; padding:20px 24px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b;">
          <p style="margin:0 0 4px 0; font-weight:600; color:#94a3b8;">© 2026 mAI — Plateforme d'IA &amp; APIs Souveraines</p>
          <p style="margin:0; font-size:11px;">Données sécurisées dans l'UE • Priorité Zero Data Retention (ZDR)</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

export type ResetType = 'all' | 'api' | 'mai' | 'images' | 'audio';

export interface TargetUser {
  id: string;
  email: string;
  username: string;
}

export async function performReset(params: {
  users: TargetUser[];
  resetType: ResetType;
  isInstant: boolean;
  expiresAt?: Date | null;
  notify?: boolean;
}) {
  const { users, resetType, isInstant, expiresAt, notify = true } = params;
  if (users.length === 0) {
    console.log(`\n${c.yellow}⚠️ Aucun utilisateur ciblé pour la réinitialisation.${c.reset}`);
    return;
  }

  await initPendingResetsTable();

  const resetLabels: Record<ResetType, string> = {
    all: "Tous les quotas (API + mAI + Images + Audio)",
    api: "Quotas de requêtes d'API",
    mai: "Tokens de modèles mAI",
    images: "Quotas journaliers de génération d'Images",
    audio: "Quotas de synthèse vocale Audio",
  };

  const badgeLabels: Record<ResetType, string> = {
    all: "Tous les quotas réinitialisés à 100%",
    api: "Quotas API réinitialisés à 100%",
    mai: "Tokens mAI réinitialisés à 100%",
    images: "Quotas Images réinitialisés",
    audio: "Quotas Audio réinitialisés",
  };

  const targetLabel = resetLabels[resetType] || "Quotas";
  const badgeLabel = badgeLabels[resetType] || "Quotas réinitialisés";

  if (isInstant) {
    // 1. Réinitialisation instantanée directe en DB (ne figure pas dans le tableau de l'utilisateur)
    console.log(`\n${c.cyan}⏳ Application de la réinitialisation instantanée (${targetLabel}) pour ${users.length} utilisateur(s)...${c.reset}`);
    for (const u of users) {
      if (resetType === 'all' || resetType === 'api') {
        await sql`UPDATE mprojects_api_keys SET request_count = 0 WHERE user_id = ${u.id}::text OR user_id = ${u.username} OR user_id = ${u.email}`;
      }
      if (resetType === 'all' || resetType === 'mai') {
        await sql`UPDATE weekly_usage SET tokens_used = 0 WHERE user_id = ${u.id}::text OR user_id = ${u.username} OR user_id = ${u.email}`;
      }
      if (resetType === 'all' || resetType === 'images') {
        await sql`UPDATE mprojects_daily_image_usage SET images_generated = 0, updated_at = NOW() WHERE (user_id = ${u.id}::text OR user_id = ${u.username} OR user_id = ${u.email}) AND usage_date = CURRENT_DATE`;
      }
      if (resetType === 'all' || resetType === 'audio') {
        await sql`UPDATE weekly_speech_usage SET tokens_used = 0, requests_count = 0 WHERE user_id = ${u.id}::text OR user_id = ${u.username} OR user_id = ${u.email}`;
      }
    }
    console.log(`${c.brightGreen}✔ Succès : Réinitialisation instantanée appliquée avec succès en base de données !${c.reset}`);
  } else {
    // 2. Réinitialisation différée avec date d'expiration (ajoutée dans le tableau de l'utilisateur)
    const expStr = expiresAt ? expiresAt.toLocaleString('fr-FR') : 'Illimitée';
    console.log(`\n${c.cyan}⏳ Enregistrement des réinitialisations à réclamer (Expiration : ${expStr})...${c.reset}`);
    for (const u of users) {
      await sql`
        INSERT INTO user_pending_resets (user_id, reset_type, expires_at, status)
        VALUES (${u.id}::text, ${resetType}, ${expiresAt ? expiresAt.toISOString() : null}, 'available')
      `;
    }
    console.log(`${c.brightGreen}✔ Succès : ${users.length} réinitialisation(s) ajoutée(s) dans la section Réinitialisations des utilisateurs !${c.reset}`);
  }

  if (!notify) return;

  // 3. Envoi des e-mails à TOUS les utilisateurs (même ceux non abonnés à la newsletter)
  console.log(`\n  ${c.brightYellow}➔ Envoi des e-mails de notification à ${users.length} utilisateur(s)...${c.reset}`);
  let success = 0;

  const timingDescription = isInstant
    ? "⚡ Cette réinitialisation a eu lieu <strong>à l'instant</strong>. Vos compteurs sont d'ores et déjà remis à zéro."
    : `📅 Une réinitialisation est <strong>disponible dans vos paramètres de compte</strong> (section <em>Réinitialisations</em>). Vous pouvez l'activer quand vous le souhaitez avant son expiration le <strong>${expiresAt ? expiresAt.toLocaleString('fr-FR') : 'Sans date d’expiration'}</strong>.`;

  const quotasDescription = resetType === 'all'
    ? "Tous vos quotas mAI ont été réinitialisés : requêtes d'API, tokens mAI hebdomadaires, générations journalières d'images et synthèse vocale audio."
    : `Votre quota concerné par cette réinitialisation : <strong>${targetLabel}</strong>.`;

  for (const user of users) {
    const html = buildQuotaEmailHtml({
      title: resetType === 'all' ? "Réinitialisation globale de vos quotas mAI" : `Réinitialisation : ${targetLabel}`,
      username: user.username,
      quotasDescription,
      timingDescription,
      badgeLabel,
    });

    try {
      const sent = await sendEmail({
        to: user.email,
        subject: resetType === 'all'
          ? "Tous vos quotas mAI ont été réinitialisés"
          : `Votre quota mAI (${targetLabel}) a été réinitialisé`,
        html,
      });
      if (sent) success++;
      await new Promise((r) => setTimeout(r, 80));
    } catch (err: any) {
      console.error(`  ${c.red}✖ Erreur d'envoi pour ${user.email} : ${err?.message || err}${c.reset}`);
    }
  }

  console.log(`  ${c.brightGreen}✔ ${success}/${users.length} notification(s) e-mail envoyée(s) avec succès !${c.reset}`);
}

// ─────────────────────────────────────────────
// Fonctions de compatibilité CLI / raccourcis
// ─────────────────────────────────────────────
export async function getAllUsers(): Promise<TargetUser[]> {
  return (await sql`SELECT id, email, username FROM users`) as unknown as TargetUser[];
}

export async function resetApiUsage(notifyUsers = true) {
  const users = await getAllUsers();
  await performReset({ users, resetType: 'api', isInstant: true, notify: notifyUsers });
}

export async function resetMaiUsage(notifyUsers = true) {
  const users = await getAllUsers();
  await performReset({ users, resetType: 'mai', isInstant: true, notify: notifyUsers });
}

export async function resetImageUsage(notifyUsers = true) {
  const users = await getAllUsers();
  await performReset({ users, resetType: 'images', isInstant: true, notify: notifyUsers });
}

export async function resetAudioUsage(notifyUsers = true) {
  const users = await getAllUsers();
  await performReset({ users, resetType: 'audio', isInstant: true, notify: notifyUsers });
}

export async function resetAllUsage(notifyUsers = true) {
  const users = await getAllUsers();
  await performReset({ users, resetType: 'all', isInstant: true, notify: notifyUsers });
}

// ─────────────────────────────────────────────
// Sélection interactive d'un utilisateur
// ─────────────────────────────────────────────
export async function promptSelectUser(rl: readline.Interface): Promise<TargetUser | null> {
  const users = (await sql`
    SELECT id, username, email, tier 
    FROM users 
    ORDER BY id ASC 
    LIMIT 30
  `) as unknown as (TargetUser & { tier?: string })[];

  if (users.length === 0) {
    console.log(`\n❌ Aucun utilisateur trouvé dans la base de données.`);
    return null;
  }

  console.log(`\n${c.bold}--- 📋 CHOISIR UN UTILISATEUR ---${c.reset}`);
  users.forEach((u, i) => {
    const tierBadge = u.tier ? `[${u.tier}]` : '[Free]';
    console.log(`  ${c.brightCyan}[${i + 1}]${c.reset} ${c.bold}${u.username.padEnd(16)}${c.reset} ${u.email.padEnd(28)} ${c.dim}${tierBadge.padEnd(8)}${c.reset} ${c.dim}(ID: ${u.id})${c.reset}`);
  });
  console.log(`  ${c.brightYellow}[S]${c.reset} 🔍 Rechercher par mot-clé (nom, e-mail ou ID)`);
  console.log(`  ${c.white}[0]${c.reset} ↩️  Annuler`);

  const ans = (await rl.question(`\n  ${c.brightYellow}➔ Choix [1-${users.length}] ou [S] pour rechercher : ${c.reset}`)).trim();

  if (ans === '0' || ans.toLowerCase() === 'annuler') {
    return null;
  }

  const num = parseInt(ans, 10);
  if (!isNaN(num) && num >= 1 && num <= users.length) {
    const selected = users[num - 1];
    console.log(`  ${c.brightGreen}✔ Utilisateur sélectionné : ${selected.username} (${selected.email})${c.reset}`);
    return selected;
  }

  // Recherche par mot-clé si 's' ou si saisie directe
  const searchParam = ans.toLowerCase() === 's'
    ? (await rl.question(`  ${c.brightYellow}➔ Entrez le nom d'utilisateur, l'email ou l'ID : ${c.reset}`)).trim()
    : ans;

  if (!searchParam) return null;

  const found = (await sql`
    SELECT id, username, email, tier 
    FROM users 
    WHERE username ILIKE ${'%' + searchParam + '%'}
       OR email ILIKE ${'%' + searchParam + '%'}
       OR id::text = ${searchParam}
    ORDER BY id ASC
    LIMIT 20
  `) as unknown as (TargetUser & { tier?: string })[];

  if (found.length === 0) {
    console.log(`❌ Aucun utilisateur trouvé pour "${searchParam}".`);
    return null;
  }

  if (found.length === 1) {
    console.log(`  ${c.brightGreen}✔ Utilisateur trouvé : ${found[0].username} (${found[0].email})${c.reset}`);
    return found[0];
  }

  console.log(`\nPlusieurs utilisateurs correspondent à "${searchParam}" :`);
  found.forEach((u, i) => {
    const tierBadge = u.tier ? `[${u.tier}]` : '[Free]';
    console.log(`  ${c.brightCyan}[${i + 1}]${c.reset} ${u.username} (${u.email}) ${tierBadge} (ID: ${u.id})`);
  });
  const subAns = (await rl.question(`  ${c.brightYellow}➔ Choisissez un numéro [1-${found.length}] : ${c.reset}`)).trim();
  const subNum = parseInt(subAns, 10);
  if (!isNaN(subNum) && subNum >= 1 && subNum <= found.length) {
    const chosen = found[subNum - 1];
    console.log(`  ${c.brightGreen}✔ Utilisateur sélectionné : ${chosen.username} (${chosen.email})${c.reset}`);
    return chosen;
  }

  return null;
}

// ─────────────────────────────────────────────
// Assistant interactif de réinitialisation
// ─────────────────────────────────────────────
export async function runResetWizard(rl: readline.Interface, defaultType?: ResetType) {
  console.log(`\n${c.bgPurple}${c.bold}${c.brightWhite} 🔄 ASSISTANT DE RÉINITIALISATION DES QUOTAS 🔄 ${c.reset}\n`);

  // 1. Choix des utilisateurs
  console.log(`${c.bold}1. Destinataire(s) de la réinitialisation :${c.reset}`);
  console.log(`  ${c.brightCyan}[1]${c.reset} 👤 Choisir un utilisateur spécifique (liste interactive ou recherche)`);
  console.log(`  ${c.brightCyan}[2]${c.reset} ⭐ Tous les utilisateurs enregistrés`);
  const userChoice = (await rl.question(`  ${c.brightYellow}➔ Choix [1-2] (défaut 1) : ${c.reset}`)).trim() || '1';

  let selectedUsers: TargetUser[] = [];
  if (userChoice === '1') {
    const selected = await promptSelectUser(rl);
    if (!selected) {
      console.log(`\n${c.dim}Action annulée (aucun utilisateur sélectionné).${c.reset}`);
      return;
    }
    selectedUsers = [selected];
  } else {
    selectedUsers = await getAllUsers();
    console.log(`  ${c.brightGreen}✔ ${selectedUsers.length} utilisateur(s) sélectionné(s).${c.reset}`);
  }

  // 2. Choix de la réinitialisation
  let targetType: ResetType = defaultType || 'all';
  if (!defaultType) {
    console.log(`\n${c.bold}2. Quel quota réinitialiser ?${c.reset}`);
    console.log(`  ${c.brightCyan}[1]${c.reset} ⚡ TOUS les quotas (API + mAI + Images + Audio)`);
    console.log(`  ${c.brightCyan}[2]${c.reset} 🔑 Quotas de requêtes d'API (mprojects_api_keys)`);
    console.log(`  ${c.brightCyan}[3]${c.reset} 🧠 Tokens hebdomadaires mAI (weekly_usage)`);
    console.log(`  ${c.brightCyan}[4]${c.reset} 🎨 Quotas journaliers d'Images (mprojects_daily_image_usage)`);
    console.log(`  ${c.brightCyan}[5]${c.reset} 🎙️ Quotas de synthèse Audio (weekly_speech_usage)`);
    const qChoice = (await rl.question(`  ${c.brightYellow}➔ Choix [1-5] (défaut 1) : ${c.reset}`)).trim() || '1';
    switch (qChoice) {
      case '2': targetType = 'api'; break;
      case '3': targetType = 'mai'; break;
      case '4': targetType = 'images'; break;
      case '5': targetType = 'audio'; break;
      default: targetType = 'all'; break;
    }
  }

  // 3. Choix du timing (Quand)
  console.log(`\n${c.bold}3. Quand effectuer la réinitialisation ?${c.reset}`);
  console.log(`  ${c.brightCyan}[1]${c.reset} ⚡ Instantanée (mise à zéro immédiate, pas dans le tableau du compte)`);
  console.log(`  ${c.brightCyan}[2]${c.reset} 📅 À réclamer avec Date d'Expiration (visible dans le tableau du compte)`);
  const timeChoice = (await rl.question(`  ${c.brightYellow}➔ Choix [1-2] (défaut 1) : ${c.reset}`)).trim() || '1';

  let isInstant = true;
  let expiresAt: Date | null = null;

  if (timeChoice === '2') {
    isInstant = false;
    console.log(`\n${c.bold}Validité de la réinitialisation :${c.reset}`);
    const daysStr = (await rl.question(`  ${c.brightYellow}➔ Nombre de jours de validité (ex: 30, ou vide pour sans date limite) : ${c.reset}`)).trim();
    if (daysStr && !isNaN(Number(daysStr))) {
      expiresAt = new Date(Date.now() + Number(daysStr) * 24 * 60 * 60 * 1000);
      console.log(`  ${c.brightGreen}✔ Expiration fixée au : ${expiresAt.toLocaleString('fr-FR')}${c.reset}`);
    } else {
      console.log(`  ${c.brightYellow}ℹ Aucune date d'expiration (valable indéfiniment jusqu'à utilisation).${c.reset}`);
    }
  }

  // Confirmation
  console.log(`\n${c.bold}RÉCAPITULATIF :${c.reset}`);
  console.log(`  - Destinataire(s) : ${selectedUsers.length} utilisateur(s)`);
  console.log(`  - Quota ciblé     : ${targetType.toUpperCase()}`);
  console.log(`  - Mode            : ${isInstant ? '⚡ Instantané (remis à zéro maintenant)' : `📅 Dans le tableau (Expiration: ${expiresAt ? expiresAt.toLocaleDateString('fr-FR') : 'Illimitée'})`}`);
  console.log(`  - Notifications   : ✉️ E-mail à tous les utilisateurs ciblés`);

  const confirm = (await rl.question(`\n  ${c.brightYellow}➔ Confirmer et exécuter ? (o/n) : ${c.reset}`)).trim().toLowerCase();
  if (confirm !== 'o' && confirm !== 'oui' && confirm !== 'y') {
    console.log(`\n${c.dim}Action annulée.${c.reset}`);
    return;
  }

  await performReset({
    users: selectedUsers,
    resetType: targetType,
    isInstant,
    expiresAt,
    notify: true,
  });
}

// ─────────────────────────────────────────────
// 4b. GESTIONNAIRE D'AUGMENTATIONS DE QUOTAS (BOOSTS TEMPORAIRES)
// ─────────────────────────────────────────────

function buildQuotaBoostEmailHtml(params: {
  title: string;
  username: string;
  quotaName: string;
  boostAmountFormatted: string;
  timingDescription: string;
  reason?: string | null;
}) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${params.title}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9;">
      <div style="max-width:560px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
        
        <!-- Header & Logo -->
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%); padding:36px 24px 28px 24px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:44px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:20px; font-weight:800; margin:16px 0 0 0; letter-spacing:-0.5px;">${params.title}</h1>
        </div>

        <!-- Body Content -->
        <div style="padding:32px 28px; line-height:1.7; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0; font-size:16px; font-weight:600; color:#ffffff;">Bonjour <strong>${params.username}</strong>,</p>
          <p>Excellente nouvelle ! Une augmentation temporaire (Boost) a été activée sur vos quotas mAI :</p>
          
          <div style="background:linear-gradient(180deg, #131d31 0%, #0c1322 100%); border:1px solid #334155; border-radius:16px; padding:22px; text-align:center; margin:22px 0;">
            <span style="display:inline-block; background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.35); font-weight:800; font-size:14px; padding:6px 18px; border-radius:100px; text-transform:uppercase; letter-spacing:0.5px;">
              +${params.boostAmountFormatted} (${params.quotaName})
            </span>
            <p style="font-size:13px; color:#94a3b8; margin:12px 0 0 0;">Votre plafond d'utilisation a été rehaussé pour vous permettre de bénéficier de capacités étendues.</p>
          </div>

          <div style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); border-radius:12px; padding:14px 18px; margin:18px 0; color:#93c5fd; font-size:14px;">
            📅 <strong>Période de validité :</strong> ${params.timingDescription}
          </div>

          ${params.reason ? `<p style="font-size:13px; color:#cbd5e1; background:rgba(255,255,255,0.04); padding:10px 14px; border-radius:8px; margin:16px 0;"><strong>Motif :</strong> ${params.reason}</p>` : ''}

          <p style="font-size:12px; color:#64748b; margin-top:24px;">Cette augmentation est immédiatement active sur votre compte, clés d'API et interfaces mAI pendant toute la durée spécifiée.</p>
        </div>

        <!-- Footer -->
        <div style="background-color:#070a12; padding:20px 24px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b;">
          <p style="margin:0 0 4px 0; font-weight:600; color:#94a3b8;">© 2026 mAI — Plateforme d'IA &amp; APIs Souveraines</p>
          <p style="margin:0; font-size:11px;">Données sécurisées dans l'UE • Priorité Zero Data Retention (ZDR)</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

function parseDateInput(inputStr: string, isStartDate = false): Date | null {
  const s = inputStr.trim().toLowerCase();
  if (!s) return null;
  if (s === 'now' || s === 'maintenant' || s === "aujourd'hui") {
    return new Date();
  }

  // Raccourcis relatifs : ex +7j, +14d, +30j, +1m, ou simplement 7
  const relMatch = s.match(/^\+?(\d+)\s*(j|d|m|h)?$/);
  if (relMatch) {
    const val = parseInt(relMatch[1], 10);
    const unit = relMatch[2] || 'j';
    const d = new Date();
    if (unit === 'h') d.setHours(d.getHours() + val);
    else if (unit === 'm') d.setMonth(d.getMonth() + val);
    else d.setDate(d.getDate() + val);
    return d;
  }

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return isStartDate ? new Date(y, m - 1, d, 0, 0, 0) : new Date(y, m - 1, d, 23, 59, 59);
  }

  // Format DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/').map(Number);
    return isStartDate ? new Date(y, m - 1, d, 0, 0, 0) : new Date(y, m - 1, d, 23, 59, 59);
  }

  const parsed = new Date(inputStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return null;
}

export function formatBoostAmount(quotaType: string, amount: number): string {
  if (quotaType === 'mai') {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString('fr-FR')}M tokens`;
    return `${amount.toLocaleString('fr-FR')} tokens`;
  }
  if (quotaType === 'api') {
    return `${amount.toLocaleString('fr-FR')} requêtes`;
  }
  if (quotaType === 'images') {
    return `${amount.toLocaleString('fr-FR')} images / jour`;
  }
  if (quotaType === 'audio') {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString('fr-FR')}M tokens audio`;
    return `${amount.toLocaleString('fr-FR')} tokens audio`;
  }
  return `${amount.toLocaleString('fr-FR')}`;
}

export async function createQuotaBoost(params: {
  userId: string; // 'all' ou user ID
  quotaType: 'mai' | 'api' | 'images' | 'audio';
  boostAmount: number;
  startsAt: Date;
  expiresAt: Date;
  reason?: string | null;
  notify?: boolean;
}) {
  await initQuotaBoostsTable();
  const { userId, quotaType, boostAmount, startsAt, expiresAt, reason, notify = true } = params;

  await sql`
    INSERT INTO user_quota_boosts (user_id, quota_type, boost_amount, boost_mode, starts_at, expires_at, reason, is_active)
    VALUES (${userId}, ${quotaType}, ${boostAmount}, 'add', ${startsAt.toISOString()}, ${expiresAt.toISOString()}, ${reason || null}, TRUE)
  `;

  if (!notify) return;

  // Récupérer les utilisateurs à notifier
  let recipients: TargetUser[] = [];
  if (userId === 'all') {
    recipients = await getAllUsers();
  } else {
    recipients = (await sql`
      SELECT id, email, username FROM users 
      WHERE id::text = ${userId}::text OR username = ${userId} OR email = ${userId}
      LIMIT 1
    `) as unknown as TargetUser[];
  }

  const quotaLabels: Record<string, string> = {
    mai: "Tokens de modèles mAI",
    api: "Requêtes d'API",
    images: "Générations d'Images",
    audio: "Synthèse vocale Audio",
  };
  const qLabel = quotaLabels[quotaType] || quotaType;
  const amountStr = formatBoostAmount(quotaType, boostAmount);

  const isStartsNow = Math.abs(startsAt.getTime() - Date.now()) < 5 * 60 * 1000;
  const timingDescription = isStartsNow
    ? `⚡ Actif dès <strong>maintenant</strong> jusqu'au <strong>${expiresAt.toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>`
    : `🗓️ Du <strong>${startsAt.toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong> au <strong>${expiresAt.toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>`;

  console.log(`\n  ${c.brightYellow}➔ Envoi des e-mails d'annonce de Boost à ${recipients.length} utilisateur(s)...${c.reset}`);
  let success = 0;
  for (const user of recipients) {
    const html = buildQuotaBoostEmailHtml({
      title: `Augmentation de vos quotas mAI (+${amountStr})`,
      username: user.username,
      quotaName: qLabel,
      boostAmountFormatted: amountStr,
      timingDescription,
      reason,
    });

    try {
      const sent = await sendEmail({
        to: user.email,
        subject: `Boost de quota mAI accordé : +${amountStr} (${qLabel})`,
        html,
      });
      if (sent) success++;
      await new Promise((r) => setTimeout(r, 80));
    } catch (err: any) {
      console.error(`  ${c.red}✖ Erreur pour ${user.email} : ${err?.message || err}${c.reset}`);
    }
  }

  console.log(`  ${c.brightGreen}✔ ${success}/${recipients.length} e-mail(s) de Boost envoyé(s) avec succès !${c.reset}`);
}

export async function listActiveQuotaBoosts(rl?: readline.Interface) {
  await initQuotaBoostsTable();
  const rows = await sql`
    SELECT b.id, b.user_id, b.quota_type, b.boost_amount, b.starts_at, b.expires_at, b.reason, b.is_active,
           u.username, u.email
    FROM user_quota_boosts b
    LEFT JOIN users u ON b.user_id = u.id::text OR b.user_id = u.username OR b.user_id = u.email
    WHERE b.is_active = TRUE AND b.expires_at >= NOW()
    ORDER BY b.created_at DESC
  `;

  console.log(`\n${c.bgPurple}${c.bold}${c.brightWhite} 📋 BOOSTS DE QUOTAS ACTIFS OU PROGRAMMÉS (${rows.length}) 📋 ${c.reset}\n`);
  if (rows.length === 0) {
    console.log(`  ${c.dim}ℹ Aucun boost de quota actif pour le moment.${c.reset}\n`);
    return;
  }

  console.log(`${c.bold}${'ID'.padEnd(5)} | ${'Cible'.padEnd(20)} | ${'Quota'.padEnd(10)} | ${'Boost'.padEnd(20)} | ${'Début'.padEnd(18)} | ${'Fin / Expiration'.padEnd(18)} | ${'Statut'}${c.reset}`);
  console.log('─'.repeat(105));

  const now = new Date();
  rows.forEach((r: any) => {
    const target = r.user_id === 'all' ? '⭐ TOUS LES COMPTES' : (r.username || r.email || r.user_id);
    const boostStr = `+${formatBoostAmount(r.quota_type, Number(r.boost_amount))}`;
    const start = new Date(r.starts_at);
    const end = new Date(r.expires_at);
    const startStr = start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const endStr = end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    const status = start > now ? `${c.yellow}⏳ Programmé${c.reset}` : `${c.brightGreen}⚡ Actif${c.reset}`;

    console.log(`${String(r.id).padEnd(5)} | ${target.padEnd(20).substring(0, 20)} | ${r.quota_type.toUpperCase().padEnd(10)} | ${boostStr.padEnd(20)} | ${startStr.padEnd(18)} | ${endStr.padEnd(18)} | ${status}`);
    if (r.reason) {
      console.log(`      ↳ Motif: ${c.dim}${r.reason}${c.reset}`);
    }
  });
  console.log("");
}

export async function runQuotaBoostWizard(rl: readline.Interface, targetUserArg?: TargetUser | string) {
  console.log(`\n${c.bgPurple}${c.bold}${c.brightWhite} 📈 ASSISTANT D'AUGMENTATION DE QUOTA (BOOST TEMPORAIRE) 📈 ${c.reset}\n`);

  let targetUserId = 'all';
  let targetDisplay = 'Tous les utilisateurs (Global)';
  let targetUsersCount = 0;

  if (targetUserArg) {
    if (typeof targetUserArg === 'object') {
      targetUserId = String(targetUserArg.id);
      targetDisplay = `${targetUserArg.username} (${targetUserArg.email})`;
      targetUsersCount = 1;
      console.log(`  ${c.brightGreen}✔ Utilisateur ciblé : ${targetDisplay}${c.reset}`);
    } else if (targetUserArg === 'all') {
      const allUsers = await getAllUsers();
      targetUserId = 'all';
      targetUsersCount = allUsers.length;
      console.log(`  ${c.brightGreen}✔ Boost global pour ${targetUsersCount} utilisateur(s).${c.reset}`);
    } else {
      const found = (await sql`
        SELECT id, email, username FROM users 
        WHERE id::text = ${targetUserArg}::text OR username = ${targetUserArg} OR email = ${targetUserArg}
        LIMIT 1
      `) as unknown as TargetUser[];
      if (found.length > 0) {
        targetUserId = String(found[0].id);
        targetDisplay = `${found[0].username} (${found[0].email})`;
        targetUsersCount = 1;
        console.log(`  ${c.brightGreen}✔ Utilisateur ciblé : ${targetDisplay}${c.reset}`);
      }
    }
  } else {
    // 1. Destinataires
    console.log(`${c.bold}1. Destinataire(s) du Boost :${c.reset}`);
    console.log(`  ${c.brightCyan}[1]${c.reset} 👤 Choisir un utilisateur spécifique (liste interactive ou recherche)`);
    console.log(`  ${c.brightCyan}[2]${c.reset} ⭐ Tous les utilisateurs de la plateforme (Boost Global)`);
    const destChoice = (await rl.question(`  ${c.brightYellow}➔ Choix [1-2] (défaut 1) : ${c.reset}`)).trim() || '1';

    if (destChoice === '1') {
      const selected = await promptSelectUser(rl);
      if (!selected) {
        console.log(`\n${c.dim}Action annulée (aucun utilisateur sélectionné).${c.reset}`);
        return;
      }
      targetUserId = String(selected.id);
      targetDisplay = `${selected.username} (${selected.email})`;
      targetUsersCount = 1;
    } else {
      const allUsers = await getAllUsers();
      targetUsersCount = allUsers.length;
      console.log(`  ${c.brightGreen}✔ Boost global pour ${targetUsersCount} utilisateur(s).${c.reset}`);
    }
  }

  // 2. Quota à augmenter
  console.log(`\n${c.bold}2. Quel quota augmenter ?${c.reset}`);
  console.log(`  ${c.brightCyan}[1]${c.reset} ⚡ TOUS les quotas simultanément (API + mAI + Images + Audio)`);
  console.log(`  ${c.brightCyan}[2]${c.reset} 🧠 Quota mAI (Tokens hebdomadaires)`);
  console.log(`  ${c.brightCyan}[3]${c.reset} 🔑 Quota API (Requêtes mensuelles clés API)`);
  console.log(`  ${c.brightCyan}[4]${c.reset} 🎨 Quota Images (Générations journalières)`);
  console.log(`  ${c.brightCyan}[5]${c.reset} 🎙️ Quota Audio (Tokens de synthèse vocale)`);
  const qChoice = (await rl.question(`  ${c.brightYellow}➔ Choix [1-5] (défaut 1) : ${c.reset}`)).trim() || '1';

  const typesToBoost: Array<{ type: 'mai' | 'api' | 'images' | 'audio'; label: string; defaultAmount: number }> = [];
  if (qChoice === '2') typesToBoost.push({ type: 'mai', label: 'Tokens mAI', defaultAmount: 5_000_000 });
  else if (qChoice === '3') typesToBoost.push({ type: 'api', label: "Requêtes d'API", defaultAmount: 1_000 });
  else if (qChoice === '4') typesToBoost.push({ type: 'images', label: 'Images journalières', defaultAmount: 10 });
  else if (qChoice === '5') typesToBoost.push({ type: 'audio', label: 'Tokens Speech Audio', defaultAmount: 50_000_000 });
  else {
    typesToBoost.push(
      { type: 'api', label: "Requêtes d'API", defaultAmount: 1_000 },
      { type: 'mai', label: 'Tokens mAI', defaultAmount: 5_000_000 },
      { type: 'images', label: 'Images journalières', defaultAmount: 10 },
      { type: 'audio', label: 'Tokens Speech Audio', defaultAmount: 50_000_000 },
    );
  }

  // 3. Montants du Boost
  console.log(`\n${c.bold}3. Montant de l'augmentation :${c.reset}`);
  const finalBoosts: Array<{ type: 'mai' | 'api' | 'images' | 'audio'; amount: number }> = [];

  for (const item of typesToBoost) {
    const promptStr = `  ${c.brightYellow}➔ Quantité ajoutée pour [${item.label}] (défaut +${item.defaultAmount.toLocaleString('fr-FR')}) : ${c.reset}`;
    const ans = (await rl.question(promptStr)).trim();
    const val = ans && !isNaN(Number(ans.replace(/\s+/g, ''))) ? Number(ans.replace(/\s+/g, '')) : item.defaultAmount;
    finalBoosts.push({ type: item.type, amount: val });
  }

  // 4. Période de validité
  console.log(`\n${c.bold}4. Période de validité du Boost :${c.reset}`);
  console.log(`  ${c.brightCyan}[1]${c.reset} ⏳ Jusqu'à une date précise (Démarre dès maintenant)`);
  console.log(`  ${c.brightCyan}[2]${c.reset} 🗓️ Entre telle date et telle date (Période planifiée)`);
  const periodChoice = (await rl.question(`  ${c.brightYellow}➔ Choix [1-2] (défaut 1) : ${c.reset}`)).trim() || '1';

  let startsAt = new Date();
  let expiresAt: Date | null = null;

  if (periodChoice === '2') {
    // Plage de dates Début -> Fin
    const startStr = (await rl.question(`  ${c.brightYellow}➔ Date de début (ex: 2026-09-01, ou "maintenant") : ${c.reset}`)).trim();
    const parsedStart = parseDateInput(startStr, true);
    if (!parsedStart) {
      console.log(`❌ Format de date de début invalide.`);
      return;
    }
    startsAt = parsedStart;

    const endStr = (await rl.question(`  ${c.brightYellow}➔ Date de fin (ex: 2026-09-30 ou +14j) : ${c.reset}`)).trim();
    const parsedEnd = parseDateInput(endStr, false);
    if (!parsedEnd || parsedEnd <= startsAt) {
      console.log(`❌ Date de fin invalide ou antérieure à la date de début.`);
      return;
    }
    expiresAt = parsedEnd;
  } else {
    // Jusqu'à une date précise
    const endStr = (await rl.question(`  ${c.brightYellow}➔ Jusqu'à quelle date ? (ex: 2026-09-30, ou +14j, +30j) : ${c.reset}`)).trim() || '+30j';
    const parsedEnd = parseDateInput(endStr, false);
    if (!parsedEnd || parsedEnd <= startsAt) {
      console.log(`❌ Date d'expiration invalide ou déjà passée.`);
      return;
    }
    expiresAt = parsedEnd;
  }

  // 5. Motif / Raison (optionnel)
  console.log(`\n${c.bold}5. Motif ou Raison (optionnel) :${c.reset}`);
  const reason = (await rl.question(`  ${c.brightYellow}➔ Motif (ex: Offre spéciale rentrée, compensation technique...) : ${c.reset}`)).trim();

  // 6. Notification e-mail
  console.log(`\n${c.bold}6. Notification :${c.reset}`);
  const notifAns = (await rl.question(`  ${c.brightYellow}➔ Envoyer un e-mail à tous les utilisateurs concernés ? (O/n) : ${c.reset}`)).trim().toLowerCase();
  const sendNotif = notifAns !== 'n' && notifAns !== 'non';

  // 7. Récapitulatif
  console.log(`\n${c.bold}══════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bold}  RÉCAPITULATIF DU BOOST DE QUOTA :${c.reset}`);
  console.log(`  - Destinataire(s)  : ${targetDisplay} (${targetUsersCount} compte(s))`);
  console.log(`  - Augmentations    :`);
  finalBoosts.forEach((b) => {
    console.log(`      • ${b.type.toUpperCase()} : +${formatBoostAmount(b.type, b.amount)}`);
  });
  console.log(`  - Début            : ${startsAt.toLocaleString('fr-FR')}`);
  console.log(`  - Fin (Expiration) : ${expiresAt.toLocaleString('fr-FR')}`);
  if (reason) console.log(`  - Motif            : ${reason}`);
  console.log(`  - E-mails          : ${sendNotif ? '✉️ Envoi automatique activé' : 'Non envoyé'}`);
  console.log(`${c.bold}══════════════════════════════════════════════════════════════════${c.reset}\n`);

  const confirm = (await rl.question(`  ${c.brightYellow}➔ Confirmer et enregistrer ce Boost ? (o/n) : ${c.reset}`)).trim().toLowerCase();
  if (confirm !== 'o' && confirm !== 'oui' && confirm !== 'y') {
    console.log(`\n${c.dim}Action annulée.${c.reset}`);
    return;
  }

  console.log(`\n${c.cyan}⏳ Enregistrement du Boost de quota en base de données...${c.reset}`);
  for (const b of finalBoosts) {
    await createQuotaBoost({
      userId: targetUserId,
      quotaType: b.type,
      boostAmount: b.amount,
      startsAt,
      expiresAt,
      reason: reason || null,
      notify: sendNotif,
    });
  }

  console.log(`\n${c.brightGreen}${c.bold}🎉 Boost de quota activé avec succès !${c.reset}\n`);
}

export async function runQuotaBoostManager(rl: readline.Interface) {
  let inMenu = true;
  while (inMenu) {
    console.log(`\n${c.bold}--- GESTIONNAIRE D'AUGMENTATIONS DE QUOTAS (BOOSTS) ---${c.reset}`);
    console.log(`  ${c.brightCyan}[1]${c.reset} 👤 Choisir un utilisateur pour lui appliquer un Boost`);
    console.log(`  ${c.brightCyan}[2]${c.reset} ⭐ Programmer un Boost pour TOUS les utilisateurs (Global)`);
    console.log(`  ${c.brightCyan}[3]${c.reset} 📋 Consulter les augmentations actives ou programmées`);
    console.log(`  ${c.brightRed}[4]${c.reset} ❌ Révoquer / Désactiver un Boost existant`);
    console.log(`  ${c.white}[0]${c.reset} ↩️  Retour au menu principal`);
    console.log("");

    const choice = (await rl.question(`  ${c.brightYellow}➔ Votre choix [0-4] : ${c.reset}`)).trim();
    switch (choice) {
      case '1': {
        const selected = await promptSelectUser(rl);
        if (selected) {
          await runQuotaBoostWizard(rl, selected);
        }
        break;
      }
      case '2':
        await runQuotaBoostWizard(rl, 'all');
        break;
      case '3':
        await listActiveQuotaBoosts(rl);
        break;
      case '4': {
        await listActiveQuotaBoosts(rl);
        const boostIdStr = (await rl.question(`  ${c.brightYellow}➔ ID du Boost à révoquer : ${c.reset}`)).trim();
        if (boostIdStr && !isNaN(Number(boostIdStr))) {
          await sql`UPDATE user_quota_boosts SET is_active = FALSE WHERE id = ${Number(boostIdStr)}`;
          console.log(`\n${c.brightGreen}✔ Le Boost #${boostIdStr} a été désactivé avec succès.${c.reset}\n`);
        } else {
          console.log("Annulé ou ID invalide.");
        }
        break;
      }
      case '0':
      case 'exit':
      case 'quit':
        inMenu = false;
        break;
      default:
        console.log("⚠️ Choix invalide.");
    }
  }
}

// ─────────────────────────────────────────────
// 5. GESTIONNAIRE DE CODES D'ABONNEMENT
// ─────────────────────────────────────────────
export async function initSubscriptionTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS subscription_codes (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      tier VARCHAR(20) NOT NULL CHECK (tier IN ('Plus', 'Pro', 'Max')),
      max_uses INTEGER NOT NULL DEFAULT 1,
      uses_count INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      expires_at TIMESTAMP WITH TIME ZONE NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subscription_code_redemptions (
      id SERIAL PRIMARY KEY,
      code_id INTEGER REFERENCES subscription_codes(id) ON DELETE CASCADE,
      user_id VARCHAR(100) NOT NULL,
      redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT uq_user_code UNIQUE(code_id, user_id)
    );
  `;
}

export function generateRandomCode(tier: string): string {
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `MAI-${tier.toUpperCase()}-${randomChars}`;
}

function renderCodesTable(codes: any[]) {
  if (codes.length === 0) {
    console.log(`\n${c.brightYellow}⚠️  Aucun code d'abonnement trouvé en base de données.${c.reset}\n`);
    return;
  }

  console.log("\n" + "=".repeat(95));
  console.log(
    `| ${"ID".padEnd(4)} | ${"CODE".padEnd(24)} | ${"TIER".padEnd(6)} | ${"UTILISATIONS".padEnd(14)} | ${"STATUT".padEnd(10)} | ${"EXPIRATION".padEnd(20)} |`
  );
  console.log("=".repeat(95));

  for (const item of codes) {
    const id = String(item.id).padEnd(4);
    const code = String(item.code).padEnd(24);
    const tier = String(item.tier).padEnd(6);
    const uses = `${item.uses_count}/${item.max_uses}`.padEnd(14);
    const status = (item.is_active ? "🟢 Actif" : "🔴 Inactif").padEnd(10);
    const exp = item.expires_at ? new Date(item.expires_at).toLocaleDateString('fr-FR') : "Illimitée";
    const expiration = exp.padEnd(20);

    console.log(`| ${id} | ${code} | ${tier} | ${uses} | ${status} | ${expiration} |`);
  }
  console.log("=".repeat(95) + "\n");
}

async function handleCreateCode(rl: readline.Interface) {
  console.log(`\n${c.bold}--- ➕ CRÉATION D'UN NOUVEAU CODE D'ABONNEMENT ---${c.reset}`);

  console.log("\nChoisissez le forfait à débloquer :");
  console.log("  1. Plus");
  console.log("  2. Pro");
  console.log("  3. Max");
  const tierChoice = (await rl.question("👉 Votre choix [1-3] (défaut: 2 - Pro) : ")).trim();
  
  let tier: 'Plus' | 'Pro' | 'Max' = 'Pro';
  if (tierChoice === '1') tier = 'Plus';
  else if (tierChoice === '3') tier = 'Max';

  console.log("\nMode de génération du code :");
  console.log(`  1. Génération intelligente automatique (ex: MAI-${tier.toUpperCase()}-XXXXXX)`);
  console.log("  2. Saisie manuelle d'un code personnalisé");
  const modeChoice = (await rl.question("👉 Votre choix [1-2] (défaut: 1) : ")).trim();

  let finalCode = "";
  if (modeChoice === '2') {
    while (!finalCode) {
      const custom = (await rl.question("👉 Entrez votre code personnalisé : ")).trim().toUpperCase();
      if (custom.length >= 3) {
        finalCode = custom;
      } else {
        console.log("❌ Le code doit comporter au moins 3 caractères.");
      }
    }
  } else {
    finalCode = generateRandomCode(tier);
  }

  const usesInput = (await rl.question("👉 Nombre maximal d'utilisations (défaut: 1) : ")).trim();
  const maxUses = parseInt(usesInput, 10) > 0 ? parseInt(usesInput, 10) : 1;

  const daysInput = (await rl.question("👉 Durée de validité en jours (laisser vide pour illimité) : ")).trim();
  const expiresInDays = parseInt(daysInput, 10) > 0 ? parseInt(daysInput, 10) : null;

  let expiresAt: Date | null = null;
  if (expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  try {
    const result = await sql`
      INSERT INTO subscription_codes (code, tier, max_uses, uses_count, is_active, expires_at)
      VALUES (${finalCode}, ${tier}, ${maxUses}, 0, TRUE, ${expiresAt})
      RETURNING *;
    `;

    const item = result[0];
    console.log(`\n${c.brightGreen}${c.bold}🎉 CODE CRÉÉ ET ENREGISTRÉ AVEC SUCCÈS !${c.reset}`);
    console.log(`🔑 Code         : ${c.brightGreen}${c.bold}${item.code}${c.reset}`);
    console.log(`⭐ Forfait      : ${item.tier}`);
    console.log(`👥 Utilisations : 0 / ${item.max_uses}`);
    console.log(`📅 Expiration   : ${item.expires_at ? new Date(item.expires_at).toLocaleString('fr-FR') : 'Illimitée'}\n`);
  } catch (err: any) {
    console.error("❌ Erreur lors de la création :", err.message || err);
  }
}

async function handleListCodes() {
  console.log(`\n${c.bold}--- 📋 LISTE DES CODES D'ABONNEMENT ---${c.reset}`);
  const codes = await sql`SELECT * FROM subscription_codes ORDER BY created_at DESC;`;
  renderCodesTable(codes);
}

async function handleToggleCode(rl: readline.Interface) {
  console.log(`\n${c.bold}--- 🔄 ACTIVER / DÉSACTIVER UN CODE ---${c.reset}`);
  const search = (await rl.question("👉 Entrez le Code ou l'ID du code à basculer : ")).trim();
  if (!search) return;

  const found = await sql`
    SELECT * FROM subscription_codes 
    WHERE code ILIKE ${search} OR id::text = ${search}
    LIMIT 1;
  `;

  if (found.length === 0) {
    console.log("❌ Aucun code correspondant trouvé.");
    return;
  }

  const current = found[0];
  const newStatus = !current.is_active;

  await sql`
    UPDATE subscription_codes 
    SET is_active = ${newStatus}
    WHERE id = ${current.id};
  `;

  console.log(`\n${c.brightGreen}✔ Le statut du code ${c.bold}${current.code}${c.reset} est désormais : ${newStatus ? '🟢 ACTIF' : '🔴 INACTIF'}\n`);
}

async function handleEditCode(rl: readline.Interface) {
  console.log(`\n${c.bold}--- ✏️ MODIFIER UN CODE D'ABONNEMENT ---${c.reset}`);
  const search = (await rl.question("👉 Entrez le Code ou l'ID à modifier : ")).trim();
  if (!search) return;

  const found = await sql`
    SELECT * FROM subscription_codes 
    WHERE code ILIKE ${search} OR id::text = ${search}
    LIMIT 1;
  `;

  if (found.length === 0) {
    console.log("❌ Aucun code trouvé.");
    return;
  }

  const current = found[0];
  console.log(`\nCode actuel : ${c.brightGreen}${current.code}${c.reset} (Tier: ${current.tier}, Max: ${current.max_uses}, Actif: ${current.is_active})`);

  console.log("\nModifier le forfait (laisser vide pour conserver '" + current.tier + "') :");
  console.log("  1. Plus | 2. Pro | 3. Max");
  const tierInput = (await rl.question("👉 Choix [1-3] : ")).trim();
  let newTier = current.tier;
  if (tierInput === '1') newTier = 'Plus';
  if (tierInput === '2') newTier = 'Pro';
  if (tierInput === '3') newTier = 'Max';

  const usesInput = (await rl.question(`👉 Nouveau quota maximal (actuel: ${current.max_uses}) : `)).trim();
  const newMaxUses = parseInt(usesInput, 10) > 0 ? parseInt(usesInput, 10) : current.max_uses;

  const statusInput = (await rl.question(`👉 Rendre actif ? (o/n, actuel: ${current.is_active ? 'Oui' : 'Non'}) : `)).trim().toLowerCase();
  let newActive = current.is_active;
  if (statusInput === 'o' || statusInput === 'oui' || statusInput === 'y') newActive = true;
  else if (statusInput === 'n' || statusInput === 'non') newActive = false;

  await sql`
    UPDATE subscription_codes
    SET tier = ${newTier},
        max_uses = ${newMaxUses},
        is_active = ${newActive}
    WHERE id = ${current.id};
  `;

  console.log(`\n${c.brightGreen}✔ Code ${c.bold}${current.code}${c.reset} mis à jour avec succès !\n`);
}

async function handleDeleteCode(rl: readline.Interface) {
  console.log(`\n${c.bold}--- 🗑️ SUPPRESSION D'UN CODE D'ABONNEMENT ---${c.reset}`);
  const search = (await rl.question("👉 Entrez le Code ou l'ID du code à supprimer : ")).trim();
  if (!search) return;

  const found = await sql`
    SELECT * FROM subscription_codes 
    WHERE code ILIKE ${search} OR id::text = ${search}
    LIMIT 1;
  `;

  if (found.length === 0) {
    console.log("❌ Aucun code trouvé.");
    return;
  }

  const current = found[0];
  const confirm = (await rl.question(`⚠️ Êtes-vous sûr de vouloir supprimer définitivement le code "${current.code}" ? (o/N) : `)).trim().toLowerCase();

  if (confirm === 'o' || confirm === 'oui' || confirm === 'y') {
    await sql`DELETE FROM subscription_codes WHERE id = ${current.id};`;
    console.log(`\n${c.brightGreen}🗑️ Le code ${current.code} a été supprimé définitivement.${c.reset}\n`);
  } else {
    console.log("\n❌ Suppression annulée.\n");
  }
}

export async function runSubscriptionCodeManager() {
  await initSubscriptionTables();
  const rl = readline.createInterface({ input, output });

  console.log("\n=======================================================");
  console.log("🎟️  GESTIONNAIRE INTERACTIF DES CODES D'ABONNEMENT mAI");
  console.log("=======================================================");

  let running = true;
  while (running) {
    console.log("\n--- MENU DES CODES ---");
    console.log("  1. ➕ Créer un nouveau code d'abonnement");
    console.log("  2. 📋 Lister tous les codes (actifs / inactifs)");
    console.log("  3. 🔄 Activer / Désactiver un code");
    console.log("  4. ✏️  Modifier un code existant");
    console.log("  5. 🗑️  Supprimer un code");
    console.log("  0. ↩️  Retour / Quitter");

    const choice = (await rl.question("\n👉 Entrez votre choix [0-5] : ")).trim();

    switch (choice) {
      case '1':
        await handleCreateCode(rl);
        break;
      case '2':
        await handleListCodes();
        break;
      case '3':
        await handleToggleCode(rl);
        break;
      case '4':
        await handleEditCode(rl);
        break;
      case '5':
        await handleDeleteCode(rl);
        break;
      case '0':
      case 'exit':
      case 'quit':
        running = false;
        break;
      default:
        console.log("⚠️ Option invalide.");
    }
  }

  rl.close();
}

// ─────────────────────────────────────────────
// 6. GESTION DES COMPTES CLIENTS
// ─────────────────────────────────────────────
export async function initCustomersTable() {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;`;
  } catch (err: any) {
    console.error("ℹ Note lors de la vérification de la colonne is_blocked dans users :", err.message || err);
  }
}

export async function initAccountAuditTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_account_actions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        action VARCHAR(20) NOT NULL CHECK (action IN ('block','unblock','delete','restore')),
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_account_actions_user_id ON user_account_actions(user_id)`;
  } catch (err: any) {
    console.error("ℹ Note lors de la création de la table d audit :", err.message || err);
  }
}

function renderCustomersTable(customers: any[]) {
  if (customers.length === 0) {
    console.log(`\n${c.brightYellow}⚠️  Aucun compte client trouvé en base de données.${c.reset}\n`);
    return;
  }

  console.log("\n" + "═".repeat(110));
  console.log(
    `║ ${"ID/UUID".padEnd(36)} ║ ${"USERNAME".padEnd(20)} ║ ${"EMAIL".padEnd(25)} ║ ${"TIER".padEnd(6)} ║ ${"STATUT".padEnd(10)} ║`
  );
  console.log("═".repeat(110));

  for (const user of customers) {
    const id = String(user.id || "").padEnd(36);
    const username = String(user.username || "").padEnd(20);
    const email = String(user.email || "").padEnd(25);
    const tier = String(user.tier || "Free").padEnd(6);
    const status = (user.is_blocked ? "🔴 Bloqué" : "🟢 Actif").padEnd(10);

    console.log(`║ ${id} ║ ${username} ║ ${email} ║ ${tier} ║ ${status} ║`);
  }
  console.log("═".repeat(110) + "\n");
}

async function handleListCustomers() {
  console.log(`\n${c.bold}--- 📋 LISTE DES COMPTES CLIENTS ---${c.reset}`);
  try {
    const customers = await sql`
      SELECT id, username, email, tier, is_blocked 
      FROM users 
      ORDER BY created_at DESC;
    `;
    renderCustomersTable(customers);
  } catch (err: any) {
    console.error("❌ Erreur lors de la récupération des clients :", err.message || err);
  }
}

async function handleToggleBlockCustomer(rl: readline.Interface) {
  console.log(`\n${c.bold}--- 🚫 BLOQUER / DÉBLOQUER UN COMPTE CLIENT ---${c.reset}`);
  const search = (await rl.question("👉 Entrez l'E-mail, le Username ou l'ID du client à bloquer/débloquer : ")).trim();
  if (!search) return;

  try {
    const found = await sql`
      SELECT id, username, email, is_blocked FROM users 
      WHERE email ILIKE ${search} OR username ILIKE ${search} OR id::text = ${search}
      LIMIT 1;
    `;

    if (found.length === 0) {
      console.log("❌ Aucun compte client correspondant trouvé.");
      return;
    }

    const current = found[0];
    const newStatus = !current.is_blocked;

    await sql`
      UPDATE users 
      SET is_blocked = ${newStatus}
      WHERE id = ${current.id};
    `;

    await sql`
      INSERT INTO user_account_actions (user_id, action, reason)
      VALUES (${current.id}::text, ${newStatus ? 'block' : 'unblock'}, 'Action via console admin')
    `;

    if (newStatus) {
      await sql`DELETE FROM connected_devices WHERE user_id = ${current.id}::text;`;
      await sql`DELETE FROM mprojects_api_keys WHERE user_id = ${current.id}::text OR user_id = ${current.username} OR user_id = ${current.email};`;
      await sql`DELETE FROM weekly_usage WHERE user_id = ${current.id}::text;`;
      await sql`DELETE FROM weekly_speech_usage WHERE user_id = ${current.id}::text;`;
      await sql`DELETE FROM mprojects_daily_image_usage WHERE user_id = ${current.id}::text;`;
      console.log(`\n${c.brightGreen}✔ Le client ${c.bold}${current.username}${c.reset} (${current.email}) a été ${c.bold}🚫 BLOQUÉ${c.reset} et toutes ses sessions actives ont été révoquées.\n`);
    } else {
      console.log(`\n${c.brightGreen}✔ Le client ${c.bold}${current.username}${c.reset} (${current.email}) a été ${c.bold}🟢 DÉBLOQUÉ${c.reset}.\n`);
    }
  } catch (err: any) {
    console.error("❌ Erreur lors de la modification du statut :", err.message || err);
  }
}

async function handleDeleteCustomer(rl: readline.Interface) {
  console.log(`\n${c.bold}--- 🗑️ SUPPRESSION D'UN COMPTE CLIENT ---${c.reset}`);
  const search = (await rl.question("👉 Entrez l'E-mail, le Username ou l'ID du client à supprimer : ")).trim();
  if (!search) return;

  try {
    const found = await sql`
      SELECT id, username, email FROM users 
      WHERE email ILIKE ${search} OR username ILIKE ${search} OR id::text = ${search}
      LIMIT 1;
    `;

    if (found.length === 0) {
      console.log("❌ Aucun compte client correspondant trouvé.");
      return;
    }

    const current = found[0];
    const confirm = (await rl.question(`⚠️ Êtes-vous sûr de vouloir supprimer définitivement le client "${current.username}" (${current.email}) ?\nToutes ses clés API, appareils et données associés seront impactés. (o/N) : `)).trim().toLowerCase();

    if (confirm === 'o' || confirm === 'oui' || confirm === 'y') {
      await sql`DELETE FROM connected_devices WHERE user_id = ${current.id}::text;`;
      await sql`DELETE FROM mprojects_api_keys WHERE user_id = ${current.id}::text OR user_id = ${current.username} OR user_id = ${current.email};`;
      await sql`DELETE FROM weekly_usage WHERE user_id = ${current.id}::text;`;
      await sql`DELETE FROM users WHERE id = ${current.id};`;
    await sql`
      INSERT INTO user_account_actions (user_id, action, reason)
      VALUES (${current.id}::text, 'delete', 'Suppression via console admin')
    `;

      console.log(`\n${c.brightGreen}🗑️ Le compte de ${current.username} (${current.email}) a été supprimé définitivement.${c.reset}\n`);
    } else {
      console.log("\n❌ Suppression annulée.\n");
    }
  } catch (err: any) {
    console.error("❌ Erreur lors de la suppression :", err.message || err);
  }
}

export async function runCustomerAccountManager() {
  await initCustomersTable();
  await initAccountAuditTable();
  const rl = readline.createInterface({ input, output });

  console.log("\n=======================================================");
  console.log("👥  GESTIONNAIRE INTERACTIF DES COMPTES CLIENTS mAI");
  console.log("=======================================================");

  let running = true;
  while (running) {
    console.log("\n--- MENU DES COMPTES CLIENTS ---");
    console.log("  1. 📋 Lister tous les comptes clients");
    console.log("  2. 🚫 Bloquer / Débloquer un compte");
    console.log("  3. 🗑️  Supprimer un compte client");
    console.log("  0. ↩️  Retour / Quitter");

    const choice = (await rl.question("\n👉 Entrez votre choix [0-3] : ")).trim();

    switch (choice) {
      case '1':
        await handleListCustomers();
        break;
      case '2':
        await handleToggleBlockCustomer(rl);
        break;
      case '3': 
        await handleDeleteCustomer(rl);
        break;
      case '0': 
      case 'exit': 
      case 'quit': 
        running = false;
        break;
      default:
        console.log("?? Option invalide.");
    }
  }

  rl.close();
}

// ─────────────────────────────────────────────
// 7. GESTIONNAIRE DE NOTIFICATIONS ACTUALITÉS
// ─────────────────────────────────────────────
async function ensureNotificationTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "userId" text NOT NULL,
        "type" varchar NOT NULL,
        "title" text NOT NULL,
        "body" text,
        "link" text,
        "isRead" boolean DEFAULT false NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification" USING btree ("userId")`;
    await sql`CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification" USING btree ("createdAt" DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification" USING btree ("userId","isRead")`;
    await sql`
      CREATE TABLE IF NOT EXISTS "user_notification_prefs" (
        "userId" text PRIMARY KEY NOT NULL,
        "enabled" boolean DEFAULT false NOT NULL,
        "aiResponse" boolean DEFAULT true NOT NULL,
        "projectCreated" boolean DEFAULT true NOT NULL,
        "mcpCreated" boolean DEFAULT true NOT NULL,
        "mcpAccessRequest" boolean DEFAULT true NOT NULL,
        "news" boolean DEFAULT true NOT NULL,
        "regenerateMode" varchar DEFAULT 'truncate' NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      )
    `;
  } catch (e: any) {
    console.error("Erreur création tables notifications", e.message);
  }
}

export async function sendNewsNotificationToEligibleUsers(
  title: string,
  body: string | null,
  link: string | null
) {
  await ensureNotificationTables();
  // Récupère les utilisateurs ayant activé les notifications + news
  const eligible = (await sql`
    SELECT "userId" FROM "user_notification_prefs"
    WHERE "enabled" = true AND "news" = true
  `) as unknown as { userId: string }[];
  if (eligible.length === 0) {
    console.log(`  ${c.yellow}⚠ Aucun utilisateur éligible (enabled=true & news=true).${c.reset}`);
    // Fallback: si aucun prefs, essayer users avec notify_limits? Non, on informe
    return { sent: 0, eligible: 0 };
  }
  console.log(`  ${c.cyan}➔ Envoi à ${eligible.length} utilisateur(s) éligible(s)...${c.reset}`);
  let sent = 0;
  for (let i = 0; i < eligible.length; i += 500) {
    const chunk = eligible.slice(i, i + 500);
    const _values = chunk.map((u) => ({ userId: u.userId }));
    // Insert par batch via sql template
    for (const u of chunk) {
      try {
        await sql`
          INSERT INTO "Notification" ("userId", "type", "title", "body", "link")
          VALUES (${u.userId}, 'news', ${title}, ${body}, ${link})
        `;
        sent++;
      } catch (err: any) {
        console.error(`  ${c.red}✖ Erreur pour ${u.userId}: ${err.message}${c.reset}`);
      }
    }
  }
  console.log(`  ${c.brightGreen}✔ ${sent} notification(s) "Actualités" créée(s) en BDD !${c.reset}`);
  return { sent, eligible: eligible.length };
}

async function handleSendNewsInteractive(rl: readline.Interface) {
  console.log(`\n${c.bold}--- 📢 ENVOI NOTIFICATION ACTUALITÉS mAI ---${c.reset}`);
  console.log(`${c.dim}Cette notification sera enregistrée en BDD pour chaque utilisateur ayant activé Notifications > Actualités d'mAI (activé par défaut à l'acceptation).${c.reset}`);
  const title = (await rl.question("👉 Titre de la notification (ex: Nouveautés mAI - Juin 2026) : ")).trim();
  if (!title) {
    console.log("❌ Titre requis.");
    return;
  }
  const body = (await rl.question("👉 Corps (facultatif, max 500c) : ")).trim();
  const link = (await rl.question("👉 Lien (facultatif, ex: /settings ou https://mai-devs.vercel.app) : ")).trim();
  const confirm = (await rl.question(`\n⚠️ Confirmer l'envoi "${title}" ? (o/N) : `)).trim().toLowerCase();
  if (confirm !== "o" && confirm !== "oui" && confirm !== "y" && confirm !== "yes") {
    console.log("Annulé.");
    return;
  }
  await sendNewsNotificationToEligibleUsers(title, body || null, link || null);
}

async function handleListRecentNotifications(rl: readline.Interface) {
  console.log(`\n${c.bold}--- 📋 NOTIFICATIONS RÉCENTES ---${c.reset}`);
  const limitIn = (await rl.question("👉 Nombre à afficher (défaut 10) : ")).trim();
  const limit = Math.min(Math.max(parseInt(limitIn, 10) || 10, 1), 50);
  try {
    const rows = await sql`SELECT "id", "userId", "type", "title", "isRead", "createdAt" FROM "Notification" ORDER BY "createdAt" DESC LIMIT ${limit}`;
    if (rows.length === 0) {
      console.log(`${c.dim}Aucune notification en BDD.${c.reset}`);
      return;
    }
    console.log("\n" + "─".repeat(110));
    console.log(`| ${"type".padEnd(18)} | ${"title".padEnd(30)} | ${"userId".padEnd(20)} | ${"lu".padEnd(4)} | ${"date".padEnd(20)} |`);
    console.log("─".repeat(110));
    for (const r of rows as any[]) {
      const t = String(r.type).padEnd(18);
      const ttl = String(r.title).slice(0, 30).padEnd(30);
      const uid = String(r.userId).slice(0, 20).padEnd(20);
      const lu = (r.isRead ? "oui" : "non").padEnd(4);
      const d = new Date(r.createdAt).toLocaleString("fr-FR").padEnd(20);
      console.log(`| ${t} | ${ttl} | ${uid} | ${lu} | ${d} |`);
    }
    console.log("─".repeat(110) + "\n");
  } catch (e: any) {
    console.error("Erreur listing", e.message);
  }
}

export async function runNotificationManager() {
  await ensureNotificationTables();
  const rl = readline.createInterface({ input, output });
  console.log("\n=======================================================");
  console.log("🔔  GESTIONNAIRE NOTIFICATIONS & ACTUALITÉS mAI");
  console.log("=======================================================");
  let running = true;
  while (running) {
    console.log("\n--- MENU NOTIFICATIONS ---");
    console.log("  1. 📢 Envoyer une notification Actualités (broadcast)");
    console.log("  2. 📋 Lister les notifications récentes");
    console.log("  3. 🗑️ Purger les notifications lues (>30j)");
    console.log("  0. ↩️ Retour / Quitter");
    const choice = (await rl.question("\n👉 Votre choix [0-3] : ")).trim();
    switch (choice) {
      case "1":
        await handleSendNewsInteractive(rl);
        break;
      case "2":
        await handleListRecentNotifications(rl);
        break;
      case "3": {
        const confirm = (await rl.question("⚠️ Supprimer les notifications lues de plus de 30 jours ? (o/N) : ")).trim().toLowerCase();
        if (confirm === "o" || confirm === "oui" || confirm === "y") {
          const res = await sql`DELETE FROM "Notification" WHERE "isRead" = true AND "createdAt" < NOW() - INTERVAL '30 days' RETURNING "id"`;
          console.log(`${c.brightGreen}✔ ${res.length} notifications purgées.${c.reset}`);
        } else console.log("Annulé.");
        break;
      }
      case "0":
      case "exit":
      case "quit":
        running = false;
        break;
      default:
        console.log("⚠️ Option invalide.");
    }
  }
  rl.close();
}

// ─────────────────────────────────────────────
// MENU PRINCIPAL DE LA SUITE ADMINISTRATIVE
// ─────────────────────────────────────────────
export async function runAdminCli() {
  await initPendingResetsTable().catch(() => {});
  await initQuotaBoostsTable().catch(() => {});
  // Support des flags en ligne de commande pour exécution non interactive / crons
  const args = process.argv.slice(2);
  if (args.includes('--reset-api')) {
    await resetApiUsage(true);
    process.exit(0);
  }
  if (args.includes('--reset-mai')) {
    await resetMaiUsage(true);
    process.exit(0);
  }
  if (args.includes('--reset-images')) {
    await resetImageUsage();
    process.exit(0);
  }
  if (args.includes('--reset-audio')) {
    await resetAudioUsage(true);
    process.exit(0);
  }
  if (args.includes('--reset-all')) {
    await resetAllUsage(true);
    process.exit(0);
  }
  if (args.includes('--boost-quota')) {
    const rl = readline.createInterface({ input, output });
    let preselectedUser: string | undefined = undefined;
    const userArgIdx = args.indexOf('--user');
    if (userArgIdx !== -1 && args[userArgIdx + 1]) {
      preselectedUser = args[userArgIdx + 1];
    }
    await runQuotaBoostWizard(rl, preselectedUser);
    rl.close();
    process.exit(0);
  }
  if (args.includes('--codes')) {
    await runSubscriptionCodeManager();
    process.exit(0);
  }
  if (args.includes('--customers')) {
    await runCustomerAccountManager();
    process.exit(0);
  }
  if (args.includes('--newsletter')) {
    await runNewsletterStudio();
    process.exit(0);
  }
  if (args.includes('--notify-news')) {
    const idx = args.indexOf('--notify-news');
    const title = args[idx + 1];
    const body = args[idx + 2] || null;
    const link = args[idx + 3] || null;
    if (!title) {
      console.error("Usage: --notify-news \"Titre\" [\"Body\"] [\"Link\"]");
      process.exit(1);
    }
    await sendNewsNotificationToEligibleUsers(title, body, link);
    process.exit(0);
  }
  if (args.includes('--notifications')) {
    await runNotificationManager();
    process.exit(0);
  }

  console.log("");
  console.log(`${c.bgPurple}${c.bold}${c.brightWhite}  ╔══════════════════════════════════════════════════════════════════════╗  ${c.reset}`);
  console.log(`${c.bgPurple}${c.bold}${c.brightWhite}  ║             🛠️  mAI — CONSOLE D'ADMINISTRATION & MAINTENANCE         ║  ${c.reset}`);
  console.log(`${c.bgPurple}${c.bold}${c.brightWhite}  ╚══════════════════════════════════════════════════════════════════════╝  ${c.reset}`);
  console.log("");

  const rl = readline.createInterface({ input, output });
  let running = true;

  while (running) {
    console.log(`\n${c.bold}ACTIONS DISPONIBLES :${c.reset}`);
    console.log(`  ${c.brightCyan}[1]${c.reset} 🔄 Réinitialiser les quotas d'usage API (mprojects_api_keys)`);
    console.log(`  ${c.brightCyan}[2]${c.reset} 🔄 Réinitialiser les quotas d'usage mAI (weekly_usage)`);
    console.log(`  ${c.brightCyan}[3]${c.reset} 🔄 Réinitialiser les quotas journaliers d'Images`);
    console.log(`  ${c.brightCyan}[4]${c.reset} 🔄 Réinitialiser les quotas de synthèse vocale Audio (weekly_speech_usage)`);
    console.log(`  ${c.brightGreen}[5]${c.reset} ⚡ ${c.bold}Réinitialiser TOUS les quotas en 1 clic (API + mAI + Images + Audio)${c.reset}`);
    console.log(`  ${c.brightYellow}[6]${c.reset} 📈 ${c.bold}Augmenter temporairement un quota (Boost jusqu'à une date ou période)${c.reset}`);
    console.log(`  ${c.brightMagenta}[7]${c.reset} 🎟️  Gérer les codes d'abonnement (Créer, Lister, Activer, Modifier)`);
    console.log(`  ${c.brightYellow}[8]${c.reset} 📧 Lancer le Studio de Newsletter (Éditeur HTML & CLI)`);
    console.log(`  ${c.brightWhite}[9]${c.reset} 👥 Gérer les comptes clients (Lister, Bloquer, Supprimer)`);
    console.log(`  ${c.brightCyan}[10]${c.reset} 🔔 Gérer les Notifications & Actualités (Broadcast)`);
    console.log(`  ${c.white}[0]${c.reset} 🚪 Quitter`);
    console.log("");

    const choice = (await rl.question(`  ${c.brightYellow}➔ Votre choix [0-10] : ${c.reset}`)).trim();

    switch (choice) {
      case '1':
        await runResetWizard(rl, 'api');
        break;
      case '2':
        await runResetWizard(rl, 'mai');
        break;
      case '3':
        await runResetWizard(rl, 'images');
        break;
      case '4':
        await runResetWizard(rl, 'audio');
        break;
      case '5':
        await runResetWizard(rl, 'all');
        break;
      case '6':
        await runQuotaBoostManager(rl);
        break;
      case '7':
        rl.close();
        await runSubscriptionCodeManager();
        return;
      case '8':
        rl.close();
        await runNewsletterStudio();
        return;
      case '9':
        rl.close();
        await runCustomerAccountManager();
        return;
      case '10':
        rl.close();
        await runNotificationManager();
        return;
      case '0':
      case 'exit':
      case 'quit':
        running = false;
        console.log(`\n${c.dim}👋 Fermeture de la console d'administration.${c.reset}\n`);
        break;
      default:
        console.log("⚠️ Choix invalide.");
    }
  }

  rl.close();
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('admin.ts')) {
  runAdminCli().catch((err) => {
    console.error("❌ Erreur fatale :", err?.message || err);
    process.exit(1);
  });
}
