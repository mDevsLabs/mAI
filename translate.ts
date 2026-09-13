/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — TRADUCTION DEEPL (translate.ts)
 * POST /v1/translate : traduction des publications ET des commentaires via
 * l'API DeepL, avec repli automatique sur le moteur mAI (OpenRouter) si
 * toutes les clés DeepL échouent.
 *  - DEEPL_API_KEY   : clé principale (variables Val Town)
 *  - DEEPL_API_KEY_2 : clé de secours, essayée si la première échoue
 * Les clés gratuites (suffixe « :fx ») sont routées vers api-free.deepl.com.
 * Le contenu HTML est envoyé avec tag_handling=html (balises préservées) et
 * les traductions sont mises en cache (post_translations / comment_translations).
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, getWeekData, rateLimit, verifyToken } from "./config.ts";
import { createRegisterMulti } from "./vibe-common.ts";
import { MAIAgentFleet } from "./vibe-mai-fleet.ts";

/** Codes cibles acceptés par DeepL /v2/translate (target_lang). */
const DEEPL_TARGET_LANGS = new Set([
  "AR", "BG", "CS", "DA", "DE", "EL", "EN", "ES", "ET", "FI", "FR", "HE",
  "HU", "ID", "IT", "JA", "KO", "LT", "LV", "NB", "NL", "PL", "PT", "RO",
  "RU", "SK", "SL", "SV", "TR", "UK", "VI", "ZH",
]);

/** Normalise « fr », « en-us », « pt_BR »… vers un code DeepL valide (null si inconnu). */
function normalizeTargetLang(raw: string): string | null {
  const upper = String(raw || "").trim().toUpperCase().replace("_", "-");
  if (!upper) return null;
  if (/^(EN|PT)-(US|GB|BR|PT)$/.test(upper)) return upper;
  const base = upper.slice(0, 2);
  if (base === "EN") return "EN-US";
  if (base === "PT") return "PT-PT";
  return DEEPL_TARGET_LANGS.has(base) ? base : null;
}

/** Les clés DeepL gratuites (suffixe « :fx ») utilisent un host dédié. */
function deeplHost(key: string): string {
  return key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
}

/** Clés DeepL dans l'ordre de priorité (DEEPL_API_KEY puis DEEPL_API_KEY_2). */
function getDeeplKeys(): string[] {
  const read = (name: string) =>
    (typeof Deno !== "undefined" ? Deno.env?.get(name) : null) ||
    (typeof process !== "undefined" ? (process.env as any)?.[name] : null) ||
    "";
  return [read("DEEPL_API_KEY"), read("DEEPL_API_KEY_2")]
    .map((k) => String(k).trim())
    .filter(Boolean);
}

