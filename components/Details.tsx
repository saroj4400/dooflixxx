"use client";

import Link from "next/link";
import {
  Play,
  Star,
  Plus,
  Check,
  Share2,
  Clock,
  Calendar,
  Tv,
  Film,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { Media, Episode } from "@/types/media";
import { ImageWithFallback } from "./ImageWithFallback";
import { useMyList } from "@/context/MyListContext";
import { Section } from "./Section";
import { SeasonSelector } from "./SeasonSelector";
import { EpisodeSelector } from "./EpisodeSelector";

interface DetailsProps {
  item: Media;
  relatedMedia?: Media[];
  seasonNumbers?: number[];
  initialEpisodes?: Episode[];
}

export function Details({
  item,
  relatedMedia = [],
  seasonNumbers = [1],
  initialEpisodes = []
}: DetailsProps) {
  const { isInList, toggleItem, showToast } = useMyList();
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const isSaved = isInList(item.id);

  /** When the user switches seasons, fetch episodes via the secure API route */
  const handleSeasonChange = async (season: number) => {
    setActiveSeason(season);
    if (item.type !== "tv") return;
    setLoadingEpisodes(true);
    try {
      const res = await fetch(`/api/episodes?tvId=${item.id}&season=${season}`);
      if (res.ok) {
        const data = await res.json();
        setEpisodes(data);
      }
    } catch {
      /* keep existing episodes on failure */
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard!");
      } else {
        showToast("Link ready to share!");
      }
    } catch {
      showToast("Link ready to share!");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero Header */}
      <section className="relative min-h-[520px] sm:min-h-[600px] overflow-hidden">
        {/* Background Backdrop */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={item.backdrop}
            alt={item.title}
            fallbackTitle={item.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-black/75 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent md:w-3/4" />

        {/* Content Container */}
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-12 pt-16 sm:px-6 md:flex-row md:items-end md:gap-10 md:px-8">
          {/* Poster Card */}
          <div className="relative aspect-[2/3] w-36 flex-none overflow-hidden rounded-[20px] sm:rounded-[24px] border border-white/15 bg-[#131318] shadow-[0_20px_50px_rgba(0,0,0,0.85)] sm:w-52 md:w-64">
            <ImageWithFallback
              src={item.poster}
              alt={item.title}
              fallbackTitle={item.title}
              fill
              sizes="(max-width: 768px) 208px, 256px"
              className="object-cover object-center"
            />
            {item.quality && (
              <span className="absolute top-2.5 left-2.5 rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-md">
                {item.quality}
              </span>
            )}
          </div>

          {/* Metadata & Actions */}
          <div className="max-w-3xl flex-1">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <span className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-white">
                {item.type === "tv" ? <Tv size={14} /> : <Film size={14} />}
                <span>{item.type === "tv" ? "TV Series" : "Movie"}</span>
              </span>
              {item.maturityRating && (
                <span className="rounded-md border border-white/20 bg-black/40 px-2 py-1 text-white/90 backdrop-blur-sm">
                  {item.maturityRating}
                </span>
              )}
              <span className="flex items-center gap-1 text-white/70">
                <Calendar size={14} />
                <span>{item.year}</span>
              </span>
              {item.runtime && (
                <span className="flex items-center gap-1 text-white/70">
                  <Clock size={14} />
                  <span>{item.runtime}</span>
                </span>
              )}
              <span className="flex items-center gap-1 rounded-md bg-white/[0.08] px-2 py-1 font-bold text-amber-400">
                <Star size={14} fill="currentColor" />
                <span>{item.rating}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-white">
              {item.title}
            </h1>

            {/* Tagline */}
            {item.tagline && (
              <p className="mt-1 text-sm sm:text-base italic text-white/60">
                &ldquo;{item.tagline}&rdquo;
              </p>
            )}

            {/* Genres */}
            <div className="mt-3 flex flex-wrap gap-2">
              {item.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base md:max-w-2xl">
              {item.description}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={
                  item.type === "tv"
                    ? `/watch/${item.id}?type=tv&season=${activeSeason}&episode=1`
                    : `/watch/${item.id}?type=movie`
                }
                className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-xs sm:text-sm font-black text-black shadow-xl transition-all duration-200 hover:bg-zinc-200 hover:scale-105 active:scale-95"
              >
                <Play size={18} fill="currentColor" />
                <span>Play Now</span>
              </Link>

              <button
                onClick={() => toggleItem(item)}
                className={`flex items-center gap-2 rounded-full border px-5 py-3 text-xs sm:text-sm font-bold backdrop-blur-md transition-all active:scale-95 ${
                  isSaved
                    ? "border-red-500/50 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {isSaved ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} />}
                <span>{isSaved ? "Saved to List" : "Add to My List"}</span>
              </button>

              <button
                onClick={handleShare}
                aria-label="Share title"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-xs sm:text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-95"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Details Specs Section */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
        <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2 md:grid-cols-4 sm:p-7">
          {item.director && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                {item.type === "tv" ? "Creator" : "Director"}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{item.director}</p>
            </div>
          )}
          {item.cast && item.cast.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">Starring</p>
              <p className="mt-1 text-sm font-semibold text-white">{item.cast.join(", ")}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/40">Audio & Subtitles</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {item.language} (Original), English [CC]
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/40">Format & Features</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {item.quality || "Ultra HD"} • Dolby Atmos • 5.1 Surround
            </p>
          </div>
        </div>
      </section>

      {/* Episodes Section for TV Shows */}
      {item.type === "tv" && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
          <SeasonSelector
            seasons={seasonNumbers.length > 0 ? seasonNumbers : [1]}
            activeSeason={activeSeason}
            onSeasonChange={handleSeasonChange}
            totalEpisodes={episodes.length}
          />
          <div className="mt-6 relative">
            {loadingEpisodes && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
                <Loader2 size={32} className="animate-spin text-cinema" />
              </div>
            )}
            <EpisodeSelector
              episodes={episodes}
              currentEpisodeNum={0}
              showId={item.id}
              backdrop={item.backdrop}
            />
          </div>
        </section>
      )}

      {/* More Like This / Recommended */}
      {relatedMedia.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
          <Section
            title="More Like This"
            items={relatedMedia}
            horizontal={true}
            seeAllHref="/new-popular"
          />
        </section>
      )}
    </div>
  );
}