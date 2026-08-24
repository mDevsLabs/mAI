import { NextRequest, NextResponse } from 'next/server';
import { revokeApiKey, updateApiKey } from '@/lib/api-key-manager';

export const runtime = 'nodejs';

// DELETE /api/dev-keys/[id] - Révoquer une clé API (auth requise)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = req.headers.get('x-user-id');
    if (!raw) return NextResponse.json({ error: { code: 'unauthorized', message: 'Auth requise.' } }, { status: 401 });
    let userId: string;
    try { userId = decodeURIComponent(raw); } catch { return NextResponse.json({ error: { code: 'bad_request', message: 'x-user-id invalide.' } }, { status: 400 }); }
    if (!userId || userId === 'dev_user') return NextResponse.json({ error: { code: 'unauthorized', message: 'Auth requise.' } }, { status: 401 });

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

    return NextResponse.json({
      success: true,
      message: "Clé API révoquée avec succès.",
    });
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
    const raw = req.headers.get('x-user-id');
    if (!raw) return NextResponse.json({ error: { code: 'unauthorized', message: 'Auth requise.' } }, { status: 401 });
    let userId: string;
    try { userId = decodeURIComponent(raw); } catch { return NextResponse.json({ error: { code: 'bad_request', message: 'x-user-id invalide.' } }, { status: 400 }); }
    if (!userId || userId === 'dev_user') return NextResponse.json({ error: { code: 'unauthorized', message: 'Auth requise.' } }, { status: 401 });
    const body = await req.json().catch(() => ({}));

    if (!id) {
      return NextResponse.json(
        { error: { code: 'bad_request', message: "Identifiant de clé manquant." } },
        { status: 400 }
      );
    }

    const updates = {
      name: body.name,
      maxLimit: body.maxLimit !== undefined ? (body.maxLimit === "" ? null : parseInt(body.maxLimit, 10)) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    };

    const success = await updateApiKey(userId, id, updates);

    if (!success) {
      return NextResponse.json(
        { error: { code: 'not_found', message: "Clé API introuvable." } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Clé API mise à jour avec succès.",
    });
  } catch (err: any) {
    console.error('Erreur PUT /api/dev-keys/[id]:', err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: "Erreur lors de la mise à jour de la clé." } },
      { status: 500 }
    );
  }
}
