import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Top10 } from "@/components/Top10";
import { ProviderSection } from "@/components/ProviderSection";
import {
  getTrending,
  getTrendingMovies,
  getTrendingTV,
  getMovies,
  getTVShows,
  getTopRatedMovies,
  getUpcomingMovies
} from "@/lib/api";

export default async function Home() {
  // Parallel fetch for performance
  const [
    trending,
    trendingMovies,
    trendingTV,
    popularMovies,
    popularTV,
    topRated,
    upcoming
  ] = await Promise.all([
    getTrending(),
    getTrendingMovies(),
    getTrendingTV(),
    getMovies(),
    getTVShows(),
    getTopRatedMovies(),
    getUpcomingMovies()
  ]);

  // Hero uses top 5 trending items (mix of movies & TV)
  const featured = trending.slice(0, 5);

  return (
    <div className="relative w-full min-w-0 overflow-x-hidden">
      {/* Featured Cinematic Hero Carousel with Integrated Dynamic Atmosphere */}
      <Hero items={featured} />

      {/* Main Content Sections - Positioned above Dynamic Ambient Background */}
      <div className="relative z-10 w-full min-w-0 space-y-6 sm:space-y-8 md:space-y-10 pt-0 pb-28 sm:pb-32 md:pb-36">
        {/* Browse by Provider (Reference Photo) */}
        <ProviderSection />

        {/* TV Action & Adventure / Trending Now (Reference Photos 1 & 2) */}
        <Section
          title="TV Action & Adventure"
          items={trending.slice(0, 20)}
          horizontal={true}
          seeAllHref="/new-popular"
        />

        {/* Top 10 Movies Globally (Reference Photo 4) */}
        <Top10 title="Top 10 Movies Globally Today" items={trendingMovies.slice(0, 10)} />

        {/* Popular Movies */}
        <Section
          title="Popular Movies"
          items={popularMovies.slice(0, 20)}
          horizontal={true}
          seeAllHref="/movies"
        />

        {/* Top 10 TV Shows Globally Today (Reference Photo 4) */}
        <Top10 title="Top 10 TV Shows Globally Today" items={trendingTV.slice(0, 10)} />

        {/* Popular TV Series */}
        <Section
          title="Popular TV Series"
          items={popularTV.slice(0, 20)}
          horizontal={true}
          seeAllHref="/tv"
        />

        {/* Top Rated & Award Winners */}
        <Section
          title="Top Rated & Award Winners"
          items={topRated.slice(0, 20)}
          horizontal={true}
          seeAllHref="/movies"
        />

        {/* Coming Soon & New Releases */}
        <Section
          title="Coming Soon & New Releases"
          items={upcoming.slice(0, 20)}
          horizontal={true}
          seeAllHref="/new-popular"
        />
      </div>
    </div>
  );
}