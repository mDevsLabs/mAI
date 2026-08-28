import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// POST /api/v1/messages - Anthropic Messages SDK Proxy
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: { message: 'Auth requise : Bearer token manquant.', type: 'authentication_error' } }, { status: 401 });
    }
    const body = await req.json();
    
    const res = await fetch('https://mai.val.run/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({
      error: {
        message: err?.message || "Failed to process Anthropic Messages request.",
        type: "api_error"
      }
    }, { status: 500 });
  }
}
