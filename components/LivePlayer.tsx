"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  AlertCircle,
  Settings,
  Check,
  SkipForward
} from "lucide-react";
import { LiveChannel } from "@/types/livetv";

interface LivePlayerProps {
  channel: LiveChannel;
  allChannels?: LiveChannel[];
  hasUserStartedPlayback: boolean;
  onStartPlayback: () => void;
  onNextChannel?: () => void;
}

export function LivePlayer({
  channel,
  hasUserStartedPlayback,
  onStartPlayback,
  onNextChannel
}: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingProxy, setUsingProxy] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [levels, setLevels] = useState<{ id: number; height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);

  // Stream loader
  const loadStream = useCallback(
    (targetUrl: string, isProxy = false) => {
      const video = videoRef.current;
      if (!video) return;

      setIsLoading(true);
      setError(null);
      setLevels([]);
      setCurrentLevel(-1);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const streamSrc = isProxy
        ? `/api/live-tv/proxy?url=${encodeURIComponent(targetUrl)}`
        : targetUrl;

      const canNativeHls =
        video.canPlayType("application/vnd.apple.mpegurl") ||
        video.canPlayType("application/x-mpegURL");

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingTimeOut: 15000,
          manifestLoadingMaxRetry: 2
        });

        hlsRef.current = hls;
        hls.loadSource(streamSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setIsLoading(false);
          setError(null);

          if (data.levels && data.levels.length > 0) {
            setLevels(
              data.levels.map((lvl, index) => ({
                id: index,
                height: lvl.height || 0,
                bitrate: lvl.bitrate || 0
              }))
            );
          }

          if (hasUserStartedPlayback) {
            video.play().then(() => setIsPlaying(true)).catch((e) => {
              console.log("[LivePlayer] Play gesture needed:", e);
              setIsPlaying(false);
            });
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          if (hls.autoLevelEnabled) {
            setCurrentLevel(-1);
          } else {
            setCurrentLevel(data.level);
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (!isProxy) {
                  setUsingProxy(true);
                  loadStream(targetUrl, true);
                } else {
                  setError("Network error: Stream currently unavailable.");
                  setIsLoading(false);
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                if (!isProxy) {
                  setUsingProxy(true);
                  loadStream(targetUrl, true);
                } else {
                  setError("Stream playback failed. Try another channel.");
                  setIsLoading(false);
                }
                break;
            }
          }
        });
      } else if (canNativeHls) {
        video.src = streamSrc;
        video.load();

        const handleLoaded = () => {
          setIsLoading(false);
          setError(null);
          if (hasUserStartedPlayback) {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        };

        const handleNativeError = () => {
          if (!isProxy) {
            setUsingProxy(true);
            loadStream(targetUrl, true);
          } else {
            setError("Stream error. Codec or network unsupported.");
            setIsLoading(false);
          }
        };

        video.addEventListener("loadedmetadata", handleLoaded, { once: true });
        video.addEventListener("error", handleNativeError, { once: true });
      } else {
        setError("HLS playback is not supported on this browser.");
        setIsLoading(false);
      }
    },
    [hasUserStartedPlayback]
  );

  // Load stream when channel changes or when user starts playback
  useEffect(() => {
    if (hasUserStartedPlayback && channel.streamUrl) {
      setUsingProxy(false);
      loadStream(channel.streamUrl, false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, channel.streamUrl, hasUserStartedPlayback, loadStream]);

  const handleStartPlay = () => {
    onStartPlayback();
    const video = videoRef.current;
    if (video) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasUserStartedPlayback) {
      handleStartPlay();
      return;
    }

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    setVolume(newVolume);
    video.volume = newVolume;
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.5);
        video.volume = 0.5;
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleSelectLevel = (levelIndex: number) => {
    if (!hlsRef.current) return;
    if (levelIndex === -1) {
      hlsRef.current.currentLevel = -1;
      setCurrentLevel(-1);
    } else {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    }
    setShowQualityMenu(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowQualityMenu(false);
      }
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-black shadow-2xl select-none"
    >
      <video
        ref={videoRef}
        playsInline
        onClick={handlePlayPause}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        className="h-full w-full object-contain cursor-pointer"
      />

      {/* Big Centered Play Button Overlay before first user interaction */}
      {!hasUserStartedPlayback && (
        <div
          onClick={handleStartPlay}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[2px] z-30 cursor-pointer transition-all hover:bg-black/60"
        >
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-cinema text-black shadow-[0_0_30px_rgba(245,197,24,0.6)] transition-transform duration-300 hover:scale-110 active:scale-95">
            <Play size={32} fill="currentColor" className="ml-1 text-black" />
          </div>
          <p className="mt-4 text-sm sm:text-base font-black uppercase tracking-wider text-white">
            Tap to Watch {channel.name}
          </p>
          <span className="mt-1 text-xs text-white/50">Live stream ready</span>
        </div>
      )}

      {/* Top Bar Header inside video */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            LIVE
          </span>
          <span className="truncate text-xs sm:text-sm font-bold text-white shadow-sm">
            {channel.name}
          </span>
        </div>

        {usingProxy && (
          <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-300">
            Proxy
          </span>
        )}
      </div>

      {/* Loading Spinner */}
      {isLoading && !error && hasUserStartedPlayback && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-10 pointer-events-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-cinema shadow-2xl">
            <RefreshCw size={24} className="animate-spin" />
          </div>
          <p className="mt-2 text-xs font-semibold text-white/80">Connecting stream...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
            <AlertCircle size={26} />
          </div>
          <h4 className="text-sm font-bold text-white">Stream Unavailable</h4>
          <p className="mt-1 max-w-xs text-xs text-white/60">{error}</p>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => loadStream(channel.streamUrl, !usingProxy)}
              className="flex items-center gap-1.5 rounded-xl bg-cinema px-3.5 py-1.5 text-xs font-bold text-black shadow-md hover:bg-yellow-400 transition"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
            {onNextChannel && (
              <button
                onClick={onNextChannel}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <SkipForward size={13} />
                <span>Next Channel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      {hasUserStartedPlayback && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between p-2.5 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Left Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-cinema text-black transition hover:scale-105 active:scale-95 shadow-md"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="text-white/80 hover:text-white transition p-1"
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="h-1.5 w-14 sm:w-18 accent-cinema cursor-pointer rounded-lg bg-white/20"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            {/* Quality switcher */}
            {levels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  aria-label="Quality settings"
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-white/80 hover:border-white/30 hover:text-white transition"
                >
                  <Settings size={12} />
                  <span>
                    {currentLevel === -1
                      ? "Auto"
                      : `${levels[currentLevel]?.height || "HQ"}p`}
                  </span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-28 overflow-hidden rounded-xl border border-white/10 bg-[#141414] p-1 shadow-2xl backdrop-blur-xl z-30">
                    <button
                      onClick={() => handleSelectLevel(-1)}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-bold transition ${
                        currentLevel === -1 ? "bg-cinema text-black" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span>Auto</span>
                      {currentLevel === -1 && <Check size={12} />}
                    </button>
                    {levels.map((lvl) => (
                      <button
                        key={lvl.id}
                        onClick={() => handleSelectLevel(lvl.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-bold transition ${
                          currentLevel === lvl.id ? "bg-cinema text-black" : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <span>{lvl.height ? `${lvl.height}p` : `Stream ${lvl.id + 1}`}</span>
                        {currentLevel === lvl.id && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reload stream */}
            <button
              onClick={() => loadStream(channel.streamUrl, usingProxy)}
              aria-label="Reload stream"
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <RefreshCw size={15} />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
