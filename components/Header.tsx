
"use client";

import Link from "next/link";
import {
  Menu,
  Search,
  X,
  Home,
  Film,
  Tv,
  Compass,
  Bookmark,
  ChevronRight,
  User,
  Sparkles,
  Radio,
} from "lucide-react";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMyList } from "@/context/MyListContext";
import { Logo } from "./Logo";
import { AuthDialog, ProfileAction } from "./AuthDialog";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const [open, setOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, profile, passwordRecovery } = useAuth();
  const displayName = profile?.full_name || (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "");

  const pathname = usePathname();
  const { count } = useMyList();

  // Pages where logo and menu appear only after scrolling
  const compactPages = [
    "/movies",
    "/tv",
    "/my-list",
    "/movie-party"
  ];

  const isLiveTV = pathname.startsWith("/live-tv");
  const isSearchPage = pathname === "/search";
  const isSettingsPage = pathname === "/settings";
  const isAnimePage = pathname === "/anime";

  const isCompactPage = compactPages.some(
    (page) =>
      pathname === page || pathname.startsWith(page + "/")
  );

  // Detect scrolling
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 80);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow || "";
      document.body.style.touchAction =
        originalTouchAction || "";
    };
  }, [open]);

  // Close the mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (passwordRecovery) setAuthOpen(true);
  }, [passwordRecovery]);

  useEffect(() => {
    const openAuth = () => setAuthOpen(true);
    window.addEventListener("doomsplay:open-auth", openAuth);
    return () => window.removeEventListener("doomsplay:open-auth", openAuth);
  }, []);

  // Visibility rules
  const showLeftControls =
    !isLiveTV && !isSearchPage && (!isCompactPage || hasScrolled);

  const showLogo = showLeftControls && !isSettingsPage && !isAnimePage;
  const showGlobalSearch = !isLiveTV && !isSearchPage && !isSettingsPage;

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/tv", label: "TV Shows", icon: Tv },
    { href: "/live-tv", label: "Live TV", icon: Radio },
    { href: "/new-popular", label: "New & Popular", icon: Compass },
    {
      href: "/my-list",
      label: "My List",
      icon: Bookmark,
      badge: count
    }
  ];

  const quickGenres = [
    "Action",
    "Sci-Fi",
    "Drama",
    "Thriller",
    "Comedy",
    "Crime",
    "Adventure"
  ];



  if (pathname.startsWith("/watch/")) return null;

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-40 bg-transparent border-none shadow-none py-4 sm:py-5 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-14 2xl:px-16 pointer-events-none"
      >
        <div className="w-full flex items-center justify-between pointer-events-auto">

          {/* LEFT: MENU + LOGO */}

          <div
            className={`flex items-center gap-3 transition-all duration-300 ${showLeftControls
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
              }`}
          >
            {!isSettingsPage && !isAnimePage && <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/90 transition active:scale-95"
            >
              <Menu size={18} />
            </button>}

            {showLogo && <Logo size="md" markOnly={true} />}
          </div>

          {/* RIGHT: SEARCH + PROFILE */}

          <div className="flex items-center gap-2.5 sm:gap-3.5">

            {showGlobalSearch && (
              <Link
                aria-label="Search"
                href="/search"
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 transition-all duration-200 hover:border-white/25 hover:bg-black/70 hover:text-white hover:scale-105 active:scale-95 backdrop-blur-md"
              >
                <Search size={17} />
              </Link>
            )}

            {!isSearchPage && !isSettingsPage && (
              <ProfileAction onClick={() => setAuthOpen(true)} />
            )}
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* MOBILE DRAWER */}

      {open && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="mr-auto flex h-full w-[85vw] max-w-[320px] flex-col bg-[#0b0b10] border-r border-white/10 p-5 shadow-2xl overflow-y-auto"
          >

            {/* Drawer Header */}

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div onClick={() => setOpen(false)}>
                <Logo size="sm" markOnly={false} />
              </div>

              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile */}

            <button type="button" onClick={() => setAuthOpen(true)} className="mt-5 flex w-full items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-left transition hover:bg-white/[0.07]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 font-bold text-white shadow-md">
                <User size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-white">
                    {user ? displayName || "Doomsplay member" : "Welcome to Doomsplay"}
                  </p>
                </div>

                <p className="text-[11px] text-white/45">
                  {user?.email || "Sign in or create an account"}
                </p>
              </div>
            </button>

            {/* Navigation */}

            <div className="mt-6 flex-1 space-y-1.5">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Navigation
              </p>

              {links.map(
                ({ href, label, icon: Icon, badge }) => {
                  const isActive =
                    pathname === href ||
                    (href === "/live-tv" &&
                      pathname.startsWith("/live-tv"));

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive
                        ? "bg-red-600 text-white font-bold shadow-lg shadow-red-600/30"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={19}
                          className={
                            isActive
                              ? "text-white"
                              : "text-white/60"
                          }
                        />

                        <span>{label}</span>
                      </div>

                      {typeof badge === "number" &&
                        badge > 0 ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive
                            ? "bg-black text-white"
                            : "bg-red-600 text-white"
                            }`}
                        >
                          {badge}
                        </span>
                      ) : (
                        <ChevronRight
                          size={16}
                          className={
                            isActive
                              ? "text-white/70"
                              : "text-white/30"
                          }
                        />
                      )}
                    </Link>
                  );
                }
              )}

              {/* Search in Drawer */}

              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition ${pathname === "/search"
                  ? "bg-red-600 text-white font-bold shadow-lg shadow-red-600/30"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Search
                    size={19}
                    className={
                      pathname === "/search"
                        ? "text-white"
                        : "text-white/60"
                    }
                  />

                  <span>Search</span>
                </div>

                <ChevronRight
                  size={16}
                  className="text-white/30"
                />
              </Link>
            </div>

            {/* Genres */}

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
                <Sparkles
                  size={12}
                  className="text-red-500"
                />

                <span>Explore Genres</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {quickGenres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/search?genre=${encodeURIComponent(
                      genre
                    )}`}
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 transition"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer */}

            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <p className="text-[11px] text-white/35">
                Doomsplay Cinematic Streaming
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
