import { type GenericProviderDefinition } from '../types';

type CanvaUserResponse = {
  user?: {
    avatar_url?: string;
    email?: string;
    id: string;
    name?: string;
  };
};

const provider: GenericProviderDefinition<{
  CANVA_CLIENT_ID: string;
  CANVA_CLIENT_SECRET: string;
}> = {
  build: (env) => {
    return {
      authorizationUrl: 'https://www.canva.com/api/oauth/v1/authorize',
      clientId: env.CANVA_CLIENT_ID,
      clientSecret: env.CANVA_CLIENT_SECRET,
      getUserInfo: async (tokens) => {
        if (!tokens.accessToken) return null;
        const res = await fetch('https://api.canva.com/rest/v1/users/me', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        if (!res.ok) return null;
        const payload = (await res.json()) as CanvaUserResponse;
        const user = payload.user;
        if (!user) return null;
        return {
          email: user.email || `${user.id}@canva.sso`,
          id: user.id,
          image: user.avatar_url,
          name: user.name || user.id,
        };
      },
      pkce: true,
      providerId: 'canva',
      scopes: ['profile:read'],
      tokenUrl: 'https://api.canva.com/rest/v1/oauth/token',
    };
  },
  checkEnvs: () => {
    const clientId = process.env.CANVA_CLIENT_ID?.trim();
    const clientSecret = process.env.CANVA_CLIENT_SECRET?.trim();

    return !!(clientId && clientSecret)
      ? {
          CANVA_CLIENT_ID: clientId,
          CANVA_CLIENT_SECRET: clientSecret,
        }
      : false;
  },
  id: 'canva',
  type: 'generic',
};

export default provider;
