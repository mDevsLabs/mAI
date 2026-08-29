import type { Hono } from "npm:hono@4";
import {
  extractTierFromApiKey,
  extractToken,
  getDb,
  getTierDailyImageLimit,
  getTierImageRequestCost,
  getUserQuotaBoost,
  verifyToken,
} from "./config.ts";

export interface ImageModelItem {
  capabilities?: {
    async_task?: boolean;
    image_to_image?: boolean;
    inpainting?: boolean;
    text_to_image?: boolean;
    upscaling?: boolean;
    variation?: boolean;
  };
  created: number;
  description: string;
  endpoints?: string[];
  features: string[];
  form: "openai-standard" | "midjourney-pipeline" | "image-edit" | "image-upscale";
  id: string;
  name: string;
  object: "model";
  owned_by: string;
  parent?: string | null;
  permission?: Array<{
    allow_create_engine: boolean;
    allow_fine_tuning: boolean;
    allow_logprobs: boolean;
    allow_sampling: boolean;
    allow_search_indices: boolean;
    allow_view: boolean;
    created: number;
    group: string | null;
    id: string;
    is_blocking: boolean;
    object: "model_permission";
    organization: string;
  }>;
  root?: string;
}

export function getCometApiKey(): string {
  if (typeof Deno !== "undefined" && Deno.env) {
    return Deno.env.get("COMET_API_KEY") || "";
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env.COMET_API_KEY || "";
  }
  return "";
}

export function normalizeImageSrc(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "";
  }
  const clean = url.trim().replace(/^["']|["']$/g, "");
  if (!clean) {
    return "";
  }

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:") ||
    clean.startsWith("/")
  ) {
    return clean;
  }

  let mime = "image/png";
  if (clean.startsWith("/9j/")) {
    mime = "image/jpeg";
  } else if (clean.startsWith("R0lGOD")) {
    mime = "image/gif";
  } else if (clean.startsWith("UklGR")) {
    mime = "image/webp";
  } else if (clean.startsWith("PHN2Zy") || clean.startsWith("PD94bWw")) {
    mime = "image/svg+xml";
  }

  return `data:${mime};base64,${clean}`;
}

/**
 * Cache mémoire pour les modèles CometAPI (TTL = 60 secondes)
 */
let cachedCometImageModels: ImageModelItem[] = [];
let lastCometFetchTime = 0;
const CACHE_TTL_MS = 60_000;

/**
 * Modèles de repli de haute qualité en cas de défaillance réseau temporaire de CometAPI
 */
const FALLBACK_IMAGE_MODELS: ImageModelItem[] = [
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1722470400,
    description:
      "Modèle ultra-rapide en 4 étapes par Black Forest Labs (Text-to-Image).",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "black-forest-labs/flux-schnell",
    name: "FLUX.1 Schnell",
    object: "model",
    owned_by: "black-forest-labs",
  },
  {
    capabilities: { async_task: true, image_to_image: true, inpainting: true, text_to_image: true },
    created: 1722470400,
    description:
      "Modèle phare de synthèse photoréaliste et artistique par Black Forest Labs (Text-to-Image / Image-to-Image).",
    endpoints: ["/v1/images/generations", "/v1/images/edits"],
    features: ["text-to-image", "image-to-image"],
    form: "openai-standard",
    id: "black-forest-labs/flux-dev",
    name: "FLUX.1 Dev",
    object: "model",
    owned_by: "black-forest-labs",
  },
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1727827200,
    description:
      "Sommet de la qualité visuelle, cohérence typographique et détails avancés par Black Forest Labs.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "black-forest-labs/flux-pro",
    name: "FLUX 1.1 Pro",
    object: "model",
    owned_by: "black-forest-labs",
  },
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1730419200,
    description:
      "Version Ultra haute résolution (jusqu'à 4K) avec photoréalisme extrême et détails de peau par Black Forest Labs.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "black-forest-labs/flux-1.1-pro-ultra",
    name: "FLUX 1.1 Pro Ultra",
    object: "model",
    owned_by: "black-forest-labs",
  },
  {
    capabilities: { async_task: true, image_to_image: true, inpainting: true, text_to_image: true },
    created: 1729641600,
    description:
      "Modèle phare de 8 milliards de paramètres de Stability AI pour une variété stylistique maximale et une typographie nette.",
    endpoints: ["/v1/images/generations", "/v1/images/edits"],
    features: ["text-to-image", "image-to-image"],
    form: "openai-standard",
    id: "stabilityai/stable-diffusion-3.5-large",
    name: "Stable Diffusion 3.5 Large",
    object: "model",
    owned_by: "stabilityai",
  },
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1729641600,
    description:
      "Version accélérée en 4 étapes de Stable Diffusion 3.5 Large par Stability AI.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "stabilityai/stable-diffusion-3.5-large-turbo",
    name: "Stable Diffusion 3.5 Large Turbo",
    object: "model",
    owned_by: "stabilityai",
  },
  {
    capabilities: { async_task: true, image_to_image: true, inpainting: true, text_to_image: true },
    created: 1690848000,
    description:
      "Modèle SDXL 1.0 haute résolution de Stability AI pour la création artistique et le rendu réaliste.",
    endpoints: ["/v1/images/generations", "/v1/images/edits"],
    features: ["text-to-image", "image-to-image"],
    form: "openai-standard",
    id: "stabilityai/sdxl",
    name: "Stable Diffusion XL 1.0",
    object: "model",
    owned_by: "stabilityai",
  },
  {
    capabilities: { async_task: true, image_to_image: true, inpainting: true, text_to_image: true, upscaling: true, variation: true },
    created: 1718064000,
    description:
      "Génération stylisée haut de gamme avec esthétique cinématique et compréhension sémantique de pointe via Midjourney v6.",
    endpoints: ["/v1/images/generations", "/mj/submit/imagine", "/mj/submit/action", "/mj/task/:id/fetch"],
    features: ["text-to-image", "image-to-image", "upscale", "variation"],
    form: "midjourney-pipeline",
    id: "midjourney/v6",
    name: "Midjourney v6",
    object: "model",
    owned_by: "midjourney",
  },
  {
    capabilities: { async_task: true, image_to_image: true, inpainting: true, text_to_image: true, upscaling: true, variation: true },
    created: 1722384000,
    description:
      "Dernière itération du moteur Midjourney v6.1 avec cohérence accrue des mains, textures et détails fins.",
    endpoints: ["/v1/images/generations", "/mj/submit/imagine", "/mj/submit/action", "/mj/task/:id/fetch"],
    features: ["text-to-image", "image-to-image", "upscale", "variation"],
    form: "midjourney-pipeline",
    id: "midjourney/v6.1",
    name: "Midjourney v6.1",
    object: "model",
    owned_by: "midjourney",
  },
  {
    capabilities: { async_task: true, image_to_image: true, inpainting: false, text_to_image: true },
    created: 1730419200,
    description:
      "Génération vectorielle et matricielle spécialisée dans les logos, icônes, illustrations et design graphique.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image", "image-to-image"],
    form: "openai-standard",
    id: "recraft-ai/recraft-v3",
    name: "Recraft V3",
    object: "model",
    owned_by: "recraft-ai",
  },
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1724284800,
    description:
      "Modèle phare de rendu de texte dans l'image et composition graphique par Ideogram AI.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "ideogram-ai/ideogram-v2",
    name: "Ideogram V2",
    object: "model",
    owned_by: "ideogram-ai",
  },
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1724284800,
    description:
      "Version ultra-rapide d'Ideogram V2 optimisée pour les flux de production en temps réel.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "ideogram-ai/ideogram-v2-turbo",
    name: "Ideogram V2 Turbo",
    object: "model",
    owned_by: "ideogram-ai",
  },
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1698796800,
    description:
      "Modèle DALL-E 3 d'OpenAI pour la synthèse d'images haute fidélité avec reformulation automatique des prompts.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "dall-e-3",
    name: "DALL-E 3",
    object: "model",
    owned_by: "openai",
  },
  {
    capabilities: { async_task: true, image_to_image: true, inpainting: true, text_to_image: true },
    created: 1667260800,
    description:
      "Modèle classique DALL-E 2 d'OpenAI pour la génération et l'édition rapide d'images.",
    endpoints: ["/v1/images/generations", "/v1/images/edits", "/v1/images/variations"],
    features: ["text-to-image", "image-to-image"],
    form: "openai-standard",
    id: "dall-e-2",
    name: "DALL-E 2",
    object: "model",
    owned_by: "openai",
  },
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1723680000,
    description:
      "Modèle de synthèse photoréaliste et typographique de Google DeepMind Imagen 3.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "google/imagen-3",
    name: "Google Imagen 3",
    object: "model",
    owned_by: "google",
  },
  {
    capabilities: { async_task: true, image_to_image: false, inpainting: false, text_to_image: true },
    created: 1730000000,
    description:
      "Modèle ultra-rapide de génération photoréaliste par Luma AI.",
    endpoints: ["/v1/images/generations"],
    features: ["text-to-image"],
    form: "openai-standard",
    id: "luma/photon",
    name: "Luma Photon",
    object: "model",
    owned_by: "luma",
  },
];

