import { authEnv } from '@/envs/auth';

import { type GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition<{
  AUTH_X_ID: string;
  AUTH_X_SECRET: string;
}> = {
  aliases: ['twitter'],
  build: (env) => {
    return {
      authentication: 'basic',
      authorizationUrl: 'https://x.com/i/oauth2/authorize',
      clientId: env.AUTH_X_ID,
      clientSecret: env.AUTH_X_SECRET,
      getUserInfo: async (tokens) => {
        const profileResponse = await fetch(
          'https://api.x.com/2/users/me?user.fields=profile_image_url',
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          },
        );

        if (!profileResponse.ok) return null;

        const profile = (await profileResponse.json()) as {
          data?: {
            id?: string;
            name?: string;
            profile_image_url?: string;
            username?: string;
          };
        };

        if (!profile.data?.id) return null;

        const emailResponse = await fetch('https://api.x.com/2/users/me?user.fields=confirmed_email', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        let email: string | undefined;
        let emailVerified = false;

        if (emailResponse.ok) {
          const emailData = (await emailResponse.json()) as {
            data?: { confirmed_email?: string };
          };

          if (emailData.data?.confirmed_email) {
            email = emailData.data.confirmed_email;
            emailVerified = true;
          }
        }

        return {
          data: profile,
          user: {
            email: email || `${profile.data.id}@x.local`,
            emailVerified,
            id: profile.data.id,
            image: profile.data.profile_image_url,
            name: profile.data.name || profile.data.username || profile.data.id,
          },
        };
      },
      pkce: true,
      providerId: 'x',
      scopes: ['users.read', 'tweet.read', 'offline.access'],
      tokenUrl: 'https://api.x.com/2/oauth2/token',
      userInfoUrl: 'https://api.x.com/2/users/me?user.fields=profile_image_url',
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_X_ID && authEnv.AUTH_X_SECRET)
      ? {
          AUTH_X_ID: authEnv.AUTH_X_ID,
          AUTH_X_SECRET: authEnv.AUTH_X_SECRET,
        }
      : false;
  },
  id: 'x',
  type: 'generic',
};

export default provider;
