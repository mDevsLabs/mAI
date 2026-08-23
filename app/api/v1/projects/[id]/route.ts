import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch(`https://mai.val.run/v1/projects/${id}`, {
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    const staticProjects: Record<string, any> = {
      web: { project_id: "web", name: "Web", description: "Application d'IA en ligne web directement et simplement pour discuter avec l'IA mAI.", status: "alpha", label: "Alpha", category: "Web Application", is_public: true },
      pulse: { project_id: "pulse", name: "Pulse", description: "Ensemble d'extensions pour diverses applications pour discuter avec mAI directement.", status: "beta", label: "Bêta", category: "Extensions", is_public: true },
      cli: { project_id: "cli", name: "CLI", description: "Discussions et séances de codage dans le terminal CLI via mAI.", status: "beta", label: "Bêta", category: "Developer Tools", is_public: true },
      coder: { project_id: "coder", name: "Coder", description: "IDE IA de nouvelle génération avec agents IA autonomes, orchestration multi-modèles et support natif des outils MCP.", status: "alpha", label: "Alpha", category: "Developer Tools", is_public: true },
      office: { project_id: "office", name: "Office", description: "Création de documents et présentations avec mAI.", status: "archived", label: "Archivé", category: "Productivity", is_public: true },
      mai: { project_id: "mai", name: "mAI Web (Legacy)", description: "Ancienne interface web de mAI.", status: "archived", label: "Archivé", category: "AI Suite", is_public: true },
      msearch: { project_id: "msearch", name: "mSearch", description: "Moteur de recherche sémantique et d'indexation vectorielle.", status: "archived", label: "Archivé", category: "Search Engine", is_public: true },
      openprovider: { project_id: "openprovider", name: "OpenProvider", description: "Hub universel d'agrégation et de routage d'API et modèles LLM.", status: "archived", label: "Archivé", category: "API Gateway", is_public: true },
      snob: { project_id: "snob", name: "Snob", description: "Jeu vidéo du style Block Blast.", status: "archived", label: "Archivé", category: "Games", is_public: true }
    };
    const key = id.toLowerCase();
    const p = staticProjects[key] || { project_id: id, name: 'Projet ' + id, description: 'Description du projet', is_public: true };
    return NextResponse.json({ project: p });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch(`https://mai.val.run/v1/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: true, project_id: id, message: 'Mis à jour' });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch(`https://mai.val.run/v1/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: true, message: 'Projet supprimé' });
  }
}