/** Appel DeepL /v2/translate : essaie chaque clé dans l'ordre (fallback simple). */
async function callDeepl(
  text: string,
  targetLang: string
): Promise<{ text: string; detected: string }> {
  const keys = getDeeplKeys();
  if (keys.length === 0) throw new Error("Aucune clé DeepL configurée (DEEPL_API_KEY).");
  const errors: string[] = [];
  for (const key of keys) {
    try {
      const res = await fetch(`${deeplHost(key)}/v2/translate`, {
        method: "POST",
        headers: {
          "Authorization": `DeepL-Auth-Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: [text], target_lang: targetLang, tag_handling: "html" }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        errors.push(`HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const tr = data?.translations?.[0];
      if (!tr?.text) {
        errors.push("réponse vide");
        continue;
      }
      return {
        text: String(tr.text),
        detected: String(tr.detected_source_language || "").toUpperCase(),
      };
    } catch (err: any) {
      errors.push(err?.message || "erreur réseau");
    }
  }
  throw new Error(`DeepL indisponible (${errors.join(" ; ")})`);
}

const LANG_LABELS: Record<string, string> = {
  ar: "arabe", bg: "bulgare", cs: "tchèque", da: "danois", de: "allemand",
  el: "grec", en: "anglais", es: "espagnol", et: "estonien", fi: "finnois",
  fr: "français", he: "hébreu", hu: "hongrois", id: "indonésien", it: "italien",
  ja: "japonais", ko: "coréen", lt: "lituanien", lv: "letton", nb: "norvégien",
  nl: "néerlandais", pl: "polonais", pt: "portugais", ro: "roumain", ru: "russe",
  sk: "slovaque", sl: "slovène", sv: "suédois", tr: "turc", uk: "ukrainien",
  vi: "vietnamien", zh: "chinois",
};
const langLabel = (code: string) => LANG_LABELS[code.toLowerCase().slice(0, 2)] || code;

// ── Helpers mAI : copies locales de vibe-ai.ts. translate.ts doit rester
// auto-suffisant — un déploiement partiel peut servir un vibe-ai.ts sans
// ces exports (cf. ERR_MODULE_NOT_FOUND au boot du val). ──

function stripCodeFences(raw: string): string {
  return raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

/** Nettoie la sortie LLM : supprime guillemets englobants et méta-commentaires. */
function cleanLlmText(raw: string): string {
  let text = stripCodeFences(String(raw || ""));
  text = text.replace(/^User Safety:[^\n]*\n*/gi, "");
  // Guillemets englobants uniquement (pas les guillemets internes)
  if (text.length >= 2 && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))) {
    text = text.slice(1, -1);
  }
  return text.trim();
}

/** Extrait le premier objet JSON d'une réponse LLM (tolérant aux fences). */
function extractJsonObject(raw: string): Record<string, any> | null {
  const text = stripCodeFences(raw);
  const start = text.indexOf("{");
  if (start === -1) return null;
  // Parse glissant : tente depuis la première accolade jusqu'à la dernière
  for (let end = text.length; end > start; end--) {
    const candidate = text.slice(start, end);
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {}
  }
  return null;
}

/** Débite le quota hebdomadaire mAI (estimation ~1 token / 3 caractères). */
async function debitWeeklyTokens(sql: any, userId: number, chars: number) {
  const { weekStartStr } = getWeekData();
  const tokens = Math.max(60, Math.ceil(chars / 3));
  try {
    await sql`
      INSERT INTO weekly_usage (user_id, week_start, tokens_used)
      VALUES (${userId}, ${weekStartStr}::date, ${tokens})
      ON CONFLICT (user_id, week_start)
      DO UPDATE SET tokens_used = weekly_usage.tokens_used + ${tokens}, updated_at = NOW()
    `;
  } catch {}
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function registerTranslateRoutes(app: Hono) {
  if ((app as any).__vibe_translate_registered) return;
  (app as any).__vibe_translate_registered = true;

  const registerMulti = createRegisterMulti(app);

  // Tables de cache créées paresseusement (idempotent) — post_translations
  // est partagée avec le moteur mAI (vibe-ai.ts), + provider pour distinguer.
  let translateTablesReady = false;
  const ensureTranslateTables = async () => {
    if (translateTablesReady) return;
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS post_translations (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        target_lang TEXT NOT NULL,
        detected_language TEXT,
        translation TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (post_id, target_lang)
      )
    `;
    await sql`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'mai'`;
    await sql`
      CREATE TABLE IF NOT EXISTS comment_translations (
        comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        target_lang TEXT NOT NULL,
        detected_language TEXT,
        translation TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (comment_id, target_lang)
      )
    `;
    translateTablesReady = true;
  };

  const handleTranslate = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const body = await c.req.json().catch(() => ({} as any));
      const postId = String(body?.post_id || "");
      const commentId = String(body?.comment_id || "");
      // Source exclusive : une publication OU un commentaire
      if (Boolean(postId) === Boolean(commentId)) {
        return c.json({ error: "Fournir post_id OU comment_id." }, 400);
      }
      const sourceId = postId || commentId;
      if (!UUID_RE.test(sourceId)) {
        return c.json({ error: "Identifiant invalide." }, 400);
      }

      // Langue cible : corps de la requête, sinon réglage utilisateur, sinon français
      let effective = String(body?.target_lang || "").trim();
      const sql = getDb();
      if (!effective) {
        const srows = await sql`SELECT ui_language FROM user_settings WHERE user_id = ${userId} LIMIT 1`.catch(() => [] as any[]);
        effective = String(srows?.[0]?.ui_language || "").trim();
      }
      const targetLang = normalizeTargetLang(effective) || "FR";

      if (!rateLimit(`translate:${userId}`, 30, 60_000)) {
        return c.json({ error: "Trop de traductions. Patientez un instant." }, 429);
      }

      await ensureTranslateTables().catch(() => {});

      // 1. Cache : traduction déjà générée pour cette source + langue cible
      try {
        const cachedRows = postId
          ? await sql`SELECT translation, detected_language, provider FROM post_translations WHERE post_id = ${postId}::uuid AND target_lang = ${targetLang} LIMIT 1`
          : await sql`SELECT translation, detected_language, provider FROM comment_translations WHERE comment_id = ${commentId}::uuid AND target_lang = ${targetLang} LIMIT 1`;
        if (cachedRows.length > 0) {
          const det = String(cachedRows[0].detected_language || "");
          const isSame = Boolean(det) && det.slice(0, 2).toUpperCase() === targetLang.slice(0, 2);
          // Si la traduction en cache est une vraie traduction (pas identique au texte source)
          if (!isSame && cachedRows[0].translation) {
            return c.json({
              success: true,
              translation: cachedRows[0].translation,
              detected_language: det,
              target_lang: targetLang,
              provider: cachedRows[0].provider || "mai",
              same_language: false,
              cached: true,
            });
          }
        }
      } catch {}

      // 2. Contenu source (HTML riche)
      const rows = postId
        ? await sql`SELECT content FROM posts WHERE id = ${postId}::uuid LIMIT 1`
        : await sql`SELECT content FROM comments WHERE id = ${commentId}::uuid LIMIT 1`;
      if (rows.length === 0) {
        return c.json({ error: postId ? "Publication introuvable." : "Réponse introuvable." }, 404);
      }
      const content = String(rows[0].content || "").trim();
      if (!content) return c.json({ error: "Contenu vide." }, 400);

      // 3. DeepL d'abord (HTML préservé) ; si les deux clés échouent → mAI.
      // Un contenu trop long pour DeepL déclenche aussi le repli mAI.
      let translation = "";
      let detected = "";
      let provider = "deepl";
      let sameLanguage = false;
      let effectiveTargetLang = targetLang;
      try {
        const deepl = await callDeepl(content, targetLang);
        translation = deepl.text;
        detected = deepl.detected;
        // Déjà dans la langue cible (ex : post en français pour cible FR) :
        // on traduit vers l'anglais (ou le français si la cible initiale était EN)
        if (detected && detected.slice(0, 2) === targetLang.slice(0, 2)) {
          const altTarget = targetLang.slice(0, 2) === "FR" ? "EN-US" : "FR";
          try {
            const altDeepl = await callDeepl(content, altTarget);
            translation = altDeepl.text;
            detected = altDeepl.detected || detected;
            effectiveTargetLang = altTarget;
          } catch {
            sameLanguage = true;
            translation = content;
          }
        }
      } catch (deeplErr: any) {
        console.warn("[translate] DeepL échec, repli mAI :", deeplErr?.message);
        const altTarget = targetLang.slice(0, 2) === "FR" ? "EN-US" : "FR";
        const system =
          "Tu es le moteur de traduction du réseau social Vibe. On te donne une publication. " +
          "1) Détecte sa langue d'origine. " +
          `2) Traduis-la fidèlement en ${langLabel(targetLang)} (ou en ${langLabel(altTarget)} si elle est déjà écrite en ${langLabel(targetLang)}) : sens EXACT, ton préservé, ton naturel de réseau social. ` +
          "Conserve les hashtags, mentions @, émojis et liens tels quels (ne les traduis pas). " +
          'Réponds UNIQUEMENT par un objet JSON strict : {"detected_language": "<nom de la langue d\'origine en français>", "target_language": "<code ou nom de la langue cible>", "translation": "<traduction>"} — sans guillemets markdown ni commentaire.';
        const raw = await MAIAgentFleet.callOpenRouter(userId, system, content);
        if (!raw) {
          return c.json({ error: "Traduction indisponible (DeepL et mAI injoignables)." }, 502);
        }
        await debitWeeklyTokens(sql, userId, content.length + raw.length);
        const parsed = extractJsonObject(raw);
        if (parsed && typeof parsed.translation === "string" && parsed.translation.trim()) {
          detected = String(parsed.detected_language || "").trim();
          translation = cleanLlmText(parsed.translation);
          if (parsed.target_language && String(parsed.target_language).toLowerCase().includes("anglais")) {
            effectiveTargetLang = "EN-US";
          }
        } else {
          // Repli : la réponse entière est la traduction
          translation = cleanLlmText(raw);
        }
        provider = "mai";
        if (!translation) return c.json({ error: "Traduction vide." }, 502);
      }

      // 4. Mise en cache (traductions exactes réutilisables, coût amorti)
      if (!sameLanguage && translation && translation !== content) {
        try {
          if (postId) {
            await sql`
              INSERT INTO post_translations (post_id, target_lang, detected_language, translation, provider)
              VALUES (${postId}::uuid, ${effectiveTargetLang}, ${detected}, ${translation}, ${provider})
              ON CONFLICT (post_id, target_lang) DO UPDATE SET translation = EXCLUDED.translation, detected_language = EXCLUDED.detected_language, provider = EXCLUDED.provider
            `;
          } else {
            await sql`
              INSERT INTO comment_translations (comment_id, target_lang, detected_language, translation, provider)
              VALUES (${commentId}::uuid, ${effectiveTargetLang}, ${detected}, ${translation}, ${provider})
              ON CONFLICT (comment_id, target_lang) DO UPDATE SET translation = EXCLUDED.translation, detected_language = EXCLUDED.detected_language, provider = EXCLUDED.provider
            `;
          }
        } catch {}
      }

      return c.json({
        success: true,
        translation,
        detected_language: detected,
        target_lang: effectiveTargetLang,
        provider,
        same_language: sameLanguage,
        cached: false,
      });
    } catch (err: any) {
      console.error("[translate] Translate error:", err);
      return c.json({ error: err?.message || "Erreur de traduction." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/translate", "/vibe/translate", "/v1/translate", "/translate"], handleTranslate);
}
