import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
  },
  'spotify'
> = {
  build: (env) => {
    return {
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.SPOTIFY_CLIENT_ID && authEnv.SPOTIFY_CLIENT_SECRET)
      ? {
          SPOTIFY_CLIENT_ID: authEnv.SPOTIFY_CLIENT_ID,
          SPOTIFY_CLIENT_SECRET: authEnv.SPOTIFY_CLIENT_SECRET,
        }
      : false;
  },
  id: 'spotify',
  type: 'builtin',
};

export default provider;
