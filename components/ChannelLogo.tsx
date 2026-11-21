"use client";

import { useState, useEffect } from "react";
import { Tv } from "lucide-react";

interface ChannelLogoProps {
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
  fallbackSize?: "xs" | "sm" | "md" | "lg";
}

export function ChannelLogo({
  src,
  alt,
  name,
  className = "h-full w-full object-contain p-1",
  fallbackSize = "md"
}: ChannelLogoProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = name
    ? name
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || name.substring(0, 2).toUpperCase()
    : "TV";

  if (hasError || !src) {
    if (fallbackSize === "xs" || fallbackSize === "sm") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2a2a] via-[#1e1e1e] to-[#121212] text-center select-none font-black text-cinema text-[11px] tracking-wider rounded-xl">
          {initials}
        </div>
      );
    }

    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#2a2a2a] via-[#1e1e1e] to-[#121212] text-center select-none p-1 rounded-xl">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-cinema mb-0.5">
          <Tv size={16} />
        </div>
        <span className="font-black uppercase tracking-wider text-white/90 text-[10px]">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name || "Channel"}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
