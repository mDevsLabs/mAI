import { NextRequest, NextResponse } from "next/server";
import { executeWebSearch } from "@/lib/web-search";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query || body.q;
    const count = typeof body.count === "number" ? body.count : 5;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Le paramètre 'query' est obligatoire." },
        { status: 400 }
      );
    }

    const searchResult = await executeWebSearch(query, count);
    return NextResponse.json(searchResult, {
      status: searchResult.success ? 200 : 502,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la recherche Web.", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query");
    const countParam = searchParams.get("count");
    const count = countParam ? parseInt(countParam, 10) : 5;

    if (!query) {
      return NextResponse.json(
        { error: "Paramètre 'q' ou 'query' manquant." },
        { status: 400 }
      );
    }

    const searchResult = await executeWebSearch(query, isNaN(count) ? 5 : count);
    return NextResponse.json(searchResult, {
      status: searchResult.success ? 200 : 502,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur serveur lors de la recherche Web.", details: err.message },
      { status: 500 }
    );
  }
}
