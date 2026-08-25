export interface YouSearchHit {
  title?: string;
  url?: string;
  description?: string;
  snippets?: string[];
  page_age?: string;
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

export function getYouApiKeys(): string[] {
  const keys: string[] = [];
  const getEnv = (name: string): string | undefined => {
    if (typeof process !== "undefined" && process.env) {
      return process.env[name];
    }
    return undefined;
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

  // 1. Essai Google News RSS
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

  // 2. Essai Bing News RSS
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

  // 3. Essai Wikipedia Search API
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

export async function executeWebSearch(query: string, count: number = 5): Promise<{
  success: boolean;
  query: string;
  results: Array<{ title: string; url: string; snippet: string }>;
  provider: string;
  error?: string;
}> {
  const trimmedQuery = (query || "").trim();
  if (!trimmedQuery) {
    return {
      success: false,
      query: "",
      results: [],
      provider: "you.com",
      error: "La requête de recherche est vide.",
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
                  success: true,
                  query: trimmedQuery,
                  results: formattedResults,
                  provider: "you.com",
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

  // 2. Fallback automatique
  const fallbackResults = await fallbackDuckDuckGoSearch(trimmedQuery, count);
  if (fallbackResults.length > 0) {
    return {
      success: true,
      query: trimmedQuery,
      results: fallbackResults,
      provider: "duckduckgo (fallback)",
    };
  }

  return {
    success: false,
    query: trimmedQuery,
    results: [],
    provider: "you.com",
    error: keys.length === 0
      ? "Aucune clé You.com configurée et le fallback n'a pas pu aboutir."
      : `Échec de la recherche après tentative sur toutes les clés You.com (${lastError?.message || "Erreur inconnue"}).`,
  };
}

export const WEB_SEARCH_TOOL = {
  type: "function" as const,
  function: {
    name: "web_search",
    description: "Recherche sur le Web des informations récentes et actualisées en temps réel via You.com.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "La requête de recherche textuelle complète et précise.",
        },
      },
      required: ["query"],
    },
  },
};
