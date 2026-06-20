import { ENABLE_BUSINESS_FEATURES } from '@lobechat/business-const';

import { appEnv } from '@/envs/app';
import { authEnv } from '@/envs/auth';
import { parseSSOProviders } from '@/libs/better-auth/utils/server';
import { type GlobalServerConfig } from '@/types/serverConfig';

const getBetterAuthSSOProviders = () => {
  const providers = parseSSOProviders(authEnv.AUTH_SSO_PROVIDERS);
  if (providers.length === 0 && process.env.NODE_ENV === 'development') {
    return [
      'google',
      'github',
      'x',
      'canva',
      'slack',
      'notion',
      'spotify',
      'telegram',
      'twitch',
      'railway',
    ];
  }
  return providers;
};

export const getServerAuthConfig = (): GlobalServerConfig => {
  return {
    aiProvider: {},
    disableEmailPassword: authEnv.AUTH_DISABLE_EMAIL_PASSWORD,
    enableBusinessFeatures: ENABLE_BUSINESS_FEATURES,
    enableEmailVerification: authEnv.AUTH_EMAIL_VERIFICATION,
    enableMagicLink: authEnv.AUTH_ENABLE_MAGIC_LINK,
    enableMarketTrustedClient: !!(
      appEnv.MARKET_TRUSTED_CLIENT_SECRET && appEnv.MARKET_TRUSTED_CLIENT_ID
    ),
    oAuthSSOProviders: getBetterAuthSSOProviders(),
    telemetry: {},
  };
};
