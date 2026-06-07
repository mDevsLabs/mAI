import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      AUTH_ALLOWED_EMAILS?: string;
      AUTH_APPLE_APP_BUNDLE_IDENTIFIER?: string;
      AUTH_APPLE_CLIENT_ID?: string;
      AUTH_APPLE_CLIENT_SECRET?: string;
      AUTH_AUTH0_ID?: string;
      AUTH_AUTH0_ISSUER?: string;
      AUTH_AUTH0_SECRET?: string;

      AUTH_AUTHELIA_ID?: string;
      AUTH_AUTHELIA_ISSUER?: string;

      AUTH_AUTHELIA_SECRET?: string;
      AUTH_AUTHENTIK_ID?: string;
      AUTH_AUTHENTIK_ISSUER?: string;

      AUTH_AUTHENTIK_SECRET?: string;
      AUTH_CASDOOR_ID?: string;

      AUTH_CANVA_ID?: string;
      AUTH_CANVA_SECRET?: string;

      AUTH_CASDOOR_ISSUER?: string;
      AUTH_CASDOOR_SECRET?: string;
      AUTH_CLOUDFLARE_ZERO_TRUST_ID?: string;
      AUTH_CLOUDFLARE_ZERO_TRUST_ISSUER?: string;
      AUTH_CLOUDFLARE_ZERO_TRUST_SECRET?: string;
      AUTH_COGNITO_DOMAIN?: string;

      AUTH_COGNITO_ID?: string;
      AUTH_COGNITO_ISSUER?: string;
      AUTH_COGNITO_REGION?: string;
      AUTH_COGNITO_SECRET?: string;

      AUTH_COGNITO_USERPOOL_ID?: string;
      AUTH_DISABLE_EMAIL_PASSWORD?: string;
      AUTH_EMAIL_VERIFICATION?: string;

      AUTH_ENABLE_MAGIC_LINK?: string;
      AUTH_FEISHU_APP_ID?: string;
      AUTH_FEISHU_APP_SECRET?: string;

      AUTH_GENERIC_OIDC_ID?: string;
      AUTH_GENERIC_OIDC_ISSUER?: string;
      AUTH_GENERIC_OIDC_SECRET?: string;

      AUTH_GITHUB_ID?: string;
      AUTH_GITHUB_SECRET?: string;
      // ===== Auth Provider Credentials ===== //
      AUTH_DISCORD_ID?: string;
      AUTH_DISCORD_SECRET?: string;
      AUTH_GOOGLE_ID?: string;

      AUTH_GOOGLE_SECRET?: string;
      AUTH_KEYCLOAK_ID?: string;
      AUTH_KEYCLOAK_ISSUER?: string;

      AUTH_KEYCLOAK_SECRET?: string;
      AUTH_LOGTO_ID?: string;

      AUTH_LOGTO_ISSUER?: string;
      AUTH_LOGTO_SECRET?: string;
      AUTH_NOTION_ID?: string;
      AUTH_NOTION_SECRET?: string;
      AUTH_MICROSOFT_AUTHORITY_URL?: string;

      AUTH_MICROSOFT_ID?: string;
      AUTH_MICROSOFT_SECRET?: string;
      AUTH_MICROSOFT_TENANT_ID?: string;

      AUTH_OKTA_ID?: string;
      AUTH_OKTA_ISSUER?: string;
      AUTH_OKTA_SECRET?: string;

      AUTH_SPOTIFY_ID?: string;
      AUTH_SPOTIFY_SECRET?: string;
      AUTH_SLACK_ID?: string;
      AUTH_SLACK_SECRET?: string;
      AUTH_TELEGRAM_ID?: string;
      AUTH_TELEGRAM_SECRET?: string;
      AUTH_TWITCH_ID?: string;
      AUTH_TWITCH_SECRET?: string;

      // ===== Better Auth ===== //
      AUTH_SECRET?: string;
      AUTH_SSO_PROVIDERS?: string;
      AUTH_TRUSTED_ORIGINS?: string;

      AUTH_WECHAT_ID?: string;
      AUTH_WECHAT_SECRET?: string;

      AUTH_X_ID?: string;
      AUTH_X_SECRET?: string;

      AUTH_RAILWAY_ID?: string;
      AUTH_RAILWAY_SECRET?: string;
      AUTH_VERCEL_ID?: string;
      AUTH_VERCEL_SECRET?: string;
      AUTH_MONDAY_ID?: string;
      AUTH_MONDAY_SECRET?: string;

      AUTH_ZITADEL_ID?: string;
      AUTH_ZITADEL_ISSUER?: string;
      AUTH_ZITADEL_SECRET?: string;

      /**
       * Internal JWT expiration time for lambda → async calls.
       * Format: number followed by unit (s=seconds, m=minutes, h=hours)
       * Examples: '10s', '1m', '1h'
       * Should be as short as possible for security, but long enough to account for network latency and server processing time.
       * @default '30s'
       */
      INTERNAL_JWT_EXPIRATION?: string;

      // ===== JWKS Key ===== //
      /**
       * Generic JWKS key for signing/verifying JWTs.
       * Used for internal service authentication and other cryptographic operations.
       * Must be a JWKS JSON string containing an RS256 RSA key pair.
       * Can be generated using `node scripts/generate-oidc-jwk.mjs`.
       */
      JWKS_KEY?: string;
    }
  }
}

