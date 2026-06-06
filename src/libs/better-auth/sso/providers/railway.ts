import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    AUTH_RAILWAY_ID: string;
    AUTH_RAILWAY_SECRET: string;
  },
  'railway'
> = {
  build: (env) => {
    return {
      clientId: env.AUTH_RAILWAY_ID,
      clientSecret: env.AUTH_RAILWAY_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_RAILWAY_ID && authEnv.AUTH_RAILWAY_SECRET)
      ? {
          AUTH_RAILWAY_ID: authEnv.AUTH_RAILWAY_ID,
          AUTH_RAILWAY_SECRET: authEnv.AUTH_RAILWAY_SECRET,
        }
      : false;
  },
  id: 'railway',
  type: 'builtin',
};

export default provider;
