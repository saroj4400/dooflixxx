
"use client";

import Link from "next/link";
import {
  Search as SearchIcon,
  ArrowLeft,
  X,
  Sparkles,
  Film,
  Tv,
  TrendingUp,
  Loader2
} from "lucide-react";

import {
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";

import {
  useSearchParams,
  useRouter
} from "next/navigation";

import { MediaCard } from "./MediaCard";
import { Media } from "@/types/media";

const popularQueries = [
  "Avengers",
  "Breaking Bad",
  "Sci-Fi",
  "Thriller",
  "Game of Thrones",
  "Action",
  "Inception",
  "Comedy"
];

const genreList = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller"
];

const providerNames: Record<string, string> = {
  "8": "Netflix",
  "9": "Prime Video",
  "337": "Disney+",
  "350": "Apple TV+",
  "15": "Hulu",
  "1899": "HBO Max",
  "531": "Paramount+",
  "386": "Peacock",
  "283": "Crunchyroll",
  "43": "Starz",
  "526": "AMC+"
};

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") || "";
  const initialGenre = searchParams.get("genre") || "All";

  const [query, setQuery] = useState(initialQuery);

  const [selectedType, setSelectedType] =
    useState<"all" | "movie" | "tv">("all");

  const [selectedGenre, setSelectedGenre] =
    useState<string>(initialGenre);

  const [results, setResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Provider ID comes directly from the URL.
  const providerId = searchParams.get("provider") || "";

  const providerName =
    providerNames[providerId] || "Streaming Provider";

  /**
   * Fetch search results.
   *
   * Provider filtering is handled by the API route.
   */
  const fetchResults = useCallback(
    async (
      q: string,
      type: string,
      genre: string,
      provider: string
    ) => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        const params = new URLSearchParams({
          q,
          type,
          genre,
          provider,
          region: "IN"
        });

        const res = await fetch(
          `/api/search?${params.toString()}`
        );

        if (!res.ok) {
          setResults([]);
          return;
        }

        const data = await res.json();

        setResults(
          Array.isArray(data) ? data : []
        );

      } catch (error) {
        console.error("Search error:", error);
        setResults([]);

      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Debounced search.
   */
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(
        query,
        selectedType,
        selectedGenre,
        providerId
      );
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    query,
    selectedType,
    selectedGenre,
    providerId,
    fetchResults
  ]);

  /**
   * Sync URL changes.
   */
  useEffect(() => {
    const q = searchParams.get("q");
    const g = searchParams.get("genre");

    setQuery(q || "");
    setSelectedGenre(g || "All");
  }, [searchParams]);

  /**
   * Active filters.
   */
  const hasActiveFilters =
    query !== "" ||
    selectedType !== "all" ||
    selectedGenre !== "All" ||
    providerId !== "";

  /**
   * Reset filters.
   */
  const handleClear = () => {
    setQuery("");
    setSelectedType("all");
    setSelectedGenre("All");
    setResults([]);
    setHasSearched(false);

    router.replace("/search");
  };

  /**
   * Quick search.
   */
  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setSelectedGenre("All");
  };

  return (
    <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-6 sm:px-6 md:px-8">

      <Link
        href="/"
        aria-label="Back to Home"
        className="relative z-50 mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Back to Home</span>
      </Link>

      {/* Search Input */}
      <div className="relative mx-auto max-w-3xl">

        <div className="relative flex items-center rounded-full border border-white/15 bg-[#101016] px-4 py-3 sm:py-3.5 shadow-2xl backdrop-blur-xl transition-all focus-within:border-red-600 focus-within:bg-black/90">

          {isLoading ? (
            <Loader2
              className="mr-3 text-red-500 flex-none animate-spin"
              size={22}
            />
          ) : (
            <SearchIcon
              className="mr-3 text-red-500 flex-none"
              size={22}
            />
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV, actors..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-white/40 outline-none"
            autoFocus
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear input"
              className="ml-2 rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition"
            >
              <X size={18} />
            </button>
          )}

        </div>

        {/* Popular Searches */}
        {!query && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">

            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/40 flex-none">
              <TrendingUp size={12} className="text-red-500" />
              <span>Trending:</span>
            </span>

            {popularQueries.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className="flex-none rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition"
              >
                {term}
              </button>
            ))}

          </div>
        )}

      </div>

      {/* Selected Provider */}
      {providerId && (
        <div className="mt-6 flex items-center gap-2">

          <div className="h-2 w-2 rounded-full bg-red-500" />

          <h2 className="text-xl font-black text-white">
            {providerName} Movies & TV Shows
          </h2>

        </div>
      )}

      {/* Filters */}
      <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4">

        {/* Media Type */}
        <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">

          <button
            onClick={() => setSelectedType("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${selectedType === "all"
              ? "bg-red-600 text-white shadow-md shadow-red-600/30"
              : "text-white/60 hover:text-white"
              }`}
          >
            All
          </button>

          <button
            onClick={() => setSelectedType("movie")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${selectedType === "movie"
              ? "bg-red-600 text-white shadow-md shadow-red-600/30"
              : "text-white/60 hover:text-white"
              }`}
          >
            <Film size={13} />
            Movies
          </button>

          <button
            onClick={() => setSelectedType("tv")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${selectedType === "tv"
              ? "bg-red-600 text-white shadow-md shadow-red-600/30"
              : "text-white/60 hover:text-white"
              }`}
          >
            <Tv size={13} />
            TV Shows
          </button>

        </div>

        {/* Genres */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-1">

          {genreList.map((g) => {
            const active = selectedGenre === g;

            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`flex-none rounded-lg px-3 py-1 text-xs font-semibold transition ${active
                  ? "bg-red-600 text-white shadow-sm"
                  : "border border-white/10 bg-white/[0.03] text-white/65 hover:border-white/20 hover:text-white"
                  }`}
              >
                {g}
              </button>
            );
          })}

        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="text-xs font-bold text-red-500 hover:underline flex-none"
          >
            Reset Filters
          </button>
        )}

      </div>

      {/* Results Header */}
      {hasSearched && !isLoading && (
        <div className="mt-4 flex items-center justify-between text-xs sm:text-sm text-white/60">

          <p>
            Showing{" "}
            <span className="font-bold text-white">
              {results.length}
            </span>{" "}
            {results.length === 1 ? "result" : "results"}

            {query && (
              <>
                {" "}for{" "}
                <span className="text-white">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}

            {selectedGenre !== "All" && (
              <>
                {" "}in{" "}
                <span className="text-white">
                  {selectedGenre}
                </span>
              </>
            )}

          </p>

        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-2xl bg-white/5"
            />
          ))}

        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 ? (

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

          {results.map((item) => (
            <MediaCard
              key={`${item.type}-${item.id}`}
              item={item}
            />
          ))}

        </div>

      ) : !isLoading && hasSearched ? (

        <div className="mx-auto my-16 max-w-md text-center px-4">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-red-500">
            <SearchIcon size={36} />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            No titles found
          </h2>

          <p className="mt-2 text-sm text-white/50">
            We couldn&apos;t find any movies or shows matching your current filters. Try adjusting your search or genre.
          </p>

          <button
            onClick={handleClear}
            className="mt-6 rounded-full bg-white px-7 py-3 text-sm font-black text-black shadow-lg hover:bg-zinc-200 transition"
          >
            Clear All Filters
          </button>

        </div>

      ) : !isLoading && !hasSearched ? (

        <div className="mt-10">

          <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
            <Sparkles size={16} className="text-red-500" />
            <span>
              Start typing to search movies and series
            </span>
          </div>

        </div>

      ) : null}

    </div>
  );
}
