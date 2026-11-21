"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { MediaCard } from "@/components/MediaCard";
import type { TVShow } from "@/types/media";

interface AnimePage {
  results: TVShow[];
  page: number;
  totalPages: number;
  configured: boolean;
  sourceError: boolean;
}

export function AnimeClient({ initialData }: { initialData: AnimePage }) {
  const [items, setItems] = useState(initialData.results);
  const [page, setPage] = useState(initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMore = async () => {
    if (loading || page >= totalPages) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/anime?page=${page + 1}`);
      if (!response.ok) throw new Error("Unable to load more anime.");
      const data = (await response.json()) as AnimePage;
      if (!Array.isArray(data.results)) throw new Error("The anime response was invalid.");
      setItems((current) => {
        const knownIds = new Set(current.map((item) => item.id));
        return [...current, ...data.results.filter((item) => item?.id && !knownIds.has(item.id))];
      });
      setPage(page + 1);
      setTotalPages(data.totalPages);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load more anime.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 pb-32 pt-8 sm:px-6 md:px-8">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-500">
            <Sparkles size={22} />
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">Anime</h1>
        </div>
        <p className="mt-1 text-sm text-white/50">Japanese animated series from the available catalog.</p>
      </div>

      {items.length > 0 ? (
        <>
          <p className="mb-3.5 mt-5 text-xs font-medium text-white/40">
            Showing <span className="font-bold text-white">{items.length}</span> anime series
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4.5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <article key={item.id} className="min-w-0">
                <MediaCard item={item} />
                {item.description && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/50">{item.description}</p>
                )}
              </article>
            ))}
          </div>
          {page < totalPages && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
              >
                {loading && <LoaderCircle size={16} className="animate-spin" />}
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center text-white/50">
          <p>
            {initialData.sourceError
              ? "The anime catalog is temporarily unavailable. Please refresh to try again."
              : initialData.configured
                ? "No anime series were found in the configured content source."
                : "No anime series are available in the local content source."}
          </p>
        </div>
      )}
      {error && <p role="alert" className="mt-5 text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
