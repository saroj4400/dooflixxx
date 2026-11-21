"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight, Volume2, VolumeX, AlertCircle } from "lucide-react";

export interface AdPlayerProps {
  adVideoUrl: string;
  duration?: number;
  skipEnabled?: boolean;
  skipAfterSeconds?: number;
  onComplete: () => void;
  title?: string;
}

/**
 * CineMate Safe Internal Advertisement Player
 *
 * Plays configured authorized advertisements strictly inside CineMate's responsive player area.
 * Guaranteed zero popups, zero redirects, and zero external navigation.
 */
export function AdPlayer({
  adVideoUrl,
  duration = 10,
  skipEnabled = true,
  skipAfterSeconds = 5,
  onComplete,
  title
}: AdPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Safe fallback if URL is empty
  useEffect(() => {
    if (!adVideoUrl) {
      console.warn("[CineMate AdPlayer] Ad video URL missing. Skipping ad.");
      onComplete();
    }
  }, [adVideoUrl, onComplete]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (next >= duration) {
          clearInterval(timer);
          onComplete();
          return duration;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  const canSkip = skipEnabled && secondsElapsed >= skipAfterSeconds;
  const skipCountdown = Math.max(0, skipAfterSeconds - secondsElapsed);
  const totalRemaining = Math.max(0, duration - secondsElapsed);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoError = () => {
    console.warn("[CineMate AdPlayer] Ad video failed to load. Continuing to main content.");
    setHasError(true);
    // Gracefully proceed to main video after brief moment
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  if (hasError) {
    return (
      <div className="relative h-full min-h-full w-full overflow-hidden rounded-none border-0 bg-black flex flex-col items-center justify-center text-center p-6 shadow-2xl">
        <AlertCircle size={28} className="text-white/40 mb-2" />
        <p className="text-xs text-white/50">Starting playback...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-full w-full overflow-hidden rounded-none border-0 bg-black shadow-none group select-none">
      {/* HTML5 Ad Video Element */}
      <video
        ref={videoRef}
        src={adVideoUrl}
        autoPlay
        playsInline
        muted={isMuted}
        onEnded={onComplete}
        onError={handleVideoError}
        className="h-full w-full object-contain bg-black"
      />

      {/* Top Ad Information Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <span className="rounded bg-yellow-500/90 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md">
          Ad
        </span>
        <span className="rounded bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white/90 border border-white/10">
          Video starts in {totalRemaining}s
        </span>
      </div>

      {/* Mute / Unmute Control */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleMute}
          className="flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-md p-2 text-white border border-white/15 hover:bg-black/80 transition active:scale-95"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Bottom Ad Action Overlay */}
      <div className="absolute bottom-4 right-4 z-20">
        {skipEnabled && (
          canSkip ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 rounded-xl bg-white/95 px-4 py-2 text-xs font-black text-black shadow-xl hover:bg-white active:scale-95 transition"
            >
              <span>Skip Ad</span>
              <ChevronRight size={15} />
            </button>
          ) : (
            <div className="rounded-xl bg-black/70 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white/75 border border-white/15">
              Skip in {skipCountdown}s
            </div>
          )
        )}
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div
          className="h-full bg-yellow-400 transition-all duration-1000 ease-linear"
          style={{ width: `${(secondsElapsed / duration) * 100}%` }}
        />
      </div>
    </div>
  );
}
