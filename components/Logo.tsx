import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  linkHref?: string;
  markOnly?: boolean;
}

export function LogoIcon({
  className = "h-9 w-9",
  size = 36
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-none select-none drop-shadow-[0_2px_10px_rgba(229,9,20,0.3)] ${className}`}
      aria-label="Doomsplay brand mark"
    >
      <defs>
        {/* Crisp White to Cool Platinum Gradient */}
        <linearGradient id="d-white-facets" x1="6" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#F4F4F5" />
          <stop offset="100%" stopColor="#D4D4D8" />
        </linearGradient>

        {/* Dynamic Crimson to Ruby Red Slash Gradient */}
        <linearGradient id="d-red-slash" x1="16" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF334B" />
          <stop offset="45%" stopColor="#E50914" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* Metallic Bevel Shadow */}
        <linearGradient id="d-bevel-shade" x1="8" y1="8" x2="28" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#71717A" stopOpacity="0.4" />
        </linearGradient>

        {/* Subtle Glow Filter */}
        <filter id="d-red-glow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Angular 'D' Spine & Outer Geometry */}
      <g>
        {/* Left Vertical Spine - Sharp Angular Pillar */}
        <path
          d="M8 6L19 6L14.5 42L8 42C6.89543 42 6 41.1046 6 40L6 8C6 6.89543 6.89543 6 8 6Z"
          fill="url(#d-white-facets)"
        />

        {/* Top-Right Sweeping Upper Facet of D */}
        <path
          d="M17 6L32 6C38.6274 6 44 11.3726 44 18C44 21.6 42.4 24.8 39.8 27L31.5 16L31 14C31 12.8954 30.1046 12 29 12L17.8 12L17 6Z"
          fill="url(#d-white-facets)"
        />

        {/* Dynamic Angular Crimson Slash Cutting Across the D */}
        <path
          d="M21 9L43.5 35L35 42L14 16L21 9Z"
          fill="url(#d-red-slash)"
          className="transition-transform duration-300"
        />

        {/* Bottom Angular Return Arch of D */}
        <path
          d="M13 36L27 36C32 36 36.5 33 39 29L33.5 22.5C31.5 25.5 28 27.5 24 27.5L14 27.5L13 36Z"
          fill="url(#d-white-facets)"
        />

        {/* Inner Geometric Negative Space & Bevel Highlight */}
        <path
          d="M18 14.5L27.5 14.5C31 14.5 34 17 34.8 20.5L25 32L17 32L18 14.5Z"
          fill="#060608"
          opacity="0.95"
        />

        {/* Front Sharp Red Blade Arrow Tip */}
        <path
          d="M30 18L42 32.5L37.5 37.5L25.5 23L30 18Z"
          fill="url(#d-red-slash)"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

export function Logo({
  size = "md",
  showText = true,
  className = "",
  linkHref = "/",
  markOnly = false
}: LogoProps) {
  const sizeConfig = {
    sm: {
      iconSize: 28,
      iconClass: "h-7 w-7",
      textSize: "text-base sm:text-lg",
      gap: "gap-2"
    },
    md: {
      iconSize: 34,
      iconClass: "h-8 w-8 sm:h-9 sm:w-9",
      textSize: "text-lg sm:text-xl",
      gap: "gap-2 sm:gap-2.5"
    },
    lg: {
      iconSize: 42,
      iconClass: "h-10 w-10 sm:h-11 sm:w-11",
      textSize: "text-2xl sm:text-3xl",
      gap: "gap-3"
    },
    xl: {
      iconSize: 52,
      iconClass: "h-12 w-12 sm:h-14 sm:w-14",
      textSize: "text-3xl sm:text-4xl",
      gap: "gap-3.5"
    }
  };

  const config = sizeConfig[size];

  const content = (
    <div
      className={`inline-flex items-center ${config.gap} transition duration-200 hover:opacity-95 active:scale-[0.98] ${className}`}
    >
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <LogoIcon className={config.iconClass} size={config.iconSize} />
      </div>

      {!markOnly && showText && (
        <span
          className={`font-black tracking-tight text-white leading-none ${config.textSize}`}
        >
          DOOMS<span className="text-white/90">PLAY</span>
        </span>
      )}
    </div>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
