import bcrypt from "npm:bcryptjs";
import type { Hono } from "npm:hono@4";
import {
  BCRYPT_ROUNDS,
  extractToken,
  generateVerificationCode,
  getDb,
  parseUserAgent,
  signToken,
  sqlite,
  verifyToken,
  verifyVerificationCode,
} from "./config.ts";
import { sendVerificationEmail } from "./email.ts";

export function registerAuthRoutes(app: Hono) {
  // POST /register
  app.post("/register", async (c) => {
    try {
      const { email, username, password } = await c.req.json();
      if (!email || !username || !password) {
        return c.json({ error: "Champs manquants." }, 400);
      }

      const sql = getDb();
      const existing =
        await sql`SELECT id FROM users WHERE email = ${email} OR username = ${username} LIMIT 1`;
      if (existing.length > 0) {
        return c.json({ error: "Email ou nom d'utilisateur déjà pris." }, 400);
      }

      const code = await generateVerificationCode(email, "register");
      await sendVerificationEmail(email, code, "register");

      return c.json({ email, status: "verification_required", success: true });
    } catch (err: any) {
      console.error("Register Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /verify-register
  app.post("/verify-register", async (c) => {
    try {
      const { email, username, password, code } = await c.req.json();
      if (!email || !username || !password || !code) {
        return c.json({ error: "Champs manquants." }, 400);
      }

      const isValid = await verifyVerificationCode(email, code, "register");
      if (!isValid) {
        return c.json({ error: "Code invalide ou expiré." }, 400);
      }

      const sql = getDb();
      const existing =
        await sql`SELECT id FROM users WHERE email = ${email} OR username = ${username} LIMIT 1`;
      if (existing.length > 0) {
        return c.json({ error: "Email ou nom d'utilisateur déjà pris." }, 400);
      }

      const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const result = await sql`
        INSERT INTO users (email, username, password_hash, tier)
        VALUES (${email}, ${username}, ${hash}, 'Free')
        RETURNING id, tier
      `;

      const user = result[0];
      const token = await signToken({ sub: user.id, tier: user.tier });

      const userAgent = c.req.header("user-agent") || "";
      const ip =
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        "Inconnue";
      const { os, device_model, device_version, device_name } =
        parseUserAgent(userAgent);

      try {
        await sql`
          INSERT INTO connected_devices (user_id, token, os, device_model, device_version, ip_address, device_name)
          VALUES (${user.id}::text, ${token}, ${os}, ${device_model}, ${device_version}, ${ip}, ${device_name})
        `;
      } catch (dbErr) {
        console.error("Erreur insertion device:", dbErr);
      }

      return c.json({ success: true, tier: user.tier, token });
    } catch (err: any) {
      console.error("Verify Register Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /login
  app.post("/login", async (c) => {
    try {
      const { email, password, identifier } = await c.req.json();
      const loginId = (identifier || email || "").trim();
      if (!loginId || !password) {
        return c.json({ error: "Champs manquants." }, 400);
      }

      const sql = getDb();
      const users =
        await sql`SELECT id, email, password_hash, tier FROM users WHERE email = ${loginId} OR username = ${loginId} OR phone = ${loginId} LIMIT 1`;
      if (users.length === 0) {
        return c.json({ error: "Identifiants invalides." }, 401);
      }

      const user = users[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return c.json({ error: "Identifiants invalides." }, 401);
      }

      const code = await generateVerificationCode(user.email, "login");
      await sendVerificationEmail(user.email, code, "login");

      return c.json({
        email: user.email,
        status: "verification_required",
        success: true,
      });
    } catch (err: any) {
      console.error("Login Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /verify-login
  app.post("/verify-login", async (c) => {
    try {
      const { email, code } = await c.req.json();
      if (!email || !code) {
        return c.json({ error: "Champs manquants." }, 400);
      }

      const isValid = await verifyVerificationCode(email, code, "login");
      if (!isValid) {
        return c.json({ error: "Code invalide ou expiré." }, 400);
      }

      const sql = getDb();
      const users =
        await sql`SELECT id, tier FROM users WHERE email = ${email} LIMIT 1`;
      if (users.length === 0) {
        return c.json({ error: "Utilisateur introuvable." }, 404);
      }

      const user = users[0];
      const token = await signToken({ sub: user.id, tier: user.tier });

      const userAgent = c.req.header("user-agent") || "";
      // Pour les tests en dev, on utilise une IP par défaut
      let ip =
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "";
      if (!ip || ip === "::1" || ip === "127.0.0.1") {
        ip = "8.8.8.8"; // IP Google par défaut pour ne pas planter l'API
      } else {
        // Extraire la première IP si on a une liste
        ip = ip.split(",")[0].trim();
      }
      const { os, device_model, device_version, device_name } =
        parseUserAgent(userAgent);

      let locationStr = "Lieu inconnu";
      let countryStr = "Pays inconnu";
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const geoRes = await fetch(`https://ip-api.com/json/${ip}`, {
          headers: { "User-Agent": "mAI/1.0" },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            locationStr = `${geoData.city}, ${geoData.country}`;
            countryStr = geoData.country;
          }
        }
      } catch (e) {
        console.error("Erreur de géolocalisation:", e);
      }

      // Vérifier si c'est un nouvel appareil ou un nouveau pays
      let isNewDeviceOrLocation = true;
      try {
        const pastDevices = await sql`
          SELECT device_name, location FROM connected_devices 
          WHERE user_id = ${user.id}::text
        `;
        if (pastDevices.length > 0) {
          // C'est pas sa toute première connexion
          const knownDevice = pastDevices.some(
            (d) => d.device_name === device_name
          );
          const knownLocation = pastDevices.some(
            (d) => d.location && d.location.includes(countryStr)
          );
          if (knownDevice && knownLocation) {
            isNewDeviceOrLocation = false;
          }
        } else {
          // Première connexion jamais (donc nouvelle par defaut, ou pas besoin d'alerte? on envoie quand meme)
          isNewDeviceOrLocation = true;
        }
      } catch (e) {
        console.error(e);
      }

      try {
        await sql`
          INSERT INTO connected_devices (user_id, token, os, device_model, device_version, ip_address, device_name, location)
          VALUES (${user.id}::text, ${token}, ${os}, ${device_model}, ${device_version}, ${ip}, ${device_name}, ${locationStr})
        `;
      } catch (dbErr) {
        console.error("Erreur insertion device:", dbErr);
      }

      if (isNewDeviceOrLocation) {
        // On n'attend pas l'envoi de l'email
        sendVerificationEmail(email, "", "new_login", {
          device: device_name,
          location: locationStr,
        }).catch(console.error);
      }

      return c.json({ success: true, tier: user.tier, token });
    } catch (err: any) {
      console.error("Verify Login Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /resend-code
  app.post("/resend-code", async (c) => {
    try {
      const { email, action } = await c.req.json();
      if (!email || !action) {
        return c.json({ error: "Champs manquants." }, 400);
      }

      // Vérifier le rate-limit (1 minute)
      const result = await sqlite.execute({
        args: [email, action],
        sql: "SELECT expires_at FROM verification_codes WHERE email = ? AND action = ?",
      });

      if (result.rows.length > 0) {
        const expiresAt = new Date(result.rows[0][0] as string);
        const now = new Date();
        // Si la date d'expiration est > maintenant + 9 minutes, ça veut dire qu'il a été généré il y a moins d'1 minute.
        const diffMinutes = (expiresAt.getTime() - now.getTime()) / 60_000;
        if (diffMinutes > 9) {
          return c.json(
            { error: "Veuillez patienter 1 minute avant de renvoyer un code." },
            429
          );
        }
      }

      const code = await generateVerificationCode(email, action);
      await sendVerificationEmail(email, code, action);

      return c.json({ success: true });
    } catch (err: any) {
      console.error("Resend Code Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /verify-code
  app.post("/verify-code", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = String(payload.sub);

      const body = await c.req.json();
      const rawCode = body?.code;
      if (!rawCode) {
        return c.json({ error: "Code requis." }, 400);
      }

      const inputCode = String(rawCode).trim().toUpperCase();
      const sql = getDb();

      let newTier: string | null = null;
      let dbCodeId: number | null = null;

      // 1. Recherche dans la table subscription_codes de la base de données
      try {
        const codeRows = await sql`
          SELECT id, code, tier, max_uses, uses_count, is_active, expires_at 
          FROM subscription_codes 
          WHERE UPPER(code) = UPPER(${inputCode}) 
          LIMIT 1
        `;

        if (codeRows.length > 0) {
          const row = codeRows[0];

          if (!row.is_active) {
            return c.json(
              { error: "Ce code d'abonnement est désactivé." },
              400
            );
          }

          if (row.expires_at && new Date(row.expires_at) < new Date()) {
            return c.json({ error: "Ce code d'abonnement a expiré." }, 400);
          }

          if (
            row.max_uses > 0 &&
            Number(row.uses_count) >= Number(row.max_uses)
          ) {
            return c.json(
              { error: "Ce code a atteint son quota maximal d'utilisations." },
              400
            );
          }

          // Vérifier si l'utilisateur a déjà activé ce code spécifique
          try {
            const redemptions = await sql`
              SELECT id FROM subscription_code_redemptions 
              WHERE code_id = ${row.id} AND user_id = ${userId}::text 
              LIMIT 1
            `;
            if (redemptions.length > 0) {
              return c.json(
                {
                  error: "Vous avez déjà débloqué votre forfait avec ce code.",
                },
                400
              );
            }
          } catch (_redErr) {
            // Ignorer si la table de redemptions n'est pas encore créée
          }

          newTier = row.tier;
          dbCodeId = row.id;
        }
      } catch (dbErr) {
        console.warn(
          "Table subscription_codes non accessible, vérification fallback ENV:",
          dbErr
        );
      }

      // 2. Fallback vers les variables d'environnement si non trouvé en base
      if (!newTier) {
        const upgradeCodes: Record<string, string> = {};

        const plusCode =
          Deno.env.get("MAI_PLUS_CODE") || Deno.env.get("PLUS_CODE");
        if (plusCode) {
          upgradeCodes[plusCode.trim().toUpperCase()] = "Plus";
        }

        const proCode =
          Deno.env.get("MAI_PRO_CODE") || Deno.env.get("PRO_CODE");
        if (proCode) {
          upgradeCodes[proCode.trim().toUpperCase()] = "Pro";
        }

        const maxCode =
          Deno.env.get("MAI_MAX_CODE") || Deno.env.get("MAX_CODE");
        if (maxCode) {
          upgradeCodes[maxCode.trim().toUpperCase()] = "Max";
        }

        newTier = upgradeCodes[inputCode] || null;
      }

      if (!newTier) {
        console.log(`[Verify-Code] Code invalide soumis par user=${userId}`);
        return c.json({ error: "Code invalide ou expiré." }, 400);
      }

      // 3. Mise à jour de l'utilisateur et de ses clés API
      await sql`UPDATE users SET tier = ${newTier} WHERE id::text = ${userId}::text`;
      await sql`UPDATE mprojects_api_keys SET plan = ${newTier} WHERE user_id = ${userId}::text`;

      // 4. Incrémentation du compteur et log de l'utilisation en base
      if (dbCodeId) {
        try {
          await sql`
            UPDATE subscription_codes 
            SET uses_count = uses_count + 1,
                is_active = CASE WHEN max_uses > 0 AND (uses_count + 1) >= max_uses THEN FALSE ELSE is_active END
            WHERE id = ${dbCodeId}
          `;
          await sql`
            INSERT INTO subscription_code_redemptions (code_id, user_id)
            VALUES (${dbCodeId}, ${userId}::text)
          `;
        } catch (updateErr) {
          console.error("Erreur mise à jour usage code:", updateErr);
        }
      }

      // 5. Envoi d'un e-mail de remerciements pour la souscription
      try {
        const userRows =
          await sql`SELECT email, username FROM users WHERE id::text = ${userId}::text LIMIT 1`;
        if (userRows.length > 0 && userRows[0].email) {
          await sendVerificationEmail(
            userRows[0].email,
            "",
            "subscription_unlocked",
            {
              tier: newTier,
              username: userRows[0].username,
            }
          );
        }
      } catch (mailErr) {
        console.error(
          "Erreur envoi email remerciements souscription:",
          mailErr
        );
      }

      // 6. Nouveau token JWT avec le tier débloqué
      const newToken = await signToken({ sub: userId, tier: newTier });

      return c.json({
        message: `Merci d'avoir souscrit au forfait ${newTier} !`,
        success: true,
        tier: newTier,
        token: newToken,
      });
    } catch (err: any) {
      console.error("Verify-Code error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /update-profile
  app.post("/update-profile", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = payload.sub as string;

      const body = await c.req.json();
      const {
        username,
        email,
        phone,
        password,
        currentPassword,
        newsletter,
        notify_limits,
        auto_logout_minutes,
      } = body;
      const sql = getDb();

      // Vérification obligatoire du mot de passe actuel
      if (!currentPassword) {
        return c.json(
          {
            error:
              "Le mot de passe actuel est obligatoire pour modifier vos informations.",
          },
          400
        );
      }

      const currentUser =
        await sql`SELECT email, password_hash FROM users WHERE id::text = ${userId}::text LIMIT 1`;
      if (!currentUser || currentUser.length === 0) {
        return c.json({ error: "Utilisateur introuvable." }, 404);
      }

      const passMatch = await bcrypt.compare(
        currentPassword,
        currentUser[0].password_hash
      );
      if (!passMatch) {
        return c.json({ error: "Le mot de passe actuel est incorrect." }, 400);
      }

      if (username && username.trim()) {
        const cleanUsername = username.trim();
        const existing =
          await sql`SELECT id FROM users WHERE username = ${cleanUsername} AND id::text != ${userId}::text LIMIT 1`;
        if (existing.length > 0) {
          return c.json({ error: "Ce nom d'utilisateur est déjà pris." }, 400);
        }
        await sql`UPDATE users SET username = ${cleanUsername} WHERE id::text = ${userId}::text`;
      }

      if (email && email.trim()) {
        const cleanEmail = email.trim();
        const existing =
          await sql`SELECT id FROM users WHERE email = ${cleanEmail} AND id::text != ${userId}::text LIMIT 1`;
        if (existing.length > 0) {
          return c.json(
            { error: "Cette adresse e-mail est déjà utilisée." },
            400
          );
        }
        if (cleanEmail !== currentUser[0].email) {
          // Send OTP instead of updating directly
          const code = await generateVerificationCode(
            cleanEmail,
            "verify_new_email"
          );
          await sendVerificationEmail(cleanEmail, code, "verify_new_email");
          return c.json({
            email: cleanEmail,
            status: "email_verification_required",
            success: true,
          });
        }
      }

      if (phone !== undefined) {
        const cleanPhone = phone ? phone.trim() : null;
        if (cleanPhone) {
          const existing =
            await sql`SELECT id FROM users WHERE phone = ${cleanPhone} AND id::text != ${userId}::text LIMIT 1`;
          if (existing.length > 0) {
            return c.json(
              {
                error:
                  "Ce numéro de téléphone est déjà associé à un autre compte.",
              },
              400
            );
          }
        }
        await sql`UPDATE users SET phone = ${cleanPhone} WHERE id::text = ${userId}::text`;
      }

      if (newsletter !== undefined) {
        await sql`UPDATE users SET newsletter = ${Boolean(newsletter)} WHERE id::text = ${userId}::text`;
      }

      if (notify_limits !== undefined) {
        await sql`UPDATE users SET notify_limits = ${Boolean(notify_limits)} WHERE id::text = ${userId}::text`;
      }

      if (auto_logout_minutes !== undefined) {
        const mins = Number.parseInt(auto_logout_minutes, 10);
        if (!isNaN(mins)) {
          await sql`UPDATE users SET auto_logout_minutes = ${mins} WHERE id::text = ${userId}::text`;
        }
      }

      if (password && password.trim()) {
        if (password.length < 6) {
          return c.json(
            { error: "Le mot de passe doit contenir au moins 6 caractères." },
            400
          );
        }
        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await sql`UPDATE users SET password_hash = ${hash} WHERE id::text = ${userId}::text`;
      }

      const updatedUser =
        await sql`SELECT username, email, phone, tier, newsletter, notify_limits FROM users WHERE id::text = ${userId}::text LIMIT 1`;
      const user = updatedUser[0];

      return c.json({
        email: user?.email,
        newsletter: user?.newsletter,
        notify_limits: user?.notify_limits,
        phone: user?.phone,
        success: true,
        tier: user?.tier,
        username: user?.username,
      });
    } catch {
      return c.json({ error: "Erreur lors de la mise à jour du profil." }, 500);
    }
  });

  // POST /verify-new-email
  app.post("/verify-new-email", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }
      const payload = await verifyToken(token);
      const userId = payload.sub as string;

      const { email, code } = await c.req.json();
      if (!email || !code) {
        return c.json({ error: "Champs manquants." }, 400);
      }

      const isValid = await verifyVerificationCode(
        email,
        code,
        "verify_new_email"
      );
      if (!isValid) {
        return c.json({ error: "Code invalide ou expiré." }, 400);
      }

      const sql = getDb();
      await sql`UPDATE users SET email = ${email.trim()} WHERE id::text = ${userId}::text`;

      return c.json({ email: email.trim(), success: true });
    } catch (err: any) {
      console.error("verify-new-email Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /request-delete-account
  app.post("/request-delete-account", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }
      const payload = await verifyToken(token);
      const userId = payload.sub as string;

      const sql = getDb();
      const currentUser =
        await sql`SELECT email FROM users WHERE id::text = ${userId}::text LIMIT 1`;
      if (!currentUser || currentUser.length === 0) {
        return c.json({ error: "Utilisateur introuvable." }, 404);
      }

      const email = currentUser[0].email;
      const code = await generateVerificationCode(email, "delete_account");
      await sendVerificationEmail(email, code, "delete_account");

      return c.json({ email, success: true });
    } catch (err: any) {
      console.error("request-delete-account Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /confirm-delete-account
  app.post("/confirm-delete-account", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }
      const payload = await verifyToken(token);
      const userId = payload.sub as string;

      const { password, code, confirmationText } = await c.req.json();
      if (!password || !code || confirmationText !== "SUPPRIMER LE COMPTE") {
        return c.json(
          { error: "Informations de confirmation invalides." },
          400
        );
      }

      const sql = getDb();
      const currentUser =
        await sql`SELECT email, password_hash FROM users WHERE id::text = ${userId}::text LIMIT 1`;
      if (!currentUser || currentUser.length === 0) {
        return c.json({ error: "Utilisateur introuvable." }, 404);
      }

      const passMatch = await bcrypt.compare(
        password,
        currentUser[0].password_hash
      );
      if (!passMatch) {
        return c.json({ error: "Mot de passe incorrect." }, 400);
      }

      const email = currentUser[0].email;
      const isValid = await verifyVerificationCode(
        email,
        code,
        "delete_account"
      );
      if (!isValid) {
        return c.json({ error: "Code invalide ou expiré." }, 400);
      }

      // Suppression (ou anonymisation)
      await sql`DELETE FROM users WHERE id::text = ${userId}::text`;

      // Révoquer le token pour déconnecter immédiatement
      await sqlite.execute({
        args: [token],
        sql: "INSERT OR IGNORE INTO token_blacklist (token) VALUES (?)",
      });

      return c.json({ success: true });
    } catch (err: any) {
      console.error("confirm-delete-account Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // GET /api-keys
  app.get("/api-keys", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = payload.sub as string;

      const sql = getDb();
      const keys = await sql`
        SELECT api_key, plan, request_count, created_at, last_used_at 
        FROM mprojects_api_keys 
        WHERE user_id = ${userId}::text
      `;

      return c.json({ keys, success: true });
    } catch (err: any) {
      console.error("Erreur API Keys:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });
}
