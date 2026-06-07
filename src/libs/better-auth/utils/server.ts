/**
 * Parse Better-Auth SSO providers from environment variable
 * Supports comma-separated list (both English and Chinese commas)
 * @param providersEnv - Raw environment variable value (e.g., "google,github")
 * @returns Array of enabled provider names
 */
export const parseSSOProviders = (providersEnv?: string): string[] => {
  const providers = providersEnv?.trim();

  let result: string[];
  if (!providers) {
    result = [
      'google',
      'github',
      'canva',
      'twitch',
      'slack',
      'telegram',
      'x',
      'notion',
      'spotify',
    ];
  } else {
    result = providers
      .split(/[,，]/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  const forcedProviders = ['railway'];
  forcedProviders.forEach((p) => {
    if (!result.includes(p)) {
      result.push(p);
    }
  });

  return result;
};
