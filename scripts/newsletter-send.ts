import { neon } from "@neondatabase/serverless";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import nodemailer from "nodemailer";
import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const sql = neon(process.env.DATABASE_URL!);

// ─────────────────────────────────────────────
// Styles & Palette ANSI CLI
// ─────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  
  // Couleurs texte
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
  
  // Fonds
  bgPurple: "\x1b[48;5;55m",
  bgCyan: "\x1b[48;5;24m",
  bgDark: "\x1b[48;5;236m",
};

// ─────────────────────────────────────────────
// Modèles HTML Pré-conçus
// ─────────────────────────────────────────────
interface EmailTemplate {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  defaultSubject: string;
  defaultContent: string;
  hasCta?: boolean;
}

const TEMPLATES: Record<string, EmailTemplate> = {
  "1": {
    id: "feature",
    name: "🚀 Nouveauté Produit / Mise à jour Majeure",
    badge: "NOUVEAUTÉ PRODUIT",
    badgeColor: "#c084fc",
    badgeBg: "rgba(168, 85, 247, 0.15)",
    defaultSubject: "🚀 Découvrez les nouvelles fonctionnalités de la plateforme mAI !",
    defaultContent: "Nous sommes ravis de vous présenter les dernières avancées de l'écosystème mAI : nouvelles architectures de modèles, vision multimodale et studio de requêtes interactif.",
    hasCta: true,
  },
  "2": {
    id: "announcement",
    name: "📣 Annonce Officielle & Communauté",
    badge: "ANNONCE OFFICIELLE",
    badgeColor: "#60a5fa",
    badgeBg: "rgba(59, 130, 246, 0.15)",
    defaultSubject: "📣 Des nouvelles importantes concernant mAI et nos services",
    defaultContent: "Bonjour {{username}},\n\nToute l'équipe mDevsLabs tenait à partager avec vous une mise à jour stratégique sur l'évolution de nos infrastructures souveraines et de nos offres.",
    hasCta: false,
  },
  "3": {
    id: "system",
    name: "⚡ Info Système & Maintenance Programmée",
    badge: "INFOS SYSTÈME",
    badgeColor: "#fbbf24",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    defaultSubject: "⚡ Maintenance et optimisation des infrastructures mAI",
    defaultContent: "Une mise à niveau de nos passerelles de routage est programmée afin de réduire la latence d'inférence et d'accroître la résilience de notre réseau. L'ensemble de vos accès reste opérationnel.",
    hasCta: false,
  },
  "4": {
    id: "custom",
    name: "✏️ Newsletter Libre / HTML Sur-Mesure",
    badge: "NEWSLETTER",
    badgeColor: "#34d399",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    defaultSubject: "L'actualité technologique de l'écosystème mAI",
    defaultContent: "Bonjour {{username}},\n\nVoici le récapitulatif des faits marquants et des nouveautés de la communauté mAI.",
    hasCta: false,
  },
};

// ─────────────────────────────────────────────
// Composants Graphiques CLI
// ─────────────────────────────────────────────
function clearConsole() {
  output.write("\x1b[2J\x1b[0;0H");
}

function printHeader() {
  console.log("");
  console.log(`${c.bgPurple}${c.bold}${c.brightWhite}  ╔══════════════════════════════════════════════════════════════════════╗  ${c.reset}`);
  console.log(`${c.bgPurple}${c.bold}${c.brightWhite}  ║                📧  mAI — STUDIO NEWSLETTER INTERACTIF                ║  ${c.reset}`);
  console.log(`${c.bgPurple}${c.bold}${c.brightWhite}  ╚══════════════════════════════════════════════════════════════════════╝  ${c.reset}`);
  console.log("");
}

function printStep(step: number, title: string) {
  console.log(`${c.brightCyan}${c.bold}┌── [Étape ${step}] ─────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.brightCyan}│${c.reset} ${c.bold}${c.brightWhite}${title}${c.reset}`);
  console.log(`${c.brightCyan}└──────────────────────────────────────────────────────────────────┘${c.reset}`);
  console.log("");
}

function printSuccess(msg: string) {
  console.log(`  ${c.brightGreen}✔${c.reset} ${msg}`);
}

function printError(msg: string) {
  console.log(`  ${c.brightRed}✖${c.reset} ${c.bold}${msg}${c.reset}`);
}

