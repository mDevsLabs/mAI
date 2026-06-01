import { type GenericProviderDefinition } from '../types';

type XUserResponse = {
  data?: {
    id: string;
    name?: string;
    profile_image_url?: string;
    username: string;
  };
};

const provider: GenericProviderDefinition<{
  X_CLIENT_ID: string;
  X_CLIENT_SECRET: string;
}> = {
  build: (env) => {
    return {
      authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
      clientId: env.X_CLIENT_ID,
      clientSecret: env.X_CLIENT_SECRET,
      getUserInfo: async (tokens) => {
        if (!tokens.accessToken) return null;
        const res = await fetch(
          'https://api.twitter.com/2/users/me?user.fields=profile_image_url,username',
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          },
        );
        if (!res.ok) return null;
        const payload = (await res.json()) as XUserResponse;
        const user = payload.data;
        if (!user) return null;
        return {
          email: `${user.username}@x.sso`,
          id: user.id,
          image: user.profile_image_url,
          name: user.name || user.username,
        };
      },
      pkce: true,
      providerId: 'x',
      scopes: ['users.read', 'tweet.read'],
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    };
  },
  checkEnvs: () => {
    const clientId = process.env.X_CLIENT_ID?.trim();
    const clientSecret = process.env.X_CLIENT_SECRET?.trim();

    return !!(clientId && clientSecret)
      ? {
          X_CLIENT_ID: clientId,
          X_CLIENT_SECRET: clientSecret,
        }
      : false;
  },
  id: 'x',
  type: 'generic',
};

export default provider;
