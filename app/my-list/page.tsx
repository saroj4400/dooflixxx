"use client";

import Link from "next/link";
import { Bookmark, Trash2, Film, Tv, Play, Plus, Check } from "lucide-react";
import { useState } from "react";
import { useMyList } from "@/context/MyListContext";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { Media } from "@/types/media";

export default function MyListPage() {
  const { items, isLoaded, removeItem, clearList } = useMyList();
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-8 sm:px-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white sm:text-4xl">My List</h1>
            {isLoaded && items.length > 0 && (
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
                {items.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/50">
            Titles you&apos;ve bookmarked for later viewing on Doomsplay.
          </p>
        </div>

        {/* Action Controls & Filters */}
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Filter tabs */}
            <div className="flex items-center rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filter === "all" ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30" : "text-white/60 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("movie")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filter === "movie" ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30" : "text-white/60 hover:text-white"
                }`}
              >
                <Film size={13} />
                <span>Movies</span>
              </button>
              <button
                onClick={() => setFilter("tv")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filter === "tv" ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30" : "text-white/60 hover:text-white"
                }`}
              >
                <Tv size={13} />
                <span>TV Shows</span>
              </button>
            </div>

            {/* Clear All */}
            <button
              onClick={clearList}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/60 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition"
              title="Clear all bookmarks"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Clear List</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Display */}
      {!isLoaded ? (
        /* Loading skeleton while reading localStorage */
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="mx-auto my-20 max-w-md text-center px-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-red-500 shadow-inner">
            <Bookmark size={40} strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-white">Your list is currently empty</h2>
          <p className="mt-2 text-sm text-white/50">
            Explore movies and TV series across Doomsplay. Use the <strong>+ My List</strong> button
            to save titles you want to watch.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/movies"
              className="rounded-full bg-white px-7 py-3 text-sm font-black text-black shadow-lg hover:bg-zinc-200 transition"
            >
              Browse Movies
            </Link>
            <Link
              href="/tv"
              className="rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-bold text-white hover:bg-white/10 transition"
            >
              Browse TV Shows
            </Link>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty Filter State */
        <div className="my-16 text-center text-white/50">
          <p>No {filter === "movie" ? "movies" : "TV shows"} in your list.</p>
          <button
            onClick={() => setFilter("all")}
            className="mt-3 text-sm font-bold text-cinema hover:underline"
          >
            Show all items
          </button>
        </div>
      ) : (
        /* Grid of Saved Items */
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredItems.map((item) => {
            const href = item.type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
            return (
              <div key={item.id} className="group relative block min-w-0">
                <Link href={href} className="block">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#191919] shadow-md transition-all duration-300 group-hover:border-white/25 group-hover:shadow-2xl">
                    <ImageWithFallback
                      src={item.poster}
                      alt={item.title}
                      fallbackTitle={item.title}
                      fill
                      sizes="(max-width: 640px) 44vw, 200px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Quick remove button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      aria-label="Remove from My List"
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white/70 backdrop-blur-md transition hover:bg-red-600 hover:text-white"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl">
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title & metadata */}
                  <div className="mt-2.5 px-0.5">
                    <h3 className="line-clamp-1 text-sm font-bold text-white group-hover:text-cinema transition-colors">
                      {item.title}
                    </h3>
                    <div className="mt-1 flex items-center justify-between text-xs text-white/50">
                      <span className="uppercase text-[10px] font-semibold text-white/60">
                        {item.type === "tv" ? "TV Series" : "Movie"}
                      </span>
                      <span>{item.year}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}