import type { Hono } from "npm:hono@4";

export interface YouSearchHit {
  description?: string;
  page_age?: string;
  snippets?: string[];
  title?: string;
  url?: string;
}

export interface YouSearchResponse {
  hits?: YouSearchHit[];
  results?: Array<{
    title: string;
    url: string;
    description: string;
    snippets?: string[];
  }>;
}

/**
 * Récupère les clés You.com configurées pour le triple fallback.
 */
function getYouApiKeys(): string[] {
  const keys: string[] = [];
  const getEnv = (name: string): string | undefined => {
    if (typeof Deno !== "undefined" && Deno.env) {
      return Deno.env.get(name);
    }
    if (typeof process !== "undefined" && process.env) {
      return process.env[name];
    }
  };

  const k1 = getEnv("YOU_API_KEY") || getEnv("YOU_API_KEY_1");
  const k2 = getEnv("YOU_API_KEY_2");
  const k3 = getEnv("YOU_API_KEY_3");

  if (k1) {
    keys.push(k1.trim());
  }
  if (k2) {
    keys.push(k2.trim());
  }
  if (k3) {
    keys.push(k3.trim());
  }

  return keys;
}

/**
 * Exécute une recherche Web via l'API You.com avec triple fallback automatique.
 */
export async function executeWebSearch(
  query: string,
  count = 5
): Promise<{
  success: boolean;
  query: string;
  results: Array<{ title: string; url: string; snippet: string }>;
  provider: string;
  error?: string;
}> {
  const trimmedQuery = (query || "").trim();
  if (!trimmedQuery) {
    return {
      error: "La requête de recherche est vide.",
      provider: "you.com",
      query: "",
      results: [],
      success: false,
    };
  }

  const keys = getYouApiKeys();
  if (keys.length === 0) {
    console.warn("[WebSearch] Aucune clé YOU_API_KEY configurée.");
    return {
      error:
        "Service de recherche temporairement non configuré (clés API You.com manquantes).",
      provider: "you.com",
      query: trimmedQuery,
      results: [],
      success: false,
    };
  }

  let lastError: any = null;

  // Tentative avec triple fallback séquentiel
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const keyLabel = `YOU_API_KEY_${i + 1}`;

    try {
      // Endpoint standard You.com Search API (ydc-index ou api.you.com)
      const url = `https://api.ydc-index.io/search?query=${encodeURIComponent(trimmedQuery)}&count=${count}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "X-API-Key": key,
        },
        method: "GET",
      });

      if (res.ok) {
        const data: YouSearchResponse = await res.json();
        const rawHits = data.hits || data.results || [];
        const formattedResults = rawHits.map((hit) => ({
          snippet:
            hit.snippets && hit.snippets.length > 0
              ? hit.snippets.join(" ... ")
              : hit.description || "",
          title: hit.title || "Sans titre",
          url: hit.url || "",
        }));

        return {
          provider: "you.com",
          query: trimmedQuery,
          results: formattedResults,
          success: true,
        };
      }

      const status = res.status;
      const errBody = await res.text().catch(() => "");
      console.warn(
        `[WebSearch] Échec ${keyLabel} (HTTP ${status}): ${errBody.slice(0, 150)}`
      );
      lastError = new Error(`HTTP ${status}: ${errBody}`);
    } catch (err: any) {
      console.warn(`[WebSearch] Erreur réseau avec ${keyLabel}:`, err.message);
      lastError = err;
    }
  }

  return {
    error: `Échec de la recherche après tentative sur toutes les clés You.com (${lastError?.message || "Erreur inconnue"}).`,
    provider: "you.com",
    query: trimmedQuery,
    results: [],
    success: false,
  };
}

/**
 * Définition standard de l'outil web_search pour les IA compatibles Tool Calling.
 */
export const WEB_SEARCH_TOOL = {
  function: {
    description:
      "Recherche sur le Web des informations récentes et actualisées en temps réel via You.com.",
    name: "web_search",
    parameters: {
      properties: {
        query: {
          description: "La requête de recherche textuelle complète et précise.",
          type: "string",
        },
      },
      required: ["query"],
      type: "object",
    },
  },
  type: "function" as const,
};

/**
 * Vérifie si la recherche web doit être activée ou désactivée sur un appel API.
 * Activée par défaut, désactivable via { "web_search": false } dans le body
 * ou via l'en-tête HTTP 'x-web-search: false' / 'x-disable-web-search: true'.
 */
export function isWebSearchEnabled(body: any, reqHeaders?: Headers): boolean {
  if (body && (body.web_search === false || body.enable_web_search === false)) {
    return false;
  }
  if (reqHeaders) {
    const headerVal =
      reqHeaders.get("x-web-search") || reqHeaders.get("X-Web-Search");
    if (headerVal && headerVal.toLowerCase() === "false") {
      return false;
    }
    const disableHeader =
      reqHeaders.get("x-disable-web-search") ||
      reqHeaders.get("X-Disable-Web-Search");
    if (
      disableHeader &&
      (disableHeader.toLowerCase() === "true" || disableHeader === "1")
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Enregistrement des routes de recherche Web dans Hono.
 */
export function registerWebRoutes(app: Hono) {
  // POST /v1/web/search
  app.post("/v1/web/search", async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const query = body.query || body.q;
      const count = typeof body.count === "number" ? body.count : 5;

      if (!query || typeof query !== "string") {
        return c.json({ error: "Le paramètre 'query' est obligatoire." }, 400);
      }

      const searchResult = await executeWebSearch(query, count);
      return c.json(searchResult, searchResult.success ? 200 : 502);
    } catch {
      return c.json({ error: "Erreur serveur lors de la recherche Web." }, 500);
    }
  });

  // GET /v1/web/search
  app.get("/v1/web/search", async (c) => {
    const query = c.req.query("q") || c.req.query("query");
    const countParam = c.req.query("count");
    const count = countParam ? Number.parseInt(countParam, 10) : 5;

    if (!query) {
      return c.json({ error: "Paramètre 'q' ou 'query' manquant." }, 400);
    }

    const searchResult = await executeWebSearch(
      query,
      isNaN(count) ? 5 : count
    );
    return c.json(searchResult, searchResult.success ? 200 : 502);
  });
}
