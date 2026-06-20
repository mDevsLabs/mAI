import { type GenericOAuthConfig } from 'better-auth/plugins';
import { type SocialProviders } from 'better-auth/social-providers';

import { appEnv } from '@/envs/app';
import { authEnv } from '@/envs/auth';
import { BUILTIN_BETTER_AUTH_PROVIDERS } from '@/libs/better-auth/constants';
import { parseSSOProviders } from '@/libs/better-auth/utils/server';

import Canva from './providers/canva';
import Github from './providers/github';
import Google from './providers/google';
import Notion from './providers/notion';
import Railway from './providers/railway';
import Slack from './providers/slack';
import Spotify from './providers/spotify';
import Telegram from './providers/telegram';
import Twitch from './providers/twitch';
import X from './providers/x';

const providerDefinitions = [
  Canva,
  Google,
  Github,
  Notion,
  Railway,
  Slack,
  Spotify,
  Telegram,
  Twitch,
  X,
] as const;

const builtInProviderIds = new Set(BUILTIN_BETTER_AUTH_PROVIDERS);

for (const definition of providerDefinitions) {
  if (definition.type === 'builtin' && !builtInProviderIds.has(definition.id)) {
    throw new Error(
      `[Better-Auth] Built-in provider "${definition.id}" is not registered in BUILTIN_BETTER_AUTH_PROVIDERS (src/libs/better-auth/constants.ts). Please update the constant to keep them in sync.`,
    );
  }
}

const providerRegistry = new Map<string, (typeof providerDefinitions)[number]>();

for (const definition of providerDefinitions) {
  providerRegistry.set(definition.id, definition);
  definition.aliases?.forEach((alias) => providerRegistry.set(alias, definition));
}

export const initBetterAuthSSOProviders = () => {
  let enabledProviders = parseSSOProviders(authEnv.AUTH_SSO_PROVIDERS);
  if (enabledProviders.length === 0 && process.env.NODE_ENV === 'development') {
    enabledProviders = [
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

  const socialProviders: SocialProviders = {};
  const genericOAuthProviders: GenericOAuthConfig[] = [];

  for (const rawProvider of enabledProviders) {
    const definition = providerRegistry.get(rawProvider);

    if (!definition) {
      throw new Error(`[Better-Auth] Unknown SSO provider: ${rawProvider}`);
    }

    /**
     * Providers expose checkEnvs predicates so we can fail fast when credentials are missing instead
     * of encountering harder-to-trace errors later in the Better-Auth pipeline.
     */
    let env = definition.checkEnvs();
    if (!env) {
      if (process.env.NODE_ENV === 'development') {
        const upperId = definition.id.toUpperCase();
        env = {
          [`AUTH_${upperId}_ID`]: `dummy_${definition.id}_id`,
          [`AUTH_${upperId}_SECRET`]: `dummy_${definition.id}_secret`,
        } as any;
      } else {
        throw new Error(
          `[Better-Auth] ${rawProvider} SSO provider environment variables are not set correctly!`,
        );
      }
    }

    if (definition.type === 'builtin') {
      const providerId = definition.id;
      if (socialProviders[providerId]) {
        throw new Error(`[Better-Auth] Duplicate SSO provider: ${providerId}`);
      }

      // @ts-expect-error - build expects specific env type, but we use union definition type
      const config = definition.build(env);
      if (config) {
        // @ts-expect-error hard to type
        socialProviders[providerId] = config;
      }

      continue;
    }

    // @ts-expect-error - build expects specific env type, but we use union definition type
    const config = definition.build(env);

    if (config) {
      // the generic oidc callback url is /api/auth/oauth2/callback/{providerId}
      // different from builtin providers' /api/auth/callback/{providerId}
      config.redirectURI = `${appEnv.APP_URL}/api/auth/callback/${definition.id}`;
      genericOAuthProviders.push(config);
    }
  }

  return {
    genericOAuthProviders,
    socialProviders,
  };
};
