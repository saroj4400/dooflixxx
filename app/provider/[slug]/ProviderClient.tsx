
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Film,
    Tv,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Star,
    PlayCircle
} from "lucide-react";

interface ProviderMedia {
    id: string;
    title: string;
    year: number;
    type: "movie" | "tv";
    poster: string | null;
    backdrop: string | null;
    description: string;
    rating: number;
    language: string;
    genres: number[];
}

interface ApiResponse {
    provider: string;
    results: ProviderMedia[];
    page: number;
    total_pages: number;
    total_results: number;
    error?: string;
}

interface Props {
    slug: string;
    providerName: string;
}

export default function ProviderClient({
    slug,
    providerName
}: Props) {
    const [type, setType] = useState<"all" | "movie" | "tv">("all");
    const [page, setPage] = useState(1);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProvider = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                provider: slug,
                type,
                page: String(page)
            });

            const response = await fetch(
                `/api/providers?${params.toString()}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Unable to load provider"
                );
            }

            setData(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong"
            );
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [slug, type, page]);

    useEffect(() => {
        loadProvider();
    }, [loadProvider]);

    const changeType = (newType: "all" | "movie" | "tv") => {
        setType(newType);
        setPage(1);
    };

    return (
        <div className="mx-auto max-w-7xl">

            {/* Provider heading */}
            <div className="mb-8">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
                    <PlayCircle size={15} />
                    <span>Streaming Provider</span>
                    <span className="text-white/30">/</span>
                    <span className="text-white/50">India</span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {providerName}
                </h1>

                <p className="mt-2 text-sm text-white/50">
                    Movies and TV shows available on {providerName} in India.
                </p>
            </div>

            {/* Media filters */}
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">

                <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1">

                    <button
                        onClick={() => changeType("all")}
                        className={`rounded-lg px-4 py-2 text-sm font-bold transition ${type === "all"
                                ? "bg-red-600 text-white"
                                : "text-white/60 hover:text-white"
                            }`}
                    >
                        All
                    </button>

                    <button
                        onClick={() => changeType("movie")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${type === "movie"
                                ? "bg-red-600 text-white"
                                : "text-white/60 hover:text-white"
                            }`}
                    >
                        <Film size={15} />
                        Movies
                    </button>

                    <button
                        onClick={() => changeType("tv")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${type === "tv"
                                ? "bg-red-600 text-white"
                                : "text-white/60 hover:text-white"
                            }`}
                    >
                        <Tv size={15} />
                        TV Shows
                    </button>

                </div>

                {data && (
                    <span className="text-xs text-white/40">
                        {data.total_results.toLocaleString()} titles
                    </span>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2
                            size={32}
                            className="animate-spin text-red-500"
                        />
                        <p className="text-sm text-white/50">
                            Loading {providerName} catalog...
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                    <p className="font-bold text-white">
                        Unable to load titles
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                        {error}
                    </p>
                    <button
                        onClick={loadProvider}
                        className="mt-5 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Catalog */}
            {!loading && !error && data && (
                <>
                    {data.results.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                            {data.results.map((item) => (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    href={
                                        item.type === "movie"
                                            ? `/movie/${item.id}`
                                            : `/tv/${item.id}`
                                    }
                                    className="group min-w-0"
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-[#17171d]">

                                        {item.poster ? (
                                            <Image
                                                src={item.poster}
                                                alt={item.title}
                                                fill
                                                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-white/30">
                                                <Film size={32} />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70" />

                                        <div className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[10px] font-bold uppercase text-white backdrop-blur-md">
                                            {item.type === "movie" ? "Movie" : "TV"}
                                        </div>

                                        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[10px] font-bold text-amber-400">
                                            <Star size={11} fill="currentColor" />
                                            {item.rating.toFixed(1)}
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <PlayCircle
                                                size={42}
                                                className="text-white"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="mt-2 truncate text-sm font-bold text-white transition-colors group-hover:text-red-500">
                                        {item.title}
                                    </h3>

                                    <p className="mt-1 text-xs text-white/45">
                                        {item.year || "Release year unavailable"}
                                        {" • "}
                                        {item.type === "movie" ? "Movie" : "Series"}
                                    </p>
                                </Link>
                            ))}

                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <Film
                                size={42}
                                className="mx-auto text-white/20"
                            />
                            <h2 className="mt-4 text-lg font-bold text-white">
                                No titles found
                            </h2>
                            <p className="mt-2 text-sm text-white/45">
                                No matching {type === "all" ? "titles" : type === "movie" ? "movies" : "TV shows"} were returned for {providerName} in India.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {data.total_pages > 1 && (
                        <div className="mt-10 flex items-center justify-center gap-4">

                            <button
                                disabled={page <= 1 || loading}
                                onClick={() => {
                                    setPage((p) => Math.max(1, p - 1));
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth"
                                    });
                                }}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-30"
                            >
                                <ChevronLeft size={17} />
                                Previous
                            </button>

                            <span className="text-sm text-white/60">
                                {page} / {Math.min(data.total_pages, 500)}
                            </span>

                            <button
                                disabled={page >= Math.min(data.total_pages, 500) || loading}
                                onClick={() => {
                                    setPage((p) => p + 1);
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth"
                                    });
                                }}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-30"
                            >
                                Next
                                <ChevronRight size={17} />
                            </button>

                        </div>
                    )}
                </>
            )}
        </div>
    );
}
