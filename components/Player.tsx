"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";

interface PlayerProps {
  url: string | null;
  title: string;
  isDirectVideo?: boolean;
  poster?: string;
  providerName?: string;
  onRetry?: () => void;
}

export function Player({
  url,
  title,
  isDirectVideo = false,
  poster,
  providerName = "Player",
  onRetry
}: PlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset states when the player URL or provider changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [url]);

  // Clean "Player Unavailable" state if URL is missing or empty
  if (!url) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121212] p-6 flex flex-col items-center justify-center text-center shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-white">Player Unavailable</h3>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-white/50 leading-relaxed">
          The selected provider (<strong>{providerName}</strong>) is currently not configured or has no active URL template.
          Please choose an alternate provider from the switcher above.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 flex items-center gap-2 rounded-xl bg-cinema px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cinema/30 hover:bg-cinema/90 transition"
          >
            <RotateCcw size={14} />
            <span>Switch to Default Provider</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="group/player relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-black shadow-2xl">
      {/* Loading Spinner Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
          <Loader2 size={38} className="animate-spin text-cinema" />
          <p className="mt-3 text-xs font-semibold text-white/70 tracking-wide">
            Connecting to {providerName}...
          </p>
        </div>
      )}

      {/* Error state if stream fails */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#121212] p-6 text-center">
          <AlertCircle size={36} className="text-red-400 mb-3" />
          <p className="text-base font-bold text-white">Playback Error</p>
          <p className="mt-1 text-xs text-white/50 max-w-sm">
            Could not load video from {providerName}. Please check your connection or switch to another player.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
            >
              Retry Player
            </button>
          )}
        </div>
      )}

      {/* Direct Video Player or Iframe Embed Player */}
      {isDirectVideo ? (
        <video
          key={url}
          controls
          autoPlay
          playsInline
          poster={poster}
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="h-full w-full object-contain bg-black"
          src={url}
        >
          Your browser does not support HTML5 video playback.
        </video>
      ) : (
        <iframe
          key={url}
          src={url}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="h-full w-full border-0 bg-black"
        />
      )}
    </div>
  );
}
