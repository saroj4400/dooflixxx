import { getTVShows, getTopRatedTV } from "@/lib/api";
import { TVClient } from "@/components/TVClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows — doomsplay",
  description: "Explore popular TV series, dramas, and episodic sensations on doomsplay."
};

export default async function TVPage() {
  const [popular, topRated] = await Promise.all([
    getTVShows(),
    getTopRatedTV()
  ]);

  const seen = new Set<string>();
  const allShows = [...popular, ...topRated].filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });

  return <TVClient shows={allShows} />;
}