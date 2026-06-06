import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    AUTH_MONDAY_ID: string;
    AUTH_MONDAY_SECRET: string;
  },
  'monday'
> = {
  build: (env) => {
    return {
      clientId: env.AUTH_MONDAY_ID,
      clientSecret: env.AUTH_MONDAY_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_MONDAY_ID && authEnv.AUTH_MONDAY_SECRET)
      ? {
          AUTH_MONDAY_ID: authEnv.AUTH_MONDAY_ID,
          AUTH_MONDAY_SECRET: authEnv.AUTH_MONDAY_SECRET,
        }
      : false;
  },
  id: 'monday',
  type: 'builtin',
};

export default provider;