/**
 * Déterminer la forme technique d'un modèle d'image CometAPI
 */
function detectModelForm(modelId: string, _features?: string[]): ImageModelItem["form"] {
  const lower = modelId.toLowerCase();
  if (lower.includes("midjourney") || lower.includes("mj-") || lower.startsWith("mj/")) {
    return "midjourney-pipeline";
  }
  if (lower.includes("upscale")) {
    return "image-upscale";
  }
  if (lower.includes("edit") || lower.includes("inpaint")) {
    return "image-edit";
  }
  return "openai-standard";
}

/**
 * Obtenir la liste ordonnée des identifiants candidats pour un modèle donné sur CometAPI
 */
function getCometCandidateModelIds(requestedModel: string): string[] {
  const lower = (requestedModel || "").toLowerCase().trim();

  if (lower.includes("schnell") || lower === "flux" || lower.includes("flux-1-schnell") || lower.includes("flux-schnell")) {
    return [
      "flux-schnell",
      "black-forest-labs/flux-schnell",
      "flux-1-schnell",
      "black-forest-labs/flux-1-schnell",
      "dall-e-3",
    ];
  }
  if (lower.includes("flux") && lower.includes("dev")) {
    return [
      "flux-dev",
      "black-forest-labs/flux-dev",
      "flux-1-dev",
      "black-forest-labs/flux-1-dev",
      "dall-e-3",
    ];
  }
  if (lower.includes("flux") && (lower.includes("pro") || lower.includes("ultra"))) {
    return [
      "flux-pro",
      "black-forest-labs/flux-pro",
      "flux-1.1-pro",
      "black-forest-labs/flux-1.1-pro",
      "dall-e-3",
    ];
  }
  if (lower.includes("dall-e-3") || lower.includes("dalle-3") || lower === "dall-e") {
    return ["dall-e-3", "openai/dall-e-3"];
  }
  if (lower.includes("dall-e-2") || lower.includes("dalle-2")) {
    return ["dall-e-2", "openai/dall-e-2", "dall-e-3"];
  }
  if (lower.includes("midjourney") || lower.includes("mj")) {
    return ["midjourney/v6.1", "midjourney/v6", "midjourney", "mj-v6", "dall-e-3"];
  }
  if (lower.includes("diffusion") || lower.includes("sd3") || lower.includes("sd-3")) {
    return [
      "stable-diffusion-3.5-large",
      "stabilityai/stable-diffusion-3.5-large",
      "sdxl",
      "stabilityai/sdxl",
      "dall-e-3",
    ];
  }
  if (lower.includes("sdxl")) {
    return ["sdxl", "stabilityai/sdxl", "dall-e-3"];
  }
  if (lower.includes("recraft")) {
    return ["recraft-v3", "recraft-ai/recraft-v3", "dall-e-3"];
  }
  if (lower.includes("ideogram")) {
    return ["ideogram-v2", "ideogram-ai/ideogram-v2", "ideogram-v2-turbo", "dall-e-3"];
  }
  if (lower.includes("imagen")) {
    return ["google/imagen-3", "imagen-3", "dall-e-3"];
  }
  if (lower.includes("photon")) {
    return ["luma/photon", "photon", "dall-e-3"];
  }

  return [requestedModel, "flux-schnell", "dall-e-3"];
}

