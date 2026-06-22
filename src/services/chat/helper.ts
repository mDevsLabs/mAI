import type { EnabledAiModel } from 'model-bank';
import { ModelProvider } from 'model-bank';

import { getAiInfraStoreState } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/selectors';

export const getEnabledRuntimeModel = (
  model: string,
  provider: string,
): EnabledAiModel | undefined => {
  const state = getAiInfraStoreState();
  const exactModel = state.enabledAiModels?.find(
    (item) => item.id === model && item.providerId === provider,
  );

  if (exactModel || provider !== ModelProvider.LobeHub) return exactModel;

  return state.enabledAiModels?.find((item) => item.id === model);
};

const getModelAbilities = (model: string, provider: string) => {
  return getEnabledRuntimeModel(model, provider)?.abilities;
};

export const isCanUseVision = (model: string, provider: string): boolean => {
  return getModelAbilities(model, provider)?.vision || false;
};

export const isCanUseVideo = (model: string, provider: string): boolean => {
  return getModelAbilities(model, provider)?.video || false;
};

export const isCanUseAudio = (model: string, provider: string): boolean => {
  return getModelAbilities(model, provider)?.audio || false;
};

export const getRuntimeModelKnowledgeCutoff = (
  model: string,
  provider: string,
): string | undefined => getEnabledRuntimeModel(model, provider)?.knowledgeCutoff;

export const findDeploymentName = (model: string, provider: string): string | undefined => {
  const state = getAiInfraStoreState();
  const providerDetail = aiProviderSelectors.providerDetailById(provider)(state);

  if (!providerDetail?.settings?.showDeployName) return undefined;

  // find the model by id
  const modelItem = state.enabledAiModels?.find(
    (i) => i.id === model && i.providerId === provider,
  );

  if (modelItem && modelItem.config?.deploymentName) return modelItem.config?.deploymentName;

  return model;
};

export const isEnableFetchOnClient = (provider: string) => {
  return aiProviderSelectors.isProviderFetchOnClient(provider)(getAiInfraStoreState());
};

export const resolveRuntimeProvider = (provider: string) => {
  const isBuiltin = Object.values(ModelProvider).includes(provider as any);
  if (isBuiltin) return provider;

  const providerConfig = aiProviderSelectors.providerConfigById(provider)(getAiInfraStoreState());

  return providerConfig?.settings.sdkType || 'openai';
};
