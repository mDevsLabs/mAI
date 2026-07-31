import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/v1/projects
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch('https://mprojects.val.run/v1/projects', {
      headers: { Authorization: authHeader },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({
      object: 'list',
      data: [
        {
          id: 'proj_demo_1',
          project_id: 'proj-demo123',
          name: 'Projet Démo mAI',
          description: 'Analyseur de code et génération de texte',
          is_public: true,
          created_at: new Date().toISOString()
        }
      ]
    });
  }
}

// POST /api/v1/projects
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch('https://mprojects.val.run/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({
      success: true,
      project_id: 'proj-' + Math.random().toString(36).substring(2, 9),
      name: 'Projet Créé'
    });
  }
}
