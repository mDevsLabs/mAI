import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    AUTH_DISCORD_ID: string;
    AUTH_DISCORD_SECRET: string;
  },
  'discord'
> = {
  build: (env) => {
    return {
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_DISCORD_ID && authEnv.AUTH_DISCORD_SECRET)
      ? {
          AUTH_DISCORD_ID: authEnv.AUTH_DISCORD_ID,
          AUTH_DISCORD_SECRET: authEnv.AUTH_DISCORD_SECRET,
        }
      : false;
  },
  id: 'discord',
  type: 'builtin',
};

export default provider;
