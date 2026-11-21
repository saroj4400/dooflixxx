"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, Loader2, RotateCcw, ChevronRight, Server, Send, ShieldAlert } from "lucide-react";
import { PlayerProvider } from "@/types/player";

interface PlayerFrameProps {
  provider: PlayerProvider;
  mediaTitle: string;
  mediaType: "movie" | "tv";
  tmdbId: string;
  season?: number;
  episode?: number;
  iframeUrl: string | null;
  poster?: string;
  isAllUnavailable?: boolean;
  onProviderFailure: (providerId: string) => void;
  onManualRetry?: () => void;
  onNextServer?: () => void;
  onRestartAll?: () => void;
}

export function PlayerFrame({
  provider,
  mediaTitle,
  mediaType,
  tmdbId,
  season = 1,
  episode = 1,
  iframeUrl,
  poster,
  isAllUnavailable = false,
  onProviderFailure,
  onManualRetry,
  onNextServer,
  onRestartAll
}: PlayerFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Telegram stream state
  const [telegramStreamUrl, setTelegramStreamUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const failureHandledRef = useRef(false);

  // Trigger provider failure and notify parent fallback coordinator
  const reportFailure = useCallback(
    (reason?: string) => {
      if (failureHandledRef.current) return;
      failureHandledRef.current = true;
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(reason || `${provider.name} is currently unavailable.`);
      onProviderFailure(provider.id);
    },
    [onProviderFailure, provider.id, provider.name]
  );

  // Reset state whenever the active provider or media item changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);
    setTelegramStreamUrl(null);
    failureHandledRef.current = false;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isAllUnavailable) {
      setIsLoading(false);
      return;
    }

    // 1. Handle Telegram Server (Server 11)
    if (provider.type === "telegram") {
      let isCancelled = false;
      const fetchTelegramMedia = async () => {
        try {
          const query = new URLSearchParams({
            tmdbId,
            type: mediaType,
            ...(mediaType === "tv" ? { season: String(season), episode: String(episode) } : {})
          });

          const res = await fetch(`/api/telegram/media?${query.toString()}`);
          if (!res.ok) {
            throw new Error("Telegram service error");
          }
          const data = await res.json();

          if (isCancelled) return;

          if (data.available && data.media?.streamUrl) {
            setTelegramStreamUrl(data.media.streamUrl);
            setIsLoading(false);
          } else {
            reportFailure("No authorized Telegram content mapped for this title.");
          }
        } catch {
          if (!isCancelled) {
            reportFailure("Could not connect to Telegram channel gateway.");
          }
        }
      };

      fetchTelegramMedia();
      return () => {
        isCancelled = true;
      };
    }

    // 2. Handle Iframe Servers (Servers 1 to 10)
    if (!iframeUrl) {
      reportFailure(`${provider.name} has no URL configured.`);
      return;
    }

    // If it is an unconfigured placeholder (.example domain), quickly advance
    if (iframeUrl.includes(".example")) {
      timerRef.current = setTimeout(() => {
        reportFailure(`${provider.name} is a placeholder and has no active authorized feed.`);
      }, 500);
      return;
    }

    // Set load timeout for live iframe embeds (e.g. 7 seconds)
    // If the iframe fails to fire load or gets stuck, automatically failover
    timerRef.current = setTimeout(() => {
      reportFailure(`Connection to ${provider.name} timed out.`);
    }, 7500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    provider.id,
    provider.type,
    provider.name,
    iframeUrl,
    tmdbId,
    mediaType,
    season,
    episode,
    isAllUnavailable,
    reportFailure
  ]);

  const handleIframeLoad = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleIframeError = () => {
    reportFailure(`Failed to load player from ${provider.name}.`);
  };

  // Case 1: All 11 Servers Exhausted -> Final Clean "Video currently unavailable" state
  if (isAllUnavailable) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 mb-4 shadow-inner">
          <AlertCircle size={32} />
        </div>

        {/* Clean user-facing requirement message */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Video currently unavailable
        </h3>

        <p className="mt-2.5 max-w-md text-xs sm:text-sm text-white/50 leading-relaxed">
          None of the 11 authorized streaming servers could provide a working stream for this title.
          Please try again shortly or select an alternate server manually.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRestartAll && (
            <button
              onClick={onRestartAll}
              className="flex items-center gap-2 rounded-xl bg-cinema px-5 py-2.5 text-xs font-black text-black shadow-lg shadow-cinema/20 hover:bg-cinema-light transition active:scale-95"
            >
              <RotateCcw size={14} />
              <span>Retry from Server 1</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group/player relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-black shadow-2xl">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md transition-opacity">
          <Loader2 size={38} className="animate-spin text-cinema" />
          <div className="mt-3.5 text-center">
            <p className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Connecting to {provider.name}...
            </p>
            <p className="mt-1 text-[11px] text-white/40">
              Verifying authorized playback stream
            </p>
          </div>
        </div>
      )}

      {/* Provider Error / Unavailable State Overlay */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#121212]/95 backdrop-blur-md p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 mb-3">
            <ShieldAlert size={28} />
          </div>

          <h4 className="text-base sm:text-lg font-bold text-white">
            {provider.name} Unavailable
          </h4>

          <p className="mt-1.5 max-w-sm text-xs text-white/60 leading-relaxed">
            {errorMessage || "The requested authorized stream could not be loaded."}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {onNextServer && (
              <button
                onClick={onNextServer}
                className="flex items-center gap-2 rounded-xl bg-cinema px-4 py-2 text-xs font-black text-black hover:bg-cinema-light shadow-lg shadow-cinema/20 transition active:scale-95"
              >
                <span>Try Next Server</span>
                <ChevronRight size={14} />
              </button>
            )}

            {onManualRetry && (
              <button
                onClick={onManualRetry}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition active:scale-95"
              >
                <RotateCcw size={13} />
                <span>Retry Server</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Playback Content Container */}
      {provider.type === "telegram" ? (
        telegramStreamUrl ? (
          <video
            key={telegramStreamUrl}
            src={telegramStreamUrl}
            controls
            autoPlay
            playsInline
            poster={poster}
            onLoadedData={() => setIsLoading(false)}
            onError={() => reportFailure("Telegram stream playback error")}
            className="h-full w-full object-contain bg-black"
          >
            Your browser does not support HTML5 video playback.
          </video>
        ) : null
      ) : iframeUrl ? (
        <iframe
          key={iframeUrl}
          src={iframeUrl}
          title={mediaTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          className="h-full w-full border-0 bg-black"
        />
      ) : null}
    </div>
  );
}
