export interface MAIModelDetail {
  capabilities: {
    coding: boolean;
    reasoning: boolean;
    vision: boolean;
    jsonOutput: boolean;
    functionCalling: boolean;
  };
  contextWindow: number;
  description: string;
  huggingFaceTag: string;
  id: string;
  license: string;
  maxOutputTokens: number;
  multimodal: boolean;
  name: string;
  ollamaTag: string;
  parameters: string;
  recommendedHardware: {
    minVram: string;
    recommendedVram: string;
    ram: string;
  };
  releaseDate: string;
  status: "active" | "beta" | "deprecated";
  tagline: string;
  version: string;
  vision: boolean;
}

export const maiModelsList: MAIModelDetail[] = [
  {
    capabilities: {
      coding: true,
      functionCalling: true,
      jsonOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindow: 262_144,
    description:
      "Modèle léger de 4 milliards de paramètres conçu pour une agilité maximale sur machines personnelles avec vision intégrée, capacité de raisonnement (thinking) et gestion avancée des appels d'outils (tools).",
    huggingFaceTag: "mDevsLabs/mAI-1.5-Light",
    id: "mai-1.5-light",
    license: "MIT",
    maxOutputTokens: 32_768,
    multimodal: true,
    name: "mAI-1.5-Light",
    ollamaTag: "mDevsLabs/mAI-1.5-Light",
    parameters: "4B",
    recommendedHardware: {
      minVram: "4GB",
      ram: "8GB",
      recommendedVram: "8GB",
    },
    releaseDate: "2026-08-28",
    status: "active",
    tagline:
      "Assistant IA local ultra-rapide et multimodal. Vision intégrée, raisonnement (thinking) et appels d'outils (tools).",
    version: "1.5.0",
    vision: true,
  },
  {
    capabilities: {
      coding: true,
      functionCalling: true,
      jsonOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindow: 262_144,
    description:
      "Modèle d'élite de 9 milliards de paramètres offrant des performances d'analyse logique et de programmation exceptionnelles, avec support natif du raisonnement profond (thinking), de la vision et des appels d'outils.",
    huggingFaceTag: "mDevsLabs/mAI-1.5-Apex",
    id: "mai-1.5-apex",
    license: "MIT",
    maxOutputTokens: 32_768,
    multimodal: true,
    name: "mAI-1.5-Apex",
    ollamaTag: "mDevsLabs/mAI-1.5-Apex",
    parameters: "9B",
    recommendedHardware: {
      minVram: "8GB",
      ram: "16GB",
      recommendedVram: "16GB",
    },
    releaseDate: "2026-08-28",
    status: "active",
    tagline:
      "Le haut de gamme absolu de la famille mAI. Puissance maximale, vision multimodale, raisonnement complexe et tools.",
    version: "1.5.0",
    vision: true,
  },
  {
    capabilities: {
      coding: true,
      functionCalling: true,
      jsonOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindow: 262_144,
    description:
      "Modèle 27B polyvalent et surpuissant pour postes de travail et serveurs locaux, réunissant vision multimodale, raisonnement étape par étape et intégration fluide des API et outils externes.",
    huggingFaceTag: "mDevsLabs/mAI-1.5-Opal",
    id: "mai-1.5-opal",
    license: "MIT",
    maxOutputTokens: 32_768,
    multimodal: true,
    name: "mAI-1.5-Opal",
    ollamaTag: "mDevsLabs/mAI-1.5-Opal",
    parameters: "27B",
    recommendedHardware: {
      minVram: "16GB",
      ram: "32GB",
      recommendedVram: "24GB",
    },
    releaseDate: "2026-08-28",
    status: "active",
    tagline:
      "L'équilibre parfait entre haute intelligence et vélocité. Multimodal 27B avec vision, thinking et tools.",
    version: "1.5.0",
    vision: true,
  },
  {
    capabilities: {
      coding: true,
      functionCalling: true,
      jsonOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindow: 262_144,
    description:
      "Modèle léger de 3 milliards de paramètres conçu pour une exécution ultra-rapide sur laptops et machines personnelles avec accélération vision intégrée.",
    huggingFaceTag: "mDevsLabs/mAI-1.2-Light-GGUF",
    id: "mai-1.2-light",
    license: "MIT",
    maxOutputTokens: 16_384,
    multimodal: true,
    name: "mAI-1.2-Light",
    ollamaTag: "mDevsLabs/mAI-1.2-Light",
    parameters: "3B",
    recommendedHardware: {
      minVram: "4GB",
      ram: "8GB",
      recommendedVram: "8GB",
    },
    releaseDate: "2026-07-22",
    status: "active",
    tagline:
      "Assistant IA local ultra-rapide et multimodal. Légèreté maximale, vision intégrée.",
    version: "1.2.0",
    vision: true,
  },
  {
    capabilities: {
      coding: true,
      functionCalling: true,
      jsonOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindow: 262_144,
    description:
      "Modèle phare de 9 milliards de paramètres offrant un raisonnement logique complexe, des compétences en développement logiciel et une analyse d'images de haute précision.",
    huggingFaceTag: "mDevsLabs/mAI-1.2-Apex-GGUF",
    id: "mai-1.2-apex",
    license: "MIT",
    maxOutputTokens: 32_768,
    multimodal: true,
    name: "mAI-1.2-Apex",
    ollamaTag: "mDevsLabs/mAI-1.2-Apex",
    parameters: "9B",
    recommendedHardware: {
      minVram: "8GB",
      ram: "16GB",
      recommendedVram: "16GB",
    },
    releaseDate: "2026-07-22",
    status: "active",
    tagline:
      "Le top tier de la famille mAI-1.2. Performances maximales, vision et raisonnement avancé.",
    version: "1.2.0",
    vision: true,
  },
  {
    capabilities: {
      coding: true,
      functionCalling: true,
      jsonOutput: true,
      reasoning: true,
      vision: false,
    },
    contextWindow: 262_144,
    description:
      "Modèle 33B polyvalent pour serveurs locaux et postes de travail spécialisés, offrant un équilibre exceptionnel pour la rédaction, la programmation et l'analyse documentaire.",
    huggingFaceTag: "mDevsLabs/mAI-1.2-Opal-GGUF",
    id: "mai-1.2-opal",
    license: "MIT",
    maxOutputTokens: 32_768,
    multimodal: false,
    name: "mAI-1.2-Opal",
    ollamaTag: "mDevsLabs/mAI-1.2-Opal",
    parameters: "33B",
    recommendedHardware: {
      minVram: "16GB",
      ram: "32GB",
      recommendedVram: "24GB",
    },
    releaseDate: "2026-07-22",
    status: "active",
    tagline:
      "Le sweet spot parfait entre vitesse et intelligence élevée. Équilibré et fluide.",
    version: "1.2.0",
    vision: false,
  },
  {
    capabilities: {
      coding: true,
      functionCalling: false,
      jsonOutput: true,
      reasoning: true,
      vision: true,
    },
    contextWindow: 262_144,
    description:
      "Première génération du modèle mAI 12B avec support multimodal original et capacités avancées en résolution de problèmes.",
    huggingFaceTag: "mDevsLabs/mAI-1-GGUF",
    id: "mai-1",
    license: "MIT",
    maxOutputTokens: 16_384,
    multimodal: true,
    name: "mAI-1",
    ollamaTag: "mDevsLabs/mAI-1",
    parameters: "12B",
    recommendedHardware: {
      minVram: "8GB",
      ram: "16GB",
      recommendedVram: "12GB",
    },
    releaseDate: "2026-07-11",
    status: "active",
    tagline:
      "Assistant IA local multimodal puissant de 12B paramètres pour le raisonnement et le code.",
    version: "1.0.0",
    vision: true,
  },
  {
    capabilities: {
      coding: true,
      functionCalling: false,
      jsonOutput: true,
      reasoning: true,
      vision: false,
    },
    contextWindow: 131_072,
    description:
      "Version 3B texte de première génération optimisée pour une empreinte mémoire minimale.",
    huggingFaceTag: "mDevsLabs/mAI-1-Light-GGUF",
    id: "mai-1-light",
    license: "MIT",
    maxOutputTokens: 8192,
    multimodal: false,
    name: "mAI-1-Light",
    ollamaTag: "mDevsLabs/mAI-1-Light",
    parameters: "3B",
    recommendedHardware: {
      minVram: "2GB",
      ram: "8GB",
      recommendedVram: "4GB",
    },
    releaseDate: "2026-07-11",
    status: "active",
    tagline: "Assistant IA local ultraléger et rapide de 3B paramètres.",
    version: "1.0.0",
    vision: false,
  },
];

export const maiModels = maiModelsList;
