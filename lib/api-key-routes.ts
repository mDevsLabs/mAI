export type ApiRouteMethod = "GET" | "POST" | "PUT" | "DELETE";

export type ApiRouteCategory =
  | "Projets"
  | "LLM & Modèles"
  | "Images & Web Search"
  | "Audio & Speech"
  | "SDK Google & Anthropic"
  | "Clés & Quotas"
  | "Système";

export interface RouteDefinition {
  id: string;
  name: string;
  category: ApiRouteCategory;
  method: ApiRouteMethod;
  path: string;
  description: string;
  requiresAuth: boolean;
  defaultHeaders: Record<string, string>;
  defaultBody?: unknown;
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

/** Catalogue public du studio, partagé avec l'exécuteur via ses allowlists. */
export const API_ROUTE_DEFINITIONS: readonly RouteDefinition[] = [
  {
    id: "projects-list",
    name: "Lister les projets",
    category: "Projets",
    method: "GET",
    path: "v1/projects",
    description: "Récupère la liste globale de tous les projets de la plateforme mAI (Web, Pulse, CLI, Coder).",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "projects-web",
    name: "Projet Web",
    category: "Projets",
    method: "GET",
    path: "v1/projects/web",
    description: "Obtient les détails et l'état de l'application mAI Web.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "projects-pulse",
    name: "Projet Pulse",
    category: "Projets",
    method: "GET",
    path: "v1/projects/pulse",
    description: "Obtient les détails de la suite d'extensions mAI Pulse.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "projects-cli",
    name: "Projet CLI",
    category: "Projets",
    method: "GET",
    path: "v1/projects/cli",
    description: "Obtient les détails de l'assistant de terminal mAI CLI.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "projects-coder",
    name: "Projet Coder",
    category: "Projets",
    method: "GET",
    path: "v1/projects/coder",
    description: "Obtient les détails de l'IDE IA mAI Coder avec agents et outils MCP.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "chat-completions",
    name: "Chat Completions mAI",
    category: "LLM & Modèles",
    method: "POST",
    path: "v1/chat/completions",
    description: "Génère une réponse LLM mAI / OpenRouter compatible OpenAI avec streaming ou JSON.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
    defaultBody: {
      model: "poolside/laguna-xs-2.1:free",
      messages: [
        { role: "system", content: "Tu es un assistant IA précis, souverain et hautement qualifié." },
        { role: "user", content: "Présente l'écosystème mAI et ses avantages en deux phrases !" },
      ],
      temperature: 0.7,
    },
  },
  {
    id: "models-list-public",
    name: "Catalogue global des modèles",
    category: "LLM & Modèles",
    method: "GET",
    path: "v1/models",
    description: "Liste tous les modèles d'intelligence artificielle disponibles sur l'API publique.",
    requiresAuth: false,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "models-mai-list",
    name: "Catalogue Modèles mAI (Locaux)",
    category: "LLM & Modèles",
    method: "GET",
    path: "v1/models/mai",
    description: "Liste les modèles d'IA souverains de la famille mAI (série 1.5, 1.2, 1.0) pour Ollama / GGUF.",
    requiresAuth: false,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "models-single-detail",
    name: "Détail d'un Modèle Spécifique",
    category: "LLM & Modèles",
    method: "GET",
    path: "v1/models/mai-1.5-light",
    description: "Récupère les métadonnées détaillées, le contexte et les capacités d'un modèle précis.",
    requiresAuth: false,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "models-images-list",
    name: "Catalogue Modèles Images",
    category: "Images & Web Search",
    method: "GET",
    path: "v1/models/images",
    description: "Liste les modèles de génération d'images haute qualité (Comet API & Flux Schnell/Dev/Pro).",
    requiresAuth: false,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "images-generations",
    name: "Générer une Image (Comet & Flux)",
    category: "Images & Web Search",
    method: "POST",
    path: "v1/images/generations",
    description: "Génère une image par IA avec prompt, négatif, format, dimensions et modèle sélectionné.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
    defaultBody: {
      model: "black-forest-labs/flux-1-schnell",
      prompt: "Un paysage futuriste avec des néons sous la pluie, photoréaliste, 8k, éclairage cinématographique",
      size: "1024x1024",
      response_format: "url",
    },
  },
  {
    id: "images-usage-quota",
    name: "Quota & Consommation Images",
    category: "Images & Web Search",
    method: "GET",
    path: "v1/images/usage",
    description: "Consulte le quota journalier et le nombre d'images générées aujourd'hui selon votre forfait.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "images-history-list",
    name: "Historique des Générations d'Images",
    category: "Images & Web Search",
    method: "GET",
    path: "v1/images/history",
    description: "Consulte l'historique complet de vos générations d'images avec URLs et prompts associés.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "web-search-query",
    name: "Recherche Web (You.com & Fallback)",
    category: "Images & Web Search",
    method: "POST",
    path: "v1/web/search",
    description: "Recherche web en temps réel enrichie avec triple fallback automatique pour l'actualité.",
    requiresAuth: false,
    defaultHeaders: { ...JSON_HEADERS },
    defaultBody: {
      query: "dernières actualités intelligence artificielle et modèles souverains 2026",
      count: 5,
    },
  },
  {
    id: "audio-models-list",
    name: "Catalogue Modèles Audio (Speech)",
    category: "Audio & Speech",
    method: "GET",
    path: "v1/audio/models",
    description: "Liste les modèles de synthèse vocale (TTS) disponibles via OpenRouter (Deepgram Flux TTS).",
    requiresAuth: false,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "audio-voices-list",
    name: "Catalogue des Voix TTS",
    category: "Audio & Speech",
    method: "GET",
    path: "v1/audio/voices",
    description: "Liste toutes les voix disponibles pour la synthèse vocale (Alexis, Michael, Stacy, Sam, Asteria, Orion).",
    requiresAuth: false,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "audio-speech-generate",
    name: "Générer une Synthèse Vocale (TTS)",
    category: "Audio & Speech",
    method: "POST",
    path: "v1/audio/speech",
    description: "Convertit du texte en audio avec Deepgram Flux TTS. Retourne un fichier MP3/audio binaire.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
    defaultBody: {
      model: "deepgram/flux-tts:free",
      input: "Bonjour, je suis mAI, votre assistant vocal souverain.",
      voice: "flux-alexis-en",
      response_format: "mp3",
      speed: 1.0,
    },
  },
  {
    id: "audio-usage-quota",
    name: "Quota & Consommation Audio",
    category: "Audio & Speech",
    method: "GET",
    path: "v1/audio/usage",
    description: "Consulte le quota hebdomadaire de tokens TTS et le nombre de requêtes vocales effectuées.",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
  },
  {
    id: "anthropic-messages",
    name: "Anthropic Messages SDK",
    category: "SDK Google & Anthropic",
    method: "POST",
    path: "v1/messages",
    description: "Endpoint compatible avec le SDK officiel Anthropic (@anthropic-ai/sdk).",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
    defaultBody: {
      model: "poolside/laguna-xs-2.1:free",
      max_tokens: 1024,
      messages: [
        { role: "user", content: "Bonjour Claude, résume les capacités de l'écosystème mAI !" },
      ],
    },
  },
  {
    id: "google-generative-ai",
    name: "Google Generative AI SDK",
    category: "SDK Google & Anthropic",
    method: "POST",
    path: "v1beta/models/poolside/laguna-xs-2.1:free:generateContent",
    description: "Endpoint compatible avec le SDK officiel Google Generative AI (@google/generative-ai).",
    requiresAuth: true,
    defaultHeaders: { ...JSON_HEADERS },
    defaultBody: {
      contents: [
        {
          role: "user",
          parts: [{ text: "Bonjour Gemini, présente brièvement les fonctionnalités mAI." }],
        },
      ],
    },
  },
  {
    id: "system-status",
    name: "Statut des services",
    category: "Système",
    method: "GET",
    path: "v1/status",
    description: "Vérifie l'état de santé, la latence et la disponibilité globale de l'infrastucture mAI.",
    requiresAuth: false,
    defaultHeaders: { ...JSON_HEADERS },
  },
];

const EXECUTOR_EXACT_METHODS: Readonly<Record<string, ApiRouteMethod>> = {
  ...Object.fromEntries(
    API_ROUTE_DEFINITIONS.map((route) => [route.path, route.method] as const),
  ),
  "v1/log-usage": "POST",
};

const EXECUTOR_METHOD_PATTERNS: Readonly<Record<ApiRouteMethod, readonly RegExp[]>> = {
  GET: [/^v1\/models\/[A-Za-z0-9._-]+$/],
  POST: [
    /^v1beta\/models\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*:(?:generateContent|streamGenerateContent)$/,
  ],
  PUT: [],
  DELETE: [],
};

export function isAllowedExecutorRoute(method: ApiRouteMethod, path: string): boolean {
  if (EXECUTOR_EXACT_METHODS[path]) {
    return EXECUTOR_EXACT_METHODS[path] === method;
  }
  return EXECUTOR_METHOD_PATTERNS[method].some((pattern) => pattern.test(path));
}

export function isPublicExecutorRoute(method: ApiRouteMethod, path: string): boolean {
  if (method === "GET" && path === "v1/models/audio") return true;
  return API_ROUTE_DEFINITIONS.some(
    (route) => route.path === path && route.method === method && !route.requiresAuth,
  );
}
