import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    AUTH_TWITCH_ID: string;
    AUTH_TWITCH_SECRET: string;
  },
  'twitch'
> = {
  build: (env) => {
    return {
      clientId: env.AUTH_TWITCH_ID,
      clientSecret: env.AUTH_TWITCH_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_TWITCH_ID && authEnv.AUTH_TWITCH_SECRET)
      ? {
          AUTH_TWITCH_ID: authEnv.AUTH_TWITCH_ID,
          AUTH_TWITCH_SECRET: authEnv.AUTH_TWITCH_SECRET,
        }
      : false;
  },
  id: 'twitch',
  type: 'builtin',
};

export default provider;