function printInfo(msg: string) {
  console.log(`  ${c.brightYellow}ℹ${c.reset} ${c.dim}${msg}${c.reset}`);
}

function printDivider() {
  console.log(`${c.dim}──────────────────────────────────────────────────────────────────────${c.reset}`);
}

function printProgressBar(current: number, total: number, label: string) {
  const width = 30;
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((width * current) / total);
  const empty = width - filled;

  const bar = `${c.brightMagenta}${"█".repeat(filled)}${c.dim}${"░".repeat(empty)}${c.reset}`;
  output.write(`\r  ${bar} ${c.bold}${percentage}%${c.reset} (${current}/${total}) | ${c.dim}${label}${c.reset}   `);
  if (current === total) console.log("");
}

// ─────────────────────────────────────────────
// Fonction Générale d'envoi d'e-mail (Google Apps Script + SMTP Fallback)
// ─────────────────────────────────────────────
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  const googleScriptsUrl = process.env.GOOGLE_SCRIPTS_URL || process.env.GOOGLE_SCRIPT_URL;
  const googleScriptSecret = process.env.GOOGLE_SCRIPTS_SECRET || process.env.GOOGLE_SCRIPT_SECRET;

  // 1. Google Apps Script
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
          return true;
        } else {
          console.error(`[EMAIL] Google Apps Script error for ${to}:`, data.error);
        }
      } else {
        console.error(`[EMAIL] Google Apps Script HTTP ${res.status} for ${to}`);
      }
    } catch (err: any) {
      console.error(`[EMAIL] Google Apps Script exception for ${to}:`, err?.message || err);
    }
  }

  // 2. SMTP Gmail Fallback
  const gmailUser = process.env.GMAIL_USER || "tusseaumathias85@gmail.com";
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailAppPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailAppPass },
      });

      await transporter.sendMail({
        from: `"mAI" <${gmailUser}>`,
        to,
        subject,
        html,
      });
      return true;
    } catch (err: any) {
      console.error(`[EMAIL] SMTP error for ${to}:`, err?.message || err);
    }
  }

  return false;
}

// ─────────────────────────────────────────────
// Serveur pour l'éditeur HTML dans le navigateur
// ─────────────────────────────────────────────
export async function runVisualEditorServer() {
  const port = 3333;
  const server = http.createServer(async (req, res) => {
    const htmlPath = path.join(process.cwd(), "scripts", "newsletter_editor.html");

    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      if (fs.existsSync(htmlPath)) {
        res.end(fs.readFileSync(htmlPath, "utf-8"));
      } else {
        res.end("<h3>Erreur : newsletter_editor.html introuvable dans le dossier scripts.</h3>");
      }
    } else if (req.method === "POST" && req.url === "/send-test") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const { email, subject, html } = JSON.parse(body);
          console.log(`\n[STUDIO] Envoi d'un mail de test à ${email}...`);
          const success = await sendEmail({ to: email, subject: `[TEST] ${subject}`, html });
          if (success) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: `Mail de test envoyé à ${email} !` }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "L'envoi a échoué. Vérifiez vos variables d'environnement." }));
          }
        } catch (e: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
    } else if (req.method === "POST" && req.url === "/send-all") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const { subject, html } = JSON.parse(body);
          console.log(`\n[STUDIO] Début de la newsletter globale pour le sujet : "${subject}"`);
          
          const targetUsers = (await sql`
            SELECT email, username 
            FROM users 
            WHERE newsletter = TRUE
          `) as unknown as { email: string; username: string }[];

          if (targetUsers.length === 0) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Aucun abonné trouvé dans la base de données." }));
            return;
          }

          console.log(`[STUDIO] Envoi en cours à ${targetUsers.length} destinataire(s)...`);
          let successCount = 0;
          let errorCount = 0;

          for (const u of targetUsers) {
            const personalizedHtml = html.replace(/{{username}}/g, u.username).replace(/Bonjour Administrateur/g, `Bonjour ${u.username}`);
            const success = await sendEmail({ to: u.email, subject, html: personalizedHtml });
            if (success) {
              successCount++;
            } else {
              errorCount++;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          console.log(`[STUDIO] Newsletter envoyée. Succès : ${successCount}, Échecs : ${errorCount}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ 
            success: true, 
            message: `Newsletter envoyée avec succès à ${successCount} abonnés ! (${errorCount} échec(s))` 
          }));
        } catch (e: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
    } else if (req.method === "POST" && req.url === "/quit") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
      console.log("\n[STUDIO] Arrêt du serveur de l'éditeur de newsletter.");
      setTimeout(() => {
        server.close();
      }, 500);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Non trouvé");
    }
  });

  server.listen(port, () => {
    console.log(`\n${c.brightGreen}✔ Éditeur visuel démarré sur http://localhost:${port}/${c.reset}`);
    
    // Ouvrir le navigateur
    const platform = process.platform;
    let command = "";
    if (platform === "win32") {
      command = `start http://localhost:${port}/`;
    } else if (platform === "darwin") {
      command = `open http://localhost:${port}/`;
    } else {
      command = `xdg-open http://localhost:${port}/`;
    }
    exec(command);
  });

  return new Promise<void>((resolve) => {
    server.on("close", () => {
      resolve();
    });
  });
}

