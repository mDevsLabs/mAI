/**
 * Canonical IDs of Better-Auth built-in social providers.
 * Keep this list in sync with provider definitions in `src/libs/better-auth/sso/providers`.
 */
export const BUILTIN_BETTER_AUTH_PROVIDERS = [
  'apple',
  'google',
  'github',
  'cognito',
  'microsoft',
  'twitch',
  'discord',
  'spotify',
  'notion',
  'twitter',
] as const;

/**
 * Provider alias → canonical ID mapping.
 * This is used on the client to normalize configured provider keys.
 */
export const PROVIDER_ALIAS_MAP: Record<string, string> = {
  'microsoft-entra-id': 'microsoft',
};
