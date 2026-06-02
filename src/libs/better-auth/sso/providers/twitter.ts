import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    TWITTER_CLIENT_ID: string;
    TWITTER_CLIENT_SECRET: string;
  },
  'twitter'
> = {
  build: (env) => {
    return {
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET)
      ? {
          TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
          TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
        }
      : false;
  },
  id: 'twitter',
  type: 'builtin',
};

export default provider;
