import { authEnv } from '@/envs/auth';

import { type GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition<{
  AUTH_CANVA_ID: string;
  AUTH_CANVA_SECRET: string;
}> = {
  build: (env) => {
    return {
      authentication: 'basic',
      authorizationUrl: 'https://www.canva.com/api/oauth/authorize',
      clientId: env.AUTH_CANVA_ID,
      clientSecret: env.AUTH_CANVA_SECRET,
      getUserInfo: async (tokens) => {
        const [userResponse, profileResponse] = await Promise.all([
          fetch('https://api.canva.com/rest/v1/users/me', {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }),
          fetch('https://api.canva.com/rest/v1/users/me/profile', {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }),
        ]);

        if (!userResponse.ok) return null;

        const user = (await userResponse.json()) as {
          team_id?: string;
          user_id?: string;
          id?: string;
        };
        const profile = profileResponse.ok
          ? ((await profileResponse.json()) as { profile?: { display_name?: string } })
          : null;

        const userId = user.user_id || user.id;

        if (!userId) return null;

        const displayName = profile?.profile?.display_name;

        return {
          data: {
            profile,
            user,
          },
          user: {
            email: `${userId}@canva.local`,
            emailVerified: true,
            id: userId,
            name: displayName || userId,
          },
        };
      },
      pkce: true,
      providerId: 'canva',
      responseType: 'code',
      scopes: ['openid', 'profile', 'email', 'profile:read'],
      tokenUrl: 'https://api.canva.com/rest/v1/oauth/token',
      userInfoUrl: 'https://api.canva.com/rest/v1/users/me/profile',
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_CANVA_ID && authEnv.AUTH_CANVA_SECRET)
      ? {
          AUTH_CANVA_ID: authEnv.AUTH_CANVA_ID,
          AUTH_CANVA_SECRET: authEnv.AUTH_CANVA_SECRET,
        }
      : false;
  },
  id: 'canva',
  type: 'generic',
};

export default provider;
