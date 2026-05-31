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
    const clientId = process.env.DISCORD_CLIENT_ID?.trim();
    const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();

    return !!(clientId && clientSecret)
      ? {
        DISCORD_CLIENT_ID: clientId,
        DISCORD_CLIENT_SECRET: clientSecret,
        }
      : false;
  },
  id: 'discord',
  type: 'builtin',
};

export default provider;
