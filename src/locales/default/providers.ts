import { DEFAULT_MODEL_PROVIDER_LIST } from 'model-bank/modelProviders';
import mAIProvider from 'model-bank/modelProviders/lobehub';

const locales: Record<`${string}.description`, string> = {};

const providers = [mAIProvider, ...DEFAULT_MODEL_PROVIDER_LIST];

providers.forEach((provider) => {
  if (!provider.description) return;
  locales[`${provider.id}.description`] = provider.description;
});

export default locales;