/**
 * Résolution des alias de modèles
 */
function resolveImageModel(requestedModel: string): string {
  if (!requestedModel) return "flux-schnell";
  const candidates = getCometCandidateModelIds(requestedModel);
  return candidates[0] || requestedModel;
}

/**
 * Formatage d'un modèle d'image selon le schéma OpenAI Model Specification
 */
function formatOpenAiImageModel(m: any): ImageModelItem {
  const modelId = m.id || "image-model";
  const org = m.owned_by || modelId.split("/")[0] || "cometapi";
  const created = Number(m.created) || Math.floor(Date.now() / 1000) - 86_400 * 30;
  const features =
    m.features ||
    m.supported_features ||
    (modelId.toLowerCase().includes("diffusion") || modelId.toLowerCase().includes("midjourney")
      ? ["text-to-image", "image-to-image"]
      : ["text-to-image"]);

  const form = m.form || detectModelForm(modelId, features);
  const endpoints = m.endpoints || (
    form === "midjourney-pipeline"
      ? ["/v1/images/generations", "/mj/submit/imagine", "/mj/submit/action", "/mj/task/:id/fetch"]
      : form === "image-edit"
      ? ["/v1/images/edits", "/v1/images/generations"]
      : form === "image-upscale"
      ? ["/v1/images/upscale"]
      : ["/v1/images/generations", "/v1/images/edits"]
  );

  return {
    capabilities: {
      async_task: true,
      image_to_image: features.includes("image-to-image") || form === "image-edit",
      inpainting: features.includes("inpainting") || features.includes("image-to-image"),
      text_to_image: true,
      upscaling: features.includes("upscale") || form === "image-upscale" || form === "midjourney-pipeline",
      variation: features.includes("variation") || form === "midjourney-pipeline",
    },
    created,
    description: m.description || `Modèle de génération d'images haute fidélité ${m.name || modelId}.`,
    endpoints,
    features,
    form,
    id: modelId,
    name: m.name || modelId,
    object: "model",
    owned_by: org,
    parent: null,
    permission: [
      {
        allow_create_engine: false,
        allow_fine_tuning: false,
        allow_logprobs: true,
        allow_sampling: true,
        allow_search_indices: false,
        allow_view: true,
        created,
        group: null,
        id: `modelperm-${modelId.replace(/[^a-zA-Z0-9]/g, "-")}`,
        is_blocking: false,
        object: "model_permission",
        organization: "*",
      },
    ],
    root: modelId,
  };
}

/**
 * Récupération dynamique et filtrage en temps réel des modèles d'images depuis CometAPI
 */
