import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Google SSO provider', () => {
  it('should prompt account selection during OAuth sign in', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-client-secret');

    const { default: provider } = await import('./google');

    const env = provider.checkEnvs();

    expect(env).toEqual({
      GOOGLE_CLIENT_ID: 'google-client-id',
      GOOGLE_CLIENT_SECRET: 'google-client-secret',
    });
    expect(env && provider.build(env)).toEqual(
      expect.objectContaining({
        prompt: 'select_account',
      }),
    );
  });
});
