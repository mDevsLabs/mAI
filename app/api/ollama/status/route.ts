import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const ollamaHost = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const { searchParams } = new URL(req.url);
  const targetModel = searchParams.get('model');

  try {
    // 1. Ping version Ollama
    const versionRes = await fetch(`${ollamaHost}/api/version`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!versionRes.ok) {
      return NextResponse.json({
        online: false,
        modelInstalled: false,
        message: `Serveur Ollama inaccessible (${versionRes.statusText}).`,
      });
    }

    const versionData = await versionRes.json();
    const versionStr = versionData.version || 'Actif';

    // 2. Vérifier les modèles installés via /api/tags
    if (targetModel) {
      try {
        const tagsRes = await fetch(`${ollamaHost}/api/tags`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          const installedList: any[] = tagsData.models || [];
          const cleanTarget = targetModel.toLowerCase();

          const isInstalled = installedList.some(
            (m) =>
              m.name?.toLowerCase() === cleanTarget ||
              m.model?.toLowerCase() === cleanTarget ||
              m.name?.toLowerCase().startsWith(cleanTarget)
          );

          if (!isInstalled) {
            return NextResponse.json({
              online: true,
              version: versionStr,
              modelInstalled: false,
              message: `Serveur Ollama connecté (${versionStr}), mais le modèle "${targetModel}" n'est pas disponible en local.`,
            });
          }
        }
      } catch {
        // En cas d'erreur sur /api/tags, considérer Ollama en ligne
      }
    }

    return NextResponse.json({
      online: true,
      version: versionStr,
      modelInstalled: true,
      message: `Serveur Ollama connecté (${versionStr}) et modèle prêt.`,
    });
  } catch {
    return NextResponse.json({
      online: false,
      modelInstalled: false,
      message: `Impossible de joindre le serveur local Ollama (${ollamaHost}). Assurez-vous que l'application Ollama est démarrée.`,
    });
  }
}
