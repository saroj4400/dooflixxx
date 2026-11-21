
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Film,
  Sparkles,
  RadioTower,
  MoreHorizontal,
  Settings,
  Tv,
  Bookmark,
  TrendingUp,
  Info,
  X,
} from "lucide-react";

const mainLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "Anime", href: "/anime", icon: Sparkles },
  { label: "Live TV", href: "/live-tv", icon: RadioTower },
];

const moreLinks = [
  { label: "TV Shows", href: "/tv", icon: Tv },
  { label: "My List", href: "/my-list", icon: Bookmark },
  { label: "New & Popular", href: "/new-popular", icon: TrendingUp },
  { label: "About", href: "/about", icon: Info },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreLinks.some(
    ({ href }) => pathname.startsWith(href)
  );

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {moreOpen && (
        <div
          className="nav-more-backdrop"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div className="nav-more-menu">
          <div className="nav-more-heading">
            <span>Explore Doomsplay</span>
            <button
              onClick={() => setMoreOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {moreLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-more-item ${pathname === href ? "active" : ""
                }`}
              onClick={() => setMoreOpen(false)}
            >
              <Icon size={21} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      )}

      <nav className="doomsplay-bottom-nav">
        {mainLinks.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`bottom-nav-item ${active ? "active" : ""
                }`}
            >
              <Icon size={25} strokeWidth={active ? 2.4 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}

        <button
          className={`bottom-nav-item ${moreOpen || moreActive ? "active" : ""
            }`}
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={27} />
          <span>More</span>
        </button>

        <Link
          href="/settings"
          className={`bottom-nav-item ${pathname.startsWith("/settings") ? "active" : ""
            }`}
        >
          <Settings size={25} />
          <span>Settings</span>
        </Link>
      </nav>
    </>
  );
}
export { MobileNav };