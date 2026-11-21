"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Media, Episode } from "@/types/media";
import { MediaCard } from "./MediaCard";
import { SeasonSelector } from "./SeasonSelector";
import { EpisodeSelector } from "./EpisodeSelector";

import { TELEGRAM_GROUP_URL } from "./telegramgroup";
import { StreamDiscovery } from "./streaming/StreamDiscovery";

interface WatchClientProps {
  item: Media;
  initialEpisode: number;
  initialSeason: number;
  episodes: Episode[];
  seasonNumbers?: number[];
  relatedMedia?: Media[];
}

export function WatchClient({
  item,
  initialEpisode,
  initialSeason,
  episodes: initialEpisodes,
  seasonNumbers = [1],
  relatedMedia = []
}: WatchClientProps) {
  const router = useRouter();

  const [season, setSeason] = useState(initialSeason);
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState(initialEpisode);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const currentEpisode = useMemo(() => {
    if (item.type !== "tv") return null;

    return (
      episodes.find((episode) => episode.episode === currentEpisodeNum) ||
      episodes[0] ||
      null
    );
  }, [item.type, episodes, currentEpisodeNum]);

  const handleSeasonChange = useCallback(
    async (newSeason: number) => {
      setSeason(newSeason);
      setCurrentEpisodeNum(1);

      router.replace(
        `/watch/${item.id}?type=tv&season=${newSeason}&episode=1`,
        { scroll: false }
      );

      if (item.type !== "tv") return;

      setLoadingEpisodes(true);

      try {
        const res = await fetch(
          `/api/episodes?tvId=${item.id}&season=${newSeason}`
        );

        if (res.ok) {
          setEpisodes(await res.json());
        }
      } catch {
        // Keep existing episodes if request fails
      } finally {
        setLoadingEpisodes(false);
      }
    },
    [item.id, item.type, router]
  );

  const handlePrevEpisode = () => {
    if (currentEpisodeNum <= 1) return;
    const nextEpisode = currentEpisodeNum - 1;
    setCurrentEpisodeNum(nextEpisode);

    router.replace(
      `/watch/${item.id}?type=tv&season=${season}&episode=${nextEpisode}`,
      { scroll: false }
    );
  };

  const handleNextEpisode = () => {
    if (currentEpisodeNum >= episodes.length) return;
    const nextEpisode = currentEpisodeNum + 1;
    setCurrentEpisodeNum(nextEpisode);

    router.replace(
      `/watch/${item.id}?type=tv&season=${season}&episode=${nextEpisode}`,
      { scroll: false }
    );
  };

  const handleEpisodeSelect = (episode: Episode) => {
    setCurrentEpisodeNum(episode.episode);

    router.replace(
      `/watch/${item.id}?type=tv&season=${season}&episode=${episode.episode}`,
      { scroll: false }
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const returnHref =
    item.type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;

  return (
    <div className="watch-page min-h-screen bg-[#060608] text-white">
      {/* Header */}
      <div className="watch-page-header border-b border-white/[0.08] bg-[#09090e]/95 backdrop-blur-xl px-4 py-3 sm:px-6 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href={returnHref}
            className="flex flex-none items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-white/10 active:scale-95 sm:text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Details</span>
          </Link>

          <div className="truncate text-center">
            <h2 className="truncate text-sm font-bold text-white sm:text-base">
              {item.title}
            </h2>

            {item.type === "tv" && currentEpisode && (
              <p className="text-[11px] text-white/50">
                Season {season}, Ep {currentEpisode.episode}: {currentEpisode.title}
              </p>
            )}
          </div>

          <span className="flex-none rounded-md bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
            {item.quality || "4K UHD"}
          </span>
        </div>
      </div>

      <div className="watch-content mx-auto space-y-5">
        <div className="flex h-[68px] items-center sm:h-[80px]">
          <a
            href={TELEGRAM_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl border border-sky-400/20 bg-[#0b1420] px-3 py-1.5 text-white shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-sky-400/40"
          >
          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#229ED9] transition-transform duration-200 group-hover:scale-105">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M21.7 3.4a1.7 1.7 0 0 0-1.8-.3L2.8 9.7c-1.2.5-1.2 1.2-.2 1.5l4.4 1.4 1.7 5.3c.2.7.1 1 .8 1 .5 0 .8-.2 1.1-.5l2.1-2 4.4 3.3c.8.4 1.4.2 1.6-.8l2.9-13.7c.3-1.2-.2-1.7-.9-1.8ZM8 12.3l9.5-6c.5-.3.9-.1.5.2l-7.8 7-.3 3.2L8 12.3Z" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block whitespace-nowrap text-xs font-bold tracking-wide text-white sm:text-[13px]">JOIN OUR TELEGRAM GROUP</span>
          </span>
          </a>
        </div>

        {/* Provider search and player: the registered streaming modules are the only source of playback URLs. */}
        <div className="watch-player-frame watch-provider-player-frame" style={{ marginTop: 0 }}>
          <StreamDiscovery
            tmdbId={item.id}
            mediaType={item.type}
            title={item.title}
            year={item.year}
            season={season}
            episode={currentEpisodeNum}
            poster={item.backdrop}
          />
        </div>

        <div className="watch-mobile-details">
          <h1 className="text-base font-bold text-white">{item.title}</h1>
          <p className="mt-1 text-xs text-amber-300">{item.type === "tv" ? "TV Show" : "Movie"}</p>
        </div>
        {/* TV Episodes */}
        {item.type === "tv" && (
          <>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <button
                onClick={handlePrevEpisode}
                disabled={currentEpisodeNum <= 1}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={16} />
                <span>Previous Episode</span>
              </button>

              <span className="text-xs font-bold text-white/70">
                S{season} · E{currentEpisodeNum}
              </span>

              <button
                onClick={handleNextEpisode}
                disabled={currentEpisodeNum >= episodes.length}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span>Next Episode</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <SeasonSelector
                seasons={seasonNumbers.length > 0 ? seasonNumbers : [1]}
                activeSeason={season}
                onSeasonChange={handleSeasonChange}
                totalEpisodes={episodes.length}
              />

              <div className="relative">
                {loadingEpisodes && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
                    <Loader2 size={28} className="animate-spin text-cinema" />
                  </div>
                )}

                {episodes.length > 0 ? (
                  <EpisodeSelector
                    episodes={episodes}
                    currentEpisodeNum={currentEpisodeNum}
                    showId={item.id}
                    backdrop={item.backdrop}
                    onSelectEpisode={handleEpisodeSelect}
                  />
                ) : !loadingEpisodes ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/40">
                    No episodes available for this season.
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}

        {/* Related Content */}
        {relatedMedia.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="text-base font-bold tracking-wide text-white sm:text-lg">
              You May Also Like
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {relatedMedia.map((rel) => (
                <MediaCard key={rel.id} item={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
