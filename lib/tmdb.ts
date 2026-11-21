/**
 * lib/tmdb.ts
 *
 * SERVER-SIDE ONLY TMDB API service.
 * - Reads TMDB_API_KEY from process.env (never exposed to client)
 * - All functions are async and safe to call from Server Components / Route Handlers
 * - Falls back to local mock data when key is absent or request fails
 */

import { Media, Movie, TVShow, Episode } from "@/types/media";
import { movies as mockMovies } from "@/data/movies";
import { shows as mockShows, getEpisodesForShow } from "@/data/tv";
import { getGenreNameById } from "@/data/genres";

const configuredTMDBBase = (process.env.TMDB_BASE_URL?.trim() || "https://api.themoviedb.org/3").replace(/\/+$/, "");
const TMDB_HOSTS = [...new Set([configuredTMDBBase, "https://api.themoviedb.org/3", "https://api.tmdb.org/3"] )];
const IMG_W500 = "https://image.tmdb.org/t/p/w500";
const IMG_W780 = "https://image.tmdb.org/t/p/w780";
const IMG_ORIGINAL = "https://image.tmdb.org/t/p/original";

// Fallback images when TMDB has no image path
const FALLBACK_POSTER = "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop";
const FALLBACK_BACKDROP = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920&auto=format&fit=crop";

/** Returns true when TMDB_API_KEY is properly configured. */
export function isTMDBConfigured(): boolean {
  const key = process.env.TMDB_API_KEY;
  return Boolean(key && key.trim().length > 0 && key !== "your_tmdb_api_key");
}

