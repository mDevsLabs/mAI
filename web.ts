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

  const candidateKeys = [
    getEnv("YOU_API_KEY"),
    getEnv("YOU_API_KEY_1"),
    getEnv("YOU_API_KEY_2"),
    getEnv("YOU_API_KEY_3"),
    getEnv("YDC_API_KEY"),
  ];

  for (const k of candidateKeys) {
    if (k && k.trim() && !keys.includes(k.trim())) {
      keys.push(k.trim());
    }
  }

  return keys;
}

/**
 * Fallback Web Universel (Google News RSS, Bing News RSS, Wikipedia & DDG)
 */
async function fallbackWebSearch(query: string, count = 5): Promise<Array<{ title: string; url: string; snippet: string }>> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  // 1. Essai Google News RSS (Ultra-rapide, mondial, temps réel, aucune clé requise)
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`;
    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, text/xml, */*",
      },
    });

    if (res.ok) {
      const xml = await res.text();
      const items = xml.split("<item>");
      for (let i = 1; i < items.length && results.length < count; i++) {
        const block = items[i].split("</item>")[0];
        const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i) || block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
        const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i);

        let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, "$1").replace(/<[^>]+>/g, "").trim() : "";
        let link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, "$1").trim() : "";
        let snippet = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, "$1").replace(/<[^>]+>/g, "").trim() : title;

        if (title && link) {
          results.push({
            title,
            url: link,
            snippet: snippet || title,
          });
        }
      }

      if (results.length > 0) return results;
    }
  } catch (err) {
    console.warn("[WebSearch] Fallback Google News RSS failed:", err);
  }

  // 2. Essai Bing News RSS (Fallback de secours)
  try {
    const bingRssUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`;
    const res = await fetch(bingRssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/rss+xml, text/xml, */*",
      },
    });

    if (res.ok) {
      const xml = await res.text();
      const items = xml.split("<item>");
      for (let i = 1; i < items.length && results.length < count; i++) {
        const block = items[i].split("</item>")[0];
        const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
        const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i);

        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
        const link = linkMatch ? linkMatch[1].trim() : "";
        const snippet = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : title;

        if (title && link) {
          results.push({
            title,
            url: link,
            snippet: snippet || title,
          });
        }
      }

      if (results.length > 0) return results;
    }
  } catch (err) {
    console.warn("[WebSearch] Fallback Bing RSS failed:", err);
  }

  // 3. Essai Wikipedia API
  try {
    const lang = /[éèàùçâêîôû]/i.test(query) ? "fr" : "en";
    const wikiUrl = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${count}&namespace=0&format=json`;
    const res = await fetch(wikiUrl, {
      headers: {
        "User-Agent": "mAI-WebSearch-Agent/1.0 (https://m-ai.fr; contact@m-ai.fr)",
      },
    });
    if (res.ok) {
      const data = await res.json();
      const titles = data[1] || [];
      const descriptions = data[2] || [];
      const urls = data[3] || [];
      for (let i = 0; i < titles.length && results.length < count; i++) {
        if (urls[i]) {
          results.push({
            title: titles[i],
            url: urls[i],
            snippet: descriptions[i] || `Article Wikipedia sur ${titles[i]}`,
          });
        }
      }
      if (results.length > 0) return results;
    }
  } catch (err) {
    console.warn("[WebSearch] Fallback Wikipedia failed:", err);
  }

  return results;
}

/**
 * Exécute une recherche Web via l'API You.com avec triple fallback automatique et fallback multi-sources.
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
  let lastError: any = null;

  // 1. Tentative avec les clés You.com (POST https://ydc-index.io/v1/search conforme à l'API You.com)
  if (keys.length > 0) {
    const endpoints = [
      "https://ydc-index.io/v1/search",
      "https://api.ydc-index.io/v1/search",
      "https://api.ydc-index.io/search",
    ];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const keyLabel = `YOU_API_KEY_${i + 1}`;

      for (const endpointUrl of endpoints) {
        try {
          const res = await fetch(endpointUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": key,
              "Accept": "application/json",
              "User-Agent": "mAI-WebSearch/1.0",
            },
            body: JSON.stringify({
              query: trimmedQuery,
              count,
            }),
          });

          if (res.ok) {
            const data: any = await res.json().catch(() => null);
            if (data) {
              // Support complet des structures You.com v1 :
              // 1. data.results.web & data.results.news (Format officiel v1)
              // 2. data.results (Array direct)
              // 3. data.hits / data.web.results
              let rawHits: any[] = [];
              if (data.results && typeof data.results === "object") {
                if (Array.isArray(data.results)) {
                  rawHits = data.results;
                } else {
                  if (Array.isArray(data.results.web)) rawHits.push(...data.results.web);
                  if (Array.isArray(data.results.news)) rawHits.push(...data.results.news);
                }
              } else if (Array.isArray(data.hits)) {
                rawHits = data.hits;
              } else if (Array.isArray(data.web?.results)) {
                rawHits = data.web.results;
              }

              const formattedResults = rawHits.map((hit: any) => {
                let snippet = "";
                if (hit.contents?.markdown) {
                  snippet = hit.contents.markdown.slice(0, 300);
                } else if (hit.snippets && Array.isArray(hit.snippets) && hit.snippets.length > 0) {
                  snippet = hit.snippets.join(" ... ");
                } else {
                  snippet = hit.description || hit.snippet || hit.text || "";
                }

                return {
                  snippet: snippet.trim(),
                  title: hit.title || hit.name || "Sans titre",
                  url: hit.url || hit.link || "",
                };
              }).filter((item: any) => item.title && item.url);

              if (formattedResults.length > 0) {
                return {
                  provider: "you.com",
                  query: trimmedQuery,
                  results: formattedResults,
                  success: true,
                };
              }
            }
          }

          const status = res.status;
          const errBody = await res.text().catch(() => "");
          lastError = new Error(`HTTP ${status}: ${errBody}`);
        } catch (err: any) {
          lastError = err;
        }
      }
    }
  }

  // 2. Fallback automatique multi-moteurs (DDG Lite / Instant / Wikipedia)
  const fallbackResults = await fallbackWebSearch(trimmedQuery, count);
  if (fallbackResults.length > 0) {
    return {
      provider: "duckduckgo (fallback)",
      query: trimmedQuery,
      results: fallbackResults,
      success: true,
    };
  }

  return {
    error: keys.length === 0
      ? "Aucune clé You.com configurée et les services de fallback sont temporairement inaccessibles."
      : `Échec de la recherche (${lastError?.message || "Erreur"}).`,
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
      return c.json(searchResult, 200);
    } catch (err: any) {
      return c.json({ error: "Erreur serveur lors de la recherche Web.", details: err?.message }, 500);
    }
  });

  // GET /v1/web/search
  app.get("/v1/web/search", async (c) => {
    try {
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
      return c.json(searchResult, 200);
    } catch (err: any) {
      return c.json({ error: "Erreur serveur lors de la recherche Web.", details: err?.message }, 500);
    }
  });
}

