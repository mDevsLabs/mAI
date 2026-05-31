import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
  },
  'github'
> = {
  build: (env) => {
    return {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  },
  checkEnvs: () => {
    const clientId = process.env.GITHUB_CLIENT_ID?.trim();
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

    return !!(clientId && clientSecret)
      ? {
        GITHUB_CLIENT_ID: clientId,
        GITHUB_CLIENT_SECRET: clientSecret,
        }
      : false;
  },
  id: 'github',
  type: 'builtin',
};

export default provider;
