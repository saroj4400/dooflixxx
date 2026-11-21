"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Info, Play, Plus, Star } from "lucide-react";
import type { Media } from "@/types/media";
import { ImageWithFallback } from "./ImageWithFallback";
import { useMyList } from "@/context/MyListContext";

export function Hero({ items }: { items: Media[] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const { isInList, toggleItem } = useMyList();

  const total = items.length;
  const currentItem = items[index] || items[0];

  const goToSlide = useCallback((nextIndex: number, smooth = true) => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const card = track.children.item(nextIndex + 1) as HTMLElement | null;
    if (!card) return;
    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    setIndex(nextIndex);
  }, []);

  const handleMobileScroll = useCallback(() => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child, childIndex) => {
      const element = child as HTMLElement;
      const childCenter = element.offsetLeft + element.clientWidth / 2;
      const distance = Math.abs(center - childCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = childIndex;
      }
    });
    const logicalIndex = nearestIndex === 0 ? total - 1 : nearestIndex - 1;
    setIndex((previous) => previous === logicalIndex ? previous : logicalIndex);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [total, isPaused]);

  useEffect(() => {
    goToSlide(index, true);
  }, [index, goToSlide]);

  if (!currentItem || total === 0) return null;

  const saved = isInList(currentItem.id);
  const detailsHref = currentItem.type === "tv" ? `/tv/${currentItem.id}` : `/movie/${currentItem.id}`;
  const playHref = currentItem.type === "tv"
    ? `/watch/${currentItem.id}?type=tv&season=1&episode=1`
    : `/watch/${currentItem.id}?type=movie`;
  const genre = currentItem.genres?.[0] || (currentItem.type === "tv" ? "TV" : "Action");

  const mobileSlides = total > 1
    ? [{ item: items[total - 1], key: `previous-${items[total - 1].id}` }, ...items.map((item) => ({ item, key: `slide-${item.id}` }))]
    : items.map((item) => ({ item, key: `slide-${item.id}` }));

  const Actions = ({ compact = false }: { compact?: boolean }) => (
    <div className={`hero-actions ${compact ? "hero-actions-mobile" : "hero-actions-desktop"}`}>
      <Link href={playHref} className="hero-play-button">
        <Play size={compact ? 19 : 17} fill="currentColor" />
        <span>Play</span>
      </Link>
      <div className="hero-secondary-actions">
        <button
          type="button"
          onClick={() => toggleItem(currentItem)}
          aria-label={saved ? "Remove from My List" : "Add to My List"}
        >
          {saved ? <Check size={compact ? 23 : 19} /> : <Plus size={compact ? 25 : 20} />}
        </button>
        <span aria-hidden="true" />
        <Link href={detailsHref} aria-label="More information">
          <Info size={compact ? 24 : 19} />
        </Link>
      </div>
    </div>
  );

  const Metadata = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`hero-metadata ${mobile ? "hero-metadata-mobile" : "hero-metadata-desktop"}`}>
      <span className="hero-rating"><Star size={mobile ? 17 : 14} fill="currentColor" /> {currentItem.rating}/10</span>
      <span className="hero-meta-separator">•</span>
      <span> {currentItem.year}</span>
      {mobile && <span className="hero-meta-separator">•</span>}
      <span className={mobile ? "hero-genre-mobile" : "hero-genre-desktop"}>{genre}</span>
    </div>
  );

  return (
    <>
      {/* MOBILE: centered portrait cards with neighboring previews */}
      <section
        className="hero-mobile-shell"
        aria-label="Featured movies and shows"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="hero-mobile-track" ref={mobileTrackRef} onScroll={handleMobileScroll}>
          {mobileSlides.map(({ item, key }, slideIndex) => {
            const itemSaved = isInList(item.id);
            const itemDetailsHref = item.type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
            const itemPlayHref = item.type === "tv"
              ? `/watch/${item.id}?type=tv&season=1&episode=1`
              : `/watch/${item.id}?type=movie`;
            const itemGenre = item.genres?.[0] || (item.type === "tv" ? "TV" : "Action");
            return (
              <article className="hero-mobile-card" key={key} aria-label={item.title}>
                <ImageWithFallback
                  src={item.poster || item.backdrop}
                  alt={item.title}
                  fallbackTitle={item.title}
                  fill
                  priority={slideIndex < 2}
                  sizes="(max-width: 767px) 85vw, 430px"
                  className="hero-mobile-poster"
                />
                <div className="hero-mobile-shade" />
                <div className="hero-mobile-copy">
                  <h1>{item.title}</h1>
                  <div className="hero-mobile-meta">
                    <span><Star size={16} fill="currentColor" /> {item.rating}/10</span>
                    <i>•</i>
                    <span className="hero-year">🗓️ {item.year}</span>
                  </div>
                  <div className="hero-mobile-genre">✨ {itemGenre}</div>
                  <p>{item.description}</p>
                  <div className="hero-actions hero-actions-mobile">
                    <Link href={itemPlayHref} className="hero-play-button">
                      <Play size={20} fill="currentColor" /> <span>Play</span>
                    </Link>
                    <div className="hero-secondary-actions">
                      <button
                        type="button"
                        onClick={() => toggleItem(item)}
                        aria-label={itemSaved ? "Remove from My List" : "Add to My List"}
                      >
                        {itemSaved ? <Check size={23} /> : <Plus size={25} />}
                      </button>
                      <span aria-hidden="true" />
                      <Link href={itemDetailsHref} aria-label="More information"><Info size={24} /></Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* DESKTOP: full-width cinematic banner, text left and artwork right */}
      <section
        className="hero-desktop-shell"
        aria-label="Featured cinematic title"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="hero-desktop-art" key={currentItem.id}>
          <ImageWithFallback
            src={currentItem.backdrop}
            alt={currentItem.title}
            fallbackTitle={currentItem.title}
            fill
            priority
            sizes="100vw"
            className="hero-desktop-image"
          />
        </div>
        <div className="hero-desktop-overlay" />
        <div className="hero-desktop-content" key={`content-${currentItem.id}`}>
          <h1>{currentItem.title}</h1>
          <Metadata />
          <p>{currentItem.description}</p>
          <Actions />
        </div>
        <div className="hero-desktop-dots" aria-label="Choose featured title">
          {items.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${item.title}`}
              aria-current={dotIndex === index ? "true" : undefined}
              className={dotIndex === index ? "is-active" : ""}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
