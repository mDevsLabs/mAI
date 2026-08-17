import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// POST /api/v1beta/models/[model] - Google Generative AI SDK Proxy
export async function POST(req: NextRequest, { params }: { params: Promise<{ model: string }> }) {
  try {
    const { model } = await params;
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    
    const res = await fetch(`https://mai.val.run/v1beta/models/${model}`, {
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
        message: err?.message || "Failed to process Google Generative AI request.",
        type: "api_error"
      }
    }, { status: 500 });
  }
}