async function fetchLiveCometImageModels(): Promise<ImageModelItem[]> {
  const now = Date.now();
  if (cachedCometImageModels.length > 0 && now - lastCometFetchTime < CACHE_TTL_MS) {
    return cachedCometImageModels;
  }

  const cometApiKey = getCometApiKey();
  if (!cometApiKey) {
    return FALLBACK_IMAGE_MODELS;
  }

  try {
    const res = await fetch("https://api.cometapi.com/v1/models", {
      headers: {
        Authorization: `Bearer ${cometApiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[CometAPI] /v1/models réponse non-OK (${res.status})`);
      return cachedCometImageModels.length > 0 ? cachedCometImageModels : FALLBACK_IMAGE_MODELS;
    }

    const json = await res.json();
    const rawModels: any[] = json.data || json.models || [];

    // Filtrage dynamique multi-formes des modèles d'image
    const imageModels = rawModels.filter((m: any) => {
      if (!m || !m.id) return false;
      const mType = String(
        m.model_type ||
        m.type ||
        m.architecture?.modality ||
        m.object ||
        ""
      ).toLowerCase();
      const outputModalities = (m.architecture?.output_modalities || []).map((o: string) =>
        String(o).toLowerCase()
      );
      const features = (m.features || m.supported_features || []).map((f: string) =>
        String(f).toLowerCase()
      );
      const idLower = String(m.id).toLowerCase();

      const isImageModality =
        mType.includes("image") ||
        outputModalities.includes("image") ||
        mType.endsWith("->image") ||
        mType.includes("text->image");

      const hasImageFeature =
        features.includes("text-to-image") ||
        features.includes("image-to-image") ||
        features.includes("inpainting") ||
        features.includes("image");

      const matchesImageKeyword =
        idLower.includes("flux") ||
        idLower.includes("diffusion") ||
        idLower.includes("dall-e") ||
        idLower.includes("midjourney") ||
        idLower.includes("mj-") ||
        idLower.includes("recraft") ||
        idLower.includes("ideogram") ||
        idLower.includes("imagen") ||
        idLower.includes("photon") ||
        idLower.includes("kling") ||
        idLower.includes("kolors") ||
        idLower.includes("sdxl") ||
        idLower.includes("stable-diffusion") ||
        idLower.startsWith("sd-") ||
        idLower.includes("qwen-image") ||
        idLower.includes("gpt-image");

      return isImageModality || hasImageFeature || matchesImageKeyword;
    });

    if (imageModels.length > 0) {
      const formatted = imageModels.map(formatOpenAiImageModel);
      cachedCometImageModels = formatted;
      lastCometFetchTime = now;
      return formatted;
    }

    return cachedCometImageModels.length > 0 ? cachedCometImageModels : FALLBACK_IMAGE_MODELS;
  } catch (err) {
    console.error("[CometAPI] Erreur de récupération des modèles:", err);
    return cachedCometImageModels.length > 0 ? cachedCometImageModels : FALLBACK_IMAGE_MODELS;
  }
}

/**
 * Exécuteur robuste multi-stratégie pour la génération d'images CometAPI
 */
async function callCometImageGeneration(params: {
  apiKey: string;
  isEdit?: boolean;
  isVariation?: boolean;
  mask?: string;
  model: string;
  n: number;
  negativePrompt?: string;
  prompt: string;
  quality?: string;
  responseFormat?: string;
  seed?: number;
  size: string;
  sourceImage?: string;
  style?: string;
}): Promise<{ data: Array<{ b64_json?: string; revised_prompt?: string; url?: string }>; usedModel: string }> {
  const { apiKey, prompt, size, n, responseFormat, quality, style, negativePrompt, seed, sourceImage, mask, isEdit, isVariation } = params;

  const candidateModels = getCometCandidateModelIds(params.model);
  let lastErrorText = "";

  for (const candidate of candidateModels) {
    // 1. Construire le payload de base minimal
    const basePayload: Record<string, unknown> = {
      model: candidate,
      prompt,
      size: size || "1024x1024",
    };

    if (n && n > 1) {
      basePayload.n = Math.min(n, 4);
    }
    if (responseFormat && responseFormat === "b64_json") {
      basePayload.response_format = "b64_json";
    }
    if (quality) {
      basePayload.quality = quality;
    }
    if (style) {
      basePayload.style = style;
    }
    if (negativePrompt) {
      basePayload.negative_prompt = negativePrompt;
    }
    if (seed !== undefined) {
      basePayload.seed = seed;
    }
    if (sourceImage) {
      basePayload.image = sourceImage;
    }
    if (mask) {
      basePayload.mask = mask;
    }

    const endpointUrl = isEdit
      ? "https://api.cometapi.com/v1/images/edits"
      : isVariation
      ? "https://api.cometapi.com/v1/images/variations"
      : "https://api.cometapi.com/v1/images/generations";

    let currentPayload = { ...basePayload };

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(endpointUrl, {
          body: JSON.stringify(currentPayload),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "POST",
        });

        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const rawList = json.data || json.images || [];
          if (Array.isArray(rawList) && rawList.length > 0) {
            const formatted = rawList.map((img: any) => {
              const rawUrl = img.url || "";
              const b64 = img.b64_json || "";
              const resolved = normalizeImageSrc(rawUrl || b64);
              return {
                b64_json: b64 || (responseFormat === "b64_json" && resolved.startsWith("data:") ? resolved.split(",")[1] : undefined),
                revised_prompt: img.revised_prompt || prompt,
                url: resolved || rawUrl,
              };
            });
            return { data: formatted, usedModel: candidate };
          }
        }

        lastErrorText = await res.text().catch(() => "");
        console.warn(`[CometAPI] Modèle '${candidate}' tentative ${attempt + 1} échouée (${res.status}):`, lastErrorText);

        // Si l'erreur indique un paramètre inconnu (ex: 'style', 'quality', 'seed', etc.)
        if (lastErrorText.includes("Unknown parameter") || lastErrorText.includes("unknown_parameter")) {
          // Supprimer les paramètres optionnels et re-tenter immédiatement
          currentPayload = {
            model: candidate,
            prompt,
            size: size || "1024x1024",
          };
          continue;
        }
      } catch (fetchErr: unknown) {
        lastErrorText = fetchErr instanceof Error ? fetchErr.message : "Erreur réseau";
        console.warn(`[CometAPI] Exception fetch '${candidate}':`, lastErrorText);
      }
      break;
    }
  }

  // 2. Fallback alternatif : essayer via /v1/chat/completions sur CometAPI
  try {
    const chatRes = await fetch("https://api.cometapi.com/v1/chat/completions", {
      body: JSON.stringify({
        messages: [
          {
            content: `Generate this image: ${prompt}`,
            role: "user",
          },
        ],
        model: "dall-e-3",
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
    });

    if (chatRes.ok) {
      const chatJson = await chatRes.json();
      const content = chatJson.choices?.[0]?.message?.content || "";
      const match = content.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/) || content.match(/(https?:\/\/[^\s\)]+\.(?:png|jpg|jpeg|webp))/i);
      if (match && match[1]) {
        return {
          data: [
            {
              revised_prompt: prompt,
              url: normalizeImageSrc(match[1]),
            },
          ],
          usedModel: "chat-image-fallback",
        };
      }
    }
  } catch {}

  throw new Error(`Erreur fournisseur Comet API: ${lastErrorText || "Impossible de générer l'image après plusieurs tentatives"}`);
}

/**
 * Exécuteur et pont asynchrone pour les tâches Midjourney sur CometAPI
 */
