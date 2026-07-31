import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// POST /api/v1/messages - Anthropic Messages SDK Proxy
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    
    const res = await fetch('https://mprojects.val.run/v1/messages', {
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
