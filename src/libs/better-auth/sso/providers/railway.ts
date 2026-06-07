import { authEnv } from '@/envs/auth';

import { type GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition<{
  AUTH_RAILWAY_ID: string;
  AUTH_RAILWAY_SECRET: string;
}> = {
  build: (env) => {
    return {
      authorizationUrl: 'https://backboard.railway.com/oauth/auth',
      clientId: env.AUTH_RAILWAY_ID,
      clientSecret: env.AUTH_RAILWAY_SECRET,
      discoveryUrl: 'https://backboard.railway.com/oauth/.well-known/openid-configuration',
      providerId: 'railway',
      responseType: 'code',
      scopes: ['openid', 'email', 'profile'],
      tokenUrl: 'https://backboard.railway.com/oauth/token',
    };
  },
  checkEnvs: () => {
    return {
      AUTH_RAILWAY_ID: authEnv.AUTH_RAILWAY_ID || 'dummy_id',
      AUTH_RAILWAY_SECRET: authEnv.AUTH_RAILWAY_SECRET || 'dummy_secret',
    };
  },
  id: 'railway',
  type: 'generic',
};

export default provider;
