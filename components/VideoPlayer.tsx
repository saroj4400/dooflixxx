"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Loader2,
  AlertCircle
} from "lucide-react";
import { PlayerProvider } from "@/types/player";
import { IframePlayer } from "./IframePlayer";
import Hls from "hls.js";
import type { StreamSource } from "@/lib/streaming/types";

export function StreamingVideoPlayer({ source, title, poster }: { source: StreamSource; title: string; poster?: string }) {
  if (source.kind === "iframe") {
    if (!source.requiresProviderPlayer) {
      return <PlayerMessage message="This provider did not identify its iframe as an authorized provider-owned player." />;
    }
    return <iframe src={source.url} title={`${title} - ${source.providerName}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="aspect-video w-full rounded-xl border-0 bg-black" />;
  }
  return <StreamingVideoElement source={source} title={title} poster={poster} />;
}

function PlayerMessage({ message }: { message: string }) {
  return <div role="alert" className="flex aspect-video items-center justify-center rounded-xl bg-black p-6 text-center text-sm text-amber-200">{message}</div>;
}

function StreamingVideoElement({ source, title, poster }: { source: StreamSource; title: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "playing" | "ended">("loading");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let dashPlayer: { reset(): void; on?(event: string, callback: (event: unknown) => void): void } | null = null;
    let cancelled = false;
    setError("");
    setState("loading");

    if (source.kind === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setError(`HLS ${data.type} error. Check source availability, CORS, MIME type, and provider authorization.`);
            setState("ready");
          }
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => setState("ready"));
        hls.loadSource(source.url);
        hls.attachMedia(video);
        return () => hls.destroy();
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source.url;
        return () => { video.removeAttribute("src"); video.load(); };
      }
      setError("HLS is not supported by this browser.");
      setState("ready");
      return;
    }

    if (source.kind === "dash") {
      void import("dashjs").then(({ MediaPlayer }) => {
        if (cancelled) return;
        const player = MediaPlayer().create();
        dashPlayer = player;
        player.initialize(video, source.url, false);
        player.on(MediaPlayer.events.ERROR, (event: unknown) => {
          console.error("DASH playback error", event);
          setError("DASH playback failed. Check manifest/segment status, CORS, MIME types, and provider authorization.");
          setState("ready");
        });
        setState("ready");
      }).catch(() => {
        if (!cancelled) {
          setError("DASH playback support could not be loaded.");
          setState("ready");
        }
      });
      return () => {
        cancelled = true;
        dashPlayer?.reset();
      };
    }

    video.src = source.url;
    return () => { video.removeAttribute("src"); video.load(); };
  }, [source]);

  return (
    <div className="space-y-2">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={poster}
        src={source.kind === "mp4" || source.kind === "webm" ? source.url : undefined}
        data-stream-kind={source.kind}
        aria-label={`${title} — ${source.providerName}`}
        onLoadedMetadata={() => setState("ready")}
        onCanPlay={() => setState("ready")}
        onPlaying={() => setState("playing")}
        onEnded={() => setState("ended")}
        onError={() => {
          const code = videoRef.current?.error?.code;
          setError(code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
            ? "Unsupported media format or incorrect MIME type."
            : "Media request failed. Check HTTP status, redirects, CORS, and required authorization.");
          setState("ready");
        }}
        className="aspect-video w-full rounded-xl bg-black"
      >
        {source.subtitles?.map((track) => (
          <track key={`${track.language}:${track.url}`} kind="subtitles" src={track.url} srcLang={track.language} label={track.label} default={track.isDefault} />
        ))}
      </video>
      <p role="status" className="text-xs text-white/50">{state === "playing" ? "Browser playback started." : state === "ended" ? "Playback ended." : state === "loading" ? "Loading selected source…" : "Source ready. Press play to start."}</p>
      {error && <p role="alert" className="text-xs text-amber-300">{error}</p>}
      {source.quality && <p className="text-[11px] text-white/40">Quality: {source.quality}</p>}
    </div>
  );
}

export interface VideoPlayerProps {
  url?: string | null;
  provider: PlayerProvider;
  title: string;
  poster?: string;
  onTryAnotherPlayer?: () => void;
  onEnded?: () => void;
  onError?: (error?: string) => void;
}

/**
 * CineMate Master Video Player
 *
 * Routes playback smoothly between:
 * 1. Authorized Iframe Providers (via IframePlayer)
 * 2. Direct HTML5 Video Streams (with custom controls: play, pause, seek, volume, speed, fullscreen)
 */
export function VideoPlayer({
  url,
  provider,
  title,
  poster,
  onTryAnotherPlayer,
  onEnded,
  onError
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Missing URL error state - automatically trigger failover
  useEffect(() => {
    if (!url && onTryAnotherPlayer) {
      const timeout = setTimeout(() => {
        onTryAnotherPlayer();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [url, onTryAnotherPlayer]);

  // Keep hook ordering valid across direct-video and iframe provider renders.
  useEffect(() => {
    if (!url || provider.type === "iframe") return;
    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [url, provider.type]);

  if (!url) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xl">
        <Loader2 size={36} className="animate-spin text-amber-400 mb-3" />
        <h3 className="text-base sm:text-lg font-bold text-white">
          Switching to another server...
        </h3>
        <p className="mt-1 text-xs text-white/50">
          Connecting to next available authorized stream
        </p>
      </div>
    );
  }

  // If provider is an iframe embed, delegate to IframePlayer
  if (provider.type === "iframe") {
    return (
      <IframePlayer
        embedUrl={url}
        title={title}
        providerName={provider.name}
        onTryAnotherPlayer={onTryAnotherPlayer}
        onError={() => onError?.()}
      />
    );
  }

  // --- HTML5 Direct Video Stream Handler ---
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.5];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (hasError) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121212] p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 mb-3.5 shadow-inner">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Player source unavailable.
        </h3>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-white/50 leading-relaxed">
          Could not stream media from {provider.name}.
        </p>
        {onTryAnotherPlayer && (
          <button
            onClick={onTryAnotherPlayer}
            className="mt-5 flex items-center gap-2 rounded-xl bg-cinema px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cinema/30 hover:bg-cinema/90 transition active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Try Another Player</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-black shadow-2xl select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
          if (onError) onError();
        }}
        onClick={togglePlay}
        className="h-full w-full object-contain bg-black cursor-pointer"
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 pointer-events-none">
          <Loader2 size={38} className="animate-spin text-cinema" />
        </div>
      )}

      {/* Custom Video Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Seek Bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-cinema h-1 cursor-pointer mb-3.5 bg-white/20 rounded-lg"
        />

        <div className="flex items-center justify-between gap-3 text-white text-xs">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex items-center justify-center rounded-lg bg-white/10 p-2 hover:bg-white/20 transition active:scale-95"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
            </button>

            {/* Time Indicator */}
            <span className="font-mono text-xs text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={toggleMute}
                className="p-1.5 text-white/70 hover:text-white transition"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-cinema h-1 bg-white/20 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Speed Selector */}
            <button
              onClick={cycleSpeed}
              className="rounded bg-white/10 px-2 py-1 text-[11px] font-bold text-white/80 hover:bg-white/20 hover:text-white transition"
              title="Playback speed"
            >
              {playbackRate}x
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-white/70 hover:text-white transition active:scale-95"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
