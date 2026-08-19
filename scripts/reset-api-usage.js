import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';

function buildEmailHtml(title, username, messageText) {
  return `
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
          <p style="margin-top:0;">Bonjour <strong>${username}</strong>,</p>
          <p>${messageText}</p>
          
          <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px; text-align:center; margin:24px 0;">
            <span style="display:inline-block; background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); font-weight:600; font-size:13px; padding:6px 16px; border-radius:20px;">
              Quotas réinitialisés à 100%
            </span>
            <p style="font-size:13px; color:#94a3b8; margin:12px 0 0 0;">Vous pouvez à nouveau utiliser l'ensemble de vos crédits et clés API mAI.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color:#0b0f19; padding:20px 24px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b;">
          <p style="margin:0 0 6px 0;">© 2026 mAI — Plateforme mAI & APIs</p>
          <p style="margin:0;">Vous recevez cet e-mail car les notifications de quotas sont activées sur votre profil.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ Erreur : DATABASE_URL n'est pas définie dans le fichier .env");
    process.exit(1);
  }
  
  const sql = neon(url);
  
  console.log("⏳ Réinitialisation des usages API...");
  await sql`UPDATE mprojects_api_keys SET request_count = 0`;
  console.log("✅ Succès : Tous les usages API ont été remis à 0 !");

  const users = await sql`SELECT email, username FROM users WHERE notify_limits = TRUE`;
  if (users.length === 0) {
    console.log("Aucun utilisateur inscrit aux notifications de limites.");
    return;
  }

  console.log(`Envoi des e-mails de notification à ${users.length} utilisateur(s)...`);

  const gmailUser = process.env.GMAIL_USER || "tusseaumathias85@gmail.com";
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD;

  let success = 0;
  for (const user of users) {
    const html = buildEmailHtml("Réinitialisation des quotas API", user.username, "Vos quotas API mAI ont été réinitialisés pour le mois.");
    
    if (gmailAppPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: gmailUser, pass: gmailAppPass },
        });
        await transporter.sendMail({
          from: `"mAI" <${gmailUser}>`,
          to: user.email,
          subject: "Vos quotas API mAI ont été réinitialisés",
          html,
        });
        success++;
        await new Promise(r => setTimeout(r, 100));
        continue;
      } catch (err) {
        console.error(`Erreur Gmail SMTP pour ${user.email}:`, err.message || err);
      }
    }
  }

  console.log(`✅ Succès : ${success} e-mails envoyés !`);
}

main().catch(err => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});
