import { NextRequest, NextResponse } from 'next/server';
import { createApiKey, listApiKeys } from '@/lib/api-key-manager';

export const runtime = 'nodejs';

// GET /api/dev-keys - Lister les clés API de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const userId = decodeURIComponent(req.headers.get('x-user-id') || 'dev_user');
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

// POST /api/dev-keys - Générer une nouvelle clé API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || 'Clé sans nom').trim();
    const maxLimit = body.maxLimit ? parseInt(body.maxLimit, 10) : null;
    const userId = decodeURIComponent(req.headers.get('x-user-id') || 'dev_user');

    if (!name) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'Le nom de la clé API est requis.' } },
        { status: 400 }
      );
    }

    const createdKey = await createApiKey(userId, name, maxLimit);

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
