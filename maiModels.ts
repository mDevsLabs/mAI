export interface MAIModelDetail {
  id: string;
  name: string;
  tagline: string;
  parameters: string;
  contextWindow: number;
  maxOutputTokens: number;
  vision: boolean;
  multimodal: boolean;
  releaseDate: string;
  version: string;
  ollamaTag: string;
  huggingFaceTag: string;
  license: string;
  status: "active" | "beta" | "deprecated";
  capabilities: {
    coding: boolean;
    reasoning: boolean;
    vision: boolean;
    jsonOutput: boolean;
    functionCalling: boolean;
  };
  recommendedHardware: {
    minVram: string;
    recommendedVram: string;
    ram: string;
  };
  description: string;
}

export const maiModelsList: MAIModelDetail[] = [
  {
    id: "mai-1.5-light",
    name: "mAI-1.5-Light",
    tagline:
      "Assistant IA local ultra-rapide et multimodal. Vision intégrée, raisonnement (thinking) et appels d'outils (tools).",
    parameters: "4B",
    contextWindow: 262144,
    maxOutputTokens: 32768,
    vision: true,
    multimodal: true,
    releaseDate: "2026-08-28",
    version: "1.5.0",
    ollamaTag: "mDevsLabs/mAI-1.5-Light",
    huggingFaceTag: "mDevsLabs/mAI-1.5-Light",
    license: "MIT",
    status: "active",
    capabilities: {
      coding: true,
      reasoning: true,
      vision: true,
      jsonOutput: true,
      functionCalling: true,
    },
    recommendedHardware: {
      minVram: "4GB",
      recommendedVram: "8GB",
      ram: "8GB",
    },
    description:
      "Modèle léger de 4 milliards de paramètres conçu pour une agilité maximale sur machines personnelles avec vision intégrée, capacité de raisonnement (thinking) et gestion avancée des appels d'outils (tools).",
  },
  {
    id: "mai-1.5-apex",
    name: "mAI-1.5-Apex",
    tagline:
      "Le haut de gamme absolu de la famille mAI. Puissance maximale, vision multimodale, raisonnement complexe et tools.",
    parameters: "9B",
    contextWindow: 262144,
    maxOutputTokens: 32768,
    vision: true,
    multimodal: true,
    releaseDate: "2026-08-28",
    version: "1.5.0",
    ollamaTag: "mDevsLabs/mAI-1.5-Apex",
    huggingFaceTag: "mDevsLabs/mAI-1.5-Apex",
    license: "MIT",
    status: "active",
    capabilities: {
      coding: true,
      reasoning: true,
      vision: true,
      jsonOutput: true,
      functionCalling: true,
    },
    recommendedHardware: {
      minVram: "8GB",
      recommendedVram: "16GB",
      ram: "16GB",
    },
    description:
      "Modèle d'élite de 9 milliards de paramètres offrant des performances d'analyse logique et de programmation exceptionnelles, avec support natif du raisonnement profond (thinking), de la vision et des appels d'outils.",
  },
  {
    id: "mai-1.5-opal",
    name: "mAI-1.5-Opal",
    tagline: "L'équilibre parfait entre haute intelligence et vélocité. Multimodal 27B avec vision, thinking et tools.",
    parameters: "27B",
    contextWindow: 262144,
    maxOutputTokens: 32768,
    vision: true,
    multimodal: true,
    releaseDate: "2026-08-28",
    version: "1.5.0",
    ollamaTag: "mDevsLabs/mAI-1.5-Opal",
    huggingFaceTag: "mDevsLabs/mAI-1.5-Opal",
    license: "MIT",
    status: "active",
    capabilities: {
      coding: true,
      reasoning: true,
      vision: true,
      jsonOutput: true,
      functionCalling: true,
    },
    recommendedHardware: {
      minVram: "16GB",
      recommendedVram: "24GB",
      ram: "32GB",
    },
    description:
      "Modèle 27B polyvalent et surpuissant pour postes de travail et serveurs locaux, réunissant vision multimodale, raisonnement étape par étape et intégration fluide des API et outils externes.",
  },
  {
    id: "mai-1.2-light",
    name: "mAI-1.2-Light",
    tagline:
      "Assistant IA local ultra-rapide et multimodal. Légèreté maximale, vision intégrée.",
    parameters: "3B",
    contextWindow: 262144,
    maxOutputTokens: 16384,
    vision: true,
    multimodal: true,
    releaseDate: "2026-07-22",
    version: "1.2.0",
    ollamaTag: "mDevsLabs/mAI-1.2-Light",
    huggingFaceTag: "mDevsLabs/mAI-1.2-Light-GGUF",
    license: "MIT",
    status: "active",
    capabilities: {
      coding: true,
      reasoning: true,
      vision: true,
      jsonOutput: true,
      functionCalling: true,
    },
    recommendedHardware: {
      minVram: "4GB",
      recommendedVram: "8GB",
      ram: "8GB",
    },
    description:
      "Modèle léger de 3 milliards de paramètres conçu pour une exécution ultra-rapide sur laptops et machines personnelles avec accélération vision intégrée.",
  },
  {
    id: "mai-1.2-apex",
    name: "mAI-1.2-Apex",
    tagline:
      "Le top tier de la famille mAI-1.2. Performances maximales, vision et raisonnement avancé.",
    parameters: "9B",
    contextWindow: 262144,
    maxOutputTokens: 32768,
    vision: true,
    multimodal: true,
    releaseDate: "2026-07-22",
    version: "1.2.0",
    ollamaTag: "mDevsLabs/mAI-1.2-Apex",
    huggingFaceTag: "mDevsLabs/mAI-1.2-Apex-GGUF",
    license: "MIT",
    status: "active",
    capabilities: {
      coding: true,
      reasoning: true,
      vision: true,
      jsonOutput: true,
      functionCalling: true,
    },
    recommendedHardware: {
      minVram: "8GB",
      recommendedVram: "16GB",
      ram: "16GB",
    },
    description:
      "Modèle phare de 9 milliards de paramètres offrant un raisonnement logique complexe, des compétences en développement logiciel et une analyse d'images de haute précision.",
  },
  {
    id: "mai-1.2-opal",
    name: "mAI-1.2-Opal",
    tagline:
      "Le sweet spot parfait entre vitesse et intelligence élevée. Équilibré et fluide.",
    parameters: "33B",
    contextWindow: 262144,
    maxOutputTokens: 32768,
    vision: false,
    multimodal: false,
    releaseDate: "2026-07-22",
    version: "1.2.0",
    ollamaTag: "mDevsLabs/mAI-1.2-Opal",
    huggingFaceTag: "mDevsLabs/mAI-1.2-Opal-GGUF",
    license: "MIT",
    status: "active",
    capabilities: {
      coding: true,
      reasoning: true,
      vision: false,
      jsonOutput: true,
      functionCalling: true,
    },
    recommendedHardware: {
      minVram: "16GB",
      recommendedVram: "24GB",
      ram: "32GB",
    },
    description:
      "Modèle 33B polyvalent pour serveurs locaux et postes de travail spécialisés, offrant un équilibre exceptionnel pour la rédaction, la programmation et l'analyse documentaire.",
  },
  {
    id: "mai-1",
    name: "mAI-1",
    tagline:
      "Assistant IA local multimodal puissant de 12B paramètres pour le raisonnement et le code.",
    parameters: "12B",
    contextWindow: 262144,
    maxOutputTokens: 16384,
    vision: true,
    multimodal: true,
    releaseDate: "2026-07-11",
    version: "1.0.0",
    ollamaTag: "mDevsLabs/mAI-1",
    huggingFaceTag: "mDevsLabs/mAI-1-GGUF",
    license: "MIT",
    status: "active",
    capabilities: {
      coding: true,
      reasoning: true,
      vision: true,
      jsonOutput: true,
      functionCalling: false,
    },
    recommendedHardware: {
      minVram: "8GB",
      recommendedVram: "12GB",
      ram: "16GB",
    },
    description:
      "Première génération du modèle mAI 12B avec support multimodal original et capacités avancées en résolution de problèmes.",
  },
  {
    id: "mai-1-light",
    name: "mAI-1-Light",
    tagline: "Assistant IA local ultraléger et rapide de 3B paramètres.",
    parameters: "3B",
    contextWindow: 131072,
    maxOutputTokens: 8192,
    vision: false,
    multimodal: false,
    releaseDate: "2026-07-11",
    version: "1.0.0",
    ollamaTag: "mDevsLabs/mAI-1-Light",
    huggingFaceTag: "mDevsLabs/mAI-1-Light-GGUF",
    license: "MIT",
    status: "active",
    capabilities: {
      coding: true,
      reasoning: true,
      vision: false,
      jsonOutput: true,
      functionCalling: false,
    },
    recommendedHardware: {
      minVram: "2GB",
      recommendedVram: "4GB",
      ram: "8GB",
    },
    description:
      "Version 3B texte de première génération optimisée pour une empreinte mémoire minimale.",
  },
];

export const maiModels = maiModelsList;