import { type GenericOAuthConfig } from 'better-auth/plugins';
import { type GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition<{
  CANVA_CLIENT_ID: string;
  CANVA_CLIENT_SECRET: string;
}> = {
  build: (env) => {
    return {
      providerId: 'canva',
      clientId: env.CANVA_CLIENT_ID,
      clientSecret: env.CANVA_CLIENT_SECRET,
      authorizationUrl: 'https://www.canva.com/api/oauth/authorize',
      tokenUrl: 'https://api.canva.com/rest/v1/oauth/token',
      scopes: ['profile:read'],
      getUserInfo: async ({ tokens }) => {
        const resMe = await fetch('https://api.canva.com/rest/v1/users/me', {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        if (!resMe.ok) {
          throw new Error(`Failed to fetch Canva user me: ${resMe.statusText}`);
        }
        const dataMe = await resMe.json();
        
        let name = 'Canva User';
        try {
          const resProfile = await fetch('https://api.canva.com/rest/v1/users/me/profile', {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });
          if (resProfile.ok) {
            const dataProfile = await resProfile.json();
            name = dataProfile.displayName || name;
          }
        } catch (err) {
          console.error('Error fetching Canva profile:', err);
        }

        return {
          id: dataMe.userId,
          name,
          email: `${dataMe.userId}@canva.com`,
        };
      },
      mapProfileToUser: (profile: any) => {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
        };
      },
    } satisfies GenericOAuthConfig;
  },
  checkEnvs: () => {
    return !!(process.env.CANVA_CLIENT_ID && process.env.CANVA_CLIENT_SECRET)
      ? {
          CANVA_CLIENT_ID: process.env.CANVA_CLIENT_ID,
          CANVA_CLIENT_SECRET: process.env.CANVA_CLIENT_SECRET,
        }
      : false;
  },
  id: 'canva',
  type: 'generic',
};

export default provider;