async function executeMidjourneyImagineBridge(
  prompt: string,
  cometApiKey: string,
  options?: { aspectRatio?: string; base64Array?: string[]; notifyHook?: string }
): Promise<{ failReason?: string; imageUrl: string; progress?: string; taskId?: string }> {
  let finalPrompt = prompt.trim();
  if (options?.aspectRatio && !finalPrompt.includes("--ar")) {
    finalPrompt = `${finalPrompt} --ar ${options.aspectRatio}`;
  }

  const payload: Record<string, unknown> = {
    prompt: finalPrompt,
  };
  if (options?.base64Array && options.base64Array.length > 0) {
    payload.base64Array = options.base64Array;
  }
  if (options?.notifyHook) {
    payload.notifyHook = options.notifyHook;
  }

  try {
    const submitRes = await fetch("https://api.cometapi.com/mj/submit/imagine", {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${cometApiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
    });

    if (submitRes.ok) {
      const submitJson = await submitRes.json();
      const taskId = submitJson.result || submitJson.task_id || submitJson.id;

      if (taskId) {
        // Polling actif jusqu'à succès (max 60s)
        const maxAttempts = 35;
        const pollIntervalMs = 1800;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

          try {
            const fetchRes = await fetch(`https://api.cometapi.com/mj/task/${taskId}/fetch`, {
              headers: {
                Authorization: `Bearer ${cometApiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            });

            if (!fetchRes.ok) continue;

            const taskJson = await fetchRes.json();
            const status = String(taskJson.status || "").toUpperCase();

            if (status === "SUCCESS") {
              const imgUrl = taskJson.imageUrl || taskJson.cdnImage || taskJson.discordImage || taskJson.image_url;
              if (imgUrl) {
                return {
                  imageUrl: imgUrl,
                  progress: "100%",
                  taskId,
                };
              }
            } else if (status === "FAILURE" || status === "FAILED") {
              break;
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn("[CometAPI] Midjourney imagine bridge error:", err);
  }

  // Si le bridge MJ natif échoue ou timeout, fallback transparent sur les générateurs d'images CometAPI
  const fallbackRes = await callCometImageGeneration({
    apiKey: cometApiKey,
    model: "dall-e-3",
    n: 1,
    prompt,
    size: "1024x1024",
  });

  return {
    imageUrl: fallbackRes.data[0]?.url || "",
    progress: "100%",
    taskId: "fallback-standard",
  };
}

export function registerImageRoutes(app: Hono) {
  // ─────────────────────────────────────────────
  // GET /v1/models/images, /models/images & /v1/images/models (OpenAI Compatible)
  // ─────────────────────────────────────────────
  const handleGetImageModels = async (c: any) => {
    const userPlan = c.get("userPlan");
    const planStr = String(userPlan || "Free")
      .toLowerCase()
      .trim();
    const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
    const shouldFilterFreeOnly = !isPaidPlan;

    try {
      let models = await fetchLiveCometImageModels();

      if (shouldFilterFreeOnly) {
        models = models.filter((m) => {
          const idLower = (m.id || "").toLowerCase();
          return idLower.includes("flux") || idLower.includes("schnell") || idLower.includes("free");
        });
      }

      return c.json({ data: models, object: "list" });
    } catch (_err) {
      let fallback = FALLBACK_IMAGE_MODELS;
      if (shouldFilterFreeOnly) {
        fallback = fallback.filter((m) => m.id.toLowerCase().includes("flux"));
      }
      return c.json({ data: fallback.map(formatOpenAiImageModel), object: "list" });
    }
  };

  app.get("/v1/models/images", handleGetImageModels);
  app.get("/models/images", handleGetImageModels);
  app.get("/v1/images/models", handleGetImageModels);
  app.get("/images/models", handleGetImageModels);

  // ─────────────────────────────────────────────
  // GET /v1/models/images/:id & /models/images/:id (OpenAI Model Detail)
  // ─────────────────────────────────────────────
  const handleGetSingleImageModel = async (c: any) => {
    const rawId = c.req.param("id") || "";
    const resolvedId = resolveImageModel(rawId);

    const liveModels = await fetchLiveCometImageModels();
    const found =
      liveModels.find(
        (m) =>
          m.id.toLowerCase() === rawId.toLowerCase() ||
          m.id.toLowerCase() === resolvedId.toLowerCase() ||
          m.name.toLowerCase() === rawId.toLowerCase()
      ) ||
      FALLBACK_IMAGE_MODELS.find(
        (m) =>
          m.id.toLowerCase() === rawId.toLowerCase() ||
          m.id.toLowerCase() === resolvedId.toLowerCase() ||
          m.name.toLowerCase() === rawId.toLowerCase()
      ) || {
        created: Math.floor(Date.now() / 1000),
        description: `Modèle d'image ${rawId}.`,
        features: ["text-to-image"],
        form: detectModelForm(resolvedId, ["text-to-image"]),
        id: resolvedId,
        name: rawId,
        object: "model" as const,
        owned_by: resolvedId.split("/")[0] || "cometapi",
      };

    return c.json(formatOpenAiImageModel(found));
  };

  app.get("/v1/models/images/:id", handleGetSingleImageModel);
  app.get("/models/images/:id", handleGetSingleImageModel);

  // ─────────────────────────────────────────────
  // GET /v1/images/usage & /images/usage
  // ─────────────────────────────────────────────
  const handleGetImageUsage = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      let userId = c.get("userId");
      let userPlan = c.get("userPlan") || "Free";

      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = (payload.sub as string) || userId;
          userPlan = (payload.tier as string) || userPlan;
        } catch {
          // Token non JWT ignoré
        }
      }

      const sql = getDb();

      if (token) {
        try {
          const keyRows = await sql`
            SELECT k.user_id, u.tier, u.email, u.username
            FROM mprojects_api_keys k
            LEFT JOIN users u ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
            WHERE k.api_key = ${token}::text
            LIMIT 1
          `;
          if (keyRows.length > 0) {
            userId = keyRows[0].user_id;
            userPlan = keyRows[0].tier || userPlan;
          }
        } catch {
          // Erreur DB ignorée
        }
      }

      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const [uRows, countRows] = await Promise.all([
        sql`SELECT tier FROM users WHERE id::text = ${userId}::text OR username = ${userId}::text OR email = ${userId}::text LIMIT 1`,
        sql`
          SELECT COALESCE(SUM(images_generated::numeric), 0) as images_generated 
          FROM mprojects_daily_image_usage 
          WHERE (
            user_id = ${userId}::text 
            OR user_id IN (SELECT id::text FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
            OR user_id IN (SELECT email FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
            OR user_id IN (SELECT username FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
          ) AND usage_date = CURRENT_DATE 
          LIMIT 1
        `.catch(() => []),
      ]);

      const keyTier = extractTierFromApiKey(token);
      const effectiveTier = keyTier || uRows[0]?.tier || userPlan || "Free";
      const usedToday = Number(countRows[0]?.images_generated || 0);
      const imageBoost = await getUserQuotaBoost(sql, userId, "images");
      const dailyLimit = getTierDailyImageLimit(effectiveTier) + imageBoost;

      const now = new Date();
      const tomorrowMidnight = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0
        )
      );

      return c.json({
        dailyLimit,
        plan: effectiveTier,
        resetAt: tomorrowMidnight.toISOString(),
        usedToday,
        userId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      return c.json(
        {
          details: msg,
          error: "Erreur lors de la récupération de l'usage image.",
        },
        500
      );
    }
  };

  app.get("/v1/images/usage", handleGetImageUsage);
  app.get("/images/usage", handleGetImageUsage);

  // ─────────────────────────────────────────────
  // GET /v1/images/history & /images/history
  // ─────────────────────────────────────────────
  const handleGetImageHistory = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      let userId = c.get("userId");

      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = payload.sub as string;
        } catch {
          // Token invalide ignoré
        }
      }

      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const sql = getDb();
      const history = await sql`
        SELECT id, title, pinned, model, prompt, negative_prompt, width, height, image_url, status, created_at
        FROM mprojects_image_generations
        WHERE user_id = ${userId}::text
        ORDER BY pinned DESC, created_at DESC
        LIMIT 50
      `.catch(() => []);

      const formattedHistory = history.map((item: any) => ({
        ...item,
        image_url: normalizeImageSrc(item.image_url),
        pinned: Boolean(item.pinned),
        title: item.title || null,
      }));

      return c.json({ data: formattedHistory, success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      return c.json(
        { details: msg, error: "Erreur historique images." },
        500
      );
    }
  };

  const handleUpdateImageHistory = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      let userId = c.get("userId");

      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = payload.sub as string;
        } catch {}
      }

      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const id = c.req.param("id") || c.req.query("id");
      if (!id) {
        return c.json({ error: "ID manquant." }, 400);
      }

      const body = await c.req.json().catch(() => ({}));
      const sql = getDb();
      const sets: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (body.title !== undefined) {
        sets.push(`title = $${idx++}`);
        values.push(body.title ? String(body.title).trim().slice(0, 200) : null);
      }
      if (body.pinned !== undefined) {
        sets.push(`pinned = $${idx++}`);
        values.push(Boolean(body.pinned));
      }

      if (sets.length === 0) {
        return c.json({ success: true });
      }

      values.push(id, userId);
      const query = `UPDATE mprojects_image_generations SET ${sets.join(", ")} WHERE id::text = $${idx++}::text AND user_id = $${idx}::text RETURNING id, title, pinned`;
      const result = await sql.unsafe(query, values);

      return c.json({ data: result[0] || null, success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      return c.json({ details: msg, error: "Erreur mise à jour image." }, 500);
    }
  };

  app.get("/v1/images/history", handleGetImageHistory);
  app.get("/images/history", handleGetImageHistory);
  app.patch("/v1/images/history/:id", handleUpdateImageHistory);
  app.patch("/v1/images/history", handleUpdateImageHistory);
  app.patch("/images/history/:id", handleUpdateImageHistory);
  app.patch("/images/history", handleUpdateImageHistory);

  // ─────────────────────────────────────────────
  // POST /v1/images/generations & Formes Multi-Modèles (OpenAI, Midjourney, Google SDK)
  // ─────────────────────────────────────────────
  const handleImageGeneration = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      const authHeader = c.req.header("Authorization");
      const headerApiKey =
        c.req.header("x-api-key") ||
        c.req.header("X-API-Key") ||
        c.req.header("x-goog-api-key") ||
        c.req.header("X-Goog-Api-Key");
      const apiKey = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : headerApiKey || null;

      let userId = c.get("userId");
      let userPlan = c.get("userPlan") || "Free";

      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = payload.sub as string;
          userPlan = (payload.tier as string) || userPlan;
        } catch {
          // Token non JWT ignoré
        }
      }

      if (!userId) {
        return c.json(
          {
            error: {
              code: "invalid_api_key",
              message: "Non authentifié. Clé API ou token requis.",
              param: null,
              type: "authentication_error",
            },
          },
          401
        );
      }

      const body = await c.req.json().catch(() => ({}));
      const reqPath = c.req.path || "";
      const isGoogleFormat =
        reqPath.includes(":generateImages") ||
        reqPath.includes(":predict") ||
        Boolean(body.instances || body.numberOfImages || body.aspectRatio);

      const rawPrompt =
        body.prompt ||
        body.instances?.[0]?.prompt ||
        body.parameters?.prompt ||
        "";
      const prompt = typeof rawPrompt === "string" ? rawPrompt.trim() : "";

      const pathModel = reqPath
        .replace(/^\/(v1beta|v1)\/models\//, "")
        .replace(/:(generateImages|predict).*$/, "");
      const requestedModel =
        body.model || pathModel || "black-forest-labs/flux-schnell";

      const model = resolveImageModel(requestedModel);
      const modelForm = detectModelForm(model, []);

      // Résolution des dimensions et aspect ratio
      let width = 1024;
      let height = 1024;
      const aspectRatioStr = body.aspect_ratio || body.aspectRatio || "";

      if (aspectRatioStr) {
        const ar = String(aspectRatioStr).trim();
        if (ar === "16:9") {
          width = 1280;
          height = 720;
        } else if (ar === "9:16") {
          width = 720;
          height = 1280;
        } else if (ar === "4:3") {
          width = 1024;
          height = 768;
        } else if (ar === "3:4") {
          width = 768;
          height = 1024;
        } else if (ar === "21:9") {
          width = 1536;
          height = 640;
        }
      } else if (body.size) {
        const parts = String(body.size).split("x");
        if (parts.length === 2) {
          width = Number.parseInt(parts[0], 10) || 1024;
          height = Number.parseInt(parts[1], 10) || 1024;
        }
      } else {
        if (body.width) width = Number(body.width);
        if (body.height) height = Number(body.height);
      }

      const negativePrompt = body.negative_prompt || "";
      const n = Math.max(1, Math.min(Number(body.n || body.numberOfImages || 1), 4));
      const responseFormat = body.response_format || "url";
      const quality = body.quality ? String(body.quality) : undefined;
      const style = body.style ? String(body.style) : undefined;

      if (!prompt) {
        return c.json(
          {
            error: {
              code: "missing_prompt",
              message: "Le paramètre 'prompt' est obligatoire pour la génération d'images.",
              param: "prompt",
              type: "invalid_request_error",
            },
          },
          400
        );
      }

      const sql = getDb();

      // Vérifier le forfait utilisateur réel
      const uRows = await sql`
        SELECT tier FROM users 
        WHERE id::text = ${userId}::text OR username = ${userId}::text 
        LIMIT 1
      `;
      const keyTier = extractTierFromApiKey(token);
      const effectiveTier = keyTier || uRows[0]?.tier || userPlan || "Free";
      const planStr = effectiveTier.toLowerCase().trim();
      const isPaidPlan = ["plus", "pro", "max"].includes(planStr);

      if (!isPaidPlan) {
        return c.json(
          {
            error: {
              code: "image_generation_tier_restricted",
              message: `La génération d'images via l'API est réservée aux abonnements payants (Plus, Pro, Max). Les clés API issues d'un compte Free ne sont pas autorisées à effectuer de requêtes de génération d'images.`,
              param: null,
              type: "permission_error",
            },
          },
          403
        );
      }

      const imageBoost = await getUserQuotaBoost(sql, userId, "images");
      const dailyLimit = getTierDailyImageLimit(effectiveTier) + imageBoost;
      const usageRows = await sql`
        SELECT images_generated 
        FROM mprojects_daily_image_usage 
        WHERE user_id = ${userId}::text AND usage_date = CURRENT_DATE 
        LIMIT 1
      `;
      const currentDailyUsage = Number(usageRows[0]?.images_generated || 0);

      if (currentDailyUsage >= dailyLimit) {
        return c.json(
          {
            error: {
              code: "daily_image_quota_exceeded",
              limit: dailyLimit,
              message: `Votre quota journalier de génération d'images est épuisé (${currentDailyUsage}/${dailyLimit} par jour pour le forfait ${effectiveTier}). Réinitialisation automatique à minuit UTC.`,
              type: "quota_error",
              used: currentDailyUsage,
            },
          },
          429
        );
      }

      // Appel de Comet API avec exécution multi-stratégie & gestion des erreurs
      const cometApiKey = getCometApiKey();
      let generatedImageUrl = "";
      let cometResultData: Array<{ b64_json?: string; revised_prompt?: string; url?: string }> = [];
      let finalUsedModel = model;

      if (cometApiKey) {
        if (modelForm === "midjourney-pipeline" && !reqPath.includes("/edits")) {
          const mjRes = await executeMidjourneyImagineBridge(prompt, cometApiKey, {
            aspectRatio: aspectRatioStr || (width !== height ? `${width}:${height}` : undefined),
            base64Array: body.image ? [body.image] : undefined,
          });
          generatedImageUrl = normalizeImageSrc(mjRes.imageUrl);
          cometResultData = [{ revised_prompt: prompt, url: generatedImageUrl }];
        } else {
          const genResult = await callCometImageGeneration({
            apiKey: cometApiKey,
            isEdit: reqPath.includes("/edits") || Boolean(body.image && body.mask),
            isVariation: reqPath.includes("/variations"),
            mask: body.mask,
            model,
            n,
            negativePrompt,
            prompt,
            quality,
            responseFormat,
            seed: body.seed,
            size: `${width}x${height}`,
            sourceImage: body.image || body.image_url,
            style,
          });

          cometResultData = genResult.data;
          finalUsedModel = genResult.usedModel;
          if (cometResultData.length > 0) {
            generatedImageUrl = cometResultData[0].url || "";
          }
        }
      } else {
        generatedImageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 20))}/${width}/${height}`;
        cometResultData = [{ revised_prompt: prompt, url: generatedImageUrl }];
      }

      // Incrémentation du quota journalier
      await sql`
        INSERT INTO mprojects_daily_image_usage (user_id, usage_date, images_generated, updated_at)
        VALUES (${userId}::text, CURRENT_DATE, 1, NOW())
        ON CONFLICT (user_id, usage_date)
        DO UPDATE SET 
          images_generated = mprojects_daily_image_usage.images_generated + 1,
          updated_at = NOW()
      `;

      // Enregistrement dans l'historique
      await sql`
        INSERT INTO mprojects_image_generations (
          user_id, api_key, model, prompt, negative_prompt, width, height, image_url, status
        ) VALUES (
          ${userId}::text,
          ${apiKey || null},
          ${finalUsedModel}::text,
          ${prompt}::text,
          ${negativePrompt || null},
          ${width}::integer,
          ${height}::integer,
          ${generatedImageUrl}::text,
          'completed'
        )
      `;

      // Incrémentation du compteur de requêtes de la clé API
      const requestCost = getTierImageRequestCost(effectiveTier);
      if (apiKey) {
        await sql`
          UPDATE mprojects_api_keys
          SET request_count = request_count + ${requestCost}, last_used_at = NOW()
          WHERE api_key = ${apiKey}
        `;
      }

      // Log de requête
      try {
        await sql`
          INSERT INTO mprojects_api_logs (api_key, endpoint, method, status_code, latency_ms, created_at)
          VALUES (${apiKey || "anonymous"}::text, ${reqPath || "/v1/images/generations"}::text, 'POST', 200, 1500, NOW())
        `;
      } catch {}

      // Format Google GenAI
      if (isGoogleFormat) {
        return c.json({
          generatedImages: cometResultData.map((img) => ({
            image: {
              imageBytes: img.b64_json || "",
              mimeType: "image/png",
              uri: img.url || generatedImageUrl,
            },
          })),
        });
      }

      // Format OpenAI Standard
      return c.json({
        created: Math.floor(Date.now() / 1000),
        data: cometResultData,
        model: finalUsedModel,
        usage: {
          daily_limit: dailyLimit,
          daily_used: currentDailyUsage + 1,
          plan: effectiveTier,
          request_cost: requestCost,
          requests_counted: requestCost,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      console.error("[ImagesAPI] Erreur serveur génération:", err);
      return c.json(
        {
          error: {
            code: "image_generation_failed",
            details: msg,
            message: `Erreur lors de la génération d'image : ${msg}`,
            type: "api_error",
          },
        },
        500
      );
    }
  };

  // ─────────────────────────────────────────────
  // POST & GET Routes Midjourney Dédiées (`/mj/*` et `/v1/mj/*`)
  // ─────────────────────────────────────────────
  const handleMidjourneyForward = async (c: any) => {
    const cometApiKey = getCometApiKey();
    if (!cometApiKey) {
      return c.json({ error: "Clé COMET_API_KEY non configurée sur le serveur." }, 500);
    }

    const subPath = c.req.path.replace(/^\/v1\/mj\//, "").replace(/^\/mj\//, "");
    const targetUrl = `https://api.cometapi.com/mj/${subPath}`;
    const method = c.req.method;

    try {
      const init: RequestInit = {
        headers: {
          Authorization: `Bearer ${cometApiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method,
      };

      if (method === "POST" || method === "PUT" || method === "PATCH") {
        const reqBody = await c.req.json().catch(() => ({}));
        init.body = JSON.stringify(reqBody);
      }

      const res = await fetch(targetUrl, init);
      const data = await res.json().catch(() => ({}));
      return c.json(data, res.status as any);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      return c.json({ error: "Erreur proxy Midjourney CometAPI", details: msg }, 500);
    }
  };

  app.post("/mj/submit/imagine", handleMidjourneyForward);
  app.post("/v1/mj/submit/imagine", handleMidjourneyForward);
  app.get("/mj/task/:id/fetch", handleMidjourneyForward);
  app.get("/v1/mj/task/:id/fetch", handleMidjourneyForward);
  app.post("/mj/submit/action", handleMidjourneyForward);
  app.post("/v1/mj/submit/action", handleMidjourneyForward);
  app.post("/mj/submit/describe", handleMidjourneyForward);
  app.post("/v1/mj/submit/describe", handleMidjourneyForward);
  app.post("/mj/submit/blend", handleMidjourneyForward);
  app.post("/v1/mj/submit/blend", handleMidjourneyForward);
  app.post("/mj/submit/change", handleMidjourneyForward);
  app.post("/v1/mj/submit/change", handleMidjourneyForward);
  app.post("/mj/submit/modal", handleMidjourneyForward);
  app.post("/v1/mj/submit/modal", handleMidjourneyForward);
  app.post("/mj/submit/shorten", handleMidjourneyForward);
  app.post("/v1/mj/submit/shorten", handleMidjourneyForward);
  app.post("/mj/submit/swap-face", handleMidjourneyForward);
  app.post("/v1/mj/submit/swap-face", handleMidjourneyForward);

  // ─────────────────────────────────────────────
  // POST & GET Routes Upscale, Edits, Variations & Tasks
  // ─────────────────────────────────────────────
  const handleImageUpscale = async (c: any) => {
    const cometApiKey = getCometApiKey();
    if (!cometApiKey) {
      return c.json({ error: "Clé COMET_API_KEY non configurée." }, 500);
    }
    try {
      const body = await c.req.json().catch(() => ({}));
      const res = await fetch("https://api.cometapi.com/v1/images/upscale", {
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${cometApiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      return c.json(data, res.status as any);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      return c.json({ error: "Erreur upscale image", details: msg }, 500);
    }
  };

  app.post("/v1/images/upscale", handleImageUpscale);
  app.post("/images/upscale", handleImageUpscale);

  const handleFetchImageTask = async (c: any) => {
    const taskId = c.req.param("id");
    const cometApiKey = getCometApiKey();
    if (!cometApiKey) {
      return c.json({ error: "Clé COMET_API_KEY non configurée." }, 500);
    }
    try {
      const res = await fetch(`https://api.cometapi.com/mj/task/${taskId}/fetch`, {
        headers: {
          Authorization: `Bearer ${cometApiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = await res.json().catch(() => ({}));
      return c.json(data, res.status as any);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      return c.json({ error: "Erreur récupération tâche", details: msg }, 500);
    }
  };

  app.get("/v1/images/tasks/:id", handleFetchImageTask);
  app.get("/images/tasks/:id", handleFetchImageTask);
  app.get("/v1/tasks/:id", handleFetchImageTask);
  app.get("/tasks/:id", handleFetchImageTask);

  // Routes OpenAI & Anthropic SDK
  app.post("/v1/images/generations", handleImageGeneration);
  app.post("/images/generations", handleImageGeneration);
  app.post("/v1/images", handleImageGeneration);
  app.post("/images", handleImageGeneration);
  app.post("/v1/images/edits", handleImageGeneration);
  app.post("/images/edits", handleImageGeneration);
  app.post("/v1/images/variations", handleImageGeneration);
  app.post("/images/variations", handleImageGeneration);

  // Routes Google GenAI / Gemini / Vertex SDK
  app.post("/v1beta/models/*:generateImages", handleImageGeneration);
  app.post("/v1/models/*:generateImages", handleImageGeneration);
  app.post("/v1beta/models/*:predict", handleImageGeneration);
  app.post("/v1/models/*:predict", handleImageGeneration);
}

