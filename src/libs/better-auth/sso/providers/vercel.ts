import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    AUTH_VERCEL_ID: string;
    AUTH_VERCEL_SECRET: string;
  },
  'vercel'
> = {
  build: (env) => {
    return {
      clientId: env.AUTH_VERCEL_ID,
      clientSecret: env.AUTH_VERCEL_SECRET,
    };
  },
  checkEnvs: () => {
    return {
      AUTH_VERCEL_ID: authEnv.AUTH_VERCEL_ID || 'dummy_id',
      AUTH_VERCEL_SECRET: authEnv.AUTH_VERCEL_SECRET || 'dummy_secret',
    };
  },
  id: 'vercel',
  type: 'builtin',
};

export default provider;
