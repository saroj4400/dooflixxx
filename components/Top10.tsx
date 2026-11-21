"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Media } from "@/types/media";
import { ImageWithFallback } from "./ImageWithFallback";

export function Top10({ items, title }: { items: Media[]; title: string }) {
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
  }, [checkScroll, items]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  const topItems = items.slice(0, 10);

  return (
    <section className="relative w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-14 2xl:px-16 mb-8 sm:mb-10 md:mb-12 group/top10 select-none">
      <h2 className="mb-3.5 text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white px-1">
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll Top 10 left"
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-black"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Horizontal container matching Reference Screenshot 4 */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-2 sm:gap-4 lg:gap-6 overflow-x-auto scroll-smooth pb-4 px-1"
        >
          {topItems.map((item, i) => {
            const href = item.type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
            const rank = i + 1;

            return (
              <Link
                key={item.id}
                href={href}
                className="group relative flex flex-none items-end min-w-[155px] sm:min-w-[195px] md:min-w-[225px] lg:min-w-[250px] xl:min-w-[275px] 2xl:min-w-[295px] transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Outlined Stylized Rank Number (Reference 4) */}
                <span
                  className="select-none text-[100px] sm:text-[135px] md:text-[160px] lg:text-[185px] xl:text-[210px] 2xl:text-[230px] font-black leading-[0.72] tracking-tighter text-transparent [-webkit-text-stroke:3px_rgba(255,255,255,0.25)] group-hover:[-webkit-text-stroke:3px_#EF4444] transition-colors duration-300"
                >
                  {rank}
                </span>

                {/* Poster Overlap Container */}
                <div className="relative -ml-7 sm:-ml-10 md:-ml-12 lg:-ml-14 xl:-ml-16 aspect-[2/3] w-[110px] sm:w-[135px] md:w-[155px] lg:w-[175px] xl:w-[190px] 2xl:w-[205px] overflow-hidden rounded-[18px] sm:rounded-[22px] border border-white/10 bg-[#131318] shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-red-600/40 group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.85)]">
                  <ImageWithFallback
                    src={item.poster}
                    alt={item.title}
                    fallbackTitle={item.title}
                    fill
                    sizes="(max-width: 640px) 135px, (max-width: 1024px) 175px, 205px"
                    className="object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                  {/* Top 10 Red Badge (Reference 4) */}
                  <span className="absolute right-2 top-2 rounded-md bg-red-600 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black tracking-wider text-white shadow-[0_2px_8px_rgba(229,9,20,0.6)]">
                    TOP 10
                  </span>

                  {/* Hover Quick Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Rating */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Star size={11} fill="currentColor" />
                    <span>{item.rating}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          <div className="w-2 sm:w-4 flex-none" />
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll Top 10 right"
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-black"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>
    </section>
  );
}
