/**
 * lib/api.ts
 *
 * Unified data gateway for CineMate.
 * Server-side only – all functions call lib/tmdb.ts when configured,
 * or transparently fall back to local mock data.
 */

import { Media, Movie, TVShow, Episode } from "@/types/media";
import { movies } from "@/data/movies";
import { shows, getEpisodesForShow } from "@/data/tv";
import { allMedia } from "@/data/media";
import {
  isTMDBConfigured,
  getTMDBMovies,
  getTMDBTopRatedMovies,
  getTMDBUpcomingMovies,
  getTMDBTVShows,
  getTMDBAnime,
  getTMDBTopRatedTV,
  getTMDBMovieDetails,
  getTMDBTVDetails,
  getTMDBTrending,
  getTMDBTVEpisodes,
  getTMDBSeasons,
  getTMDBSimilarMedia,
  searchTMDB
} from "./tmdb";

export async function getAnime(page = 1) {
  return {
    ...(await getTMDBAnime(page)),
    configured: isTMDBConfigured()
  };
}

// ─── Movies ─────────────────────────────────────────────────────────────────

export async function getMovies(): Promise<Movie[]> {
  if (isTMDBConfigured()) return getTMDBMovies();
  return movies;
}

export async function getTopRatedMovies(): Promise<Movie[]> {
  if (isTMDBConfigured()) return getTMDBTopRatedMovies();
  return movies.filter((m) => m.isTopRated);
}

export async function getUpcomingMovies(): Promise<Movie[]> {
  if (isTMDBConfigured()) return getTMDBUpcomingMovies();
  return movies.filter((m) => m.isNew);
}

export async function getMovieById(id: string): Promise<Movie | undefined> {
  if (isTMDBConfigured()) {
    const item = await getTMDBMovieDetails(id);
    if (item) return item;
  }
  return movies.find((m) => m.id === id);
}

// ─── TV Shows ────────────────────────────────────────────────────────────────

export async function getTVShows(): Promise<TVShow[]> {
  if (isTMDBConfigured()) return getTMDBTVShows();
  return shows;
}

export async function getTopRatedTV(): Promise<TVShow[]> {
  if (isTMDBConfigured()) return getTMDBTopRatedTV();
  return shows.filter((s) => s.isTopRated);
}

export async function getTVShowById(id: string): Promise<TVShow | undefined> {
  if (isTMDBConfigured()) {
    const item = await getTMDBTVDetails(id);
    if (item) return item;
  }
  return shows.find((s) => s.id === id);
}

// ─── Seasons & Episodes ──────────────────────────────────────────────────────

export async function getSeasonsForShow(tvId: string): Promise<number[]> {
  if (isTMDBConfigured()) return getTMDBSeasons(tvId);
  return [1, 2];
}

export async function getEpisodesForSeason(
  tvId: string,
  season: number
): Promise<Episode[]> {
  if (isTMDBConfigured()) return getTMDBTVEpisodes(tvId, season);
  return getEpisodesForShow(tvId, 8);
}

// ─── Combined / Discovery ────────────────────────────────────────────────────

export async function getMediaById(
  id: string,
  typeHint?: "movie" | "tv"
): Promise<Media | undefined> {
  const cleanId = String(id).trim();
  if (!cleanId) return undefined;

  if (isTMDBConfigured()) {
    if (typeHint === "tv") {
      const tv = await getTMDBTVDetails(cleanId);
      if (tv) return tv;
      const movie = await getTMDBMovieDetails(cleanId);
      if (movie) return movie;
    } else if (typeHint === "movie") {
      const movie = await getTMDBMovieDetails(cleanId);
      if (movie) return movie;
      const tv = await getTMDBTVDetails(cleanId);
      if (tv) return tv;
    } else {
      // Try movie first, then TV
      const movie = await getTMDBMovieDetails(cleanId);
      if (movie) return movie;
      const tv = await getTMDBTVDetails(cleanId);
      if (tv) return tv;
    }
  }

  if (typeHint === "tv") {
    const s = shows.find((m) => m.id === cleanId);
    if (s) return s;
  } else if (typeHint === "movie") {
    const m = movies.find((m) => m.id === cleanId);
    if (m) return m;
  }

  return allMedia.find((m) => m.id === cleanId);
}

export async function getTrending(): Promise<Media[]> {
  if (isTMDBConfigured()) return getTMDBTrending("all", "week");
  return allMedia.filter((m) => m.isTop10 || m.isTopRated || m.isNew);
}

export async function getTrendingMovies(): Promise<Movie[]> {
  if (isTMDBConfigured()) {
    const results = await getTMDBTrending("movie", "day");
    return results.filter((m): m is Movie => m.type === "movie");
  }
  return movies;
}

export async function getTrendingTV(): Promise<TVShow[]> {
  if (isTMDBConfigured()) {
    const results = await getTMDBTrending("tv", "day");
    return results.filter((s): s is TVShow => s.type === "tv");
  }
  return shows;
}

export async function getRelatedMedia(
  current: Media,
  limit = 8
): Promise<Media[]> {
  // Use TMDB similar IDs if available
  if (isTMDBConfigured() && current.similarIds && current.similarIds.length > 0) {
    const similar = await getTMDBSimilarMedia(
      current.similarIds.slice(0, limit),
      current.type
    );
    if (similar.length > 0) return similar;
  }
  // Fallback: genre-based local filter
  return allMedia
    .filter(
      (m) =>
        m.id !== current.id &&
        (m.type === current.type ||
          m.genres.some((g) => current.genres.includes(g)))
    )
    .slice(0, limit);
}

// ─── Search ──────────────────────────────────────────────────────────────────

export async function searchMedia(
  query: string,
  filterType?: "all" | "movie" | "tv",
  genre?: string
): Promise<Media[]> {
  const q = query.trim().toLowerCase();

  let list: Media[];
  if (isTMDBConfigured() && q) {
    list = await searchTMDB(q);
  } else {
    list = allMedia;
  }

  if (filterType && filterType !== "all") {
    list = list.filter((m) => m.type === filterType);
  }

  if (genre && genre !== "All") {
    list = list.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  if (!q) return list;

  // If from TMDB, trust the ranking. If local, apply text filter.
  if (isTMDBConfigured()) return list;

  return list.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.director && m.director.toLowerCase().includes(q)) ||
      (m.cast && m.cast.some((c) => c.toLowerCase().includes(q)))
  );
}

// Re-export for backward compat
export { getEpisodesForShow };
