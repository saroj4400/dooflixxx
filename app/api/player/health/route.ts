import { NextRequest, NextResponse } from "next/server";
import { getPlayerProviderById, getMoviePlayerUrl, getTVPlayerUrl } from "@/lib/player";
import { getAuthorizedTelegramMedia } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");
  const mediaId = searchParams.get("mediaId");
  const mediaType = (searchParams.get("mediaType") || "movie") as "movie" | "tv";
  const season = searchParams.get("season") ? parseInt(searchParams.get("season")!, 10) : 1;
  const episode = searchParams.get("episode") ? parseInt(searchParams.get("episode")!, 10) : 1;

  if (!providerId || !mediaId) {
    return NextResponse.json(
      { healthy: false, reason: "Missing providerId or mediaId" },
      { status: 400 }
    );
  }

  const provider = getPlayerProviderById(providerId);
  if (!provider || !provider.enabled) {
    return NextResponse.json({
      healthy: false,
      reason: "Provider not authorized or disabled"
    });
  }

  // 1. Telegram provider health check
  if (provider.type === "telegram") {
    try {
      const startTime = Date.now();
      const media = await getAuthorizedTelegramMedia({
        tmdbId: mediaId,
        type: mediaType,
        season,
        episode
      });
      const latencyMs = Date.now() - startTime;

      if (media && media.fileId) {
        return NextResponse.json({ healthy: true, latencyMs });
      }
      return NextResponse.json({
        healthy: false,
        latencyMs,
        reason: "No authorized Telegram stream mapped"
      });
    } catch {
      return NextResponse.json({
        healthy: false,
        reason: "Telegram service error"
      });
    }
  }

  // 2. Iframe / Video HTTP provider health check
  const url =
    mediaType === "movie"
      ? getMoviePlayerUrl(provider.id, mediaId)
      : getTVPlayerUrl(provider.id, mediaId, season, episode);

  if (!url) {
    return NextResponse.json({
      healthy: false,
      reason: "No active URL template"
    });
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const targetUrl = new URL(url);
    // Ping origin endpoint to verify gateway reachability
    const res = await fetch(targetUrl.origin, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    // Status codes below 500 indicate the gateway/server is active
    if (res.status < 500) {
      return NextResponse.json({ healthy: true, latencyMs });
    }
    return NextResponse.json({
      healthy: false,
      latencyMs,
      reason: `HTTP ${res.status}`
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      healthy: false,
      latencyMs,
      reason: err?.name === "AbortError" ? "Gateway timeout" : "Connection failed"
    });
  }
}
