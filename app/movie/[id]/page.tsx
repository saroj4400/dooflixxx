import { notFound } from "next/navigation";
import { Details } from "@/components/Details";
import { getMovieById, getRelatedMedia } from "@/lib/api";
import type { Metadata } from "next";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getMovieById(id);
  if (!item) return { title: "Movie Not Found — doomsplay" };

  return {
    title: `${item.title} (${item.year}) — Stream on doomsplay`,
    description: item.description
  };
}

export default async function MoviePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getMovieById(id);
  if (!item) notFound();

  const related = await getRelatedMedia(item, 8);

  return <Details item={item} relatedMedia={related} />;
}