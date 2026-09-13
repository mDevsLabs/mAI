"use server";

import { neon } from "@neondatabase/serverless";
import { sendHtmlEmail } from "@/email";
import crypto from "crypto";
import { getSessionIdentity } from "@/lib/session-auth";
import { isAdminUser } from "@/app/actions/support-utils";

export type UserTier = "Free" | "Plus" | "Pro" | "Max";

export interface UpdateUserAdminParams {
  userId: number | string;
  tier?: UserTier;
  username?: string;
  email?: string;
  phone?: string | null;
  password?: string;
  notify?: boolean;
  reason?: string;
}

export interface UserChangeItem {
  label: string;
  oldValue?: string | null;
  newValue: string;
  icon?: string;
}

export interface UpdateUserAdminResult {
  success: boolean;
  changes: UserChangeItem[];
  user?: {
    id: number;
    username: string;
    email: string;
    tier: string;
    phone: string | null;
    is_blocked: boolean;
  };
  error?: string;
  emailSent?: boolean;
}

function escapeHtml(str: any): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildAccountUpdateEmailHtml(params: {
  username: string;
  changes: UserChangeItem[];
  newTier?: string | null;
  tempPassword?: string | null;
}) {
  const { username, changes, newTier, tempPassword } = params;

  const changesListHtml = changes
    .map((item) => {
      const icon = item.icon || "✨";
      const oldStr = item.oldValue
        ? `<span style="color:#94a3b8; text-decoration:line-through; margin-right:6px;">${escapeHtml(item.oldValue)}</span>➔ `
        : "";
      return `
        <li style="margin-bottom:12px; font-size:14px; line-height:1.6; color:#e2e8f0; list-style:none; padding-left:0;">
          <span style="display:inline-block; margin-right:8px; font-size:16px;">${icon}</span>
          <strong style="color:#cbd5e1;">${escapeHtml(item.label)} :</strong> 
          ${oldStr}<strong style="color:#c084fc;">${escapeHtml(item.newValue)}</strong>
        </li>
      `;
    })
    .join("");

  const tierLimitsMap: Record<string, string> = {
    Free: "500 req/mois API • 10M tokens mAI • 10 GB Cloud Storage",
    Plus: "1 500 req/mois API • 20M tokens mAI • 20 GB Cloud Storage",
    Pro: "3 000 req/mois API • 30M tokens mAI • 40 GB Cloud Storage",
    Max: "7 500 req/mois API • 50M tokens mAI • 60 GB Cloud Storage",
  };

  const tierBadgeHtml = newTier
    ? `
      <div style="background:linear-gradient(180deg, #131d31 0%, #0c1322 100%); border:1px solid #334155; border-radius:16px; padding:20px; text-align:center; margin:22px 0;">
        <span style="display:inline-block; background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.35); font-weight:800; font-size:14px; padding:6px 20px; border-radius:100px; text-transform:uppercase; letter-spacing:0.5px;">
          Forfait Actuel : ${escapeHtml(newTier)}
        </span>
        <p style="font-size:13px; color:#94a3b8; margin:10px 0 0 0;">
          ${tierLimitsMap[newTier] || "Vos nouveaux quotas étendus sont immédiatement disponibles."}
        </p>
      </div>
    `
    : "";

  const passwordBoxHtml = tempPassword
    ? `
      <div style="background:rgba(234,179,8,0.1); border:1px solid rgba(234,179,8,0.3); border-radius:12px; padding:16px; margin:18px 0; color:#fef08a; font-size:14px;">
        🔑 <strong>Nouveau mot de passe temporaire :</strong> 
        <code style="background:#0f172a; padding:4px 10px; border-radius:6px; color:#fbbf24; font-family:monospace; font-size:15px; user-select:all;">${escapeHtml(tempPassword)}</code>
        <br><span style="font-size:12px; color:#cbd5e1; margin-top:8px; display:inline-block;">Nous vous recommandons de le modifier dès votre prochaine connexion dans vos paramètres de compte.</span>
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mise à jour de votre compte mAI</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9; -webkit-font-smoothing:antialiased;">
      <div style="max-width:560px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
        
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%); padding:36px 24px 28px 24px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:44px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:20px; font-weight:800; margin:16px 0 0 0; letter-spacing:-0.5px;">Mise à jour de votre compte mAI</h1>
        </div>

        <div style="padding:32px 28px; line-height:1.7; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0; font-size:16px; font-weight:600; color:#ffffff;">Bonjour <strong>${escapeHtml(username)}</strong>,</p>
          <p>Un administrateur de la plateforme mAI a apporté des modifications aux informations de votre compte :</p>
          
          <div style="background:rgba(255,255,255,0.03); border:1px solid #1e293b; border-radius:14px; padding:18px 20px; margin:18px 0;">
            <ul style="margin:0; padding:0;">
              ${changesListHtml}
            </ul>
          </div>

          ${tierBadgeHtml}
          ${passwordBoxHtml}

          <div style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); border-radius:12px; padding:14px 18px; margin:18px 0; color:#93c5fd; font-size:14px;">
            ⚡ <strong>Prise d'effet immédiate :</strong> Vos nouveaux droits et informations sont effectifs dès à présent sur l'ensemble de vos accès mAI.
          </div>

          <p style="font-size:13px; color:#94a3b8; margin-top:24px;">
            Si vous n'êtes pas à l'origine de cette demande ou si vous avez des questions, notre support est à votre disposition à <a href="mailto:mprojectsofficiel@gmail.com" style="color:#a855f7;">mprojectsofficiel@gmail.com</a>.
          </p>
        </div>

        <div style="background-color:#070a12; padding:20px 24px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b;">
          <p style="margin:0 0 4px 0; font-weight:600; color:#94a3b8;">© 2026 mAI — Plateforme d'IA &amp; APIs Souveraines</p>
          <p style="margin:0; font-size:11px;">Données sécurisées dans l'UE • Priorité Zero Data Retention (ZDR)</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

function buildAccountSecurityAlertEmailHtml(params: {
  username: string;
  oldEmail: string;
  newEmail: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alerte de sécurité - Changement d'adresse e-mail mAI</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9;">
      <div style="max-width:560px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden;">
        <div style="background:linear-gradient(135deg, #7f1d1d 0%, #31104b 100%); padding:28px 24px; text-align:center; border-bottom:1px solid #991b1b;">
          <h1 style="color:#ffffff; font-size:20px; font-weight:800; margin:0;">⚠️ Alerte de sécurité mAI</h1>
        </div>
        <div style="padding:28px; line-height:1.7; font-size:15px; color:#cbd5e1;">
          <p>Bonjour <strong>${escapeHtml(params.username)}</strong>,</p>
          <p>L'adresse e-mail associée à votre compte mAI a été modifiée par un administrateur :</p>
          <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:12px; padding:14px; margin:16px 0; color:#fca5a5; font-size:14px;">
            Nouvelle adresse e-mail : <strong>${escapeHtml(params.newEmail)}</strong>
          </div>
          <p>Si vous êtes à l'origine de cette demande, aucune action supplémentaire n'est requise.</p>
          <p style="color:#ef4444; font-weight:600;">Si vous n'avez pas sollicité cette modification, contactez immédiatement notre équipe : <a href="mailto:mprojectsofficiel@gmail.com" style="color:#f87171;">mprojectsofficiel@gmail.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function hashPassword(plainText: string): Promise<string> {
  if (typeof (globalThis as any).Bun !== 'undefined' && (globalThis as any).Bun.password?.hash) {
    return await (globalThis as any).Bun.password.hash(plainText, { algorithm: 'bcrypt', cost: 10 });
  }
  try {
    // Indirection volontaire : dépendance optionnelle, non embarquée par le bundler
    const importOptional = Function('s', 'return import(s)') as (s: string) => Promise<any>;
    const bcryptjs = await importOptional('bcryptjs');
    return await bcryptjs.default.hash(plainText, 10);
  } catch {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(plainText, salt, 1000, 64, 'sha512').toString('hex');
    return `$pbkdf2$${salt}$${hash}`;
  }
}

export async function updateUserByAdmin(params: UpdateUserAdminParams): Promise<UpdateUserAdminResult> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return { success: false, changes: [], error: "DATABASE_URL non configurée." };
  }

  const sql = neon(dbUrl);

  // Garde d'accès : réservé à l'administrateur (identité dérivée de la session signée)
  const identity = await getSessionIdentity();
  if (!identity) {
    return { success: false, changes: [], error: "Authentification requise." };
  }
  const adminRows = await sql`SELECT email FROM users WHERE id::text = ${identity.userId}::text LIMIT 1`;
  if (!isAdminUser(String(adminRows[0]?.email || ""))) {
    return { success: false, changes: [], error: "Accès réservé à l'administrateur." };
  }

  const userRows = await sql`
    SELECT id, username, email, tier, phone, is_blocked, created_at 
    FROM users 
    WHERE id::text = ${String(params.userId)} 
       OR LOWER(username) = ${String(params.userId).toLowerCase().trim().replace(/^@/, '')} 
       OR LOWER(email) = ${String(params.userId).toLowerCase().trim()}
    LIMIT 1;
  `;

  if (userRows.length === 0) {
    return { success: false, changes: [], error: `Utilisateur "${params.userId}" introuvable.` };
  }

  const user = userRows[0] as any;
  const changes: UserChangeItem[] = [];

  let targetTier: UserTier | null = null;
  if (params.tier) {
    const normalized = (params.tier.charAt(0).toUpperCase() + params.tier.slice(1).toLowerCase()) as UserTier;
    if (!['Free', 'Plus', 'Pro', 'Max'].includes(normalized)) {
      return { success: false, changes: [], error: `Plan "${params.tier}" invalide.` };
    }
    if (normalized !== (user.tier || 'Free')) {
      targetTier = normalized;
      changes.push({
        label: "Plan d'abonnement",
        oldValue: user.tier || "Free",
        newValue: normalized,
        icon: "⭐",
      });
    }
  }

  let targetUsername: string | null = null;
  if (params.username) {
    const cleanU = String(params.username).toLowerCase().trim().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
    if (cleanU.length < 2) {
      return { success: false, changes: [], error: "Le nom d'utilisateur doit faire au moins 2 caractères." };
    }
    if (cleanU !== user.username) {
      const existing = await sql`SELECT id FROM users WHERE LOWER(username) = ${cleanU} AND id != ${user.id} LIMIT 1;`;
      if (existing.length > 0) {
        return { success: false, changes: [], error: `Le nom d'utilisateur "${cleanU}" est déjà pris.` };
      }
      targetUsername = cleanU;
      changes.push({
        label: "Nom d'utilisateur",
        oldValue: `@${user.username}`,
        newValue: `@${cleanU}`,
        icon: "👤",
      });
    }
  }

  let targetEmail: string | null = null;
  if (params.email) {
    const cleanE = String(params.email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanE)) {
      return { success: false, changes: [], error: "Format d'adresse e-mail invalide." };
    }
    if (cleanE !== user.email.toLowerCase()) {
      const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${cleanE} AND id != ${user.id} LIMIT 1;`;
      if (existing.length > 0) {
        return { success: false, changes: [], error: `L'adresse e-mail "${cleanE}" est déjà utilisée.` };
      }
      targetEmail = cleanE;
      changes.push({
        label: "Adresse e-mail",
        oldValue: user.email,
        newValue: cleanE,
        icon: "✉️",
      });
    }
  }

  let targetPhone: string | null | undefined = undefined;
  if (params.phone !== undefined) {
    const cleanP = params.phone ? String(params.phone).trim() : null;
    if (cleanP !== (user.phone || null)) {
      targetPhone = cleanP;
      changes.push({
        label: "Numéro de téléphone",
        oldValue: user.phone || "Non renseigné",
        newValue: cleanP || "Supprimé",
        icon: "📞",
      });
    }
  }

  let targetHash: string | null = null;
  if (params.password) {
    if (params.password.length < 6) {
      return { success: false, changes: [], error: "Le mot de passe doit comporter au moins 6 caractères." };
    }
    targetHash = await hashPassword(params.password);
    changes.push({
      label: "Mot de passe",
      oldValue: "••••••••",
      newValue: "Nouveau mot de passe défini par l'administrateur",
      icon: "🔑",
    });
  }

  if (changes.length === 0) {
    return {
      success: true,
      changes: [],
      user,
      error: "Aucune modification à appliquer.",
    };
  }

  // Application en base de données
  if (targetTier) {
    await sql`UPDATE users SET tier = ${targetTier} WHERE id = ${user.id};`;
    const TIER_REQUEST_LIMITS: Record<string, number> = { Free: 500, Plus: 1500, Pro: 3000, Max: 10000 };
    const reqLimit = TIER_REQUEST_LIMITS[targetTier] || 500;
    await sql`
      UPDATE mprojects_api_keys 
      SET plan = ${targetTier}, max_limit = ${reqLimit}
      WHERE user_id = ${user.id}::text OR user_id = ${user.username} OR user_id = ${user.email};
    `.catch(() => {});
  }

  if (targetUsername) {
    await sql`UPDATE users SET username = ${targetUsername} WHERE id = ${user.id};`;
    await sql`
      UPDATE profiles 
      SET display_name = ${targetUsername} 
      WHERE user_id = ${user.id} AND (display_name IS NULL OR display_name = ${user.username});
    `.catch(() => {});
    await sql`
      UPDATE mprojects_api_keys 
      SET user_id = ${targetUsername} 
      WHERE user_id = ${user.username};
    `.catch(() => {});
  }

  if (targetEmail) {
    await sql`UPDATE users SET email = ${targetEmail} WHERE id = ${user.id};`;
  }

  if (targetPhone !== undefined) {
    await sql`UPDATE users SET phone = ${targetPhone} WHERE id = ${user.id};`;
  }

  if (targetHash) {
    await sql`UPDATE users SET password_hash = ${targetHash} WHERE id = ${user.id};`;
  }

  // Journalisation d'audit
  const auditReason = params.reason || `Modification via Server Action: ${changes.map((c) => c.label).join(', ')}`;
  await sql`
    INSERT INTO user_account_actions (user_id, action, reason)
    VALUES (${user.id}::text, 'update', ${auditReason});
  `.catch(() => {});

  // Envoi email confirmation
  let emailSent = false;
  if (params.notify !== false) {
    const notifyRecipient = targetEmail || user.email;
    const emailHtml = buildAccountUpdateEmailHtml({
      username: targetUsername || user.username,
      changes,
      newTier: targetTier || (changes.some((c) => c.label.includes('Plan')) ? targetTier : null),
      tempPassword: params.password || null,
    });

    try {
      emailSent = await sendHtmlEmail(
        notifyRecipient,
        targetTier
          ? `Votre compte mAI a été mis à niveau (${targetTier})`
          : "Mise à jour des informations de votre compte mAI",
        emailHtml
      );
    } catch (err: any) {
      console.error(`Erreur notification e-mail à ${notifyRecipient}:`, err?.message || err);
    }

    if (targetEmail && targetEmail !== user.email && user.email) {
      try {
        await sendHtmlEmail(
          user.email,
          "Alerte de sécurité : modification de votre adresse e-mail mAI",
          buildAccountSecurityAlertEmailHtml({
            username: user.username,
            oldEmail: user.email,
            newEmail: targetEmail,
          })
        );
      } catch (err: any) {
        console.error(`Erreur notification sécurité à l'ancienne adresse ${user.email}:`, err?.message || err);
      }
    }
  }

  const updatedUserRows = await sql`
    SELECT id, username, email, tier, phone, is_blocked, created_at 
    FROM users 
    WHERE id = ${user.id} 
    LIMIT 1;
  `;

  return {
    success: true,
    changes,
    user: (updatedUserRows[0] as any) || user,
    emailSent,
  };
}
