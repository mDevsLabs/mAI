import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    NOTION_CLIENT_ID: string;
    NOTION_CLIENT_SECRET: string;
  },
  'notion'
> = {
  build: (env) => {
    return {
      clientId: env.NOTION_CLIENT_ID,
      clientSecret: env.NOTION_CLIENT_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET)
      ? {
          NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID,
          NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET,
        }
      : false;
  },
  id: 'notion',
  type: 'builtin',
};

export default provider;
