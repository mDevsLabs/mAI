import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
  },
  'discord'
> = {
  build: (env) => {
    return {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.DISCORD_CLIENT_ID && authEnv.DISCORD_CLIENT_SECRET)
      ? {
          DISCORD_CLIENT_ID: authEnv.DISCORD_CLIENT_ID,
          DISCORD_CLIENT_SECRET: authEnv.DISCORD_CLIENT_SECRET,
        }
      : false;
  },
  id: 'discord',
  type: 'builtin',
};

export default provider;
