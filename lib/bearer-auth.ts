import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from './api-key-manager';

// Rate Limiter basique en mémoire (60 requêtes/minute par IP/clé)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

const ipRequestMap: Map<string, { count: number; resetAt: number }> = new Map();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInSec: 60 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetInSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetInSec };
  }

  record.count += 1;
  const remaining = MAX_REQUESTS_PER_WINDOW - record.count;
  const resetInSec = Math.ceil((record.resetAt - now) / 1000);
  return { allowed: true, remaining, resetInSec };
}

/**
 * Helper middleware de sécurité pour vérifier le Bearer token et le rate limit
 */
export async function authenticateBearer(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';

  // 1. Vérification du Rate Limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          error: {
            code: 'rate_limit_exceeded',
            message: `Limite de requêtes dépassée (${MAX_REQUESTS_PER_WINDOW} req/min). Réessayez dans ${rateLimit.resetInSec} secondes.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSec),
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': '0',
          },
        }
      ),
    };
  }

  // 2. Extrait et vérifie le header Authorization
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          error: {
            code: 'unauthorized',
            message: 'En-tête Authorization: Bearer <clé_api> manquant ou mal formaté.',
          },
        },
        { status: 401 }
      ),
    };
  }

  const secretKey = authHeader.slice(7).trim();
  const validation = await validateApiKey(secretKey);

  if (!validation.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          error: {
            code: 'unauthorized',
            message: validation.error || 'Clé API invalide ou révoquée.',
          },
        },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    keyInfo: validation.keyInfo,
    ip,
  };
}
