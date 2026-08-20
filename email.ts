import nodemailer from "npm:nodemailer";

export async function sendVerificationEmail(
  email: string,
  code: string,
  action: string,
  extraInfo?: any
) {
  console.log(`🔑 [CODE/ALERT] (${action}) pour ${email} : ${code || 'Aucun (Alerte)'}`);

  let subject = "Notification - mAI";
  let title = "Notification";
  let textContent = "";
  let showCode = !code ? false : true;

  switch(action) {
    case "register":
      subject = "Vérifiez votre adresse e-mail - mAI";
      title = "Vérification d'inscription";
      textContent = "Voici votre code de vérification à 6 chiffres pour votre compte <strong>mAI</strong> :";
      break;
    case "login":
      subject = "Code de vérification de connexion - mAI";
      title = "Vérification de connexion";
      textContent = "Voici votre code de vérification à 6 chiffres pour votre compte <strong>mAI</strong> :";
      break;
    case "verify_new_email":
      subject = "Vérification de votre nouvelle adresse e-mail - mAI";
      title = "Changement d'e-mail";
      textContent = "Voici le code de vérification pour confirmer votre nouvelle adresse e-mail :";
      break;
    case "delete_account":
      subject = "Code de suppression de compte - mAI";
      title = "Suppression du compte";
      textContent = "Vous avez demandé la suppression de votre compte. Voici votre code à 8 chiffres :";
      break;
    case "new_login":
      subject = "Nouvelle connexion détectée - mAI";
      title = "Alerte de sécurité";
      showCode = false;
      const device = extraInfo?.device || 'Appareil inconnu';
      const location = extraInfo?.location || 'Lieu inconnu';
      textContent = `Une nouvelle connexion à votre compte <strong>mAI</strong> a été détectée depuis :<br><br>
        <strong>Appareil :</strong> ${device}<br>
        <strong>Localisation :</strong> ${location}<br><br>
        Si vous êtes à l'origine de cette connexion, aucune action n'est requise. Sinon, modifiez immédiatement votre mot de passe et déconnectez cet appareil.`;
      break;
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
          
          ${showCode ? `
          <!-- Styled Code Container -->
          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:24px; text-align:center; margin:28px 0;">
            <div style="font-size:34px; font-weight:800; letter-spacing:8px; color:#a855f7; font-family:Consolas, Monaco, monospace; margin-bottom:12px; user-select:all;">
              ${code}
            </div>
            <p style="font-size:12px; color:#94a3b8; margin:0;">Code unique • Expire dans 10 minutes</p>
          </div>
          ` : ''}

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

  // 1. Gmail SMTP via Nodemailer
  const gmailUser = Deno.env.get("GMAIL_USER") || "tusseaumathias85@gmail.com";
  const gmailAppPass = Deno.env.get("GMAIL_APP_PASSWORD");

  if (gmailAppPass) {
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

      console.log(`✉️ E-mail envoyé avec succès via Gmail SMTP à ${email}`);
      return;
    } catch (err: any) {
      console.error("❌ Erreur d'envoi Gmail SMTP :", err?.message || err);
    }
  }

  // 2. Resend Fallback
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
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
      if (res.ok) {
      }
    } catch (_e) {
      // ignore
    }
  }
}
