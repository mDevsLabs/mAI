export function getCometApiKey(): string {
  if (typeof process !== "undefined" && process.env) {
    return process.env.COMET_API_KEY || "";
  }
  return "";
}

export const FALLBACK_IMAGE_MODELS = [
  {
    id: "black-forest-labs/flux-1-schnell",
    name: "FLUX.1 Schnell",
    description: "Modèle de génération d'images ultra-rapide en 4 étapes par Black Forest Labs (Text-to-Image).",
    created: Math.floor(Date.now() / 1000) - 86400 * 30,
    model_type: "image",
    features: ["text-to-image"],
  },
  {
    id: "black-forest-labs/flux-1-dev",
    name: "FLUX.1 Dev",
    description: "Modèle phare de haute précision pour la synthèse d'images photoréalistes et artistiques (Text-to-Image).",
    created: Math.floor(Date.now() / 1000) - 86400 * 30,
    model_type: "image",
    features: ["text-to-image"],
  },
  {
    id: "black-forest-labs/flux-1.1-pro",
    name: "FLUX 1.1 Pro",
    description: "Le sommet de la qualité visuelle, cohérence typographique et détails avancés par Black Forest Labs.",
    created: Math.floor(Date.now() / 1000) - 86400 * 15,
    model_type: "image",
    features: ["text-to-image"],
  },
  {
    id: "stabilityai/stable-diffusion-3.5-large",
    name: "Stable Diffusion 3.5 Large",
    description: "Modèle de pointe de 8 milliards de paramètres de Stability AI pour une variété stylistique maximale.",
    created: Math.floor(Date.now() / 1000) - 86400 * 20,
    model_type: "image",
    features: ["text-to-image", "image-to-image"],
  },
  {
    id: "midjourney/v6",
    name: "Midjourney v6",
    description: "Génération stylisée haut de gamme avec esthétique et prompt comprehension avancée.",
    created: Math.floor(Date.now() / 1000) - 86400 * 60,
    model_type: "image",
    features: ["text-to-image"],
  },
  {
    id: "recraft-ai/recraft-v3",
    name: "Recraft V3",
    description: "Génération vectorielle et matricielle spécialisée dans les logos, illustrations et design graphique.",
    created: Math.floor(Date.now() / 1000) - 86400 * 10,
    model_type: "image",
    features: ["text-to-image"],
  },
];
