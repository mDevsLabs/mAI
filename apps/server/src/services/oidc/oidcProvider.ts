import { getDBInstance } from '@/database/core/web-server';
import { authEnv } from '@/envs/auth';
import { type OIDCProvider } from '@/libs/oidc-provider/provider';
import { createOIDCProvider } from '@/libs/oidc-provider/provider';

/**
 * OIDC Provider instance
 */
let provider: OIDCProvider;

/**
 * Get OIDC Provider instance
 * @returns OIDC Provider instance
 */
export const getOIDCProvider = async (): Promise<OIDCProvider> => {
  if (!provider) {
    // OIDC is forced enabled

    const db = getDBInstance();
    provider = await createOIDCProvider(db);
  }

  return provider;
};
