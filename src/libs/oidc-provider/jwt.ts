import { TRPCError } from '@trpc/server';
import debug from 'debug';

import { authEnv } from '@/envs/auth';

const log = debug('oidc-jwt');

/**
 * Get JWKS key string from environment
 * Uses JWKS_KEY which already has fallback to OIDC_JWKS_KEY in authEnv
 */
const getJwksKeyString = () => {
  return authEnv.JWKS_KEY;
};

import crypto from 'node:crypto';

let memoizedJwks: any = null;

const generateFallbackJWKS = () => {
  if (memoizedJwks) return memoizedJwks;

  const { privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  const jwk = privateKey.export({ format: 'jwk' }) as any;
  jwk.use = 'sig';
  jwk.kid = crypto.randomBytes(8).toString('hex');
  jwk.alg = 'RS256';

  memoizedJwks = { keys: [jwk] };
  return memoizedJwks;
};

/**
 * Get JWKS from environment variables
 * This JWKS is a JSON object containing RS256 private keys
 */
export const getJWKS = (): object => {
  try {
    const jwksString = getJwksKeyString();

    if (!jwksString) {
      log('JWKS_KEY environment variable is missing, generating a fallback in-memory JWKS key pair.');
      return generateFallbackJWKS();
    }

    // Attempt to parse JWKS JSON string
    const jwks = JSON.parse(jwksString);

    // Check if JWKS format is valid
    if (!jwks.keys || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('Invalid JWKS format: missing or empty keys array');
    }

    // Check if there is an RS256 algorithm key
    const hasRS256Key = jwks.keys.some((key: any) => key.alg === 'RS256' && key.kty === 'RSA');
    if (!hasRS256Key) {
      throw new Error('No RSA key with RS256 algorithm found in JWKS');
    }

    return jwks;
  } catch (error) {
    console.error('Failed to parse JWKS:', error);
    throw new Error(`JWKS_KEY parse error: ${(error as Error).message}`, { cause: error });
  }
};

const getVerificationKey = async () => {
  try {
    const jwksString = getJwksKeyString();

    let jwks;
    if (!jwksString) {
      jwks = generateFallbackJWKS();
    } else {
      jwks = JSON.parse(jwksString);
    }

    if (!jwks.keys || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('Invalid JWKS format: missing or empty keys array');
    }

    const privateRsaKey = jwks.keys.find((key: any) => key.alg === 'RS256' && key.kty === 'RSA');
    if (!privateRsaKey) {
      throw new Error('No RSA key with RS256 algorithm found in JWKS');
    }

    // Create a “clean” JWK object containing only public key components.
    // The key fields of an RSA public key are kty, n, e. Others like kid, alg, use are also public.
    const publicKeyJwk = {
      alg: privateRsaKey.alg,
      e: privateRsaKey.e,
      kid: privateRsaKey.kid,
      kty: privateRsaKey.kty,
      n: privateRsaKey.n,
      use: privateRsaKey.use,
    };

    // Remove any undefined fields to keep the object clean
    Object.keys(publicKeyJwk).forEach(
      (key) => (publicKeyJwk as any)[key] === undefined && delete (publicKeyJwk as any)[key],
    );

    const { importJWK } = await import('jose');

    // Now, in any environment, `importJWK` will correctly identify this object as a public key.
    return await importJWK(publicKeyJwk, 'RS256');
  } catch (error) {
    log('Failed to get JWKS public key: %O', error);
    throw new Error(`JWKS_KEY public key retrieval failed: ${(error as Error).message}`, {
      cause: error,
    });
  }
};

/**
 * Validate OIDC JWT Access Token
 * @param token - JWT access token
 * @returns Parsed token payload and user information
 */
export const validateOIDCJWT = async (token: string) => {
  log('Starting OIDC JWT token validation');

  // JWKS / signing key retrieval is an infrastructure concern (misconfigured
  // env, malformed JWKS, key import failure). Let these errors propagate as
  // plain Error so upstream middleware maps them to 500 and triggers ops
  // alerts — treating them as 401 would incorrectly ask clients to re-auth
  // while the real problem is server-side.
  const publicKey = await getVerificationKey();

  try {
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
    });

    log('JWT validation successful, payload: %O', payload);

    const userId = payload.sub;
    const clientId = payload.client_id;
    const aud = payload.aud;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'JWT token is missing user ID (sub)',
      });
    }

    return {
      clientId,
      payload,
      tokenData: {
        aud,
        client_id: clientId,
        exp: payload.exp,
        iat: payload.iat,
        jti: payload.jti,
        purpose: payload.purpose as string | undefined,
        scope: payload.scope,
        sub: userId,
      },
      userId,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    log('JWT validation failed: %O', error);

    // Preserve the original jose error via `cause` so upstream middleware
    // can still inspect specific codes like `ERR_JWT_EXPIRED`.
    throw new TRPCError({
      cause: error,
      code: 'UNAUTHORIZED',
      message: `JWT token validation failed: ${(error as Error).message}`,
    });
  }
};
