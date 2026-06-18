import { describe, expect, it, vi } from 'vitest';

vi.mock('@/envs/auth', () => ({
  authEnv: {
    AUTH_CANVA_ID: 'canva-client-id',
    AUTH_CANVA_SECRET: 'canva-client-secret',

    AUTH_GITHUB_ID: 'github-client-id',
    AUTH_GITHUB_SECRET: 'github-client-secret',
    AUTH_GOOGLE_ID: 'google-client-id',
    AUTH_GOOGLE_SECRET: 'google-client-secret',
    AUTH_NOTION_ID: 'notion-client-id',
    AUTH_NOTION_SECRET: 'notion-client-secret',
    AUTH_SLACK_ID: 'slack-client-id',
    AUTH_SLACK_SECRET: 'slack-client-secret',
    AUTH_SPOTIFY_ID: 'spotify-client-id',
    AUTH_SPOTIFY_SECRET: 'spotify-client-secret',
    AUTH_TELEGRAM_ID: 'telegram-client-id',
    AUTH_TELEGRAM_SECRET: 'telegram-client-secret',
    AUTH_TWITCH_ID: 'twitch-client-id',
    AUTH_TWITCH_SECRET: 'twitch-client-secret',
    AUTH_X_ID: 'x-client-id',
    AUTH_X_SECRET: 'x-client-secret',
  },
}));

describe('new SSO providers', () => {
  it('should expose native provider configs for built-in providers', async () => {
    const [slack, spotify, twitch, notion] = await Promise.all([
      import('./slack'),
      import('./spotify'),
      import('./twitch'),
      import('./notion'),
    ]);


    expect(slack.default.build(slack.default.checkEnvs()!)).toEqual({
      clientId: 'slack-client-id',
      clientSecret: 'slack-client-secret',
    });
    expect(spotify.default.build(spotify.default.checkEnvs()!)).toEqual({
      clientId: 'spotify-client-id',
      clientSecret: 'spotify-client-secret',
    });
    expect(twitch.default.build(twitch.default.checkEnvs()!)).toEqual({
      clientId: 'twitch-client-id',
      clientSecret: 'twitch-client-secret',
    });
    expect(notion.default.build(notion.default.checkEnvs()!)).toEqual({
      clientId: 'notion-client-id',
      clientSecret: 'notion-client-secret',
    });
  });

  it('should expose generic provider configs with the expected callbacks and redirects', async () => {
    const [xProvider, canvaProvider, telegramProvider] = await Promise.all([
      import('./x'),
      import('./canva'),
      import('./telegram'),
    ]);

    const xConfig = xProvider.default.build(xProvider.default.checkEnvs()!);
    const canvaConfig = canvaProvider.default.build(canvaProvider.default.checkEnvs()!);
    const telegramConfig = telegramProvider.default.build(telegramProvider.default.checkEnvs()!);

    expect(xConfig).toEqual(
      expect.objectContaining({
        authentication: 'basic',
        authorizationUrl: 'https://x.com/i/oauth2/authorize',
        providerId: 'x',
        tokenUrl: 'https://api.x.com/2/oauth2/token',
      }),
    );
    expect(canvaConfig).toEqual(
      expect.objectContaining({
        authentication: 'basic',
        authorizationUrl: 'https://www.canva.com/api/oauth/authorize',
        providerId: 'canva',
        responseType: 'code',
        tokenUrl: 'https://api.canva.com/rest/v1/oauth/token',
      }),
    );
    expect(telegramConfig).toEqual(
      expect.objectContaining({
        discoveryUrl: 'https://oauth.telegram.org/.well-known/openid-configuration',
        providerId: 'telegram',
        scopes: ['openid', 'profile'],
      }),
    );
  });

  it('should fall back to dummy config for railway when env vars are not set', async () => {
    const railway = await import('./railway');

    expect(railway.default.checkEnvs()).toEqual({
      AUTH_RAILWAY_ID: 'dummy_id',
      AUTH_RAILWAY_SECRET: 'dummy_secret',
    });
  });
});
