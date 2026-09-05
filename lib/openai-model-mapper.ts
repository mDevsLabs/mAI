import { modelsData } from './models';
import { OpenAIModelObject } from './openai-types';

// Map de correspondance entre les identifiants OpenAI courants et nos modèles locaux mAI
export const OPENAI_MODEL_MAP: Record<string, string> = {
  // Flagship / Reasoning High Tier -> mAI-1.2-Apex
  'gpt-4o': 'mDevsLabs/mAI-1.2-Apex',
  'gpt-4-turbo': 'mDevsLabs/mAI-1.2-Apex',
  'claude-3-5-sonnet': 'mDevsLabs/mAI-1.2-Apex',
  'o1-preview': 'mDevsLabs/mAI-1.2-Apex',

  // Fast / Light Tier -> mAI-1.2-Light
  'gpt-4o-mini': 'mDevsLabs/mAI-1.2-Light',
  'gpt-3.5-turbo': 'mDevsLabs/mAI-1.2-Light',

  // Balanced / Heavy Tier -> mAI-1.2-Opal
  'gpt-4': 'mDevsLabs/mAI-1.2-Opal',
  'gpt-4-32k': 'mDevsLabs/mAI-1.2-Opal',

  // Original Multimodal -> mAI-1
  'gpt-4-vision-preview': 'mDevsLabs/mAI-1',

  // Original Ultra Fast -> mAI-1-Light
  'gpt-3.5-turbo-instruct': 'mDevsLabs/mAI-1-Light',
};

/**
 * Mappe un nom de modèle demandé (ex: "gpt-4o", "mai-1.2-apex", "mDevsLabs/mAI-1.2-Apex")
 * vers le tag exact attendu par le moteur Ollama local.
 */
export function resolveOllamaModel(requestedModel: string): string {
  if (!requestedModel) return 'mDevsLabs/mAI-1.2-Light';

  const cleanRequested = requestedModel.trim().toLowerCase();

  // 1. Chercher dans le mapping direct OpenAI
  for (const [key, value] of Object.entries(OPENAI_MODEL_MAP)) {
    if (key.toLowerCase() === cleanRequested) {
      return value;
    }
  }

  // 2. Chercher dans notre catalogue de modèles par id ou ollamaTag
  const found = modelsData.find(
    (m) =>
      m.id.toLowerCase() === cleanRequested ||
      m.name.toLowerCase() === cleanRequested ||
      m.ollamaTag?.toLowerCase() === cleanRequested
  );

  if (found?.ollamaTag) {
    return found.ollamaTag;
  }

  // 3. Fallback : si c'est un tag explicite (ex: "llama3:latest"), on le conserve, sinon fallback sur mAI-1.2-Light
  return requestedModel.includes('/') || requestedModel.includes(':')
    ? requestedModel
    : 'mDevsLabs/mAI-1.2-Light';
}

/**
 * Retourne la liste globale des modèles au format OpenAI Model Object
 */
export function getOpenAIModelsList(): OpenAIModelObject[] {
  const now = Math.floor(Date.now() / 1000);

  // Modèles mAI natifs
  const nativeModels: OpenAIModelObject[] = modelsData.map((m: { id: string }) => ({
    id: m.id,
    object: 'model',
    created: now,
    owned_by: 'mDevsLabs',
  }));

  // Alias OpenAI supportés
  const aliasModels: OpenAIModelObject[] = Object.keys(OPENAI_MODEL_MAP).map((alias) => ({
    id: alias,
    object: 'model',
    created: now,
    owned_by: 'openai-compatibility',
  }));

  return [...nativeModels, ...aliasModels];
}
