import { NextRequest, NextResponse } from 'next/server';
import { OpenAIErrorResponse, OpenAIModelListResponse } from '@/lib/openai-types';
import { authenticateCatalogRequest } from '@/lib/api-key-session';
import { redactApiSecretJson } from '@/lib/api-key-redaction';

export const runtime = 'nodejs';

function isPublicModel(model: any): boolean {
  const id = String(model?.id || '').toLowerCase();
  return id === 'mai-2' || id === 'mai-2-mini' || id.includes(':free');
}

function catalogUnavailable(): NextResponse<OpenAIErrorResponse> {
  return NextResponse.json<OpenAIErrorResponse>(
    {
      error: {
        message: 'Le catalogue de modèles est temporairement indisponible.',
        type: 'api_error',
        param: null,
        code: 'catalog_unavailable',
      },
    },
    { status: 502, headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export async function GET(req: NextRequest) {
  const authResult = await authenticateCatalogRequest(req);
  if (!authResult.ok) return authResult.response;

  const auth = authResult.auth;
  const isPublic = auth.mode === 'public';
  const cacheControl = isPublic
    ? 'public, s-maxage=300, stale-while-revalidate=60'
    : 'private, no-store';

  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (auth.mode === 'bearer') {
      headers.Authorization = `Bearer ${auth.token}`;
    } else if (auth.mode === 'session') {
      // Le secret est injecté uniquement dans cette requête serveur-sortie.
      headers.Authorization = `Bearer ${auth.secretKey}`;
    }

    // L'API distante reçoit seulement la clé Bearer réellement validée, jamais
    // une identité affirmée par le client.
    const maiResponse = await fetch('https://mai.val.run/v1/models', {
      headers,
      ...(isPublic
        ? { next: { revalidate: 300 } }
        : { cache: 'no-store' as const }),
    });

    if (maiResponse.ok) {
      const payload = redactApiSecretJson(
        await maiResponse.json(),
        auth.mode === 'bearer' ? auth.token : auth.mode === 'session' ? auth.secretKey : null,
      );
      const upstream = Array.isArray(payload?.data) ? payload.data : [];
      // Relais transparent : aucun modèle n'est ajouté ni retiré côté Next.js.
      const data = isPublic ? upstream.filter(isPublicModel) : upstream;
      const response: OpenAIModelListResponse = { object: 'list', data };
      return NextResponse.json(response, { headers: { 'Cache-Control': cacheControl } });
    }
  } catch {
    // Erreur réseau ou réponse illisible : traité comme un catalogue indisponible.
  }

  // Aucun catalogue de secours local n'est exposé : le client affiche une
  // liste vide et propose de réessayer, plutôt que des modèles fictifs.
  return catalogUnavailable();
}
