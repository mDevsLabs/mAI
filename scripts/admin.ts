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
// Template d'E-mail de Réinitialisation de Quotas
// ─────────────────────────────────────────────
function buildQuotaEmailHtml(title: string, username: string, messageText: string, badgeLabel: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9;">
      <div style="max-width:560px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
        
        <!-- Header & Logo -->
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%); padding:36px 24px 28px 24px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:44px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:20px; font-weight:800; margin:16px 0 0 0; letter-spacing:-0.5px;">${title}</h1>
        </div>

        <!-- Body Content -->
        <div style="padding:32px 28px; line-height:1.7; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0; font-size:16px; font-weight:600; color:#ffffff;">Bonjour <strong>${username}</strong>,</p>
          <p>${messageText}</p>
          
          <div style="background:linear-gradient(180deg, #131d31 0%, #0c1322 100%); border:1px solid #334155; border-radius:16px; padding:22px; text-align:center; margin:26px 0;">
            <span style="display:inline-block; background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.35); font-weight:800; font-size:13px; padding:6px 18px; border-radius:100px; text-transform:uppercase; letter-spacing:0.5px;">
              ${badgeLabel}
            </span>
            <p style="font-size:13px; color:#94a3b8; margin:12px 0 0 0;">L'intégralité de vos crédits, tokens et clés d'API sont à nouveau disponibles.</p>
          </div>

          <p style="font-size:12px; color:#64748b; margin-top:24px;">Cet e-mail automatique vous est adressé car les notifications de gestion de quotas sont activées sur votre profil mAI.</p>
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

// ─────────────────────────────────────────────
// 1. RÉINITIALISATION DES USAGES API
// ─────────────────────────────────────────────
export async function resetApiUsage(notifyUsers = true) {
  console.log(`\n${c.cyan}⏳ Réinitialisation des usages des clés d'API (mprojects_api_keys)...${c.reset}`);
  await sql`UPDATE mprojects_api_keys SET request_count = 0`;
  console.log(`${c.brightGreen}✔ Succès : Tous les compteurs de requêtes d'API ont été remis à 0 !${c.reset}`);

  if (!notifyUsers) return;

  const users = (await sql`SELECT email, username FROM users WHERE notify_limits = TRUE`) as unknown as { email: string; username: string }[];
  if (users.length === 0) {
    console.log(`  ${c.dim}ℹ Aucun utilisateur inscrit aux notifications de limites.${c.reset}`);
    return;
  }

  console.log(`  ${c.brightYellow}➔ Envoi des e-mails de notification à ${users.length} utilisateur(s)...${c.reset}`);
  let success = 0;
  for (const user of users) {
    const html = buildQuotaEmailHtml(
      "Réinitialisation de vos quotas d'API",
      user.username,
      "Vos quotas de requêtes d'API mAI ont été réinitialisés pour la nouvelle période.",
      "Quotas d'API réinitialisés à 100%"
    );

    try {
      const sent = await sendEmail({
        to: user.email,
        subject: "Vos quotas API mAI ont été réinitialisés",
        html,
      });
      if (sent) success++;
      await new Promise((r) => setTimeout(r, 100));
    } catch (err: any) {
      console.error(`  ${c.red}✖ Erreur d'envoi pour ${user.email} : ${err?.message || err}${c.reset}`);
    }
  }

  console.log(`  ${c.brightGreen}✔ ${success} notification(s) e-mail envoyée(s) avec succès !${c.reset}`);
}

// ─────────────────────────────────────────────
// 2. RÉINITIALISATION DES USAGES mAI (TOKENS HEBDOMADAIRES)
// ─────────────────────────────────────────────
export async function resetMaiUsage(notifyUsers = true) {
  console.log(`\n${c.cyan}⏳ Réinitialisation des tokens hebdomadaires mAI (weekly_usage)...${c.reset}`);
  await sql`UPDATE weekly_usage SET tokens_used = 0`;
  console.log(`${c.brightGreen}✔ Succès : Tous les compteurs de tokens mAI ont été remis à 0 !${c.reset}`);

  if (!notifyUsers) return;

  const users = (await sql`SELECT email, username FROM users WHERE notify_limits = TRUE`) as unknown as { email: string; username: string }[];
  if (users.length === 0) {
    console.log(`  ${c.dim}ℹ Aucun utilisateur inscrit aux notifications de limites.${c.reset}`);
    return;
  }

  console.log(`  ${c.brightYellow}➔ Envoi des e-mails de notification à ${users.length} utilisateur(s)...${c.reset}`);
  let success = 0;
  for (const user of users) {
    const html = buildQuotaEmailHtml(
      "Réinitialisation de vos quotas mAI",
      user.username,
      "Vos quotas de tokens hebdomadaires pour les modèles mAI ont été réinitialisés.",
      "Quotas mAI réinitialisés à 100%"
    );

    try {
      const sent = await sendEmail({
        to: user.email,
        subject: "Vos quotas mAI ont été réinitialisés",
        html,
      });
      if (sent) success++;
      await new Promise((r) => setTimeout(r, 100));
    } catch (err: any) {
      console.error(`  ${c.red}✖ Erreur d'envoi pour ${user.email} : ${err?.message || err}${c.reset}`);
    }
  }

  console.log(`  ${c.brightGreen}✔ ${success} notification(s) e-mail envoyée(s) avec succès !${c.reset}`);
}

// ─────────────────────────────────────────────
// 3. RÉINITIALISATION DES USAGES IMAGES
// ─────────────────────────────────────────────
export async function resetImageUsage() {
  console.log(`\n${c.cyan}⏳ Réinitialisation des quotas journaliers de génération d'images...${c.reset}`);
  await sql`UPDATE mprojects_daily_image_usage SET images_generated = 0, updated_at = NOW() WHERE usage_date = CURRENT_DATE`;
  console.log(`${c.brightGreen}✔ Succès : Les quotas journaliers d'images ont été réinitialisés pour aujourd'hui !${c.reset}`);
}

