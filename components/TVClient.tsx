"use client";

import { useState, useMemo } from "react";
import { TVShow } from "@/types/media";
import { MediaCard } from "@/components/MediaCard";
import { Tv, SlidersHorizontal } from "lucide-react";

const genres = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Mystery",
  "Reality",
  "Sci-Fi & Fantasy",
  "Thriller",
  "Western"
];

interface Props {
  shows: TVShow[];
}

export function TVClient({ shows }: Props) {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "year">("popular");

  const filtered = useMemo(() => {
    let list = [...shows];

    if (selectedGenre !== "All") {
      list = list.filter((s) =>
        s.genres.some(
          (g) =>
            g.toLowerCase() === selectedGenre.toLowerCase() ||
            g.toLowerCase().includes(selectedGenre.toLowerCase())
        )
      );
    }

    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "year") list.sort((a, b) => b.year - a.year);

    return list;
  }, [shows, selectedGenre, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-500">
              <Tv size={22} />
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">TV Shows</h1>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Explore gripping series, award-winning dramas, and episodic sensations.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-white/40" />
          <span className="text-xs text-white/40">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "popular" | "rating" | "year")}
            className="rounded-xl border border-white/10 bg-[#101016] px-3 py-1.5 text-xs font-semibold text-white outline-none hover:border-white/20 transition cursor-pointer"
          >
            <option value="popular">Recommended</option>
            <option value="rating">Highest Rated</option>
            <option value="year">Newest First</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {genres.map((g) => {
          const active = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`flex-none rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition ${
                active
                  ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30"
                  : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Counter */}
      <div className="mt-5 mb-3.5 text-xs font-medium text-white/40">
        Showing <span className="text-white font-bold">{filtered.length}</span> series
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-white/50">
          <p>No TV shows found in this category.</p>
          <button
            onClick={() => setSelectedGenre("All")}
            className="mt-3 text-sm font-bold text-red-500 hover:underline"
          >
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}
