import { authEnv } from '@/envs/auth';

import { type GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition<{
  AUTH_MONDAY_ID: string;
  AUTH_MONDAY_SECRET: string;
}> = {
  build: (env) => {
    return {
      authorizationUrl: 'https://auth.monday.com/oauth2/authorize',
      clientId: env.AUTH_MONDAY_ID,
      clientSecret: env.AUTH_MONDAY_SECRET,
      getUserInfo: async (tokens) => {
        const response = await fetch('https://api.monday.com/v2', {
          body: JSON.stringify({
            query: `query { me { id name email } }`,
          }),
          headers: {
            Authorization: tokens.accessToken, // monday uses the token directly, no Bearer prefix required typically, or we can just try token.
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        if (!response.ok) return null;

        const data = (await response.json()) as {
          data?: {
            me?: {
              email?: string;
              id?: string;
              name?: string;
            };
          };
        };

        const me = data.data?.me;
        if (!me?.id) return null;

        return {
          data,
          user: {
            email: me.email || `${me.id}@monday.local`,
            emailVerified: !!me.email,
            id: me.id,
            name: me.name || me.id,
          },
        };
      },
      providerId: 'monday',
      responseType: 'code',
      scopes: ['me:read'],
      tokenUrl: 'https://auth.monday.com/oauth2/token',
    };
  },
  checkEnvs: () => {
    return {
      AUTH_MONDAY_ID: authEnv.AUTH_MONDAY_ID || 'dummy_id',
      AUTH_MONDAY_SECRET: authEnv.AUTH_MONDAY_SECRET || 'dummy_secret',
    };
  },
  id: 'monday',
  type: 'generic',
};

export default provider;