// ─────────────────────────────────────────────
// 3b. RÉINITIALISATION DES USAGES AUDIO
// ─────────────────────────────────────────────
export async function resetAudioUsage(notifyUsers = true) {
  console.log(`\n${c.cyan}⏳ Réinitialisation des quotas audio (weekly_speech_usage)...${c.reset}`);
  await sql`UPDATE weekly_speech_usage SET tokens_used = 0, requests_count = 0`;
  console.log(`${c.brightGreen}✔ Succès : Tous les compteurs de quotas audio ont été remis à 0 !${c.reset}`);

  if (!notifyUsers) return;

  const users = (await sql`SELECT email, username FROM users WHERE notify_limits = TRUE`) as unknown as { email: string; username: string }[];
  if (users.length === 0) {
    console.log(`  ${c.dim}ℹ Aucun utilisateur inscrit aux notifications de limites.${c.reset}`);
    return;
  }

  console.log(`  ${c.brightYellow}➔ Envoi des e-mails de notification à ${users.length} utilisateur(s)...${c.reset}`);
  let success = 0;
  for (const user of users) {
    const html = buildQuotaEmailHtml(
      "Réinitialisation de vos quotas Audio",
      user.username,
      "Vos quotas de synthèse vocale et d'audio mAI ont été réinitialisés pour la nouvelle période.",
      "Quotas Audio réinitialisés à 100%"
    );

    try {
      const sent = await sendEmail({
        to: user.email,
        subject: "Vos quotas Audio mAI ont été réinitialisés",
        html,
      });
      if (sent) success++;
      await new Promise((r) => setTimeout(r, 100));
    } catch (err: any) {
      console.error(`  ${c.red}✖ Erreur d'envoi pour ${user.email} : ${err?.message || err}${c.reset}`);
    }
  }

  console.log(`  ${c.brightGreen}✔ ${success} notification(s) e-mail envoyée(s) avec succès !${c.reset}`);
}

// ─────────────────────────────────────────────
// 4. RÉINITIALISATION GLOBALE (API + mAI + IMAGES + AUDIO)
// ─────────────────────────────────────────────
export async function resetAllUsage(notifyUsers = true) {
  console.log(`\n${c.bgPurple}${c.bold}${c.brightWhite} ⚡ RÉINITIALISATION GLOBALE DE TOUS LES QUOTAS (API + mAI + IMAGES + AUDIO) ⚡ ${c.reset}`);
  await resetApiUsage(false);
  await resetMaiUsage(false);
  await resetImageUsage();
  await resetAudioUsage(false);

  if (notifyUsers) {
    const users = (await sql`SELECT email, username FROM users WHERE notify_limits = TRUE`) as unknown as { email: string; username: string }[];
    if (users.length > 0) {
      console.log(`\n  ${c.brightYellow}➔ Envoi d'une notification globale unifiée à ${users.length} utilisateur(s)...${c.reset}`);
      let success = 0;
      for (const user of users) {
        const html = buildQuotaEmailHtml(
          "Réinitialisation globale de vos quotas mAI",
          user.username,
          "L'ensemble de vos quotas de requêtes API, de tokens mAI, de génération d'images et de synthèse vocale/audio ont été réinitialisés à 100%.",
          "Tous les quotas réinitialisés à 100%"
        );

        try {
          const sent = await sendEmail({
            to: user.email,
            subject: "Tous vos quotas mAI ont été réinitialisés",
            html,
          });
          if (sent) success++;
          await new Promise((r) => setTimeout(r, 100));
        } catch (err: any) {
          console.error(`  ${c.red}✖ Erreur pour ${user.email} : ${err?.message || err}${c.reset}`);
        }
      }
      console.log(`  ${c.brightGreen}✔ ${success} e-mail(s) de réinitialisation globale envoyé(s) !${c.reset}`);
    }
  }

  console.log(`\n${c.brightGreen}${c.bold}🎉 Tous les quotas ont été remis à zéro avec succès !${c.reset}\n`);
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
    const values = chunk.map((u) => ({ userId: u.userId }));
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
    console.log(`  ${c.brightMagenta}[6]${c.reset} 🎟️  Gérer les codes d'abonnement (Créer, Lister, Activer, Modifier)`);
    console.log(`  ${c.brightYellow}[7]${c.reset} 📧 Lancer le Studio de Newsletter (Éditeur HTML & CLI)`);
    console.log(`  ${c.brightWhite}[8]${c.reset} 👥 Gérer les comptes clients (Lister, Bloquer, Supprimer)`);
    console.log(`  ${c.brightCyan}[9]${c.reset} 🔔 Gérer les Notifications & Actualités (Broadcast)`);
    console.log(`  ${c.white}[0]${c.reset} 🚪 Quitter`);
    console.log("");

    const choice = (await rl.question(`  ${c.brightYellow}➔ Votre choix [0-9] : ${c.reset}`)).trim();

    switch (choice) {
      case '1':
        await resetApiUsage(true);
        break;
      case '2':
        await resetMaiUsage(true);
        break;
      case '3':
        await resetImageUsage();
        break;
      case '4':
        await resetAudioUsage(true);
        break;
      case '5':
        await resetAllUsage(true);
        break;
      case '6':
        rl.close();
        await runSubscriptionCodeManager();
        return;
      case '7':
        rl.close();
        await runNewsletterStudio();
        return;
      case '8':
        rl.close();
        await runCustomerAccountManager();
        return;
      case '9':
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
