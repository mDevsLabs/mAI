import { NextRequest, NextResponse } from 'next/server';
import { authenticateOpenAIRequest } from '@/lib/openai-auth';
import { OpenAIModelListResponse } from '@/lib/openai-types';
import { maiModelsList } from '@/maiModels';
import { openRouterModels } from '@/lib/ai-models';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const userId = req.headers.get('x-user-id');

  // Authentification facultative pour v1/models (consultation publique de la liste complète)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const authResult = await authenticateOpenAIRequest(req);
    if (!authResult.valid) {
      return authResult.response;
    }
  }

  try {
    const forwardHeaders: Record<string, string> = {};
    if (authHeader) forwardHeaders['Authorization'] = authHeader;
    if (userId) forwardHeaders['x-user-id'] = userId;

    // Fetch OpenRouter models depuis Val Town
    const maiRes = await fetch('https://mai.val.run/v1/models', { headers: forwardHeaders }).catch(() => null);

    let cloudModels: any[] = [];
    if (maiRes && maiRes.ok) {
      const data = await maiRes.json();
      cloudModels = data.data || [];
    } else {
      // Fallback local: Tous les modèles OpenRouter
      cloudModels = openRouterModels.map(m => ({
        id: m.id,
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: m.provider || 'openrouter'
      }));
    }

    // Tous les modèles locaux (mDevsLabs)
    const localModels = maiModelsList.map(m => ({
      created: Math.floor(Date.now() / 1000),
      description: m.description,
      id: m.ollamaTag || m.id,
      maxContext: m.contextWindow || 262_144,
      maxOutput: m.maxOutputTokens || 32_768,
      name: m.name,
      object: 'model',
      owned_by: 'mDevsLabs',
      supported_parameters: [
        'temperature',
        'top_p',
        'max_tokens',
        'stream',
        'tools',
        'thinking',
        'response_format'
      ]
    }));

    const response: OpenAIModelListResponse = {
      object: 'list',
      data: [...localModels, ...cloudModels],
    };

    return NextResponse.json(response);
  } catch {
    const fallbackList = [
      ...maiModelsList.map(m => ({
        created: 0,
        description: m.description,
        id: m.ollamaTag || m.id,
        maxContext: m.contextWindow,
        maxOutput: m.maxOutputTokens,
        name: m.name,
        object: 'model',
        owned_by: 'mDevsLabs',
        supported_parameters: ['temperature', 'top_p', 'max_tokens', 'stream', 'tools']
      })),
      ...openRouterModels.map(m => ({
        created: 0,
        description: `${m.name} via ${m.provider || 'OpenRouter'}`,
        id: m.id,
        maxContext: m.maxContext,
        maxOutput: m.maxOutput,
        name: m.name,
        object: 'model',
        owned_by: m.provider || 'openrouter',
        supported_parameters: ['temperature', 'top_p', 'max_tokens', 'stream', 'tools']
      }))
    ];
    return NextResponse.json({ object: 'list', data: fallbackList });
  }
}
