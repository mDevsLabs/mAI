import { NextRequest, NextResponse } from 'next/server';
import { authenticateOpenAIRequest } from '@/lib/openai-auth';
import { OpenAIModelListResponse } from '@/lib/openai-types';

export const runtime = 'nodejs';

import { maiModelsList } from '@/maiModels';
import { fetchOpenRouterModels, openRouterModels } from '@/aiModels';

import { listApiKeys } from '@/lib/api-key-manager';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const userId = req.headers.get('x-user-id');

  let hasValidAuth = false;

  // 1. Si Bearer token est fourni
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const authResult = await authenticateOpenAIRequest(req);
    if (!authResult.valid) {
      return authResult.response;
    }
    hasValidAuth = true;
  } 
  // 2. Si x-user-id est fourni (requête depuis l'application web)
  else if (userId) {
    const keys = await listApiKeys(userId);
    if (keys && keys.length > 0) {
      hasValidAuth = true;
    }
  }

  if (!hasValidAuth) {
    return NextResponse.json(
      {
        error: {
          message: "Accès refusé. Aucune clé API configurée pour ce compte. Veuillez générer une clé API sur la page /api/keys.",
          type: "authentication_error",
          param: null,
          code: "api_key_required"
        }
      },
      { status: 401 }
    );
  }

  const isFreeTier = false;

  try {
    const [maiRes, fetchedCloudModels] = await Promise.all([
      fetch('https://mprojects.val.run/v1/mai/models').catch(() => null),
      fetchOpenRouterModels(isFreeTier).catch(() => [])
    ]);

    let maiModels: any[] = [];

    if (maiRes && maiRes.ok) {
      const data = await maiRes.json();
      maiModels = data.data || [];
    } else {
      maiModels = maiModelsList.map(m => ({
        id: m.ollamaTag || m.id,
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: 'mDevsLabs'
      })); 
    }

    const cloudModels = (fetchedCloudModels.length > 0 ? fetchedCloudModels : openRouterModels).map(m => ({
      id: m.id,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: m.provider || 'openrouter'
    }));

    const response: OpenAIModelListResponse = {
      object: 'list',
      data: [...maiModels, ...cloudModels],
    };

    return NextResponse.json(response);
  } catch {
    const fallbackList = [
      ...maiModelsList.map(m => ({ id: m.ollamaTag || m.id, object: 'model', created: 0, owned_by: 'mDevsLabs' })),
      ...openRouterModels.filter(m => !isFreeTier || m.id.includes(':free')).map(m => ({ id: m.id, object: 'model', created: 0, owned_by: m.provider || 'openrouter' }))
    ];
    return NextResponse.json({ object: 'list', data: fallbackList });
  }
}
