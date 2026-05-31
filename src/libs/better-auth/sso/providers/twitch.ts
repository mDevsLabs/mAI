import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    TWITCH_CLIENT_ID: string;
    TWITCH_CLIENT_SECRET: string;
  },
  'twitch'
> = {
  build: (env) => {
    return {
      clientId: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.TWITCH_CLIENT_ID && authEnv.TWITCH_CLIENT_SECRET)
      ? {
          TWITCH_CLIENT_ID: authEnv.TWITCH_CLIENT_ID,
          TWITCH_CLIENT_SECRET: authEnv.TWITCH_CLIENT_SECRET,
        }
      : false;
  },
  id: 'twitch',
  type: 'builtin',
};

export default provider;
