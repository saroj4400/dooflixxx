"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProviderItem {
  id: string;
  name: string;
  query: string;
  bgGradient: string;
  borderColor: string;
  logo: React.ReactNode;
}

const providers: ProviderItem[] = [
  {
    id: "netflix",
    name: "Netflix",
    query: "Netflix",
    bgGradient: "from-zinc-900 to-black",
    borderColor: "hover:border-red-600/60 hover:shadow-[0_0_24px_rgba(229,9,20,0.45)]",
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-9 lg:h-9 xl:w-11 xl:h-11 transition-transform group-hover:scale-105" fill="none">
        <path d="M12 6H17.5V34H12V6Z" fill="#E50914" />
        <path d="M22.5 6H28V34H22.5V6Z" fill="#E50914" />
        <path d="M12 6L28 34H22.5L12 15V6Z" fill="#B81D24" />
        <path d="M12 6L28 34H22.5L12 15.5V6Z" fill="#E50914" />
      </svg>
    )
  },
  {
    id: "prime",
    name: "Prime Video",
    query: "Prime",
    bgGradient: "from-[#00284d] to-[#00172e]",
    borderColor: "hover:border-sky-500/60 hover:shadow-[0_0_24px_rgba(0,168,225,0.45)]",
    logo: (
      <div className="flex flex-col items-center justify-center text-center transition-transform group-hover:scale-105">
        <span className="text-[15px] sm:text-[17px] lg:text-[15px] xl:text-[18px] font-black tracking-tight text-white leading-none">
          prime
        </span>
        <span className="text-[9.5px] sm:text-[11px] lg:text-[9.5px] xl:text-[11.5px] font-bold text-[#00A8E1] tracking-wider -mt-0.5">
          video
        </span>
        <svg viewBox="0 0 32 8" className="w-6 sm:w-7 xl:w-8 h-2 -mt-0.5 text-[#00A8E1]" fill="currentColor">
          <path d="M0 4 C 10 9, 22 9, 32 3 C 28 6, 20 8, 0 4 Z" />
        </svg>
      </div>
    )
  },
  {
    id: "disney",
    name: "Disney+",
    query: "Disney",
    bgGradient: "from-[#0d1b3e] to-[#050b1a]",
    borderColor: "hover:border-blue-400/60 hover:shadow-[0_0_24px_rgba(59,130,246,0.45)]",
    logo: (
      <div className="flex items-center justify-center font-serif transition-transform group-hover:scale-105">
        <span className="text-[17px] sm:text-[20px] lg:text-[18px] xl:text-[21px] font-black italic tracking-tighter text-white">
          Disney<span className="text-blue-400 not-italic text-sm sm:text-base xl:text-lg font-sans ml-0.5">+</span>
        </span>
      </div>
    )
  },
  {
    id: "apple",
    name: "Apple TV+",
    query: "Apple",
    bgGradient: "from-zinc-800 to-black",
    borderColor: "hover:border-zinc-400/60 hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]",
    logo: (
      <div className="flex items-center justify-center gap-1 transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 xl:w-6 xl:h-6 fill-current text-white">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.9.04-2 .6-2.65 1.36-.58.68-1.09 1.76-1.05 2.81 1 .08 2.06-.52 2.69-1.3" />
        </svg>
        <span className="text-[13px] sm:text-[15px] lg:text-[13.5px] xl:text-[16px] font-bold text-white">tv+</span>
      </div>
    )
  },
  {
    id: "applestore",
    name: "Apple TV",
    query: "Apple",
    bgGradient: "from-zinc-800 to-black",
    borderColor: "hover:border-zinc-400/60 hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]",
    logo: (
      <div className="flex items-center justify-center gap-1 transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 xl:w-6 xl:h-6 fill-current text-white">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.9.04-2 .6-2.65 1.36-.58.68-1.09 1.76-1.05 2.81 1 .08 2.06-.52 2.69-1.3" />
        </svg>
        <span className="text-[13px] sm:text-[15px] lg:text-[13.5px] xl:text-[16px] font-bold text-white">tv</span>
      </div>
    )
  },
  {
    id: "hulu",
    name: "Hulu",
    query: "Hulu",
    bgGradient: "from-[#082a1a] to-[#02130b]",
    borderColor: "hover:border-emerald-500/60 hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]",
    logo: (
      <span className="text-[20px] sm:text-[24px] lg:text-[22px] xl:text-[26px] font-black tracking-tighter text-[#1CE783] transition-transform group-hover:scale-105">
        hulu
      </span>
    )
  },
  {
    id: "hbo",
    name: "HBO Max",
    query: "HBO",
    bgGradient: "from-[#2b085c] to-[#12002b]",
    borderColor: "hover:border-purple-500/60 hover:shadow-[0_0_24px_rgba(168,85,247,0.45)]",
    logo: (
      <div className="flex flex-col items-center transition-transform group-hover:scale-105">
        <span className="text-[16px] sm:text-[19px] lg:text-[17px] xl:text-[20px] font-black tracking-widest text-white leading-none">
          HBO
        </span>
        <span className="text-[8.5px] sm:text-[9.5px] lg:text-[9px] xl:text-[10.5px] font-extrabold tracking-widest text-purple-300">
          MAX
        </span>
      </div>
    )
  },
  {
    id: "paramount",
    name: "Paramount+",
    query: "Paramount",
    bgGradient: "from-[#0064d2] to-[#003882]",
    borderColor: "hover:border-blue-400/60 hover:shadow-[0_0_24px_rgba(0,100,210,0.5)]",
    logo: (
      <div className="flex flex-col items-center text-center transition-transform group-hover:scale-105">
        <svg viewBox="0 0 32 16" className="w-8 h-4 sm:w-9 sm:h-4.5 lg:w-8 lg:h-4 xl:w-10 xl:h-5 text-white fill-current">
          <path d="M16 2 L22 14 L10 14 Z" opacity="0.85" />
          <path d="M16 5 L20 14 L12 14 Z" opacity="0.4" />
        </svg>
        <span className="text-[9.5px] sm:text-[11px] lg:text-[10px] xl:text-[12px] font-black tracking-tight text-white uppercase leading-none mt-0.5">
          Paramount<span className="text-sky-300 text-[11px] sm:text-[12px] lg:text-[11px] xl:text-[13px]">+</span>
        </span>
      </div>
    )
  },
  {
    id: "peacock",
    name: "Peacock",
    query: "Peacock",
    bgGradient: "from-zinc-900 to-black",
    borderColor: "hover:border-amber-500/60 hover:shadow-[0_0_24px_rgba(245,158,11,0.45)]",
    logo: (
      <div className="flex flex-col items-center justify-center transition-transform group-hover:scale-105">
        <div className="flex gap-0.5 sm:gap-1 mb-0.5">
          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-yellow-400" />
          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" />
          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500" />
          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-500" />
        </div>
        <span className="text-[10.5px] sm:text-[12px] lg:text-[11px] xl:text-[13px] font-black text-white leading-none">peacock</span>
      </div>
    )
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    query: "Anime",
    bgGradient: "from-[#FF6B00] to-[#E05000]",
    borderColor: "hover:border-orange-400/60 hover:shadow-[0_0_24px_rgba(255,107,0,0.55)]",
    logo: (
      <div className="flex items-center justify-center transition-transform group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white fill-current">
          <circle cx="16" cy="16" r="14" fill="white" />
          <circle cx="17.5" cy="16" r="10.5" fill="#E05000" />
          <circle cx="19.5" cy="16" r="7.5" fill="white" />
          <circle cx="21" cy="16" r="5" fill="#E05000" />
        </svg>
      </div>
    )
  },
  {
    id: "starz",
    name: "Starz",
    query: "Starz",
    bgGradient: "from-zinc-900 to-black",
    borderColor: "hover:border-zinc-400/60 hover:shadow-[0_0_24px_rgba(255,255,255,0.3)]",
    logo: (
      <span className="text-[14px] sm:text-[17px] lg:text-[15px] xl:text-[18px] font-black tracking-widest text-white uppercase transition-transform group-hover:scale-105">
        STARZ
      </span>
    )
  },
  {
    id: "amc",
    name: "AMC+",
    query: "AMC",
    bgGradient: "from-[#002b2b] to-black",
    borderColor: "hover:border-teal-500/60 hover:shadow-[0_0_24px_rgba(20,184,166,0.45)]",
    logo: (
      <div className="flex flex-col items-center transition-transform group-hover:scale-105">
        <div className="rounded border border-teal-400/70 px-1.5 py-0.5 text-center">
          <span className="text-[11.5px] sm:text-[13px] lg:text-[12px] xl:text-[14px] font-black text-teal-300 tracking-tight">amc+</span>
        </div>
      </div>
    )
  }
];