// ─────────────────────────────────────────────
// Générateur HTML Moderne & Luxueux (Console CLI)
// ─────────────────────────────────────────────
function buildNewsletterHtml(
  subject: string,
  username: string,
  textContent: string,
  templateInfo: EmailTemplate,
  customHtml?: string,
  ctaText?: string,
  ctaUrl?: string
) {
  if (customHtml && customHtml.trim().length > 0) {
    return customHtml.replace(/{{username}}/g, username);
  }

  const formattedContent = textContent
    .replace(/{{username}}/g, username)
    .replace(/\n\n/g, "</p><p style='margin-bottom:18px;'>")
    .replace(/\n/g, "<br>");

  const ctaSection = ctaText && ctaUrl ? `
    <div style="text-align:center; margin:36px 0 20px 0;">
      <a href="${ctaUrl}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color:#ffffff; font-weight:800; font-size:15px; text-decoration:none; padding:16px 36px; border-radius:14px; box-shadow:0 10px 25px -5px rgba(124, 58, 237, 0.45); letter-spacing:0.3px;">
        ${ctaText} →
      </a>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#080c14; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f1f5f9; -webkit-font-smoothing:antialiased;">
      <div style="max-width:600px; margin:40px auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);">
        
        <!-- Top Bar Badge -->
        <div style="background:#090e1a; padding:14px 24px; text-align:center; border-bottom:1px solid #1e293b;">
          <span style="display:inline-block; background:${templateInfo.badgeBg}; color:${templateInfo.badgeColor}; border:1px solid ${templateInfo.badgeColor}44; font-size:11px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; padding:4px 14px; border-radius:100px;">
            ${templateInfo.badge}
          </span>
        </div>

        <!-- Header & Logo -->
        <div style="background:linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #0f172a 100%); padding:38px 28px 32px 28px; text-align:center; border-bottom:1px solid #2e1065;">
          <img src="https://upload.fs.fr/azq3C6GLea.png" alt="mAI Logo" style="height:46px; width:auto; max-width:180px; object-fit:contain; display:inline-block;" />
          <h1 style="color:#ffffff; font-size:22px; font-weight:800; margin:18px 0 0 0; letter-spacing:-0.5px; line-height:1.3;">
            ${subject}
          </h1>
        </div>

        <!-- Body Content -->
        <div style="padding:36px 32px; line-height:1.75; font-size:15px; color:#cbd5e1;">
          <p style="margin-top:0; margin-bottom:18px; font-size:16px; font-weight:600; color:#ffffff;">
            Bonjour ${username}, 👋
          </p>
          <div style="color:#cbd5e1; font-size:15px;">
            <p style="margin-bottom:18px;">${formattedContent}</p>
          </div>
          ${ctaSection}
        </div>

        <!-- Footer -->
        <div style="background-color:#070a12; padding:24px 28px; text-align:center; border-top:1px solid #1e293b; font-size:12px; color:#64748b; line-height:1.6;">
          <p style="margin:0 0 8px 0; font-weight:600; color:#94a3b8;">© 2026 mAI — Plateforme d'IA Souveraine &amp; APIs</p>
          <p style="margin:0 0 4px 0;">Vous recevez cet e-mail car votre compte est inscrit aux actualités mAI.</p>
          <p style="margin:0; font-size:11px; color:#475569;">Hébergement sécurisé dans l'UE &amp; USA • Politique Zero Data Retention (ZDR) priorisée</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

// ─────────────────────────────────────────────
// Ouverture d'un Aperçu dans le Navigateur
// ─────────────────────────────────────────────
function openPreviewInBrowser(htmlContent: string) {
  const tempPath = path.join(process.cwd(), ".temp_newsletter_preview.html");
  fs.writeFileSync(tempPath, htmlContent, "utf-8");

  const platform = process.platform;
  let command = "";
  if (platform === "win32") {
    command = `start "" "${tempPath}"`;
  } else if (platform === "darwin") {
    command = `open "${tempPath}"`;
  } else {
    command = `xdg-open "${tempPath}"`;
  }

  exec(command, (err) => {
    if (err) {
      printError(`Impossible d'ouvrir le navigateur : ${err.message}`);
    } else {
      printSuccess(`Aperçu ouvert dans le navigateur ! (${tempPath})`);
    }
  });
}

