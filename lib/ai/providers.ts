/**
 * Providers IA pour mAI
 * Support : AI Gateway (Vercel), FranceStudent (SDK OpenAI), AI Horde (REST)
 * 
 * @version 0.0.2
 */
import { createOpenAI } from "@ai-sdk/openai";
import { customProvider, gateway } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel, getModelCategory } from "./models";

// ──────────────────────────────────────────────
// Provider FranceStudent (compatible SDK OpenAI)
// ──────────────────────────────────────────────
const franceStudent = createOpenAI({
  apiKey: process.env.FS_API_KEY ?? "",
  baseURL: process.env.FS_BASE_URL ?? "https://api.francestudent.org/v1/",
  name: "francestudent",
});

// ──────────────────────────────────────────────
// Provider pour les tests
// ──────────────────────────────────────────────
export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

/**
 * Retourne le modèle de langage approprié en fonction de l'ID du modèle.
 * Route automatiquement vers le bon provider (AI Gateway, FranceStudent, AI Horde).
 */
export function getLanguageModel(modelId: string) {
  // Environnement de test
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  // Déterminer la catégorie du modèle
  const category = getModelCategory(modelId);

  switch (category) {
    case "francestudent":
      // FranceStudent via SDK OpenAI compatible
      return franceStudent(modelId);

    case "ai-horde":
      // AI Horde : pas de support direct via AI SDK, 
      // fallback vers FranceStudent pour le moment
      // (l'API Horde sera gérée via des appels REST dans les routes API)
      return franceStudent(modelId);

    case "ai-gateway":
    default:
      // AI Gateway (Vercel)
      return gateway.languageModel(modelId);
  }
}

/**
 * Retourne le modèle utilisé pour la génération de titres.
 */
export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return gateway.languageModel(titleModel.id);
}