export const getAuthConfig = () => {
  return {
    AUTH_EMAIL_VERIFICATION: process.env.AUTH_EMAIL_VERIFICATION === '1',
    AUTH_ENABLE_MAGIC_LINK: process.env.AUTH_ENABLE_MAGIC_LINK === '1',
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_SSO_PROVIDERS: process.env.AUTH_SSO_PROVIDERS,
    AUTH_TRUSTED_ORIGINS: process.env.AUTH_TRUSTED_ORIGINS,
    AUTH_ALLOWED_EMAILS: process.env.AUTH_ALLOWED_EMAILS,
    AUTH_DISABLE_EMAIL_PASSWORD: process.env.AUTH_DISABLE_EMAIL_PASSWORD === '1',

    // Auth Provider Credentials
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,

    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,

    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,

    AUTH_CANVA_ID: process.env.AUTH_CANVA_ID,
    AUTH_CANVA_SECRET: process.env.AUTH_CANVA_SECRET,

    AUTH_NOTION_ID: process.env.AUTH_NOTION_ID,
    AUTH_NOTION_SECRET: process.env.AUTH_NOTION_SECRET,

    AUTH_SLACK_ID: process.env.AUTH_SLACK_ID,
    AUTH_SLACK_SECRET: process.env.AUTH_SLACK_SECRET,

    AUTH_SPOTIFY_ID: process.env.AUTH_SPOTIFY_ID,
    AUTH_SPOTIFY_SECRET: process.env.AUTH_SPOTIFY_SECRET,

    AUTH_TELEGRAM_ID: process.env.AUTH_TELEGRAM_ID,
    AUTH_TELEGRAM_SECRET: process.env.AUTH_TELEGRAM_SECRET,

    AUTH_TWITCH_ID: process.env.AUTH_TWITCH_ID,
    AUTH_TWITCH_SECRET: process.env.AUTH_TWITCH_SECRET,

    AUTH_X_ID: process.env.AUTH_X_ID,
    AUTH_X_SECRET: process.env.AUTH_X_SECRET,

    AUTH_RAILWAY_ID: process.env.AUTH_RAILWAY_ID,
    AUTH_RAILWAY_SECRET: process.env.AUTH_RAILWAY_SECRET,

    AUTH_VERCEL_ID: process.env.AUTH_VERCEL_ID,
    AUTH_VERCEL_SECRET: process.env.AUTH_VERCEL_SECRET,

    AUTH_MONDAY_ID: process.env.AUTH_MONDAY_ID,
    AUTH_MONDAY_SECRET: process.env.AUTH_MONDAY_SECRET,

    JWKS_KEY: process.env.JWKS_KEY,
    ENABLE_OIDC: !!process.env.JWKS_KEY,

    // Internal JWT expiration time
    INTERNAL_JWT_EXPIRATION: process.env.INTERNAL_JWT_EXPIRATION,
  } as any;
};

export const authEnv = getAuthConfig();

// Auth headers and constants
export const LOBE_CHAT_AUTH_HEADER = 'X-lobe-chat-auth';
export const LOBE_CHAT_OIDC_AUTH_HEADER = 'Oidc-Auth';
