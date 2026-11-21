"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Film } from "lucide-react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackTitle,
  fallbackSubtitle,
  className,
  ...rest
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#262626] via-[#171717] to-[#0e0e0e] p-4 text-center select-none ${className || ""}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-cinema shadow-inner">
          <Film size={24} />
        </div>
        {fallbackTitle && (
          <p className="mt-2 line-clamp-2 text-xs font-bold text-white/90">
            {fallbackTitle}
          </p>
        )}
        {fallbackSubtitle && (
          <p className="mt-0.5 text-[10px] text-white/50">{fallbackSubtitle}</p>
        )}
        <span className="mt-2 text-[9px] font-black uppercase tracking-widest text-white/25">
          doomsplay
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || fallbackTitle || "Media"}
      className={className}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}
