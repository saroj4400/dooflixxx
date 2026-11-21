/**
 * app/api/search/route.ts
 *
 * Secure server-side search route.
 * Client components call this endpoint – TMDB_API_KEY never reaches the browser.
 *
 * GET /api/search?q=batman&type=movie&genre=Action
 */

import { NextRequest, NextResponse } from "next/server";
import { searchMedia } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const type = (searchParams.get("type") || "all") as "all" | "movie" | "tv";
  const genre = searchParams.get("genre") || "All";

  try {
    const results = await searchMedia(q, type, genre);
    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "no-store" // Search results must not be cached by CDN
      }
    });
  } catch (err) {
    console.error("[/api/search] Error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
