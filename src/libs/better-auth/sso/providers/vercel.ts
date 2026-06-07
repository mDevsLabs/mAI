import { authEnv } from '@/envs/auth';

import { type GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition<{
  AUTH_VERCEL_ID: string;
  AUTH_VERCEL_SECRET: string;
}> = {
  build: (env) => {
    return {
      authorizationUrl: 'https://vercel.com/oauth/authorize',
      clientId: env.AUTH_VERCEL_ID,
      clientSecret: env.AUTH_VERCEL_SECRET,
      getUserInfo: async (tokens) => {
        const response = await fetch('https://api.vercel.com/v2/user', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        if (!response.ok) return null;

        const data = (await response.json()) as {
          user?: {
            avatar?: string;
            email?: string;
            id?: string;
            name?: string;
            username?: string;
          };
        };

        const user = data.user;
        if (!user?.id) return null;

        return {
          data,
          user: {
            email: user.email || `${user.id}@vercel.local`,
            emailVerified: !!user.email,
            id: user.id,
            image: user.avatar,
            name: user.name || user.username || user.id,
          },
        };
      },
      providerId: 'vercel',
      responseType: 'code',
      scopes: ['openid', 'email', 'profile'],
      tokenUrl: 'https://api.vercel.com/v2/oauth/access_token',
    };
  },
  checkEnvs: () => {
    return {
      AUTH_VERCEL_ID: authEnv.AUTH_VERCEL_ID || 'dummy_id',
      AUTH_VERCEL_SECRET: authEnv.AUTH_VERCEL_SECRET || 'dummy_secret',
    };
  },
  id: 'vercel',
  type: 'generic',
};

export default provider;
