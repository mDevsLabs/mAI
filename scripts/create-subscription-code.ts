import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs';
import path from 'path';

// Chargement automatique du .env / .env.local si DATABASE_URL n'est pas dans l'environnement
function loadEnvFallback() {
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

loadEnvFallback();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ Erreur : La variable DATABASE_URL est introuvable dans votre environnement ou vos fichiers .env.");
  process.exit(1);
}

const sql = neon(dbUrl);

/**
 * Initialise les tables si elles n'existent pas
 */
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

/**
 * Génère une clé intelligente au format MAI-[TIER]-[ALEATOIRE]
 */
export function generateRandomCode(tier: string): string {
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `MAI-${tier.toUpperCase()}-${randomChars}`;
}

/**
 * Affiche un tableau stylisé des codes
 */
function renderCodesTable(codes: any[]) {
  if (codes.length === 0) {
    console.log("\n⚠️  Aucun code d'abonnement trouvé en base de données.\n");
    return;
  }

  console.log("\n" + "=".repeat(95));
  console.log(
    `| ${"ID".padEnd(4)} | ${"CODE".padEnd(24)} | ${"TIER".padEnd(6)} | ${"UTILISATIONS".padEnd(14)} | ${"STATUT".padEnd(10)} | ${"EXPIRATION".padEnd(20)} |`
  );
  console.log("=".repeat(95));

  for (const c of codes) {
    const id = String(c.id).padEnd(4);
    const code = String(c.code).padEnd(24);
    const tier = String(c.tier).padEnd(6);
    const uses = `${c.uses_count}/${c.max_uses}`.padEnd(14);
    const status = (c.is_active ? "🟢 Actif" : "🔴 Inactif").padEnd(10);
    const exp = c.expires_at ? new Date(c.expires_at).toLocaleDateString('fr-FR') : "Illimitée";
    const expiration = exp.padEnd(20);

    console.log(`| ${id} | ${code} | ${tier} | ${uses} | ${status} | ${expiration} |`);
  }
  console.log("=".repeat(95) + "\n");
}

/**
 * Menu 1 : Créer un nouveau code
 */
