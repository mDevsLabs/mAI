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
    return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET)
      ? {
          SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
          SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
        }
      : false;
  },
  id: 'spotify',
  type: 'builtin',
};

export default provider;
