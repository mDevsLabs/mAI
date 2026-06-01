import { type GenericProviderDefinition } from '../types';

type NotionTokenPayload = {
  owner?: {
    user?: {
      avatar_url?: string;
      id: string;
      name?: string;
      person?: {
        email?: string;
      };
    };
  };
};

const provider: GenericProviderDefinition<{
  NOTION_CLIENT_ID: string;
  NOTION_CLIENT_SECRET: string;
}> = {
  build: (env) => {
    return {
      authorizationUrl: 'https://api.notion.com/v1/oauth/authorize',
      clientId: env.NOTION_CLIENT_ID,
      clientSecret: env.NOTION_CLIENT_SECRET,
      getUserInfo: async (tokens) => {
        const raw = tokens.raw as NotionTokenPayload;
        const ownerUser = raw?.owner?.user;
        if (ownerUser) {
          return {
            email: ownerUser.person?.email || `${ownerUser.id}@notion.sso`,
            id: ownerUser.id,
            image: ownerUser.avatar_url,
            name: ownerUser.name || 'Notion User',
          };
        }
        return null;
      },
      pkce: false,
      providerId: 'notion',
      tokenUrl: 'https://api.notion.com/v1/oauth/token',
    };
  },
  checkEnvs: () => {
    const clientId = process.env.NOTION_CLIENT_ID?.trim();
    const clientSecret = process.env.NOTION_CLIENT_SECRET?.trim();

    return !!(clientId && clientSecret)
      ? {
          NOTION_CLIENT_ID: clientId,
          NOTION_CLIENT_SECRET: clientSecret,
        }
      : false;
  },
  id: 'notion',
  type: 'generic',
};

export default provider;
