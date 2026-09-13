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
    return NextResponse.json({ success: true, keys });
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

    const body = await req.json().catch(() => ({}));
    const name = (body.name || 'Clé sans nom').trim();
    const maxLimit = body.maxLimit ? parseInt(body.maxLimit, 10) : null;

    if (!name) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'Le nom de la clé API est requis.' } },
        { status: 400 }
      );
    }

    const createdKey = await createApiKey(userId, name, Number.isFinite(maxLimit as number) ? maxLimit : null);

    return NextResponse.json({
      success: true,
      key: createdKey,
    });
  } catch (err: any) {
    console.error('Erreur POST /api/dev-keys:', err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: 'Erreur lors de la création de la clé API.' } },
      { status: 500 }
    );
  }
}
