import { Section } from "@/components/Section";
import { Top10 } from "@/components/Top10";
import {
  getTrendingMovies,
  getTrendingTV,
  getUpcomingMovies,
  getTopRatedMovies
} from "@/lib/api";
import { Sparkles, Flame, Trophy } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New & Popular — Doomsplay",
  description: "The most watched movies, trending TV shows, and latest premieres on Doomsplay."
};

export default async function NewPopularPage() {
  const [trendingMovies, trendingTV, upcoming, topRated] = await Promise.all([
    getTrendingMovies(),
    getTrendingTV(),
    getUpcomingMovies(),
    getTopRatedMovies()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
      {/* Header Banner */}
      <div className="mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 text-red-500 shadow-md">
            <Sparkles size={22} />
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">New &amp; Popular</h1>
        </div>
        <p className="mt-1 text-sm text-white/50">
          The most watched movies, trending TV shows, and latest premieres streaming right now.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {/* Upcoming / New Releases */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-red-600/10 via-transparent to-rose-950/20 p-4 sm:p-6 mb-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400 mb-2">
            <Flame size={16} />
            <span>Trending Worldwide</span>
          </div>
          <Section
            title="Upcoming & New Releases"
            items={upcoming.slice(0, 20)}
            horizontal={true}
          />
        </div>

        {/* Top 10 Movies */}
        <Top10
          title="Top 10 Movies Globally Today"
          items={trendingMovies.slice(0, 10)}
        />

        {/* Top 10 TV Shows */}
        <Top10
          title="Top 10 TV Shows Globally Today"
          items={trendingTV.slice(0, 10)}
        />

        {/* Critically Acclaimed */}
        <div className="pt-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 mb-4">
            <Trophy size={16} />
            <span>Critically Acclaimed</span>
          </div>
          <Section
            title="Top Rated & Award Winners"
            items={topRated.slice(0, 20)}
            horizontal={true}
          />
        </div>
      </div>
    </div>
  );
}