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
    const clientId = process.env.TWITCH_CLIENT_ID?.trim();
    const clientSecret = process.env.TWITCH_CLIENT_SECRET?.trim();

    return !!(clientId && clientSecret)
      ? {
        TWITCH_CLIENT_ID: clientId,
        TWITCH_CLIENT_SECRET: clientSecret,
        }
      : false;
  },
  id: 'twitch',
  type: 'builtin',
};

export default provider;