// ─────────────────────────────────────────────
// Core CLI Runner
// ─────────────────────────────────────────────
export async function runNewsletterStudio() {
  clearConsole();
  printHeader();

  const rl = readline.createInterface({ input, output });

  try {
    printStep(1, "Menu de démarrage du Studio");
    console.log(`  ${c.cyan}[1]${c.reset} ${c.bold}Lancer l'Éditeur Visuel (Navigateur Web)${c.reset} ${c.brightGreen}[Recommandé]${c.reset}`);
    console.log(`  ${c.cyan}[2]${c.reset} ${c.bold}Continuer dans le Terminal (CLI)${c.reset}`);
    console.log("");
    
    const studioChoice = (await rl.question(`  ${c.brightYellow}➔ Choix [1-2] (défaut: 1) : ${c.reset}`)).trim() || "1";

    if (studioChoice === "1") {
      rl.close();
      await runVisualEditorServer();
      return;
    }

    // ──────── ÉTAPE 1: Choix de la cible ────────
    printStep(1, "Sélection des destinataires");
    console.log(`  ${c.cyan}1.${c.reset} ${c.bold}Tous les abonnés Newsletter${c.reset} ${c.dim}(newsletter = TRUE dans la DB)${c.reset}`);
    console.log(`  ${c.cyan}2.${c.reset} ${c.bold}Email de test uniquement${c.reset} ${c.dim}(Pour tester la réception)${c.reset}`);
    console.log(`  ${c.cyan}3.${c.reset} ${c.bold}Utilisateurs par Forfait${c.reset} ${c.dim}(Free, Plus, Pro, Max)${c.reset}`);
    console.log("");

    const targetChoice = (await rl.question(`  ${c.brightYellow}➔ Choix [1-3] (défaut: 1) : ${c.reset}`)).trim() || "1";

    let targetUsers: { email: string; username: string }[] = [];

    if (targetChoice === "2") {
      const testEmail = (await rl.question(`  ${c.brightYellow}➔ Saisissez l'adresse e-mail de test : ${c.reset}`)).trim();
      if (!testEmail || !testEmail.includes("@")) {
        printError("Adresse e-mail invalide.");
        return;
      }
      targetUsers = [{ email: testEmail, username: testEmail.split("@")[0] }];
    } else if (targetChoice === "3") {
      const tier = (await rl.question(`  ${c.brightYellow}➔ Saisissez le forfait visé (Free/Plus/Pro/Max) : ${c.reset}`)).trim();
      printInfo(`Recherche des utilisateurs avec le forfait ${tier}...`);
      targetUsers = (await sql`
        SELECT u.email, u.username 
        FROM users u 
        WHERE LOWER(u.tier) = LOWER(${tier}) AND u.newsletter = TRUE
      `) as unknown as { email: string; username: string }[];
    } else {
      printInfo("Récupération de tous les abonnés...");
      targetUsers = (await sql`
        SELECT email, username 
        FROM users 
        WHERE newsletter = TRUE
      `) as unknown as { email: string; username: string }[];
    }

    if (targetUsers.length === 0) {
      printError("Aucun destinataire trouvé pour cette cible.");
      return;
    }

    printSuccess(`${targetUsers.length} destinataire(s) sélectionné(s) !`);
    console.log("");
    printDivider();

    // ──────── ÉTAPE 2: Choix du Template ────────
    printStep(2, "Choix du modèle de mail (Template)");
    Object.entries(TEMPLATES).forEach(([key, t]) => {
      console.log(`  ${c.cyan}${key}.${c.reset} ${c.bold}${t.name}${c.reset}`);
    });
    console.log("");

    const templateChoice = (await rl.question(`  ${c.brightYellow}➔ Sélectionner un modèle [1-4] (défaut: 1) : ${c.reset}`)).trim() || "1";
    const selectedTemplate = TEMPLATES[templateChoice] || TEMPLATES["1"];

    printSuccess(`Modèle sélectionné : ${selectedTemplate.name}`);
    console.log("");
    printDivider();

    // ──────── ÉTAPE 3: Contenu & Paramètres ────────
    printStep(3, "Personnalisation du contenu");

    console.log(`  ${c.dim}Objet par défaut : "${selectedTemplate.defaultSubject}"${c.reset}`);
    const inputSubject = await rl.question(`  ${c.brightYellow}➔ Objet du mail (Entrée pour garder par défaut) : ${c.reset}`);
    const subject = inputSubject.trim() || selectedTemplate.defaultSubject;

    console.log("");
    let textContent = selectedTemplate.defaultContent;
    let customHtml = "";
    let ctaText = "";
    let ctaUrl = "";

    if (selectedTemplate.id === "custom") {
      printInfo("Saisissez votre contenu personnalisé (ou coller du HTML).");
      printInfo("Pour terminer la saisie, tapez 'FIN' sur une ligne seule.");
      console.log("");

      const lines: string[] = [];
      let lineNum = 1;
      while (true) {
        const line = await rl.question(`  ${c.dim}${String(lineNum).padStart(3)}│${c.reset} `);
        if (line.trim() === "FIN") break;
        lines.push(line);
        lineNum++;
      }
      const rawInput = lines.join("\n").trim();
      if (rawInput.startsWith("<") && rawInput.endsWith(">")) {
        customHtml = rawInput;
      } else {
        textContent = rawInput || selectedTemplate.defaultContent;
      }
    } else {
      console.log(`  ${c.dim}Texte par défaut :${c.reset}\n  ${c.italic}"${selectedTemplate.defaultContent.replace(/\n/g, "\n  ")}"${c.reset}\n`);
      const changeText = await rl.question(`  ${c.brightYellow}➔ Saisir un texte personnalisé ? (o/N) : ${c.reset}`);

      if (changeText.toLowerCase() === "o" || changeText.toLowerCase() === "y") {
        printInfo("Tapez 'FIN' sur une ligne seule pour valider :");
        const lines: string[] = [];
        let lineNum = 1;
        while (true) {
          const line = await rl.question(`  ${c.dim}${String(lineNum).padStart(3)}│${c.reset} `);
          if (line.trim() === "FIN") break;
          lines.push(line);
          lineNum++;
        }
        textContent = lines.join("\n").trim() || selectedTemplate.defaultContent;
      }

      if (selectedTemplate.hasCta) {
        console.log("");
        const wantCta = await rl.question(`  ${c.brightYellow}➔ Ajouter un bouton d'action (CTA) ? (O/n) : ${c.reset}`);
        if (wantCta.toLowerCase() !== "n") {
          ctaText = (await rl.question(`  ${c.cyan}→${c.reset} Texte du bouton (ex: Découvrir mAI 1.5) : `)).trim() || "Découvrir mAI";
          ctaUrl = (await rl.question(`  ${c.cyan}→${c.reset} Lien URL du bouton (ex: https://mai.val.run) : `)).trim() || "https://mai.val.run";
        }
      }
    }

    printSuccess("Contenu prêt !");
    console.log("");
    printDivider();

    // ──────── ÉTAPE 4: Dashboard d'actions interactif ────────
    const defaultEmail = process.env.GMAIL_USER || "tusseaumathias85@gmail.com";

    while (true) {
      clearConsole();
      printHeader();
      printStep(4, "Récapitulatif & Actions");

      console.log(`  ${c.bold}📌 Objet :${c.reset} ${c.brightCyan}${subject}${c.reset}`);
      console.log(`  ${c.bold}👥 Destinataires :${c.reset} ${c.brightGreen}${targetUsers.length} personne(s)${c.reset}`);
      console.log(`  ${c.bold}🎨 Modèle :${c.reset} ${selectedTemplate.name}`);
      if (ctaText && ctaUrl) {
        console.log(`  ${c.bold}🔗 Bouton CTA :${c.reset} "${ctaText}" → ${ctaUrl}`);
      }
      console.log("");
      printDivider();
      console.log("");

      console.log(`  ${c.bold}${c.brightWhite}MENU D'ACTION :${c.reset}`);
      console.log(`  ${c.brightGreen}[1] 🚀 Lancer l'envoi global de la newsletter${c.reset}`);
      console.log(`  ${c.brightCyan}[2] 📧 S'envoyer un mail de test rapide${c.reset}`);
      console.log(`  ${c.brightYellow}[3] 🌐 Ouvrir un aperçu HTML dans le navigateur${c.reset}`);
      console.log(`  ${c.white}[4] ❌ Annuler et quitter${c.reset}`);
      console.log("");

      const action = (await rl.question(`  ${c.brightYellow}➔ Votre choix [1-4] : ${c.reset}`)).trim();

      if (action === "3") {
        const sampleUsername = targetUsers[0]?.username || "Développeur";
        const html = buildNewsletterHtml(subject, sampleUsername, textContent, selectedTemplate, customHtml, ctaText, ctaUrl);
        openPreviewInBrowser(html);
        await rl.question(`\n  ${c.dim}Appuyez sur Entrée pour revenir au menu...${c.reset}`);
      } else if (action === "2") {
        const testTarget = (await rl.question(`\n  ${c.brightYellow}➔ Saisissez l'adresse e-mail pour le test (défaut: ${defaultEmail}) : ${c.reset}`)).trim() || defaultEmail;
        printInfo(`Envoi du mail de test à ${testTarget}...`);

        const html = buildNewsletterHtml(`[TEST] ${subject}`, "TestUser", textContent, selectedTemplate, customHtml, ctaText, ctaUrl);
        const success = await sendEmail({ to: testTarget, subject: `[TEST] ${subject}`, html });
        if (success) {
          printSuccess(`E-mail de test envoyé avec succès à ${testTarget} !`);
        } else {
          printError(`Échec de l'envoi de test à ${testTarget}.`);
        }
        await rl.question(`\n  ${c.dim}Appuyez sur Entrée pour revenir au menu...${c.reset}`);
      } else if (action === "1") {
        const confirm = (await rl.question(`\n  ${c.bold}${c.brightRed}⚠️  Êtes-vous SÛR de vouloir envoyer à ${targetUsers.length} destinataire(s) ? (O/n) : ${c.reset}`)).trim();
        if (confirm.toLowerCase() === "o" || confirm.toLowerCase() === "y" || confirm === "") {
          break; // Sort du menu et lance l'envoi
        }
      } else if (action === "4") {
        printInfo("Envoi annulé.");
        return;
      }
    }

    // ──────── ÉTAPE 5: Envoi en masse avec animation ────────
    clearConsole();
    printHeader();
    printStep(5, "Envoi en cours...");

    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    console.log("");
    for (let i = 0; i < targetUsers.length; i++) {
      const u = targetUsers[i];
      printProgressBar(i + 1, targetUsers.length, u.email);

      const html = buildNewsletterHtml(subject, u.username, textContent, selectedTemplate, customHtml, ctaText, ctaUrl);
      const success = await sendEmail({ to: u.email, subject, html });
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }

      // 100ms de délai pour éviter le rate-limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("");
    console.log("");
    printDivider();
    console.log(`  ${c.bold}${c.brightWhite}📊 RÉSULTAT DU DÉPLOIEMENT${c.reset}`);
    printDivider();
    console.log(`  ${c.brightGreen}✔ ${successCount} mail(s) envoyé(s) avec succès${c.reset}`);
    if (errorCount > 0) {
      console.log(`  ${c.brightRed}✖ ${errorCount} échec(s)${c.reset}`);
    }
    console.log(`  ${c.dim}⏱ Temps total : ${duration}s${c.reset}`);
    printDivider();
    console.log("");

  } finally {
    rl.close();
  }
}

// Permettre l'exécution directe si appelé en script
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('newsletter-send.ts')) {
  runNewsletterStudio().catch((err) => {
    printError(`Erreur fatale : ${err.message || err}`);
    process.exit(1);
  });
}
