"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronRightIcon } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Media } from "@/types/media";
import { MediaCard } from "./MediaCard";

interface SectionProps {
  title: string;
  items: Media[];
  horizontal?: boolean;
  seeAllHref?: string;
}

export function Section({
  title,
  items,
  horizontal = true,
  seeAllHref = "/new-popular"
}: SectionProps) {
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

  return (
    <section className="relative w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-14 2xl:px-16 mb-8 sm:mb-10 md:mb-12 group/section select-none">
      {/* Header matching Reference */}
      <div className="mb-3.5 flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="group/link flex items-center gap-1 text-xs sm:text-sm font-bold text-white/50 transition-colors hover:text-white"
          >
            <span>See all</span>
            <ChevronRightIcon
              size={15}
              className="transition-transform duration-200 group-hover/link:translate-x-0.5"
            />
          </Link>
        )}
      </div>

      {horizontal ? (
        <div className="relative">
          {/* Left Arrow (Desktop) */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label={`Scroll ${title} left`}
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-black"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Carousel container */}
          <div
            ref={scrollRef}
            className="no-scrollbar flex gap-3 sm:gap-4 lg:gap-4.5 xl:gap-5 overflow-x-auto scroll-smooth pb-3 px-1"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="w-[135px] sm:w-[165px] md:w-[190px] lg:w-[215px] xl:w-[235px] 2xl:w-[250px] flex-none"
              >
                <MediaCard item={item} />
              </div>
            ))}
            <div className="w-2 sm:w-4 flex-none" />
          </div>

          {/* Right Arrow (Desktop) */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label={`Scroll ${title} right`}
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-black/85 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-black"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      ) : (
        /* Vertical Grid view */
        <div className="grid grid-cols-2 gap-3 sm:gap-4.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
