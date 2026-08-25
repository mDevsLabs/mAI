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

  const k1 = getEnv("YOU_API_KEY") || getEnv("YOU_API_KEY_1");
  const k2 = getEnv("YOU_API_KEY_2");
  const k3 = getEnv("YOU_API_KEY_3");

  if (k1) keys.push(k1.trim());
  if (k2) keys.push(k2.trim());
  if (k3) keys.push(k3.trim());

  return keys;
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
  if (keys.length === 0) {
    return {
      success: false,
      query: trimmedQuery,
      results: [],
      provider: "you.com",
      error: "Service de recherche temporairement non configuré (clés API You.com manquantes).",
    };
  }

  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const keyLabel = `YOU_API_KEY_${i + 1}`;

    try {
      const url = `https://api.ydc-index.io/search?query=${encodeURIComponent(trimmedQuery)}&count=${count}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-API-Key": key,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data: YouSearchResponse = await res.json();
        const rawHits = data.hits || data.results || [];
        const formattedResults = rawHits.map((hit) => ({
          title: hit.title || "Sans titre",
          url: hit.url || "",
          snippet:
            hit.snippets && hit.snippets.length > 0
              ? hit.snippets.join(" ... ")
              : hit.description || "",
        }));

        return {
          success: true,
          query: trimmedQuery,
          results: formattedResults,
          provider: "you.com",
        };
      }

      const status = res.status;
      const errBody = await res.text().catch(() => "");
      console.warn(`[WebSearch] Échec ${keyLabel} (HTTP ${status}): ${errBody.slice(0, 150)}`);
      lastError = new Error(`HTTP ${status}: ${errBody}`);
    } catch (err: any) {
      console.warn(`[WebSearch] Erreur réseau avec ${keyLabel}:`, err.message);
      lastError = err;
    }
  }

  return {
    success: false,
    query: trimmedQuery,
    results: [],
    provider: "you.com",
    error: `Échec de la recherche après tentative sur toutes les clés You.com (${lastError?.message || "Erreur inconnue"}).`,
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
