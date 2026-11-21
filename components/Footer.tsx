"use client";

import Link from "next/link";
import { Film, ShieldCheck, Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on watch/player page so the full viewing area is unobstructed
  if (pathname.startsWith("/watch/")) {
    return null;
  }

  const links = [
    { label: "Home", href: "/" },
    { label: "Movies", href: "/movies" },
    { label: "TV Shows", href: "/tv" },
    { label: "Live TV", href: "/live-tv" },
    { label: "Trending", href: "/new-popular" },
    { label: "My List", href: "/my-list" },
    { label: "Search", href: "/search" }
  ];

  const genres = [
    "Action",
    "Sci-Fi",
    "Drama",
    "Thriller",
    "Comedy",
    "Crime",
    "Adventure",
    "Romance"
  ];

  const quickLinks = [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" }
  ];

  return (
    <footer className="mt-16 border-t border-white/[0.08] bg-[#07070a] text-white/60 pb-28 sm:pb-32">
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-14 2xl:px-16 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand & Mission */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <Logo size="md" />
            <p className="text-xs leading-relaxed text-white/50">
              Your modern cinema and television discovery hub. Explore award-winning
              features, trending episodic series, Live TV channels, and curated watchlists on Doomsplay.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <ShieldCheck size={14} className="text-red-500" />
              <span>Premium Cinematic Streaming</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Genres */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Browse Genres
            </h4>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <Link
                  key={g}
                  href={`/search?genre=${encodeURIComponent(g)}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>

          {/* Architecture & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Architecture
            </h4>
            <p className="text-xs leading-relaxed text-white/50">
              Built with Next.js App Router, Tailwind CSS, TypeScript, and a decoupled TMDB and
              multi-player provider integration service.
            </p>
            <p className="text-[11px] leading-relaxed text-white/40">
              Stream movies, shows, and live broadcasts seamlessly with ultra-low latency.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {currentYear} Doomsplay. All rights reserved.</p>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            <span>•</span>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted for film lovers & binge-watchers</span>
            <Heart size={13} className="text-red-500 fill-red-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
