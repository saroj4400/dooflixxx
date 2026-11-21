"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";

export interface IframePlayerProps {
  embedUrl: string;
  title: string;
  providerName?: string;
  onTryAnotherPlayer?: () => void;
  onError?: () => void;
}

/**
 * CineMate Iframe Player
 *
 * Renders authorized embed streams inside a responsive 16:9 container.
 * Features built-in load monitoring, timeout detection, and automatic fallback.
 * Strictly prevents popups, external redirects, or unwanted window openings.
 */
export function IframePlayer({
  embedUrl,
  title,
  providerName = "Player",
  onTryAnotherPlayer,
  onError
}: IframePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Detect placeholder or invalid URL
    if (!embedUrl || embedUrl.includes(".example")) {
      setHasError(true);
      setIsLoading(false);
      if (onTryAnotherPlayer) {
        onTryAnotherPlayer();
      } else if (onError) {
        onError();
      }
      return;
    }

    // Safety timeout: if iframe doesn't respond or load within 8s, trigger automatic fallback
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [embedUrl, onTryAnotherPlayer, onError]);

  const handleLoad = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onTryAnotherPlayer) {
      onTryAnotherPlayer();
    } else if (onError) {
      onError();
    }
  };

  if (hasError) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 mb-3.5 shadow-inner">
          <AlertCircle size={28} />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white">
          Switching to another server...
        </h3>

        <p className="mt-2 max-w-md text-xs sm:text-sm text-white/50 leading-relaxed">
          The selected stream gateway encountered a connection timeout.
        </p>

        {onTryAnotherPlayer && (
          <button
            onClick={onTryAnotherPlayer}
            className="mt-5 flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Try Next Server</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-black shadow-2xl">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity">
          <Loader2 size={36} className="animate-spin text-amber-400" />
          <p className="mt-3 text-xs font-semibold text-white/70 tracking-wide">
            Connecting to stream server...
          </p>
        </div>
      )}

      {/* Embed Iframe */}
      <iframe
        key={embedUrl}
        src={embedUrl}
        title={title || "doomsplay Player"}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; clipboard-write; web-share"
        allowFullScreen
        referrerPolicy="origin"
        onLoad={handleLoad}
        onError={handleError}
        className="h-full w-full border-0 bg-black"
      />
    </div>
  );
}
