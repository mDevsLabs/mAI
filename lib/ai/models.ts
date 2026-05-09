/**
 * Modèles de chat pour mAI — Multi-providers
 * Catégories : AI Gateway, FranceStudent, AI Horde
 * 
 * @version 0.0.2
 */

// Modèle de chat par défaut — FranceStudent GPT-5.5
export const DEFAULT_CHAT_MODEL = "gpt-5.5";

// Modèle utilisé pour la génération de titres
export const titleModel = {
  id: "mistral/mistral-small",
  name: "Mistral Small",
  provider: "mistral",
  description: "Modèle rapide pour la génération de titres",
  gatewayOrder: ["mistral"],
};

// Capacités d'un modèle
export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

// Catégorie de provider
export type ModelCategory = "ai-gateway" | "francestudent" | "ai-horde";

// Type d'un modèle de chat
export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: ModelCategory;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

// ──────────────────────────────────────────────
// MODÈLES AI GATEWAY (Vercel AI Gateway)
// ──────────────────────────────────────────────
export const aiGatewayModels: ChatModel[] = [
  // DeepSeek V3.2 → priorité FranceStudent (supprimé ici)
  // Kimi K2.5 → priorité FranceStudent (supprimé ici)
  // GPT OSS 120B → priorité FranceStudent (supprimé ici)
  {
    id: "mistral/codestral",
    name: "Codestral",
    provider: "mistral",
    description: "Modèle orienté code avec support d'outils",
    category: "ai-gateway",
    gatewayOrder: ["mistral"],
  },
  {
    id: "mistral/mistral-small",
    name: "Mistral Small",
    provider: "mistral",
    description: "Modèle vision rapide avec support d'outils",
    category: "ai-gateway",
    gatewayOrder: ["mistral"],
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "openai",
    description: "Modèle de raisonnement compact",
    category: "ai-gateway",
    gatewayOrder: ["groq", "bedrock"],
    reasoningEffort: "low",
  },
  {
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    provider: "xai",
    description: "Modèle rapide sans raisonnement avec outils",
    category: "ai-gateway",
    gatewayOrder: ["xai"],
  },
];

// ──────────────────────────────────────────────
// MODÈLES FRANCESTUDENT (Compatible SDK OpenAI)
// ──────────────────────────────────────────────
export const franceStudentModels: ChatModel[] = [
  {
    id: "DeepSeek-V3.2",
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    description: "Modèle DeepSeek via FranceStudent",
    category: "francestudent",
  },
  {
    id: "FW-GLM-5",
    name: "FW-GLM 5",
    provider: "xAi",
    description: "Modèle GLM-5 via FranceStudent",
    category: "francestudent",
  },
  {
    id: "gpt-5.2",
    name: "GPT 5.2",
    provider: "openai",
    description: "GPT 5.2 via FranceStudent",
    category: "francestudent",
  },
  {
    id: "gpt-5.4",
    name: "GPT 5.4",
    provider: "openai",
    description: "GPT 5.4 via FranceStudent",
    category: "francestudent",
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT 5.4 Mini",
    provider: "openai",
    description: "GPT 5.4 Mini — version compacte",
    category: "francestudent",
  },
  {
    id: "gpt-5.4-nano",
    name: "GPT 5.4 Nano",
    provider: "openai",
    description: "GPT 5.4 Nano — version ultra-légère",
    category: "francestudent",
  },
  {
    id: "gpt-5.5",
    name: "GPT 5.5",
    provider: "openai",
    description: "GPT 5.5 — modèle phare FranceStudent",
    category: "francestudent",
  },
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "openai",
    description: "GPT open-source 120B via FranceStudent",
    category: "francestudent",
  },
  {
    id: "Kimi-K2.5",
    name: "Kimi K2.5",
    provider: "Kimi",
    description: "Kimi K2.5 via FranceStudent",
    category: "francestudent",
  },
  {
    id: "Mistral-Large-3",
    name: "Mistral Large 3",
    provider: "Mistral",
    description: "Mistral Large 3 via FranceStudent",
    category: "francestudent",
  },
];

