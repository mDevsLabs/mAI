import { NextRequest, NextResponse } from 'next/server';
import { revokeApiKey, updateApiKey } from '@/lib/api-key-manager';
import { authenticateSession } from '@/lib/session-auth';

export const runtime = 'nodejs';

// DELETE /api/dev-keys/[id] - Révoquer une clé API (auth requise)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateSession(req);
    if (!auth.ok) return auth.response;
    const userId = auth.identity.userId;

    if (!id) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: "Identifiant de clé manquant." } },
        { status: 400 }
      );
    }

    const success = await revokeApiKey(userId, id);

    if (!success) {
      return NextResponse.json(
        { error: { code: 'not_found', message: "Clé API introuvable ou déjà révoquée." } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Clé API révoquée avec succès." },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (err: any) {
    console.error('Erreur DELETE /api/dev-keys/[id]:', err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: "Erreur lors de la révocation de la clé." } },
      { status: 500 }
    );
  }
}

// PUT /api/dev-keys/[id] - Mettre à jour une clé API (auth requise)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateSession(req);
    if (!auth.ok) return auth.response;
    const userId = auth.identity.userId;

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;

    if (!id) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: "Identifiant de clé manquant." } },
        { status: 400 }
      );
    }

    const name = body.name === undefined
      ? undefined
      : (typeof body.name === 'string' ? body.name.trim() : null);
    if (name === null || (name !== undefined && (!name || name.length > 80))) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'Nom de clé invalide (80 caractères maximum).' } },
        { status: 400 }
      );
    }

    let maxLimit: number | null | undefined;
    if (body.maxLimit !== undefined) {
      if (
        body.maxLimit !== null &&
        body.maxLimit !== '' &&
        typeof body.maxLimit !== 'number' &&
        typeof body.maxLimit !== 'string'
      ) {
        return NextResponse.json(
          { error: { code: 'bad_request', message: 'La limite doit être un entier positif.' } },
          { status: 400 }
        );
      }
      if (body.maxLimit === null || body.maxLimit === '') {
        maxLimit = null;
      } else {
        const parsed = Number(body.maxLimit);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          return NextResponse.json(
            { error: { code: 'bad_request', message: 'La limite doit être un entier positif.' } },
            { status: 400 }
          );
        }
        maxLimit = parsed;
      }
    }
    if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'isActive doit être un booléen.' } },
        { status: 400 }
      );
    }
    const updates = {
      name,
      maxLimit,
      isActive: body.isActive as boolean | undefined,
    };

    const success = await updateApiKey(userId, id, updates);

    if (!success) {
      return NextResponse.json(
        { error: { code: 'not_found', message: "Clé API introuvable." } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Clé API mise à jour avec succès." },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (err: any) {
    console.error('Erreur PUT /api/dev-keys/[id]:', err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: "Erreur lors de la mise à jour de la clé." } },
      { status: 500 }
    );
  }
}
