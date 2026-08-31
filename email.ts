import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-expect-error Nodemailer transport typing is incompatible with the configured transport.
  if (typeof Deno !== "undefined" && Deno.env && Deno.env.get) {
    // @ts-expect-error Nodemailer transport typing is incompatible with the configured transport.
    return Deno.env.get(key);
  }
  return undefined;
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  action: string,
  extraInfo?: any
) {
  // Log du code pour développement / debugging
  const maskedEmail = email.replace(/(.{2}).*(@.*)/, "$1***$2");
  console.log(
    `[EMAIL] action=${action} to=${maskedEmail} hasCode=${Boolean(code)} code=${code}`
  );

  let subject = "Notification - mAI";
  let title = "Notification";
  let textContent = "";
  let showCode = code ? true : false;

  switch (action) {
    case "register":
      subject = "Vérifiez votre adresse e-mail - mAI";
      title = "Vérification d'inscription";
      textContent =
        "Voici votre code de vérification à 6 chiffres pour votre compte <strong>mAI</strong> :";
      break;
    case "login":
      subject = "Code de vérification de connexion - mAI";
      title = "Vérification de connexion";
      textContent =
        "Voici votre code de vérification à 6 chiffres pour votre compte <strong>mAI</strong> :";
      break;
    case "verify_new_email":
      subject = "Vérification de votre nouvelle adresse e-mail - mAI";
      title = "Changement d'e-mail";
      textContent =
        "Voici le code de vérification pour confirmer votre nouvelle adresse e-mail :";
      break;
    case "delete_account":
      subject = "Code de suppression de compte - mAI";
      title = "Suppression du compte";
      textContent =
        "Vous avez demandé la suppression de votre compte. Voici votre code à 8 chiffres :";
      break;
    case "subscription_unlocked": {
      const tierUnlocked = escapeHtml(extraInfo?.tier || "Pro");
      subject = `Merci d'avoir souscrit au forfait ${tierUnlocked} ! - mAI`;
      title = `Merci d'avoir souscrit au forfait ${tierUnlocked} !`;
      showCode = false;
      textContent = `Nous vous remercions chaleureusement pour votre souscription au forfait <strong>${tierUnlocked}</strong> sur <strong>mAI</strong> !<br><br>
        Votre compte bénéficie dès maintenant de vos nouveaux quotas étendus pour l'ensemble de vos applications et clés d'API (tokens mAI, requêtes API et stockage Cloud).<br><br>
        Toute l'équipe mDevsLabs vous remercie pour votre confiance et vous souhaite une excellente expérience créative et productive avec mAI.`;
      break;
    }
    case "new_login": {
      subject = "Nouvelle connexion détectée - mAI";
      title = "Alerte de sécurité";
      showCode = false;
      const device = escapeHtml(extraInfo?.device || "Appareil inconnu");
      const location = escapeHtml(extraInfo?.location || "Lieu inconnu");
      textContent = `Une nouvelle connexion à votre compte <strong>mAI</strong> a été détectée depuis :<br><br>
        <strong>Appareil :</strong> ${device}<br>
        <strong>Localisation :</strong> ${location}<br><br>
        Si vous êtes à l'origine de cette connexion, aucune action n'est requise. Sinon, modifiez immédiatement votre mot de passe et déconnectez cet appareil.`;
      break;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#090d16; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f8fafc;">
      <div style="max-width:560px; margin:40px auto; background:#111827; border:1px solid #1f293d; border-radius:16px; overflow:hidden; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
        
        <!-- Header & Logo -->
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #31104b 100%); padding:32px 24px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:48px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:20px; font-weight:700; margin:16px 0 0 0; letter-spacing:-0.5px;">${title}</h1>
        </div>

        <!-- Body Content -->
        <div style="padding:32px 28px; line-height:1.6; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0;">Bonjour,</p>
          <p>${textContent}</p>
          
          ${
            showCode
              ? `
          <!-- Styled Code Container -->
          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:24px; text-align:center; margin:28px 0;">
            <div style="font-size:34px; font-weight:800; letter-spacing:8px; color:#a855f7; font-family:Consolas, Monaco, monospace; margin-bottom:12px; user-select:all;">
              ${escapeHtml(code)}
            </div>
            <p style="font-size:12px; color:#94a3b8; margin:0;">Code unique • Expire dans 10 minutes</p>
          </div>
          `
              : ""
          }

          <p style="font-size:13px; color:#94a3b8; margin-top:28px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez l'ignorer ou sécuriser votre compte.</p>
        </div>

        <!-- Footer -->
        <div style="background-color:#0b0f19; padding:20px 24px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b;">
          <p style="margin:0 0 6px 0;">© 2026 mAI — Plateforme d'Intelligence Artificielle & APIs</p>
          <p style="margin:0;">Cet e-mail automatique a été envoyé de manière sécurisée.</p>
        </div>

      </div>
    </body>
    </html>
  `;

  await sendHtmlEmail(email, subject, html);
}

// ─────────────────────────────────────────────
// Envoi d'e-mail générique avec fallback
// ─────────────────────────────────────────────
export async function sendHtmlEmail(to: string, subject: string, html: string): Promise<boolean> {
  // 1. Google Apps Script (Recommandé)
  const googleScriptsUrl = getEnv("GOOGLE_SCRIPTS_URL") || getEnv("GOOGLE_SCRIPT_URL");
  const googleScriptSecret = getEnv("GOOGLE_SCRIPTS_SECRET") || getEnv("GOOGLE_SCRIPT_SECRET");

  if (googleScriptsUrl && googleScriptSecret) {
    try {
      const res = await fetch(googleScriptsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: googleScriptSecret,
          to,
          subject,
          htmlBody: html,
          body: "Veuillez activer l'affichage HTML pour lire cet e-mail mAI.",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const maskedTo = to.replace(/(.{2}).*(@.*)/, "$1***$2");
          console.log(`[EMAIL] Google Apps Script OK to=${maskedTo}`);
          return true;
        } else {
          console.error("Erreur de retour Google Apps Script :", data.error);
        }
      } else {
        console.error("Erreur HTTP Google Apps Script :", res.status, res.statusText);
      }
    } catch (err: any) {
      console.error("Erreur envoi via Google Apps Script :", err?.message || err);
    }
  }

  // 2. Fallback Gmail SMTP via Nodemailer
  const gmailUser = getEnv("GMAIL_USER") || "tusseaumathias85@gmail.com";
  const gmailAppPass = getEnv("GMAIL_APP_PASSWORD");

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
        from: `"mAI Support" <${gmailUser}>`,
        html,
        subject,
        to,
      });

      const maskedTo = to.replace(/(.{2}).*(@.*)/, "$1***$2");
      console.log(`[EMAIL] Gmail SMTP OK to=${maskedTo}`);
      return true;
    } catch (err: any) {
      console.error("Erreur envoi Gmail SMTP :", err?.message || err);
    }
  } else {
    console.warn(
      "[EMAIL] Ni Google Apps Script ni Gmail SMTP configurés pour l'envoi."
    );
  }

  return false;
}

// ─────────────────────────────────────────────
// Notifications pour le Support & Signalement de bugs
// ─────────────────────────────────────────────
export interface SupportTicketEmailPayload {
  id: string;
  ticket_number?: number | string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_tier?: string;
  title: string;
  description: string;
  category: string;
  project: string;
  priority: string;
  status?: string;
  created_at?: string;
  isAiGenerated?: boolean;
}

const PRIORITY_COLORS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: "Critique / Urgent", bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", border: "rgba(239, 68, 68, 0.4)" },
  high: { label: "Haute", bg: "rgba(249, 115, 22, 0.15)", text: "#f97316", border: "rgba(249, 115, 22, 0.4)" },
  medium: { label: "Normale", bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "rgba(16, 185, 129, 0.4)" },
  low: { label: "Faible", bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.4)" },
};

/**
 * Envoie un e-mail à mathias.tss2012@gmail.com pour lui présenter le nouveau ticket créé.
 */
export async function sendSupportTicketCreatedEmail({
  ticket,
  appUrl = "https://m-ai.fr",
}: {
  ticket: SupportTicketEmailPayload;
  appUrl?: string;
}) {
  const adminEmail = "mathias.tss2012@gmail.com";
  const ticketRef = ticket.ticket_number ? `#TICK-${ticket.ticket_number}` : `#${ticket.id.slice(0, 8)}`;
  const subject = `[Support mAI] Nouveau ticket ${ticketRef} : ${ticket.title}`;
  
  const priorityInfo = PRIORITY_COLORS[ticket.priority.toLowerCase()] || PRIORITY_COLORS.medium;
  const directLink = `${appUrl.replace(/\/$/, "")}/support/tickets/${ticket.id}`;
  const safeDescription = escapeHtml(ticket.description).replace(/\n/g, "<br>");

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9;">
      <div style="max-width:600px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
        
        <!-- Header & Logo -->
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%); padding:32px 28px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:44px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:20px; font-weight:800; margin:16px 0 4px 0; letter-spacing:-0.5px;">Nouveau ticket de support</h1>
          <p style="color:#a855f7; font-size:13px; font-weight:600; margin:0; letter-spacing:0.5px;">RÉFÉRENCE : ${ticketRef}</p>
        </div>

        <!-- Body Content -->
        <div style="padding:32px 28px; line-height:1.6; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0; font-size:15px;">Un utilisateur vient de soumettre un nouveau ticket sur la plateforme <strong>mAI</strong>.</p>
          
          <!-- Metadatas Box -->
          <div style="background:#131d31; border:1px solid #1e293b; border-radius:16px; padding:20px; margin:24px 0;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <tr>
                <td style="padding:6px 0; color:#94a3b8; width:110px; font-weight:600;">Demandeur :</td>
                <td style="padding:6px 0; color:#f8fafc; font-weight:700;">
                  ${escapeHtml(ticket.user_name)} 
                  <span style="color:#a855f7; font-weight:500;">(${escapeHtml(ticket.user_email)})</span>
                  ${ticket.user_tier ? `<span style="background:rgba(168,85,247,0.2); color:#c084fc; font-size:11px; padding:2px 8px; border-radius:100px; margin-left:6px; font-weight:700;">${escapeHtml(ticket.user_tier)}</span>` : ""}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#94a3b8; font-weight:600;">Projet :</td>
                <td style="padding:6px 0; color:#60a5fa; font-weight:700;">${escapeHtml(ticket.project)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#94a3b8; font-weight:600;">Section :</td>
                <td style="padding:6px 0; color:#e2e8f0; font-weight:600;">${escapeHtml(ticket.category)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#94a3b8; font-weight:600;">Priorité :</td>
                <td style="padding:6px 0;">
                  <span style="display:inline-block; background:${priorityInfo.bg}; color:${priorityInfo.text}; border:1px solid ${priorityInfo.border}; font-size:12px; font-weight:800; padding:2px 10px; border-radius:100px; text-transform:uppercase;">
                    ${priorityInfo.label}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Description Box -->
          <div style="margin:24px 0;">
            <p style="font-size:13px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Objet de la demande :</p>
            <h2 style="font-size:17px; font-weight:700; color:#ffffff; margin:0 0 12px 0;">${escapeHtml(ticket.title)}</h2>
            <div style="background:#090d16; border:1px solid #1e293b; border-left:4px solid #9333ea; border-radius:12px; padding:18px; color:#e2e8f0; font-size:14px; line-height:1.7; word-break:break-word;">
              ${safeDescription}
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align:center; margin:36px 0 20px 0;">
            <a href="${directLink}" style="display:inline-block; background:linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); color:#ffffff; text-decoration:none; font-weight:700; font-size:15px; padding:14px 32px; border-radius:14px; box-shadow:0 10px 25px -5px rgba(147,51,234,0.5);">
              → Répondre au ticket #${ticket.ticket_number || ticket.id.slice(0, 6)}
            </a>
          </div>

          <p style="text-align:center; font-size:12px; color:#64748b; margin-top:12px;">
            Vous pouvez également écrire directement au demandeur : 
            <a href="mailto:${escapeHtml(ticket.user_email)}?subject=Re: [Support mAI ${ticketRef}] ${encodeURIComponent(ticket.title)}" style="color:#a855f7; text-decoration:underline;">
              ${escapeHtml(ticket.user_email)}
            </a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color:#080c14; padding:20px 28px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b;">
          <p style="margin:0 0 6px 0;">© 2026 mAI — Centre de Support & Signalement Technique</p>
          <p style="margin:0;">Cet e-mail automatique est destiné à l'administration du support mAI.</p>
        </div>

      </div>
    </body>
    </html>
  `;

  return await sendHtmlEmail(adminEmail, subject, html);
}

/**
 * Envoie une notification par e-mail à l'utilisateur (ou à l'admin) lors d'une action ou d'une réponse.
 */
export async function sendSupportTicketUpdateEmail({
  ticket,
  recipientEmail,
  recipientName,
  message,
  newStatus,
  authorRole,
  appUrl = "https://m-ai.fr",
  isAiGenerated,
}: {
  ticket: SupportTicketEmailPayload;
  recipientEmail: string;
  recipientName: string;
  message: string;
  newStatus?: string;
  authorRole: "admin" | "user" | "system";
  appUrl?: string;
  isAiGenerated?: boolean;
}) {
  const ticketRef = ticket.ticket_number ? `#TICK-${ticket.ticket_number}` : `#${ticket.id.slice(0, 8)}`;
  const isFromAdmin = authorRole === "admin";
  const subject = isFromAdmin
    ? `[Support mAI] Réponse à votre ticket ${ticketRef} : ${ticket.title}`
    : `[Support mAI] Nouveau message sur le ticket ${ticketRef}`;

  const directLink = `${appUrl.replace(/\/$/, "")}/support/tickets/${ticket.id}`;
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(subject)}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9;">
      <div style="max-width:600px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #0f172a 100%); padding:32px 28px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:44px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:20px; font-weight:800; margin:16px 0 4px 0; letter-spacing:-0.5px;">
            ${isFromAdmin ? "Réponse de l'Équipe Support" : "Nouveau message"}
          </h1>
          <p style="color:#a855f7; font-size:13px; font-weight:600; margin:0;">TICKET ${ticketRef} • ${escapeHtml(ticket.title)}</p>
        </div>

        <!-- Body Content -->
        <div style="padding:32px 28px; line-height:1.6; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0;">Bonjour <strong>${escapeHtml(recipientName)}</strong>,</p>
          
          <p>
            ${isFromAdmin 
              ? "Un membre de l'équipe technique de <strong>mAI</strong> a répondu à votre demande :" 
              : "Un nouveau message a été posté sur le ticket :"}
          </p>
          
          <!-- Message Bubble -->
          <div style="background:#131d31; border:1px solid #1e293b; border-left:4px solid ${isFromAdmin ? '#10b981' : '#a855f7'}; border-radius:14px; padding:20px; margin:24px 0; color:#f1f5f9; font-size:14px; line-height:1.7;">
            ${safeMessage}
          </div>

          ${
            isAiGenerated || ticket.isAiGenerated
              ? `
          <div style="background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.35); border-radius:12px; padding:12px 16px; margin:16px 0; font-size:12px; color:#fcd34d; display:flex; gap:8px; align-items:center;">
            <span style="font-size:14px;">IA</span>
            <span><strong>Contenu créé avec l'assistance de l'IA</strong> — ce message a été généré avec l'aide de l'IA et relu par l'équipe <strong>mAI</strong>.</span>
          </div>
          `
              : ""
          }

          ${
            newStatus
              ? `
          <div style="background:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.3); border-radius:12px; padding:12px 18px; margin:20px 0; font-size:13px; color:#93c5fd;">
            <strong>Mise à jour de statut :</strong> Le ticket est désormais noté comme <em>${escapeHtml(newStatus)}</em>.
          </div>
          `
              : ""
          }

          <!-- CTA Button -->
          <div style="text-align:center; margin:32px 0 16px 0;">
            <a href="${directLink}" style="display:inline-block; background:linear-gradient(135deg, #9333ea 0%, #4f46e5 100%); color:#ffffff; text-decoration:none; font-weight:700; font-size:15px; padding:14px 32px; border-radius:14px; box-shadow:0 10px 25px -5px rgba(147,51,234,0.5);">
              Voir le fil de discussion et répondre
            </a>
          </div>

          <p style="font-size:12px; color:#64748b; text-align:center; margin-top:20px;">
            Vous pouvez à tout moment suivre l'état de l'ensemble de vos demandes sur votre 
            <a href="${appUrl.replace(/\/$/, "")}/support/tickets" style="color:#a855f7; text-decoration:underline;">Espace Support mAI</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color:#080c14; padding:20px 28px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b;">
          <p style="margin:0 0 6px 0;">© 2026 mAI — Centre de Support & Signalement Technique</p>
          <p style="margin:0;">mDevsLabs • Solutions d'Intelligence Artificielle Souveraines</p>
        </div>

      </div>
    </body>
    </html>
  `;

  return await sendHtmlEmail(recipientEmail, subject, html);
}
