import { NextRequest, NextResponse } from 'next/server';
import { createApiKey, listApiKeys } from '@/lib/api-key-manager';
import { authenticateSession } from '@/lib/session-auth';

export const runtime = 'nodejs';

// GET /api/dev-keys - Lister les clés API de l'utilisateur (auth requise)
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateSession(req);
    if (!auth.ok) return auth.response;
    const userId = auth.identity.userId;

    const keys = await listApiKeys(userId);
    return NextResponse.json(
      { success: true, keys },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (err: any) {
    console.error('Erreur GET /api/dev-keys:', err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: 'Impossible de récupérer les clés API.' } },
      { status: 500 }
    );
  }
}

// POST /api/dev-keys - Générer une nouvelle clé API (auth requise)
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateSession(req);
    if (!auth.ok) return auth.response;
    const userId = auth.identity.userId;

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const name = body.name === undefined
      ? 'Clé sans nom'
      : (typeof body.name === 'string' ? body.name.trim() : '');
    const rawLimit = body.maxLimit;
    if (rawLimit !== undefined && rawLimit !== null && rawLimit !== '' && typeof rawLimit !== 'number' && typeof rawLimit !== 'string') {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'La limite doit être un entier positif.' } },
        { status: 400 }
      );
    }
    const parsedLimit = rawLimit === undefined || rawLimit === null || rawLimit === ''
      ? null
      : Number(rawLimit);
    const maxLimit = parsedLimit !== null && Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : null;

    if (!name || name.length > 80) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'Le nom de la clé API est requis (80 caractères maximum).' } },
        { status: 400 }
      );
    }
    if (parsedLimit !== null && (!Number.isInteger(parsedLimit) || parsedLimit <= 0)) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'La limite doit être un entier positif.' } },
        { status: 400 }
      );
    }

    const createdKey = await createApiKey(userId, name, maxLimit);

    // Unique endpoint autorisant un secret en réponse : il n'est renvoyé
    // qu'immédiatement après la création et ne sera plus listé ensuite.
    return NextResponse.json(
      {
        success: true,
        key: createdKey,
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (err: any) {
    console.error('Erreur POST /api/dev-keys:', err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: 'Erreur lors de la création de la clé API.' } },
      { status: 500 }
    );
  }
}