async function handleCreateCode(rl: readline.Interface) {
  console.log("\n--- ➕ CRÉATION D'UN NOUVEAU CODE D'ABONNEMENT ---");

  // 1. Choix du Forfait
  console.log("\nChoisissez le forfait à débloquer :");
  console.log("  1. Plus");
  console.log("  2. Pro");
  console.log("  3. Max");
  const tierChoice = (await rl.question("👉 Votre choix [1-3] (défaut: 2 - Pro) : ")).trim();
  
  let tier: 'Plus' | 'Pro' | 'Max' = 'Pro';
  if (tierChoice === '1') tier = 'Plus';
  else if (tierChoice === '3') tier = 'Max';

  // 2. Mode de génération
  console.log("\nMode de génération du code :");
  console.log("  1. Génération intelligente automatique (ex: MAI-" + tier.toUpperCase() + "-XXXXXX)");
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

  // 3. Nombre d'utilisations
  const usesInput = (await rl.question("👉 Nombre maximal d'utilisations (défaut: 1) : ")).trim();
  const maxUses = parseInt(usesInput, 10) > 0 ? parseInt(usesInput, 10) : 1;

  // 4. Durée de validité
  const daysInput = (await rl.question("👉 Durée de validité en jours (laisser vide pour illimité) : ")).trim();
  const expiresInDays = parseInt(daysInput, 10) > 0 ? parseInt(daysInput, 10) : null;

  let expiresAt: Date | null = null;
  if (expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Insertion en base
  try {
    const result = await sql`
      INSERT INTO subscription_codes (code, tier, max_uses, uses_count, is_active, expires_at)
      VALUES (${finalCode}, ${tier}, ${maxUses}, 0, TRUE, ${expiresAt})
      RETURNING *;
    `;

    const c = result[0];
    console.log("\n🎉 ===============================================");
    console.log("✅ CODE CRÉÉ ET ENREGISTRÉ AVEC SUCCÈS !");
    console.log(`🔑 Code         : \x1b[32m\x1b[1m${c.code}\x1b[0m`);
    console.log(`⭐ Forfait      : ${c.tier}`);
    console.log(`👥 Utilisations : 0 / ${c.max_uses}`);
    console.log(`📅 Expiration   : ${c.expires_at ? new Date(c.expires_at).toLocaleString('fr-FR') : 'Illimitée'}`);
    console.log("===============================================\n");
  } catch (err: any) {
    console.error("❌ Erreur lors de la création :", err.message || err);
  }
}

/**
 * Menu 2 : Lister les codes
 */
async function handleListCodes() {
  console.log("\n--- 📋 LISTE DES CODES D'ABONNEMENT ---");
  const codes = await sql`
    SELECT * FROM subscription_codes ORDER BY created_at DESC;
  `;
  renderCodesTable(codes);
}

/**
 * Menu 3 : Activer / Désactiver un code
 */
async function handleToggleCode(rl: readline.Interface) {
  console.log("\n--- 🔄 ACTIVER / DÉSACTIVER UN CODE ---");
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

  console.log(`\n✅ Le statut du code \x1b[1m${current.code}\x1b[0m est désormais : ${newStatus ? '🟢 ACTIF' : '🔴 INACTIF'}\n`);
}

/**
 * Menu 4 : Modifier un code existant
 */
async function handleEditCode(rl: readline.Interface) {
  console.log("\n--- ✏️ MODIFIER UN CODE D'ABONNEMENT ---");
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
  console.log(`\nCode actuel sélectionné : \x1b[32m${current.code}\x1b[0m (Tier: ${current.tier}, Max uses: ${current.max_uses}, Actif: ${current.is_active})`);

  // Nouveau Forfait
  console.log("\nModifier le forfait (laisser vide pour conserver '" + current.tier + "') :");
  console.log("  1. Plus | 2. Pro | 3. Max");
  const tierInput = (await rl.question("👉 Choix [1-3] : ")).trim();
  let newTier = current.tier;
  if (tierInput === '1') newTier = 'Plus';
  if (tierInput === '2') newTier = 'Pro';
  if (tierInput === '3') newTier = 'Max';

  // Nouveau Max Uses
  const usesInput = (await rl.question(`👉 Nouveau quota maximal d'utilisations (actuel: ${current.max_uses}) : `)).trim();
  const newMaxUses = parseInt(usesInput, 10) > 0 ? parseInt(usesInput, 10) : current.max_uses;

  // Statut actif/inactif
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

  console.log(`\n✅ Code \x1b[1m${current.code}\x1b[0m mis à jour avec succès !\n`);
}

/**
 * Menu 5 : Supprimer définitivement un code
 */
async function handleDeleteCode(rl: readline.Interface) {
  console.log("\n--- 🗑️ SUPPRESSION D'UN CODE D'ABONNEMENT ---");
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
    console.log(`\n🗑️ Le code \x1b[1m${current.code}\x1b[0m a été supprimé définitivement.\n`);
  } else {
    console.log("\n❌ Suppression annulée.\n");
  }
}

/**
 * Boucle Principale Interactive
 */
async function main() {
  await initSubscriptionTables();

  const rl = readline.createInterface({ input, output });

  console.log("\n=======================================================");
  console.log("🎟️  GESTIONNAIRE INTERACTIF DES CODES D'ABONNEMENT mAI");
  console.log("=======================================================");

  let running = true;

  while (running) {
    console.log("\n--- MENU PRINCIPAL ---");
    console.log("  1. ➕ Créer un nouveau code (personnalisé ou auto)");
    console.log("  2. 📋 Lister tous les codes (actifs / inactifs)");
    console.log("  3. 🔄 Activer / Désactiver un code (toggle)");
    console.log("  4. ✏️  Modifier un code (forfait, quota...)");
    console.log("  5. 🗑️  Supprimer définitivement un code");
    console.log("  0. 🚪 Quitter le gestionnaire");

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
        console.log("\n👋 Au revoir !\n");
        break;
      default:
        console.log("⚠️ Option invalide, veuillez choisir entre 0 et 5.");
    }
  }

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});
