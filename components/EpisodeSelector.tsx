"use client";

import Link from "next/link";
import { Play, CheckCircle2, Clock } from "lucide-react";
import { Episode } from "@/types/tv";
import { ImageWithFallback } from "./ImageWithFallback";

interface EpisodeSelectorProps {
  episodes: Episode[];
  currentEpisodeNum: number;
  showId: string;
  backdrop?: string;
  onSelectEpisode?: (ep: Episode) => void;
}

export function EpisodeSelector({
  episodes,
  currentEpisodeNum,
  showId,
  backdrop,
  onSelectEpisode
}: EpisodeSelectorProps) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-white/45">
        No episodes currently listed for this season.
      </div>
    );
  }

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {episodes.map((ep) => {
        const isCurrent = ep.episode === currentEpisodeNum;
        const href = `/watch/${showId}?type=tv&season=${ep.season || 1}&episode=${ep.episode}`;

        return (
          <Link
            key={ep.id}
            href={href}
            onClick={() => onSelectEpisode?.(ep)}
            className={`group flex flex-col overflow-hidden rounded-2xl border p-3 transition-all duration-200 ${
              isCurrent
                ? "border-red-600/60 bg-red-600/10 shadow-xl shadow-red-600/20"
                : "border-white/10 bg-[#0e0e13] hover:border-white/20 hover:bg-[#131318]"
            }`}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <ImageWithFallback
                src={ep.thumbnail || backdrop || ""}
                alt={ep.title}
                fallbackTitle={`Ep ${ep.episode}`}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 260px"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover:bg-black/20">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform ${
                    isCurrent
                      ? "bg-red-600 text-white scale-110 font-bold"
                      : "bg-white/90 text-black group-hover:scale-110"
                  }`}
                >
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </div>
              </div>

              <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                <Clock size={10} />
                <span>{ep.runtime}</span>
              </span>

              {isCurrent && (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase text-white shadow">
                  Playing
                </span>
              )}
            </div>

            {/* Episode Title & Description */}
            <div className="mt-2.5 flex-1">
              <h4
                className={`line-clamp-1 text-xs font-bold transition-colors ${
                  isCurrent ? "text-red-400" : "text-white group-hover:text-white/90"
                }`}
              >
                {ep.episode}. {ep.title}
              </h4>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/50">
                {ep.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