// ──────────────────────────────────────────────
// MODÈLES AI HORDE (Texte)
// ──────────────────────────────────────────────
export const aiHordeTextModels: ChatModel[] = [
  {
    id: "aphrodite/Sao10K/L3-8B-Stheno-v3.2",
    name: "L3 8B Stheno v3.2",
    provider: "aphrodite",
    description: "Modèle Stheno 8B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "aphrodite/TheDrummer/Behemoth-R1-123B-v2-w4a16",
    name: "Behemoth R1 123B v2",
    provider: "aphrodite",
    description: "Modèle Behemoth 123B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "aphrodite/TheDrummer/Behemoth-X-123B-v2.1",
    name: "Behemoth X 123B v2.1",
    provider: "aphrodite",
    description: "Modèle Behemoth X 123B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "aphrodite/TheDrummer/Cydonia-24B-v4.3",
    name: "Cydonia 24B v4.3",
    provider: "aphrodite",
    description: "Modèle Cydonia 24B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "aphrodite/TheDrummer/Skyfall-31B-v4.1",
    name: "Skyfall 31B v4.1",
    provider: "aphrodite",
    description: "Modèle Skyfall 31B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Angelic_Eclipse_12B",
    name: "Angelic Eclipse 12B",
    provider: "koboldcpp",
    description: "Modèle Angelic Eclipse 12B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/anthracite-org/magnum-v2-4b",
    name: "Magnum v2 4B",
    provider: "koboldcpp",
    description: "Modèle Magnum v2 4B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Artemis-31B-v1g-Q4_K_M",
    name: "Artemis 31B v1g",
    provider: "koboldcpp",
    description: "Modèle Artemis 31B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Cydonia-24B-v4.3",
    name: "Cydonia 24B v4.3 (KoboldCpp)",
    provider: "koboldcpp",
    description: "Modèle Cydonia 24B via KoboldCpp",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Dark-Nexus-24B-v2.0.i1-Q5_K_M",
    name: "Dark Nexus 24B v2.0",
    provider: "koboldcpp",
    description: "Modèle Dark Nexus 24B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/digo-prayudha/unsloth-llama-3.2-1b-gguf",
    name: "Llama 3.2 1B (Unsloth)",
    provider: "koboldcpp",
    description: "Llama 3.2 1B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/gemma-4-26B-A4B-it-abliterix-v6.i1-Q4_K_S",
    name: "Gemma 4 26B A4B",
    provider: "koboldcpp",
    description: "Gemma 4 26B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Gemma-4-31B-it",
    name: "Gemma 4 31B IT",
    provider: "koboldcpp",
    description: "Gemma 4 31B Instruction-Tuned via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/gemma-4-E2B-it-ARA-heresy.i1-Q6",
    name: "Gemma 4 E2B ARA",
    provider: "koboldcpp",
    description: "Gemma 4 E2B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive",
    name: "Gemma 4 E4B Uncensored",
    provider: "koboldcpp",
    description: "Gemma 4 E4B non censuré via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Impish_Magic_24B",
    name: "Impish Magic 24B",
    provider: "koboldcpp",
    description: "Modèle Impish Magic 24B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Judas-Uncensored-3.2-1B.Q8",
    name: "Judas Uncensored 1B",
    provider: "koboldcpp",
    description: "Modèle Judas 1B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/KobbleTiny-1.1B",
    name: "KobbleTiny 1.1B",
    provider: "koboldcpp",
    description: "Modèle KobbleTiny 1.1B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/L3-8B-Stheno-v3.2",
    name: "L3 8B Stheno v3.2 (KoboldCpp)",
    provider: "koboldcpp",
    description: "Modèle Stheno 8B via KoboldCpp",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/L3-Super-Nova-RP-8B",
    name: "L3 Super Nova RP 8B",
    provider: "koboldcpp",
    description: "Modèle Super Nova RP 8B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Llama-3SOME-8B-v2-Q4_K_M",
    name: "Llama 3SOME 8B v2",
    provider: "koboldcpp",
    description: "Modèle Llama 3SOME 8B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Magidonia-24B-v4.3",
    name: "Magidonia 24B v4.3",
    provider: "koboldcpp",
    description: "Modèle Magidonia 24B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/mini-magnum-12b-v1.1",
    name: "Mini Magnum 12B v1.1",
    provider: "koboldcpp",
    description: "Modèle Mini Magnum 12B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/mradermacher/Cerebras-GPT-111M-instruction-GGUF",
    name: "Cerebras GPT 111M",
    provider: "koboldcpp",
    description: "Modèle Cerebras GPT 111M via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/mradermacher/pythia-70m-deduped.f16.gguf",
    name: "Pythia 70M",
    provider: "koboldcpp",
    description: "Modèle Pythia 70M via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/pygmalion-2-7b.Q4_K_M",
    name: "Pygmalion 2 7B",
    provider: "koboldcpp",
    description: "Modèle Pygmalion 2 7B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Qwen3.5-397B-A17B-K_G_2.93",
    name: "Qwen 3.5 397B",
    provider: "koboldcpp",
    description: "Modèle Qwen 3.5 397B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Qwen3.5-4B.Q5_K_M",
    name: "Qwen 3.5 4B",
    provider: "koboldcpp",
    description: "Modèle Qwen 3.5 4B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Qwen3VL-8B-Instruct-Q4_K_M",
    name: "Qwen 3 VL 8B",
    provider: "koboldcpp",
    description: "Modèle Qwen 3 VL 8B Instruct via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Qwen_Qwen3-0.6B-IQ4_XS",
    name: "Qwen 3 0.6B",
    provider: "koboldcpp",
    description: "Modèle Qwen 3 0.6B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/Qwen/Qwen3.5-0.8B",
    name: "Qwen 3.5 0.8B",
    provider: "koboldcpp",
    description: "Modèle Qwen 3.5 0.8B via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/tencent/HY-MT1.5-1.8B",
    name: "HY-MT 1.5 1.8B",
    provider: "koboldcpp",
    description: "Modèle Tencent HY-MT via AI Horde",
    category: "ai-horde",
  },
  {
    id: "koboldcpp/WizzGPTv8",
    name: "WizzGPT v8",
    provider: "koboldcpp",
    description: "Modèle WizzGPT v8 via AI Horde",
    category: "ai-horde",
  },
  {
    id: "slm/testing-Kai-0.35B-Instruct.Q8_0.gguf",
    name: "Kai 0.35B Instruct",
    provider: "slm",
    description: "Modèle SLM Kai 0.35B via AI Horde",
    category: "ai-horde",
  },
];

