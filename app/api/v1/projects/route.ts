import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/v1/projects
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch('https://mai.val.run/v1/projects', {
      headers: { Authorization: authHeader },
    });
    const data = await res.json().catch(() => null);
    if (data === null) {
      return NextResponse.json(
        { error: { code: 'upstream_error', message: 'Réponse invalide du service projets.' } },
        { status: 502 }
      );
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: { code: 'upstream_unavailable', message: 'Service projets indisponible.' } },
      { status: 502 }
    );
  }
}

// POST /api/v1/projects
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const res = await fetch('https://mai.val.run/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (data === null) {
      return NextResponse.json(
        { error: { code: 'upstream_error', message: 'Réponse invalide du service projets.' } },
        { status: 502 }
      );
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    // Ne jamais simuler un succès : le projet n'a pas été créé
    return NextResponse.json(
      { error: { code: 'upstream_unavailable', message: 'Service projets indisponible.' } },
      { status: 502 }
    );
  }
}
