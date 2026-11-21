import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedTelegramMedia } from "@/lib/telegram";

/**
 * GET /api/telegram/media?tmdbId=550&type=movie
 * GET /api/telegram/media?tmdbId=1399&type=tv&season=1&episode=1
 *
 * Verifies if authorized content is available in the Telegram channel
 * without leaking Telegram bot tokens or credentials.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const type = (searchParams.get("type") || "movie") as "movie" | "tv";
  const season = searchParams.get("season") ? parseInt(searchParams.get("season")!, 10) : undefined;
  const episode = searchParams.get("episode") ? parseInt(searchParams.get("episode")!, 10) : undefined;

  if (!tmdbId) {
    return NextResponse.json({ available: false, error: "Missing tmdbId" }, { status: 400 });
  }

  try {
    const media = await getAuthorizedTelegramMedia({
      tmdbId,
      type,
      season,
      episode
    });

    if (!media) {
      return NextResponse.json({
        available: false,
        message: "No authorized Telegram stream found for this item."
      });
    }

    // Return safe stream reference without leaking bot tokens
    return NextResponse.json({
      available: true,
      media: {
        tmdbId: media.tmdbId,
        type: media.type,
        caption: media.caption,
        // Internal proxy route - token remains secret on server
        streamUrl: `/api/telegram/stream?fileId=${encodeURIComponent(media.fileId)}`
      }
    });
  } catch (error) {
    console.error("Telegram media query error:", error);
    return NextResponse.json({ available: false, error: "Internal server error" }, { status: 500 });
  }
}