// ──────────────────────────────────────────────
// AGRÉGATION DE TOUS LES MODÈLES
// ──────────────────────────────────────────────

// Tous les modèles de chat combinés
export const chatModels: ChatModel[] = [
  ...franceStudentModels,
  ...aiGatewayModels,
  ...aiHordeTextModels,
];

// Ensemble des IDs de modèles autorisés (FranceStudent + AI Gateway)
export const allowedModelIds = new Set(
  [...franceStudentModels, ...aiGatewayModels].map((m) => m.id)
);

// Modèles groupés par provider
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

// Modèles groupés par catégorie
export const modelsByCategory = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  },
  {} as Record<ModelCategory, ChatModel[]>
);

// Retourne les modèles actifs
export function getActiveModels(): ChatModel[] {
  return chatModels;
}

// Détermine la catégorie d'un modèle à partir de son ID
export function getModelCategory(modelId: string): ModelCategory {
  const model = chatModels.find((m) => m.id === modelId);
  return model?.category ?? "francestudent";
}

// ──────────────────────────────────────────────
// CAPACITÉS (AI Gateway uniquement)
// ──────────────────────────────────────────────

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  // Capacités pour les modèles AI Gateway
  const gatewayResults = await Promise.all(
    aiGatewayModels.map(async (model) => {
      try {
        const res = await fetch(
          `https://ai-gateway.vercel.sh/v1/models/${model.id}/endpoints`,
          { next: { revalidate: 86_400 } }
        );
        if (!res.ok) {
          return [model.id, { tools: false, vision: false, reasoning: false }];
        }

        const json = await res.json();
        const endpoints = json.data?.endpoints ?? [];
        const params = new Set(
          endpoints.flatMap(
            (e: { supported_parameters?: string[] }) =>
              e.supported_parameters ?? []
          )
        );
        const inputModalities = new Set(
          json.data?.architecture?.input_modalities ?? []
        );

        return [
          model.id,
          {
            tools: params.has("tools"),
            vision: inputModalities.has("image"),
            reasoning: params.has("reasoning"),
          },
        ];
      } catch {
        return [model.id, { tools: false, vision: false, reasoning: false }];
      }
    })
  );

  // Capacités par défaut pour FranceStudent (compatible OpenAI → tools + vision)
  const fsResults = franceStudentModels.map((model) => [
    model.id,
    { tools: true, vision: false, reasoning: false },
  ]);

  // Capacités par défaut pour AI Horde (pas de tools)
  const hordeResults = aiHordeTextModels.map((model) => [
    model.id,
    { tools: false, vision: false, reasoning: false },
  ]);

  return Object.fromEntries([...gatewayResults, ...fsResults, ...hordeResults]);
}

export const isDemo = process.env.IS_DEMO === "1";

type GatewayModel = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
};

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  try {
    const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      next: { revalidate: 86_400 },
    });
    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return (json.data ?? [])
      .filter((m: GatewayModel) => m.type === "language")
      .map((m: GatewayModel) => ({
        id: m.id,
        name: m.name,
        provider: m.id.split("/")[0],
        description: "",
        category: "ai-gateway" as ModelCategory,
        capabilities: {
          tools: m.tags?.includes("tool-use") ?? false,
          vision: m.tags?.includes("vision") ?? false,
          reasoning: m.tags?.includes("reasoning") ?? false,
        },
      }));
  } catch {
    return [];
  }
}
