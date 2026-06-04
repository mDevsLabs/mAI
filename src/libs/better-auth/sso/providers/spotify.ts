import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    AUTH_SPOTIFY_ID: string;
    AUTH_SPOTIFY_SECRET: string;
  },
  'spotify'
> = {
  build: (env) => {
    return {
      clientId: env.AUTH_SPOTIFY_ID,
      clientSecret: env.AUTH_SPOTIFY_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_SPOTIFY_ID && authEnv.AUTH_SPOTIFY_SECRET)
      ? {
          AUTH_SPOTIFY_ID: authEnv.AUTH_SPOTIFY_ID,
          AUTH_SPOTIFY_SECRET: authEnv.AUTH_SPOTIFY_SECRET,
        }
      : false;
  },
  id: 'spotify',
  type: 'builtin',
};

export default provider;
