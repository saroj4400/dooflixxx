import { NextRequest, NextResponse } from "next/server";
import { getAnime } from "@/lib/api";

export async function GET(request: NextRequest) {
  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;

  try {
    const result = await getAnime(page);
    if (result.sourceError) {
      return NextResponse.json({ error: "Anime catalog is temporarily unavailable." }, { status: 502 });
    }
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" }
    });
  } catch (error) {
    console.error("[/api/anime] Error:", error);
    return NextResponse.json({ error: "Unable to load anime right now." }, { status: 502 });
  }
}
