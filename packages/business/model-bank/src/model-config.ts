import type { AiFullModelCard } from 'model-bank';
import { loadModels as loadModelBankModels, ModelProvider } from 'model-bank';

interface mAIModelConfig {
  models: AiFullModelCard[];
  planCardModels: string[];
  updatedAt?: string;
  version: number;
}

const getDefaultmAIModelConfig = (): mAIModelConfig => ({
  models: [],
  planCardModels: [],
  version: 1,
});

const loadmAIModelConfig = async (): Promise<mAIModelConfig> =>
  getDefaultmAIModelConfig();

export const loadModels = async () =>
  loadModelBankModels({
    providerLoaders: {
      [ModelProvider.mAI]: loadmAIModels,
    },
  });

const loadmAIModels = async (): Promise<AiFullModelCard[]> =>
  (await loadmAIModelConfig()).models;

export const loadmAIPlanCardModels = async (): Promise<string[]> =>
  (await loadmAIModelConfig()).planCardModels;
