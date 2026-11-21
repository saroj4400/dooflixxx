/**
 * app/api/episodes/route.ts
 *
 * Secure server-side route for fetching TV season episodes.
 * Client components call this – TMDB_API_KEY never reaches the browser.
 *
 * GET /api/episodes?tvId=1396&season=2
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisodesForSeason } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tvId = searchParams.get("tvId") || "";
  const season = parseInt(searchParams.get("season") || "1", 10);

  if (!tvId) {
    return NextResponse.json([], { status: 400 });
  }

  try {
    const episodes = await getEpisodesForSeason(tvId, season);
    return NextResponse.json(episodes, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch (err) {
    console.error("[/api/episodes] Error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
