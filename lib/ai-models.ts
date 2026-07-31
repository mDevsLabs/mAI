export interface AIModel {
  id: string;
  name: string;
  provider?: string;
  maxContext: number;
  maxOutput: number;
}

/**
 * Récupère la liste des modèles depuis OpenRouter API.
 * - Filtre les modèles dont l'id commence par `openrouter/`
 * - Ne conserve que les modèles avec une sortie texte
 * - Supprime les paramètres inutiles (input_price, temperature, pricing, etc.)
 * - Si `isFreeTier` est vrai, conserve uniquement les modèles contenant `:free` dans leur id.
 */
export async function fetchOpenRouterModels(isFreeTier: boolean = false): Promise<AIModel[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Erreur API OpenRouter: ${res.statusText}`);
    }

    const data = await res.json();
    const rawModels: any[] = data.data || [];

    const filtered: AIModel[] = rawModels
      .filter((m) => m && m.id && !m.id.startsWith("openrouter/"))
      .filter((m) => {
        const modality = m.architecture?.modality || "";
        const outputModalities = m.architecture?.output_modalities || [];
        return (
          outputModalities.includes("text") ||
          modality.endsWith("text") ||
          modality.includes("->text")
        );
      })
      .map((m) => ({
        id: m.id,
        name: m.name || m.id,
        provider: m.id.split("/")[0] || "mAI",
        maxContext: m.context_length || 128000,
        maxOutput: m.top_provider?.max_completion_tokens || 4096,
      }));

    if (isFreeTier) {
      return filtered.filter((m) => m.id.includes(":free"));
    }

    return filtered;
  } catch (error) {
    console.error("Erreur lors de la récupération des modèles OpenRouter:", error);
    return [];
  }
}

// Export de secours synchrone pour la rétrocompatibilité (chargé dynamiquement ou liste vide par défaut)
export const openRouterModels: AIModel[] = [
  { id: "google/gemini-2.5-flash:free", name: "Gemini 2.5 Flash (free)", provider: "google", maxContext: 1048576, maxOutput: 65535 },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct (free)", provider: "meta-llama", maxContext: 131072, maxOutput: 128000 },
  { id: "qwen/qwen-2.5-coder-32b-instruct:free", name: "Qwen 2.5 Coder 32B (free)", provider: "qwen", maxContext: 32768, maxOutput: 8192 },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (free)", provider: "deepseek", maxContext: 163840, maxOutput: 16000 },
];

export const maiModels: AIModel[] = [];
