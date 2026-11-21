"use client";

import Link from "next/link";
import { Star, Plus, Check, Play } from "lucide-react";
import { Media } from "@/types/media";
import { ImageWithFallback } from "./ImageWithFallback";
import { useMyList } from "@/context/MyListContext";

export function MediaCard({ item }: { item: Media }) {
  const { isInList, toggleItem } = useMyList();
  const isSaved = isInList(item.id);
  const href = item.type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;

  const handleToggleList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(item);
  };

  return (
    <Link
      href={href}
      className="group relative block min-w-0 transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Poster Container matching Reference 1 & 2 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[18px] sm:rounded-[22px] border border-white/[0.08] bg-[#131318] shadow-md transition-all duration-300 group-hover:border-white/25 group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.85)]">
        <ImageWithFallback
          src={item.poster}
          alt={item.title}
          fallbackTitle={item.title}
          fallbackSubtitle={`${item.year} • ${item.type.toUpperCase()}`}
          fill
          sizes="(max-width: 640px) 140px, (max-width: 1024px) 190px, 250px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

        {/* Badges matching Reference Screenshots (Red 'TOP RATED' and 'NEW') */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {item.isTopRated && (
            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(229,9,20,0.6)]">
              TOP RATED
            </span>
          )}
          {item.isNew && !item.isTopRated && (
            <span className="rounded-md bg-red-600/90 px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              NEW
            </span>
          )}
          {item.quality && (
            <span className="rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold text-white/90 backdrop-blur-sm self-start">
              {item.quality}
            </span>
          )}
        </div>

        {/* Watchlist Toggle Button (Top-Right) */}
        <button
          onClick={handleToggleList}
          aria-label={isSaved ? "Remove from My List" : "Add to My List"}
          className={`absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all active:scale-90 ${
            isSaved
              ? "border-red-500 bg-red-600 text-white font-bold shadow-[0_0_10px_rgba(229,9,20,0.5)]"
              : "border-white/20 bg-black/60 text-white/80 hover:bg-black/90 hover:text-white"
          }`}
        >
          {isSaved ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} />}
        </button>

        {/* Quick Action Overlay (Desktop Hover Play Button) */}
        <div className="absolute inset-0 hidden sm:flex items-center justify-center bg-black/35 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-transform hover:scale-110">
            <Play size={18} fill="currentColor" className="ml-0.5" />
          </div>
        </div>
      </div>

      {/* Title & Metadata Below Card */}
      <div className="mt-2.5 px-0.5">
        <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-white/90 transition-colors group-hover:text-white">
          {item.title}
        </h3>
        <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs text-white/50">
          <div className="flex items-center gap-1.5">
            <span className="rounded border border-white/15 px-1 py-0.2 text-[9px] font-semibold uppercase text-white/60">
              {item.type === "tv" ? "TV" : "Movie"}
            </span>
            <span>{item.year}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-amber-400">
            <Star size={11} fill="currentColor" />
            <span>{item.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}