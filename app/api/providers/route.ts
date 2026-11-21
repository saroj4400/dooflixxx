
import { NextRequest, NextResponse } from "next/server";

const PROVIDERS: Record<string, { id: number; name: string }> = {
    netflix: { id: 8, name: "Netflix" },
    prime: { id: 119, name: "Prime Video" },
    disney: { id: 337, name: "Disney+" },
    apple: { id: 350, name: "Apple TV+" },
    applestore: { id: 350, name: "Apple TV" },
    hulu: { id: 15, name: "Hulu" },
    hbo: { id: 1899, name: "HBO Max" },
    paramount: { id: 531, name: "Paramount+" },
    peacock: { id: 386, name: "Peacock" },
    crunchyroll: { id: 283, name: "Crunchyroll" },
    starz: { id: 43, name: "Starz" },
    amc: { id: 526, name: "AMC+" }
};

const IMAGE = "https://image.tmdb.org/t/p/w500";

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const provider = params.get("provider") || "";
    const type = params.get("type") || "all";
    const page = Math.max(
        1,
        Math.min(500, Number(params.get("page") || 1))
    );

    const selectedProvider = PROVIDERS[provider];

    if (!selectedProvider) {
        return NextResponse.json(
            { error: "Unknown provider" },
            { status: 400 }
        );
    }

    if (!["all", "movie", "tv"].includes(type)) {
        return NextResponse.json(
            { error: "Invalid media type" },
            { status: 400 }
        );
    }

    const apiKeyValue = process.env.TMDB_API_KEY?.trim();

    if (!apiKeyValue || apiKeyValue === "your_tmdb_api_key") {
        return NextResponse.json(
            { error: "TMDB API key is not configured" },
            { status: 503 }
        );
    }

    const apiKey: string = apiKeyValue;
    async function discover(mediaType: "movie" | "tv") {
        const tmdbBase = (process.env.TMDB_BASE_URL?.trim() || "https://api.themoviedb.org/3").replace(/\/+$/, "");
        const url = new URL(`${tmdbBase}/discover/${mediaType}`);

        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("language", "en-US");
        url.searchParams.set("region", "IN");
        url.searchParams.set("watch_region", "IN");
        url.searchParams.set(
            "with_watch_providers",
            String(selectedProvider.id)
        );

        // Subscription, free and ad-supported availability.
        // Rental and purchase titles are intentionally excluded.
        url.searchParams.set(
            "with_watch_monetization_types",
            "flatrate|free|ads"
        );

        url.searchParams.set("sort_by", "popularity.desc");
        url.searchParams.set("include_adult", "false");
        url.searchParams.set("page", String(page));

        const response = await fetch(url.toString(), {
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            const errorDetails = await response.text();

            console.error("TMDB API ERROR:", {
                mediaType,
                status: response.status,
                details: errorDetails
            });

            throw new Error(
                `TMDB ${mediaType} failed (${response.status}): ${errorDetails}`
            );
        }

        const data = await response.json();

        return {
            page: data.page || page,
            total_pages: data.total_pages || 0,
            total_results: data.total_results || 0,
            results: (data.results || []).map((item: any) => ({
                id: String(item.id),
                title:
                    mediaType === "movie"
                        ? item.title || item.original_title
                        : item.name || item.original_name,
                year: Number(
                    (
                        mediaType === "movie"
                            ? item.release_date
                            : item.first_air_date
                    )?.slice(0, 4)
                ) || 0,
                type: mediaType,
                poster: item.poster_path
                    ? `${IMAGE}${item.poster_path}`
                    : null,
                backdrop: item.backdrop_path
                    ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
                    : null,
                description: item.overview || "",
                rating: Number(
                    (item.vote_average || 0).toFixed(1)
                ),
                language: item.original_language || "en",
                genres: item.genre_ids || []
            }))
        };
    }

    try {
        if (type === "movie" || type === "tv") {
            const data = await discover(type);

            return NextResponse.json({
                provider: selectedProvider.name,
                region: "IN",
                type,
                ...data
            });
        }

        // Fetch movies and TV separately, then combine.
        const [movies, shows] = await Promise.all([
            discover("movie"),
            discover("tv")
        ]);

        const combined = [
            ...movies.results,
            ...shows.results
        ].sort((a, b) => b.rating - a.rating);

        return NextResponse.json({
            provider: selectedProvider.name,
            region: "IN",
            type: "all",
            page,
            total_results:
                movies.total_results + shows.total_results,
            total_pages: Math.max(
                movies.total_pages,
                shows.total_pages
            ),
            results: combined
        });
    } catch (error) {
        console.error("[Provider API]", error);

        return NextResponse.json(
            { error: "Unable to load provider catalog" },
            { status: 502 }
        );
    }
}
