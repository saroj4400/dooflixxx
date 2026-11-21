
import { NextRequest, NextResponse } from "next/server";
import { discoverStreams } from "@/lib/streaming/manager";
import type {
  MediaKind,
  ProviderIntegrationStatus,
} from "@/lib/streaming/types";
import { streamingProviders } from "@/lib/streaming/registry";
import { getStreamingDiagnostics } from "@/lib/streaming/diagnostics";
import { getTMDBTitleVariants } from "@/lib/tmdb";

export const dynamic = "force-dynamic";


export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const probe = url.searchParams.get("probe") === "true";

    const diagnostics = await getStreamingDiagnostics({
      probe,
    });

    return NextResponse.json(
      {
        providers: diagnostics.providers,
        endpointRecords: diagnostics.endpointRecords,
        unassignedEndpointRecords:
          diagnostics.unassignedEndpointRecords,

        activePlaybackProviders: streamingProviders
          .filter((provider) => provider.enabled)
          .map(({ id, name, supports }) => ({
            id,
            name,
            supports,
          })),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[API /streams GET]", error);

    return NextResponse.json(
      { error: "Unable to load streaming diagnostics" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const tmdbId = String(body?.tmdbId ?? "").trim();
    const mediaType = body?.mediaType as MediaKind;

    const season = Number(body?.season ?? 1);
    const episode = Number(body?.episode ?? 1);

    if (!/^\d{1,12}$/.test(tmdbId)) {
      return NextResponse.json(
        { error: "A valid TMDB ID is required" },
        { status: 400 }
      );
    }

    if (mediaType !== "movie" && mediaType !== "tv") {
      return NextResponse.json(
        { error: "mediaType must be movie or tv" },
        { status: 400 }
      );
    }

    if (
      mediaType === "tv" &&
      (
        !Number.isInteger(season) ||
        !Number.isInteger(episode) ||
        season < 1 ||
        episode < 1 ||
        season > 100 ||
        episode > 500
      )
    ) {
      return NextResponse.json(
        { error: "Invalid season or episode" },
        { status: 400 }
      );
    }

    const titleVariants = await getTMDBTitleVariants(tmdbId, mediaType).catch(() => []);
    const result = await discoverStreams({
      tmdbId,
      mediaType,
      title:
        typeof body?.title === "string"
          ? body.title.slice(0, 180)
          : undefined,
      titleVariants,
      year:
        Number.isInteger(body?.year) && body.year > 1800
          ? body.year
          : undefined,
      season,
      episode,
    });

    const diagnostics = await getStreamingDiagnostics();

    const providerStatus: ProviderIntegrationStatus[] =
      diagnostics.providers.map((provider) => ({
        id: provider.id,
        name: provider.name,
        playbackAvailable: provider.playableMediaVerified,
        reason: provider.failureReason,
      }));

    return NextResponse.json(
      {
        success: true,

        // Number of providers that actually ran discovery.
        configuredProviders: result.providers.length,

        sources: result.sources,

        // Runtime discovery results.
        providers: result.providers,

        // Integration and playback diagnostics.
        providerStatus,

        message:
          result.sources.length === 0
            ? "No playable sources were returned. Providers may be disabled, unavailable, or unable to return a verified source."
            : undefined,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("[API /streams POST]", error);

    return NextResponse.json(
      { error: "Unable to discover streaming sources" },
      { status: 500 }
    );
  }
}
