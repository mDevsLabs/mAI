import { NextRequest, NextResponse } from 'next/server';
import { searchSite, SEARCH_TYPE_ORDER, type SearchType } from '@/lib/search-index';

export const runtime = 'nodejs';

const MAX_LIMIT = 30;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const query = params.get('q') || '';
  const typeParam = params.get('type') || 'all';
  const limitParam = Number(params.get('limit'));

  const type: SearchType | 'all' = (SEARCH_TYPE_ORDER as string[]).includes(typeParam)
    ? (typeParam as SearchType)
    : 'all';

  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(MAX_LIMIT, limitParam) : 12;

  try {
    const results = searchSite(query, { type, limit });
    return NextResponse.json({
      query,
      type,
      count: results.length,
      results,
    });
  } catch (err: any) {
    console.error('Erreur /api/search:', err);
    return NextResponse.json(
      {
        query,
        type,
        count: 0,
        results: [],
        error: 'Erreur lors de la recherche.',
      },
      { status: 500 }
    );
  }
}