/** Internal: make an authenticated TMDB GET request. Returns parsed JSON or null. */
async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey || apiKey === "your_tmdb_api_key") return null;

  for (const base of TMDB_HOSTS) {
    try {
      const url = new URL(`${base}${endpoint}`);
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("language", "en-US");
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

      const res = await fetch(url.toString(), {
        next: { revalidate: 3600 } // Cache 1 hour
      });

      if (!res.ok) {
        if (res.status === 404) {
          // Resource not found under this endpoint (e.g. movie vs tv)
          return null;
        }
        console.warn(`[TMDB] ${base}${endpoint} → HTTP ${res.status}`);
        continue;
      }
      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[TMDB] ${base}${endpoint} request error:`, (err as any)?.message || err);
    }
  }
  return null;
}

/** Build a full TMDB poster URL. Returns fallback if path is absent. */
export function getTMDBPosterUrl(path: string | null | undefined, size: "w500" | "w780" = "w500"): string {
  if (!path) return FALLBACK_POSTER;
  const base = size === "w780" ? IMG_W780 : IMG_W500;
  return `${base}${path}`;
}

/** Build a full TMDB backdrop URL. Returns fallback if path is absent. */
export function getTMDBBackdropUrl(path: string | null | undefined): string {
  if (!path) return FALLBACK_BACKDROP;
  return `${IMG_ORIGINAL}${path}`;
}

// ─── Mappers ────────────────────────────────────────────────────────────────

function formatTMDBMovie(item: any): Movie {
  const crew: any[] = item.credits?.crew ?? [];
  const cast: any[] = item.credits?.cast ?? [];
  const director = crew.find((p: any) => p.job === "Director")?.name;
  const castNames = cast.slice(0, 6).map((p: any) => p.name);
  const similar: any[] = item.similar?.results ?? [];

  return {
    id: String(item.id ?? ""),
    title: item.title || item.original_title || "Untitled",
    year: item.release_date ? parseInt(item.release_date.split("-")[0], 10) || 2025 : 2025,
    type: "movie",
    poster: getTMDBPosterUrl(item.poster_path, "w500"),
    backdrop: getTMDBBackdropUrl(item.backdrop_path),
    description: item.overview || "No synopsis available.",
    genres: Array.isArray(item.genres)
      ? item.genres.map((g: any) => g.name)
      : Array.isArray(item.genre_ids)
        ? item.genre_ids.map((id: number) => getGenreNameById(id) || "Movie").slice(0, 3)
        : ["Cinema"],
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 7.5,
    runtime: item.runtime
      ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
      : "2h",
    language: item.original_language?.toUpperCase() ?? "EN",
    quality: "4K Ultra HD",
    tagline: item.tagline || undefined,
    isTopRated: (item.vote_average ?? 0) >= 8.0,
    isTop10: (item.popularity ?? 0) > 100,
    isNew: Boolean(
      item.release_date &&
      new Date(item.release_date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)
    ),
    maturityRating: undefined,
    director: director || undefined,
    cast: castNames.length > 0 ? castNames : undefined,
    similarIds: similar.slice(0, 10).map((s: any) => String(s.id))
  };
}

function formatTMDBTV(item: any): TVShow {
  const cast: any[] = item.credits?.cast ?? [];
  const crew: any[] = item.credits?.crew ?? [];
  const similar: any[] = item.similar?.results ?? [];
  const castNames = cast.slice(0, 6).map((p: any) => p.name);
  const creator = item.created_by?.[0]?.name || crew.find((p: any) => p.job === "Executive Producer")?.name;
  const numSeasons = item.number_of_seasons ?? 1;

  return {
    id: String(item.id ?? ""),
    title: item.name || item.original_name || "Untitled Series",
    year: item.first_air_date ? parseInt(item.first_air_date.split("-")[0], 10) || 2025 : 2025,
    type: "tv",
    poster: getTMDBPosterUrl(item.poster_path, "w500"),
    backdrop: getTMDBBackdropUrl(item.backdrop_path),
    description: item.overview || "No series synopsis available.",
    genres: Array.isArray(item.genres)
      ? item.genres.map((g: any) => g.name)
      : Array.isArray(item.genre_ids)
        ? item.genre_ids.map((id: number) => getGenreNameById(id) || "TV").slice(0, 3)
        : ["Series"],
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 7.8,
    runtime: `${numSeasons} Season${numSeasons > 1 ? "s" : ""}`,
    language: item.original_language?.toUpperCase() ?? "EN",
    quality: "4K Ultra HD",
    tagline: item.tagline || undefined,
    isTopRated: (item.vote_average ?? 0) >= 8.0,
    isTop10: (item.popularity ?? 0) > 80,
    isNew: Boolean(
      item.first_air_date &&
      new Date(item.first_air_date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)
    ),
    maturityRating: undefined,
    director: creator || undefined,
    cast: castNames.length > 0 ? castNames : undefined,
    numberOfSeasons: numSeasons,
    similarIds: similar.slice(0, 10).map((s: any) => String(s.id))
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Trending movies and/or TV shows */
export async function getTMDBTrending(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<Media[]> {
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>(`/trending/${mediaType}/${timeWindow}`);
    if (data?.results) {
      return data.results.map((item: any) =>
        item.media_type === "tv" ? formatTMDBTV(item) : formatTMDBMovie(item)
      );
    }
  }
  if (mediaType === "movie") return mockMovies;
  if (mediaType === "tv") return mockShows;
  return [...mockMovies, ...mockShows];
}

/** Popular movies */
export async function getTMDBMovies(page = 1): Promise<Movie[]> {
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>("/movie/popular", { page: String(page) });
    if (data?.results) return data.results.map(formatTMDBMovie);
  }
  return mockMovies;
}

/** Top-rated movies */
export async function getTMDBTopRatedMovies(page = 1): Promise<Movie[]> {
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>("/movie/top_rated", { page: String(page) });
    if (data?.results) return data.results.map(formatTMDBMovie);
  }
  return mockMovies.filter((m) => m.isTopRated);
}

/** Upcoming movies */
export async function getTMDBUpcomingMovies(page = 1): Promise<Movie[]> {
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>("/movie/upcoming", { page: String(page) });
    if (data?.results) return data.results.map(formatTMDBMovie);
  }
  return mockMovies.filter((m) => m.isNew);
}

/** Popular TV shows */
export async function getTMDBTVShows(page = 1): Promise<TVShow[]> {
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>("/tv/popular", { page: String(page) });
    if (data?.results) return data.results.map(formatTMDBTV);
  }
  return mockShows;
}

/** Anime series: TMDB TV animation genre, restricted to Japanese originals. */
export async function getTMDBAnime(page = 1): Promise<{ results: TVShow[]; page: number; totalPages: number; sourceError: boolean }> {
  const safePage = Math.max(1, Math.floor(page));
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>("/discover/tv", {
      with_genres: "16",
      with_original_language: "ja",
      sort_by: "popularity.desc",
      include_adult: "false",
      page: String(safePage)
    });
    if (data && Array.isArray(data.results)) {
      return {
        // TMDB's discover endpoint already constrains this list to genre 16;
        // retain that category if a result omits genre_ids in its response.
        results: data.results.map((item: any) => {
          const show = formatTMDBTV(item);
          return show.genres.includes("Animation")
            ? show
            : { ...show, genres: [...show.genres, "Animation"] };
        }),
        page: safePage,
        totalPages: Math.max(1, Number(data.total_pages) || 1),
        sourceError: false
      };
    }
  }

  // Only use local records that independently satisfy the anime identifiers.
  const localAnime = mockShows.filter((show) =>
    show.genres.some((genre) => genre.toLowerCase() === "animation") &&
    ["ja", "jp", "japanese"].includes(show.language.toLowerCase())
  );
  const pageSize = 20;
  const start = (safePage - 1) * pageSize;
  return {
    results: localAnime.slice(start, start + pageSize),
    page: safePage,
    totalPages: Math.max(1, Math.ceil(localAnime.length / pageSize)),
    sourceError: isTMDBConfigured()
  };
}

/** Top-rated TV shows */
export async function getTMDBTopRatedTV(page = 1): Promise<TVShow[]> {
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>("/tv/top_rated", { page: String(page) });
    if (data?.results) return data.results.map(formatTMDBTV);
  }
  return mockShows.filter((s) => s.isTopRated);
}

/** Full movie details with credits & similar */
export async function getTMDBMovieDetails(id: string | number): Promise<Movie | null> {
  const cleanId = String(id).trim();
  if (isTMDBConfigured() && cleanId) {
    const data = await fetchTMDB<any>(`/movie/${cleanId}`, {
      append_to_response: "credits,similar"
    });
    if (data && data.id) return formatTMDBMovie(data);
  }
  return mockMovies.find((m) => m.id === cleanId) ?? null;
}

/** Full TV show details with credits, seasons & similar */
export async function getTMDBTVDetails(id: string | number): Promise<TVShow | null> {
  const cleanId = String(id).trim();
  if (isTMDBConfigured() && cleanId) {
    const data = await fetchTMDB<any>(`/tv/${cleanId}`, {
      append_to_response: "credits,similar"
    });
    if (data && data.id) return formatTMDBTV(data);
  }
  return mockShows.find((s) => s.id === cleanId) ?? null;
}

/** Original and alternate titles used to match a provider catalog to TMDB identity. */
export async function getTMDBTitleVariants(
  id: string | number,
  mediaType: "movie" | "tv"
): Promise<string[]> {
  const cleanId = String(id).trim();
  if (!/^\d{1,12}$/.test(cleanId) || !isTMDBConfigured()) return [];
  const data = await fetchTMDB<any>(`/${mediaType}/${cleanId}`, {
    append_to_response: "alternative_titles",
  });
  if (!data) return [];
  const alternatives = mediaType === "movie"
    ? data.alternative_titles?.titles
    : data.alternative_titles?.results;
  const values = [
    data.title,
    data.original_title,
    data.name,
    data.original_name,
    ...(Array.isArray(alternatives)
      ? alternatives.map((entry: any) => entry.title || entry.name)
      : []),
  ];
  return [...new Set(values.filter((value): value is string => typeof value === "string" && Boolean(value.trim())).map((value) => value.trim()))].slice(0, 12);
}

/** Episodes for a single season of a TV show */
export async function getTMDBTVEpisodes(
  tvId: string | number,
  seasonNumber = 1
): Promise<Episode[]> {
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>(`/tv/${tvId}/season/${seasonNumber}`);
    if (data?.episodes) {
      return (data.episodes as any[]).map((ep) => ({
        id: `${tvId}-s${seasonNumber}-e${ep.episode_number}`,
        season: seasonNumber,
        episode: ep.episode_number,
        title: ep.name || `Episode ${ep.episode_number}`,
        description: ep.overview || "No description available.",
        runtime: ep.runtime ? `${ep.runtime}m` : "45m",
        thumbnail: ep.still_path ? `${IMG_W780}${ep.still_path}` : undefined,
        airDate: ep.air_date || undefined
      }));
    }
  }
  return getEpisodesForShow(String(tvId), 8);
}

/** Get season numbers for a TV show */
export async function getTMDBSeasons(tvId: string | number): Promise<number[]> {
  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>(`/tv/${tvId}`);
    if (data?.seasons) {
      return (data.seasons as any[])
        .filter((s: any) => s.season_number > 0)
        .map((s: any) => s.season_number as number);
    }
  }
  return [1, 2];
}

/** Multi-search: movies + TV shows */
export async function searchTMDB(query: string, page = 1): Promise<Media[]> {
  const q = query.trim();
  if (!q) return [];

  if (isTMDBConfigured()) {
    const data = await fetchTMDB<any>("/search/multi", {
      query: q,
      page: String(page)
    });
    if (data?.results) {
      return (data.results as any[])
        .filter((i) => i.media_type === "movie" || i.media_type === "tv")
        .map((item) =>
          item.media_type === "tv" ? formatTMDBTV(item) : formatTMDBMovie(item)
        );
    }
  }

  // Fallback: local filter
  const lower = q.toLowerCase();
  return [...mockMovies, ...mockShows].filter(
    (m) =>
      m.title.toLowerCase().includes(lower) ||
      m.genres.some((g) => g.toLowerCase().includes(lower)) ||
      m.description.toLowerCase().includes(lower)
  );
}

/** Fetch a batch of similar/recommended titles by TMDB ID list */
export async function getTMDBSimilarMedia(
  ids: string[],
  type: "movie" | "tv"
): Promise<Media[]> {
  if (!isTMDBConfigured() || ids.length === 0) return [];
  const results: Media[] = [];
  for (const id of ids.slice(0, 6)) {
    const endpoint = type === "movie" ? `/movie/${id}` : `/tv/${id}`;
    const data = await fetchTMDB<any>(endpoint);
    if (data) results.push(type === "movie" ? formatTMDBMovie(data) : formatTMDBTV(data));
  }
  return results;
}
