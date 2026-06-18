import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    AUTH_NOTION_ID: string;
    AUTH_NOTION_SECRET: string;
  },
  'notion'
> = {
  build: (env) => {
    return {
      clientId: env.AUTH_NOTION_ID,
      clientSecret: env.AUTH_NOTION_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_NOTION_ID && authEnv.AUTH_NOTION_SECRET)
      ? {
          AUTH_NOTION_ID: authEnv.AUTH_NOTION_ID,
          AUTH_NOTION_SECRET: authEnv.AUTH_NOTION_SECRET,
        }
      : false;
  },
  id: 'notion',
  type: 'builtin',
};

export default provider;
