/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — AI TEXT TOOLS (vibe-ai.ts)
 * Outils IA textuels du composer et des posts :
 *  - POST /v1/ai/text       : continuation (ghost-text Tab), orthographe,
 *                             allonger, réduire, ton — modèle par défaut mAI
 *  - POST /v1/ai/translate  : « Traduire avec mAI » (détection de langue +
 *                             traduction, cache post_translations en base)
 * Tous les appels passent par MAIAgentFleet.callOpenRouter (modèle par défaut
 * de l'utilisateur, cf. vibe-mai-fleet.ts).
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, getWeekData, rateLimit, verifyToken } from "./config.ts";
import { createRegisterMulti } from "./vibe-common.ts";
import { MAIAgentFleet } from "./vibe-mai-fleet.ts";

const TEXT_ACTIONS = new Set(["complete", "fix_spelling", "lengthen", "shorten", "tone"]);

const TONE_INSTRUCTIONS: Record<string, string> = {
  professionnel: "professionnel, clair et crédible, adapté à un contexte de travail",
  amical: "amical et chaleureux, comme entre amis",
  humoristique: "léger et humoristique, avec une touche d'esprit (sans en faire trop)",
  direct: "direct et percutant, va droit au but",
  inspirant: "inspirant et motivant",
  poetique: "poétique et imagé",
};

