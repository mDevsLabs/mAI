import nodemailer from "npm:nodemailer";

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  action: string,
  extraInfo?: any
) {
  // Ne jamais logger le code OTP en clair — seulement l'action et l'email partiel masqué
  const maskedEmail = email.replace(/(.{2}).*(@.*)/, "$1***$2");
  console.log(
    `[EMAIL] action=${action} to=${maskedEmail} hasCode=${Boolean(code)}`
  );

  let subject = "Notification - mAI";
  let title = "Notification";
  let badgeText = "SÉCURITÉ mAI";
  let badgeBg = "rgba(168, 85, 247, 0.15)";
  let badgeColor = "#c084fc";
  let badgeBorder = "rgba(168, 85, 247, 0.35)";
  let textContent = "";
  let showCode = Boolean(code);

  switch (action) {
    case "register":
      subject = "Vérifiez votre adresse e-mail — mAI";
      title = "Création de votre compte";
      badgeText = "INSCRIPTION";
      textContent =
        "Bienvenue sur la plateforme <strong>mAI</strong> ! Veuillez saisir le code de vérification à 6 chiffres ci-dessous pour valider votre adresse e-mail et activer votre compte :";
      break;
    case "login":
      subject = "Code de connexion sécurisé — mAI";
      title = "Vérification de connexion";
      badgeText = "AUTHENTIFICATION";
      textContent =
        "Une tentative de connexion à votre compte <strong>mAI</strong> a été initiée. Voici votre code d&apos;authentification à usage unique :";
      break;
    case "verify_new_email":
      subject = "Confirmation de nouvelle adresse e-mail — mAI";
      title = "Modification d'adresse e-mail";
      badgeText = "SÉCURITÉ DU COMPTE";
      textContent =
        "Vous avez demandé la modification de votre adresse de messagerie sur <strong>mAI</strong>. Confirmez cette opération avec le code ci-dessous :";
      break;
    case "delete_account":
      subject = "Code de confirmation de suppression de compte — mAI";
      title = "Suppression définitive du compte";
      badgeText = "ACTION CRITIQUE";
      badgeBg = "rgba(239, 68, 68, 0.15)";
      badgeColor = "#f87171";
      badgeBorder = "rgba(239, 68, 68, 0.35)";
      textContent =
        "Vous avez demandé la suppression intégrale de votre compte et de vos données mAI. Si vous confirmez cette action irréversible, saisissez votre code à 8 chiffres :";
      break;
    case "subscription_unlocked": {
      const tierUnlocked = escapeHtml(extraInfo?.tier || "Pro");
      subject = `Félicitations pour votre forfait ${tierUnlocked} ! — mAI`;
      title = `Forfait ${tierUnlocked} activé avec succès 🎉`;
      badgeText = "FORFAIT ACTIF";
      badgeBg = "rgba(16, 185, 129, 0.15)";
      badgeColor = "#34d399";
      badgeBorder = "rgba(16, 185, 129, 0.35)";
      showCode = false;
      textContent = `Nous vous remercions chaleureusement pour votre souscription au forfait <strong>${tierUnlocked}</strong> sur <strong>mAI</strong> !<br><br>
        Vos nouveaux quotas de calcul, tokens hebdomadaires, accès multi-modèles et espace Cloud Storage sont désormais actifs et synchronisés avec l&apos;ensemble de vos applications et clés d&apos;API.<br><br>
        Toute l&apos;équipe <strong>mDevsLabs</strong> vous remercie pour votre confiance et se tient à votre disposition.`;
      break;
    }
    case "new_login": {
      subject = "Alerte de sécurité : Nouvelle connexion détectée — mAI";
      title = "Nouvelle session détectée 🛡️";
      badgeText = "ALERTE SÉCURITÉ";
      badgeBg = "rgba(245, 158, 11, 0.15)";
      badgeColor = "#fbbf24";
      badgeBorder = "rgba(245, 158, 11, 0.35)";
      showCode = false;
      const device = escapeHtml(extraInfo?.device || "Appareil non identifié");
      const location = escapeHtml(extraInfo?.location || "Localisation non disponible");
      textContent = `Une nouvelle connexion à votre compte <strong>mAI</strong> a été établie :<br><br>
        <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:16px; margin:16px 0; font-size:14px;">
          <div style="margin-bottom:8px;"><strong>📱 Appareil / Navigateur :</strong> <span style="color:#cbd5e1;">${device}</span></div>
          <div><strong>📍 Localisation approximative :</strong> <span style="color:#cbd5e1;">${location}</span></div>
        </div>
        Si vous êtes à l&apos;origine de cette opération, aucune action n&apos;est requise. Dans le cas contraire, nous vous recommandons de réinitialiser votre mot de passe et de révoquer vos sessions actives immédiatement depuis votre espace client.`;
      break;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9; -webkit-font-smoothing:antialiased;">
      <div style="max-width:580px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
        
        <!-- Top Glow & Badge -->
        <div style="background:#090e1a; padding:14px 24px; text-align:center; border-bottom:1px solid #1e293b;">
          <span style="display:inline-block; background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder}; font-size:11px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; padding:4px 14px; border-radius:100px;">
            ${badgeText}
          </span>
        </div>

        <!-- Header & Logo -->
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%); padding:36px 28px 30px 28px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:46px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:22px; font-weight:800; margin:18px 0 0 0; letter-spacing:-0.5px; line-height:1.3;">
            ${title}
          </h1>
        </div>

        <!-- Body Content -->
        <div style="padding:36px 32px; line-height:1.7; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0; margin-bottom:18px; font-size:16px; font-weight:600; color:#ffffff;">Bonjour,</p>
          <div style="color:#cbd5e1; font-size:15px;">
            <p style="margin-bottom:18px;">${textContent}</p>
          </div>
          
          ${
            showCode
              ? `
          <!-- Code Card Luxury Display -->
          <div style="background:linear-gradient(180deg, #131d31 0%, #0c1322 100%); border:1.5px solid #6366f1; border-radius:16px; padding:26px 20px; text-align:center; margin:30px 0; box-shadow:0 0 25px rgba(99, 102, 241, 0.15);">
            <div style="font-size:36px; font-weight:900; letter-spacing:10px; color:#a855f7; font-family:Consolas, 'Courier New', Monaco, monospace; margin-bottom:10px; user-select:all; text-shadow:0 0 15px rgba(168, 85, 247, 0.4);">
              ${escapeHtml(code)}
            </div>
            <p style="font-size:12px; color:#94a3b8; margin:0; font-weight:500;">
              ⏳ Code temporaire à usage unique • Expire dans 10 minutes
            </p>
          </div>
          `
              : ""
          }

          <div style="background:#090e1a; border-left:3px solid #8b5cf6; padding:14px 16px; border-radius:0 12px 12px 0; margin-top:28px;">
            <p style="font-size:12px; color:#94a3b8; margin:0; line-height:1.5;">
              🔒 <strong>Sécurité mAI</strong> : mDevsLabs ne vous demandera jamais votre mot de passe ou votre clé secrète par e-mail. Si vous n&apos;êtes pas à l&apos;origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color:#070a12; padding:24px 28px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b; line-height:1.6;">
          <p style="margin:0 0 6px 0; font-weight:600; color:#94a3b8;">© 2026 mAI — mDevsLabs Technology</p>
          <p style="margin:0; font-size:11px;">Plateforme d&apos;Intelligence Artificielle Souveraine &amp; APIs • Hébergement sécurisé dans l&apos;UE &amp; USA • ZDR Priorisée</p>
        </div>

      </div>
    </body>
    </html>
  `;

  // 1. Gmail SMTP via Nodemailer
  const gmailUser = typeof Deno !== "undefined" && Deno.env ? Deno.env.get("GMAIL_USER") : (typeof process !== "undefined" ? process.env.GMAIL_USER : "");
  const gmailAppPass = typeof Deno !== "undefined" && Deno.env ? Deno.env.get("GMAIL_APP_PASSWORD") : (typeof process !== "undefined" ? process.env.GMAIL_APP_PASSWORD : "");

  if (gmailUser && gmailAppPass) {
    try {
      const transporter = nodemailer.createTransport({
        auth: {
          pass: gmailAppPass,
          user: gmailUser,
        },
        service: "gmail",
      });

      await transporter.sendMail({
        from: `"mAI" <${gmailUser}>`,
        html,
        subject,
        to: email,
      });

      const maskedTo = email.replace(/(.{2}).*(@.*)/, "$1***$2");
      console.log(`[EMAIL] Gmail SMTP OK to=${maskedTo}`);
      return;
    } catch (err: any) {
      console.error("Erreur envoi Gmail SMTP :", err?.message || err);
    }
  }

  // 2. Resend Fallback
  const resendKey = typeof Deno !== "undefined" && Deno.env ? Deno.env.get("RESEND_API_KEY") : (typeof process !== "undefined" ? process.env.RESEND_API_KEY : "");
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        body: JSON.stringify({
          from: "mAI <onboarding@resend.dev>",
          html,
          subject,
          to: email,
        }),
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    } catch (_e) {
      // ignore
    }
  }
}
