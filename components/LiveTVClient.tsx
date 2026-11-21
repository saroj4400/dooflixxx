"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Star,
  Clock,
  Radio,
  X,
  Tv,
  ListFilter,
  Sparkles,
  Volume2
} from "lucide-react";
import { LiveChannel } from "@/types/livetv";
import { LivePlayer } from "@/components/LivePlayer";
import { ChannelLogo } from "@/components/ChannelLogo";

const FAVORITES_KEY = "doomsplay-live-favorites";
const HISTORY_KEY = "doomsplay-live-history";
const PAGE_SIZE = 80;

interface Props {
  initialChannels: LiveChannel[];
  initialChannelId?: string;
}

export function LiveTVClient({ initialChannels, initialChannelId }: Props) {
  const [channels] = useState<LiveChannel[]>(initialChannels);

  // Selected channel state
  const initialSelected = useMemo(() => {
    if (initialChannelId) {
      const found = channels.find((c) => c.id === initialChannelId);
      if (found) return found;
    }
    return channels[0] || null;
  }, [channels, initialChannelId]);

  const [activeChannel, setActiveChannel] = useState<LiveChannel | null>(initialSelected);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedNav, setSelectedNav] = useState("All"); // "All" | "History" | "Favorite" | category string
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const playerRef = useRef<HTMLDivElement | null>(null);

  // SSR-safe localStorage loading
  useEffect(() => {
    try {
      const favs = localStorage.getItem(FAVORITES_KEY);
      if (favs) setFavorites(JSON.parse(favs));

      const hist = localStorage.getItem(HISTORY_KEY);
      if (hist) setHistory(JSON.parse(hist));
    } catch (e) {
      console.error("[LiveTV] Failed to load local storage:", e);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = (channelId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFavorites((prev) => {
      const next = prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("[LiveTV] Failed to save favorites:", err);
      }
      return next;
    });
  };

  // Add to history (max 20)
  const recordHistory = (channelId: string) => {
    setHistory((prev) => {
      const next = [channelId, ...prev.filter((id) => id !== channelId)].slice(0, 20);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("[LiveTV] Failed to save history:", err);
      }
      return next;
    });
  };

  // Channel selection action
  const handleSelectChannel = (channel: LiveChannel) => {
    setActiveChannel(channel);
    setHasStartedPlayback(true);
    recordHistory(channel.id);

    // Scroll player into view on mobile
    if (window.innerWidth < 1024 && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Next channel helper
  const handleNextChannel = () => {
    if (!activeChannel || channels.length === 0) return;
    const currentIndex = channels.findIndex((c) => c.id === activeChannel.id);
    const nextIndex = (currentIndex + 1) % channels.length;
    handleSelectChannel(channels[nextIndex]);
  };

  // Language chips: "All", "Hindi", "English", then other Indian languages in data
  const languageChips = useMemo(() => {
    const langSet = new Set<string>();
    channels.forEach((c) => {
      if (Array.isArray(c.languages)) {
        c.languages.forEach((l) => l && langSet.add(l));
      } else if (c.language) {
        langSet.add(c.language);
      }
    });

    langSet.delete("Hindi");
    langSet.delete("English");

    const others = Array.from(langSet).sort();
    return ["All", "Hindi", "English", ...others];
  }, [channels]);

  // Categories list from all channels
  const uniqueCategories = useMemo(() => {
    const catSet = new Set<string>();
    channels.forEach((c) => {
      if (c.category) catSet.add(c.category);
    });
    return Array.from(catSet).sort();
  }, [channels]);

  // Base filtered list (Language + Search query)
  const languageAndSearchFiltered = useMemo(() => {
    return channels.filter((c) => {
      // Language filter
      if (selectedLanguage !== "All") {
        const hasLang = Array.isArray(c.languages)
          ? c.languages.includes(selectedLanguage)
          : c.language === selectedLanguage;
        if (!hasLang) return false;
      }

      // Search query (channel name & altNames)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchAlt = c.altNames?.some((alt) => alt.toLowerCase().includes(q));
        if (!matchName && !matchAlt) {
          return false;
        }
      }

      return true;
    });
  }, [channels, selectedLanguage, searchQuery]);

  // Dynamic Sidebar Counts (matches selected language & search query)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: languageAndSearchFiltered.length,
      Favorite: languageAndSearchFiltered.filter((c) => favorites.includes(c.id)).length,
      History: languageAndSearchFiltered.filter((c) => history.includes(c.id)).length
    };

    uniqueCategories.forEach((cat) => {
      counts[cat] = languageAndSearchFiltered.filter((c) => c.category === cat).length;
    });

    return counts;
  }, [languageAndSearchFiltered, favorites, history, uniqueCategories]);

  // Right column channel list based on selected sidebar item
  const displayChannels = useMemo(() => {
    if (selectedNav === "Favorite") {
      return languageAndSearchFiltered.filter((c) => favorites.includes(c.id));
    }
    if (selectedNav === "History") {
      // Maintain history order
      const map = new Map(languageAndSearchFiltered.map((c) => [c.id, c]));
      const list: LiveChannel[] = [];
      history.forEach((id) => {
        const ch = map.get(id);
        if (ch) list.push(ch);
      });
      return list;
    }
    if (selectedNav === "All") {
      return languageAndSearchFiltered;
    }
    return languageAndSearchFiltered.filter((c) => c.category === selectedNav);
  }, [languageAndSearchFiltered, selectedNav, favorites, history]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedNav, selectedLanguage, searchQuery]);

  const pagedChannels = useMemo(() => {
    return displayChannels.slice(0, visibleCount);
  }, [displayChannels, visibleCount]);

  if (!activeChannel && channels.length > 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column on Desktop / Top Section on Mobile */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4">
          {/* 1. Search Bar */}
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Channel by name..."
              className="w-full rounded-full border border-white/10 bg-[#0e0e13] pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-white/40 outline-none transition focus:border-red-600 focus:bg-[#14141c]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* 2. Player Container */}
          <div ref={playerRef} className="scroll-mt-20">
            {activeChannel ? (
              <LivePlayer
                channel={activeChannel}
                allChannels={channels}
                hasUserStartedPlayback={hasStartedPlayback}
                onStartPlayback={() => {
                  setHasStartedPlayback(true);
                  if (activeChannel) recordHistory(activeChannel.id);
                }}
                onNextChannel={handleNextChannel}
              />
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-black border border-white/10 flex items-center justify-center text-white/40 text-xs">
                No channel selected
              </div>
            )}
          </div>

          {/* Active Channel Details under Player */}
          {activeChannel && (
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0e0e13] px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 flex-none rounded-xl overflow-hidden border border-white/10 bg-black/50 p-0.5">
                  <ChannelLogo
                    src={activeChannel.logo}
                    name={activeChannel.name}
                    fallbackSize="xs"
                    className="h-full w-full object-contain p-0.5"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-sm sm:text-base font-black text-white">
                      {activeChannel.name}
                    </h1>
                    <span className="flex items-center gap-1 rounded-full bg-red-600 px-1.5 py-0.2 text-[8px] font-black uppercase text-white shadow-sm flex-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-white/50">
                    {activeChannel.category} • {activeChannel.language || "Hindi"}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => toggleFavorite(activeChannel.id, e)}
                aria-label="Favorite channel"
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                  favorites.includes(activeChannel.id)
                    ? "border-amber-400/50 bg-amber-400/15 text-amber-400 shadow-sm"
                    : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                }`}
              >
                <Star
                  size={17}
                  className={favorites.includes(activeChannel.id) ? "fill-amber-400" : ""}
                />
              </button>
            </div>
          )}
        </div>

        {/* Right Column on Desktop / Bottom Section on Mobile */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4">
          {/* 3. Language Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {languageChips.map((lang) => {
              const active = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`flex-none rounded-full px-4 py-1.5 text-xs font-bold transition duration-200 ${
                    active
                      ? "bg-red-600 text-white font-black shadow-md shadow-red-600/30 scale-[1.02]"
                      : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>

          {/* 4. Two-Column Browser Container */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0e0e13] shadow-xl flex h-[460px] sm:h-[500px] md:h-[560px]">
            {/* Left Sidebar: Categories (~35% width, darker bg, independent scroll) */}
            <div className="w-[36%] sm:w-[32%] md:w-[35%] flex-none border-r border-white/10 bg-[#09090d] overflow-y-auto no-scrollbar flex flex-col py-1.5">
              {/* All */}
              <button
                onClick={() => setSelectedNav("All")}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold transition text-left ${
                  selectedNav === "All"
                    ? "border-l-4 border-red-600 bg-red-600/10 text-white font-black"
                    : "border-l-4 border-transparent text-white/60 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <span className="truncate">All</span>
                <span className="text-[10px] font-semibold text-white/40 ml-1">
                  ({categoryCounts.All ?? 0})
                </span>
              </button>

              {/* History */}
              <button
                onClick={() => setSelectedNav("History")}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold transition text-left ${
                  selectedNav === "History"
                    ? "border-l-4 border-red-600 bg-red-600/10 text-white font-black"
                    : "border-l-4 border-transparent text-white/60 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Clock size={12} className="flex-none" />
                  <span className="truncate">History</span>
                </div>
                <span className="text-[10px] font-semibold text-white/40 ml-1">
                  ({categoryCounts.History ?? 0})
                </span>
              </button>

              {/* Favorite */}
              <button
                onClick={() => setSelectedNav("Favorite")}
                className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold transition text-left ${
                  selectedNav === "Favorite"
                    ? "border-l-4 border-red-600 bg-red-600/10 text-white font-black"
                    : "border-l-4 border-transparent text-white/60 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Star size={12} className="flex-none fill-amber-400 text-amber-400" />
                  <span className="truncate">Favorite</span>
                </div>
                <span className="text-[10px] font-semibold text-white/40 ml-1">
                  ({categoryCounts.Favorite ?? 0})
                </span>
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-white/5" />

              {/* Category list derived from data */}
              {uniqueCategories.map((cat) => {
                const count = categoryCounts[cat] ?? 0;
                const active = selectedNav === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedNav(cat)}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-semibold transition text-left ${
                      active
                        ? "border-l-4 border-red-600 bg-red-600/10 text-white font-bold"
                        : "border-l-4 border-transparent text-white/60 hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className="text-[10px] text-white/40 ml-1">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Right List: Channels (~65% width, independent scroll) */}
            <div className="flex-1 bg-[#0e0e13] overflow-y-auto flex flex-col divide-y divide-white/5">
              {pagedChannels.length > 0 ? (
                <>
                  {pagedChannels.map((channel) => {
                    const isPlayingCurrent = activeChannel?.id === channel.id;
                    const isFav = favorites.includes(channel.id);

                    return (
                      <div
                        key={channel.id}
                        onClick={() => handleSelectChannel(channel)}
                        className={`group flex items-center justify-between px-3 py-2.5 sm:px-3.5 cursor-pointer transition-colors ${
                          isPlayingCurrent
                            ? "bg-red-600/10 text-white"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        {/* Left: Logo + Title */}
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <div
                            className={`relative h-10 w-10 flex-none rounded-xl overflow-hidden border p-0.5 ${
                              isPlayingCurrent
                                ? "border-red-600/60 bg-black/60 shadow-sm"
                                : "border-white/10 bg-black/40 group-hover:border-white/20"
                            }`}
                          >
                            <ChannelLogo
                              src={channel.logo}
                              name={channel.name}
                              fallbackSize="xs"
                              className="h-full w-full object-contain p-0.5"
                            />
                            {isPlayingCurrent && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="flex items-end gap-0.5 h-3">
                                  <span className="w-0.5 h-2 bg-red-500 animate-pulse" />
                                  <span className="w-0.5 h-3 bg-red-500 animate-pulse delay-75" />
                                  <span className="w-0.5 h-1.5 bg-red-500 animate-pulse delay-150" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`truncate text-xs sm:text-sm font-bold leading-tight ${
                                isPlayingCurrent
                                  ? "text-red-400"
                                  : "text-white/90 group-hover:text-white"
                              }`}
                            >
                              {channel.name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40">
                              <span className="truncate">{channel.category}</span>
                              {channel.language && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{channel.language}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Star Favorite Button */}
                        <button
                          onClick={(e) => toggleFavorite(channel.id, e)}
                          aria-label={isFav ? "Remove favorite" : "Add favorite"}
                          className={`p-1.5 rounded-lg transition ${
                            isFav
                              ? "text-amber-400"
                              : "text-white/20 group-hover:text-white/40 hover:text-white"
                          }`}
                        >
                          <Star
                            size={16}
                            className={isFav ? "fill-amber-400" : "hover:fill-white/20"}
                          />
                        </button>
                      </div>
                    );
                  })}

                  {/* Load more button if items remain */}
                  {displayChannels.length > visibleCount && (
                    <div className="p-3 text-center">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition"
                      >
                        Load more channels ({displayChannels.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Empty States */
                <div className="flex flex-col items-center justify-center p-8 text-center my-auto">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-red-500 mb-2 shadow-inner">
                    {selectedNav === "Favorite" ? (
                      <Star size={22} className="text-amber-400" />
                    ) : selectedNav === "History" ? (
                      <Clock size={22} className="text-white/70" />
                    ) : (
                      <Tv size={22} />
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {selectedNav === "Favorite"
                      ? "No Favorites Saved"
                      : selectedNav === "History"
                      ? "No Watch History"
                      : "No Channels Found"}
                  </h3>
                  <p className="mt-1 text-[11px] text-white/40 max-w-[200px]">
                    {selectedNav === "Favorite"
                      ? "Star any channel on the right to pin it to your favorites."
                      : selectedNav === "History"
                      ? "Channels you play will appear here for fast access."
                      : "No channels match the active language or search filter."}
                  </p>
                  {(searchQuery || selectedLanguage !== "All" || selectedNav !== "All") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedLanguage("All");
                        setSelectedNav("All");
                      }}
                      className="mt-3 text-[11px] font-bold text-red-500 hover:underline"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
