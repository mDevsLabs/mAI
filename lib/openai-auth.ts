import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from './api-key-manager';
import { checkRateLimit } from './bearer-auth';
import { OpenAIErrorResponse } from './openai-types';

export interface AuthenticatedOpenAIContext {
  valid: true;
  apiKeyId: string;
  plan: string;
}

export interface InvalidOpenAIContext {
  valid: false;
  response: NextResponse<OpenAIErrorResponse>;
}

export async function authenticateOpenAIRequest(
  req: NextRequest
): Promise<AuthenticatedOpenAIContext | InvalidOpenAIContext> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      valid: false,
      response: NextResponse.json<OpenAIErrorResponse>(
        {
          error: {
            message: 'You must provide a Bearer API key in the Authorization header.',
            type: 'invalid_request_error',
            param: null,
            code: 'invalid_api_key',
          },
        },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.substring(7).trim();

  // Valider la clé via la couche de gestion de clés API
  const validation = await validateApiKey(token);

  if (!validation.valid || !validation.keyInfo) {
    return {
      valid: false,
      response: NextResponse.json<OpenAIErrorResponse>(
        {
          error: {
            message: 'Incorrect API key provided. You can find your API key at /api/keys.',
            type: 'invalid_request_error',
            param: null,
            code: 'invalid_api_key',
          },
        },
        { status: 401 }
      ),
    };
  }

  // Rate Limiting (60 requêtes/min par IP/clé)
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
  const rateLimitKey = `openai_${validation.keyInfo.id}_${clientIp}`;
  const rateCheck = checkRateLimit(rateLimitKey);

  if (!rateCheck.allowed) {
    return {
      valid: false,
      response: NextResponse.json<OpenAIErrorResponse>(
        {
          error: {
            message: 'Rate limit reached for requests. Please slow down your requests.',
            type: 'requests',
            param: null,
            code: 'rate_limit_exceeded',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.resetInSec.toString(),
          },
        }
      ),
    };
  }

  return {
    valid: true,
    apiKeyId: validation.keyInfo.id,
    plan: validation.keyInfo.name || 'Free',
  };
}
