import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || '';
    const res = await fetch(`https://mai.val.run/v1/devices/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: authHeader,
        'User-Agent': userAgent,
        'X-Forwarded-For': ip
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Erreur proxy de mise à jour' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authHeader = req.headers.get('authorization') || '';
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || '';
    const res = await fetch(`https://mai.val.run/v1/devices/${id}`, {
      method: 'DELETE',
      headers: { 
        Authorization: authHeader,
        'User-Agent': userAgent,
        'X-Forwarded-For': ip
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Erreur proxy de suppression' }, { status: 500 });
  }
}