export function ProviderSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <section className="relative w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-14 2xl:px-16 mt-0 mb-6 sm:mb-8 md:mb-10 group/providers select-none">
      {/* Header matching Reference */}
      <div className="mb-3 sm:mb-4 px-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white">
          Browse by Provider
        </h2>
      </div>

      <div className="relative">
        {/* Left Arrow Button (visible on touch / smaller viewports when scrollable) */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll providers left"
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex lg:hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white shadow-xl backdrop-blur-md transition hover:scale-110 hover:bg-black"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Providers Container: Full-width 12-column grid on desktop/laptop; smooth carousel on tablet/mobile */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex overflow-x-auto scroll-smooth gap-3 sm:gap-4 lg:grid lg:grid-cols-12 lg:overflow-visible lg:gap-2.5 xl:gap-3.5 2xl:gap-4 w-full py-1.5 px-0.5"
        >
          {providers.map((provider) => (
            <Link
              key={provider.id}
              href={`/provider/${provider.id}`}
              className="group flex flex-col items-center flex-none w-[76px] sm:w-[86px] md:w-[94px] lg:w-full transition-transform duration-200 hover:-translate-y-1 active:scale-95"
            >
              {/* Squircle Tile with Brand Gradient & Hover Glow */}
              <div
                className={`relative flex aspect-square w-full max-w-[80px] sm:max-w-[88px] lg:max-w-none items-center justify-center rounded-[18px] sm:rounded-[22px] lg:rounded-[20px] xl:rounded-[24px] border border-white/12 bg-gradient-to-br ${provider.bgGradient} p-2 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-white/25 ${provider.borderColor}`}
              >
                {provider.logo}
                <div className="absolute inset-0 rounded-[18px] sm:rounded-[22px] lg:rounded-[20px] xl:rounded-[24px] bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* Provider Title Below Tile */}
              <span className="mt-2 text-center text-[10.5px] sm:text-[11.5px] lg:text-[11px] xl:text-[12px] font-semibold text-white/75 group-hover:text-white transition-colors truncate w-full px-0.5">
                {provider.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Right Arrow Button (visible on tablet/mobile when scrollable) */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll providers right"
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex lg:hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white shadow-xl backdrop-blur-md transition hover:scale-110 hover:bg-black"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}
