import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || '';
    const res = await fetch('https://mai.val.run/v1/devices', {
      headers: { 
        Authorization: authHeader,
        'User-Agent': userAgent,
        'X-Forwarded-For': ip
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Erreur proxy de récupération des appareils' }, { status: 500 });
  }
}
