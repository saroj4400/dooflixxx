import { notFound } from "next/navigation";
import { Details } from "@/components/Details";
import {
  getTVShowById,
  getRelatedMedia,
  getSeasonsForShow,
  getEpisodesForSeason
} from "@/lib/api";
import type { Metadata } from "next";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getTVShowById(id);
  if (!item) return { title: "TV Show Not Found — doomsplay" };

  return {
    title: `${item.title} (${item.year}) — Stream on doomsplay`,
    description: item.description
  };
}

export default async function TVDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getTVShowById(id);
  if (!item) notFound();

  const [related, seasonNumbers, season1Episodes] = await Promise.all([
    getRelatedMedia(item, 8),
    getSeasonsForShow(id),
    getEpisodesForSeason(id, 1)
  ]);

  return (
    <Details
      item={item}
      relatedMedia={related}
      seasonNumbers={seasonNumbers}
      initialEpisodes={season1Episodes}
    />
  );
}