function stripCodeFences(raw: string): string {
  return raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

/** Nettoie la sortie LLM : supprime guillemets englobants et méta-commentaires. */
export function cleanLlmText(raw: string): string {
  let text = stripCodeFences(String(raw || ""));
  text = text.replace(/^User Safety:[^\n]*\n*/gi, "");
  // Guillemets englobants uniquement (pas les guillemets internes)
  if (text.length >= 2 && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'")))) {
    text = text.slice(1, -1);
  }
  return text.trim();
}

/** Extrait le premier objet JSON d'une réponse LLM (tolérant aux fences). */
export function extractJsonObject(raw: string): Record<string, any> | null {
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
export async function debitWeeklyTokens(sql: any, userId: number, chars: number) {
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

export function registerVibeAIRoutes(app: Hono) {
  const registerMulti = createRegisterMulti(app);
  // ── Outils texte du composer ──────────────────────────────
  const handleAIText = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const body = await c.req.json().catch(() => ({} as any));
      const text = String(body?.text || "");
      const action = String(body?.action || "");
      const tone = String(body?.tone || "");

      if (!text.trim()) return c.json({ error: "Texte requis." }, 400);
      if (!TEXT_ACTIONS.has(action)) return c.json({ error: "Action invalide." }, 400);
      // Anti-abus : la continuation se déclenche en tapant, on la plafonne plus fort
      if (!rateLimit(`ai-text:${userId}`, action === "complete" ? 40 : 20, 60_000)) {
        return c.json({ error: "Trop de requêtes mAI. Patientez un instant." }, 429);
      }

      const sql = getDb();
      let system: string;
      if (action === "complete") {
        system =
          "Tu es l'assistant d'écriture du réseau social Vibe. On te donne le début d'une publication. " +
          "Continue-la naturellement et brièvement : au maximum une proposition courte (15 mots environ). " +
          "Ne répète JAMAIS le texte existant, ne mets aucun guillemet, aucune explication. " +
          "Réponds UNIQUEMENT par la suite du texte, en français. Si le texte semble complet, réponds par une très courte continuation pertinente.";
      } else if (action === "fix_spelling") {
        system =
          "Corrige l'orthographe, la grammaire et la ponctuation du texte suivant (français), sans changer le sens ni le style. " +
          "Conserve les hashtags, mentions @ et émojis tels quels. " +
          "Réponds UNIQUEMENT par le texte corrigé, sans guillemets ni commentaire.";
      } else if (action === "lengthen") {
        system =
          "Allonge le texte suivant (environ le double), en gardant le même ton, le même point de vue et les hashtags/mentions/émojis existants. " +
          "Reste adapté à un réseau social. Réponds UNIQUEMENT par le texte allongé, sans guillemets ni commentaire.";
      } else if (action === "shorten") {
        system =
          "Raccourcis le texte suivant d'environ moitié en conservant l'essentiel du sens, le ton et les hashtags/mentions importants. " +
          "Réponds UNIQUEMENT par le texte raccourci, sans guillemets ni commentaire.";
      } else {
        const toneDesc = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS[tone.toLowerCase()] || `« ${tone} »`;
        system =
          `Réécris le texte suivant avec un ton ${toneDesc}, sans changer le fond du message. ` +
          "Conserve les hashtags/mentions/émojis pertinents. Réponds UNIQUEMENT par le texte réécrit, sans guillemets ni commentaire.";
      }

      const result = await MAIAgentFleet.callOpenRouter(userId, system, text);
      if (!result) {
        return c.json({ error: "mAI est indisponible pour le moment (modèle ou clé IA)." }, 502);
      }

      await debitWeeklyTokens(sql, userId, text.length + result.length);
      return c.json({ success: true, text: cleanLlmText(result) });
    } catch (err: any) {
      console.error("[vibe-ai] AI text error:", err);
      return c.json({ error: err?.message || "Erreur outil texte mAI." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/ai/text", "/vibe/ai/text", "/v1/ai/text", "/ai/text"], handleAIText);

  // ── « Traduire avec mAI » ─────────────────────────────────
  let translationsTableReady = false;
  const ensureTranslationsTable = async () => {
    if (translationsTableReady) return;
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
    translationsTableReady = true;
  };

  const LANG_NAMES: Record<string, string> = {
    fr: "français", en: "anglais", es: "espagnol", de: "allemand", it: "italien",
    pt: "portugais", nl: "néerlandais", ar: "arabe", ja: "japonais", ko: "coréen",
    zh: "chinois", ru: "russe", hi: "hindi", tr: "turc", pl: "polonais",
  };
  const langLabel = (code: string) => LANG_NAMES[code.toLowerCase()] || code;

  const handleTranslate = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const body = await c.req.json().catch(() => ({} as any));
      const postId = String(body?.post_id || "");
      const rawText = String(body?.text || "").trim();
      const targetLang = String(body?.target_lang || "fr").toLowerCase().slice(0, 8);
      if (!rateLimit(`ai-translate:${userId}`, 20, 60_000)) {
        return c.json({ error: "Trop de traductions. Patientez un instant." }, 429);
      }
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
      // Traduction de texte brut (ex : message DM) : pas de cache post_translations
      if (!isUuid) {
        if (!rawText) {
          return c.json({ error: "Identifiant de post invalide." }, 400);
        }
        if (rawText.length > 8000) {
          return c.json({ error: "Texte trop long (8000 caractères max)." }, 400);
        }
        const altTargetRaw = targetLang.slice(0, 2) === "FR" ? "EN-US" : "FR";
        const systemRaw =
          "Tu es le moteur de traduction du réseau social Vibe. On te donne un message privé. " +
          "1) Détecte sa langue d'origine. " +
          `2) Traduis-le fidèlement en ${langLabel(targetLang)} (ou en ${langLabel(altTargetRaw)} s'il est déjà rédigé en ${langLabel(targetLang)}) : sens EXACT, ton préservé. ` +
          "Conserve les mentions @, émojis et liens tels quels. " +
          'Réponds UNIQUEMENT par un objet JSON strict : {"detected_language": "<langue d\'origine en français>", "target_language": "<langue cible>", "translation": "<traduction>"} — sans markdown ni commentaire.';
        const sqlRaw = getDb();
        const raw = await MAIAgentFleet.callOpenRouter(userId, systemRaw, rawText);
        if (!raw) return c.json({ error: "mAI est indisponible pour le moment (modèle ou clé IA)." }, 502);
        await debitWeeklyTokens(sqlRaw, userId, rawText.length + raw.length);
        const parsedRaw = extractJsonObject(raw);
        let detectedRaw = "";
        let translationRaw = "";
        let effectiveTargetRaw = targetLang;
        if (parsedRaw && typeof parsedRaw.translation === "string" && parsedRaw.translation.trim()) {
          detectedRaw = String(parsedRaw.detected_language || "").trim();
          translationRaw = cleanLlmText(parsedRaw.translation);
          if (parsedRaw.target_language && String(parsedRaw.target_language).toLowerCase().includes("anglais")) {
            effectiveTargetRaw = "EN-US";
          }
        } else {
          translationRaw = cleanLlmText(raw);
        }
        if (!translationRaw) return c.json({ error: "Traduction vide." }, 502);
        return c.json({ success: true, translation: translationRaw, detected_language: detectedRaw, target_lang: effectiveTargetRaw, cached: false });
      }

      const sql = getDb();
      await ensureTranslationsTable().catch(() => {});

      // 1. Cache : traduction déjà générée pour ce post + langue cible
      try {
        const cachedRows = await sql`
          SELECT translation, detected_language FROM post_translations
          WHERE post_id = ${postId}::uuid AND target_lang = ${targetLang}
          LIMIT 1
        `;
        if (cachedRows.length > 0) {
          return c.json({
            success: true,
            translation: cachedRows[0].translation,
            detected_language: cachedRows[0].detected_language || "",
            cached: true,
          });
        }
      } catch {}

      // 2. Génération : détection de langue + traduction en un seul appel
      const postRows = await sql`SELECT content FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
      if (postRows.length === 0) return c.json({ error: "Publication introuvable." }, 404);
      const content = String(postRows[0].content || "").trim();
      if (!content) return c.json({ error: "Publication vide." }, 400);

      const altTarget = targetLang.slice(0, 2) === "FR" ? "EN-US" : "FR";
      const system =
        "Tu es le moteur de traduction du réseau social Vibe. On te donne une publication. " +
        "1) Détecte sa langue d'origine. " +
        `2) Traduis-la fidèlement en ${langLabel(targetLang)} (ou en ${langLabel(altTarget)} si elle est déjà rédigée en ${langLabel(targetLang)}) : sens EXACT, ton préservé, ton naturel de réseau social. ` +
        "Conserve les hashtags, mentions @, émojis et liens tels quels (ne les traduis pas). " +
        'Réponds UNIQUEMENT par un objet JSON strict : {"detected_language": "<nom de la langue d\'origine en français>", "target_language": "<nom de la langue cible>", "translation": "<traduction>"} — sans guillemets markdown ni commentaire.';

      const raw = await MAIAgentFleet.callOpenRouter(userId, system, content);
      if (!raw) return c.json({ error: "mAI est indisponible pour le moment (modèle ou clé IA)." }, 502);

      await debitWeeklyTokens(sql, userId, content.length + raw.length);

      const parsed = extractJsonObject(raw);
      let detected = "";
      let translation = "";
      let effectiveTarget = targetLang;
      if (parsed && typeof parsed.translation === "string" && parsed.translation.trim()) {
        detected = String(parsed.detected_language || "").trim();
        translation = cleanLlmText(parsed.translation);
        if (parsed.target_language && String(parsed.target_language).toLowerCase().includes("anglais")) {
          effectiveTarget = "EN-US";
        }
      } else {
        // Repli : la réponse entière est la traduction
        translation = cleanLlmText(raw);
      }
      if (!translation) return c.json({ error: "Traduction vide." }, 502);

      // 3. Mise en cache (traductions exactes réutilisables, coût amorti)
      try {
        await sql`
          INSERT INTO post_translations (post_id, target_lang, detected_language, translation)
          VALUES (${postId}::uuid, ${effectiveTarget}, ${detected}, ${translation})
          ON CONFLICT (post_id, target_lang) DO UPDATE SET translation = EXCLUDED.translation, detected_language = EXCLUDED.detected_language
        `;
      } catch {}

      return c.json({ success: true, translation, detected_language: detected, target_lang: effectiveTarget, cached: false });
    } catch (err: any) {
      console.error("[vibe-ai] Translate error:", err);
      return c.json({ error: err?.message || "Erreur traduction mAI." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/ai/translate", "/vibe/ai/translate", "/v1/ai/translate", "/ai/translate"], handleTranslate);
}
