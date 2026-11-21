import { notFound } from "next/navigation";
import { getMediaById, getSeasonsForShow, getEpisodesForSeason, getRelatedMedia } from "@/lib/api";
import { WatchClient } from "@/components/WatchClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ episode?: string; season?: string; type?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { episode: episodeParam, season: seasonParam, type: typeParam } = await searchParams;

  const typeHint =
    typeParam === "movie" || typeParam === "tv"
      ? typeParam
      : (seasonParam || episodeParam ? "tv" : undefined);

  const item = await getMediaById(id, typeHint);
  if (!item) return { title: "Stream Title — doomsplay" };

  const epSubtitle =
    item.type === "tv" && episodeParam
      ? ` (Season ${seasonParam || 1}, Episode ${episodeParam})`
      : "";

  return {
    title: `Watch ${item.title}${epSubtitle} — doomsplay Stream Player`,
    description: `Watch ${item.title} on doomsplay with multiple authorized streaming servers.`
  };
}

export default async function WatchPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ episode?: string; season?: string; type?: string }>;
}) {
  const { id } = await params;
  const { episode: episodeParam, season: seasonParam, type: typeParam } = await searchParams;

  const typeHint =
    typeParam === "movie" || typeParam === "tv"
      ? typeParam
      : (seasonParam || episodeParam ? "tv" : undefined);

  const item = await getMediaById(id, typeHint);
  if (!item) notFound();

  const initialEpisode = episodeParam ? parseInt(episodeParam, 10) || 1 : 1;
  const initialSeason = seasonParam ? parseInt(seasonParam, 10) || 1 : 1;

  // Fetch real TMDB season list, initial season episodes, and related media
  const [seasonNumbers, episodes, relatedMedia] = await Promise.all([
    item.type === "tv" ? getSeasonsForShow(id) : Promise.resolve([]),
    item.type === "tv" ? getEpisodesForSeason(id, initialSeason) : Promise.resolve([]),
    getRelatedMedia(item, 6)
  ]);

  return (
    <WatchClient
      item={item}
      initialEpisode={initialEpisode}
      initialSeason={initialSeason}
      episodes={episodes}
      seasonNumbers={seasonNumbers}
      relatedMedia={relatedMedia}
    />
  );
}