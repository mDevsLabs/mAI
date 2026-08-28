import { NextRequest, NextResponse } from 'next/server';
import { revokeApiKey } from '@/lib/api-key-manager';

export const runtime = 'nodejs';

// DELETE /api/keys/[id] - Révoquer une clé API
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get('x-user-id') || 'dev_user';

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
    console.error('Erreur DELETE /api/keys/[id]:', err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: "Erreur lors de la révocation de la clé." } },
      { status: 500 }
    );
  }
}
