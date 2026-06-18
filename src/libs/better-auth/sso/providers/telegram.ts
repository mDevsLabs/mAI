import { authEnv } from '@/envs/auth';

import { buildOidcConfig } from '../helpers';
import { type GenericProviderDefinition } from '../types';

const provider: GenericProviderDefinition<{
  AUTH_TELEGRAM_ID: string;
  AUTH_TELEGRAM_SECRET: string;
}> = {
  build: (env) =>
    buildOidcConfig({
      clientId: env.AUTH_TELEGRAM_ID,
      clientSecret: env.AUTH_TELEGRAM_SECRET,
      issuer: 'https://oauth.telegram.org',
      overrides: {
        mapProfileToUser: (profile) => ({
          email: `${profile.sub ?? profile.id}@telegram.local`,
          emailVerified: true,
          image: profile.picture,
          name: profile.name ?? profile.preferred_username ?? profile.sub ?? profile.id,
        }),
      },
      providerId: 'telegram',
      scopes: ['openid', 'profile'],
    }),
  checkEnvs: () => {
    return !!(authEnv.AUTH_TELEGRAM_ID && authEnv.AUTH_TELEGRAM_SECRET)
      ? {
          AUTH_TELEGRAM_ID: authEnv.AUTH_TELEGRAM_ID,
          AUTH_TELEGRAM_SECRET: authEnv.AUTH_TELEGRAM_SECRET,
        }
      : false;
  },
  id: 'telegram',
  type: 'generic',
};

export default provider;
