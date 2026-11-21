import { getMovies, getTopRatedMovies } from "@/lib/api";
import { MoviesClient } from "@/components/MoviesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies — doomsplay",
  description: "Browse popular movies, blockbusters, and indie hits on doomsplay."
};

export default async function MoviesPage() {
  const [popular, topRated] = await Promise.all([
    getMovies(),
    getTopRatedMovies()
  ]);

  // Merge and de-duplicate by id
  const seen = new Set<string>();
  const allMovies = [...popular, ...topRated].filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  return <MoviesClient movies={allMovies} />;
}