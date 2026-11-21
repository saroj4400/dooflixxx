import type { Metadata } from "next";
import { AnimeClient } from "@/components/AnimeClient";
import { getAnime } from "@/lib/api";

export const metadata: Metadata = {
  title: "Anime — Doomsplay",
  description: "Browse Japanese animated series available on Doomsplay."
};

export const dynamic = "force-dynamic";

export default async function AnimePage() {
  const initialData = await getAnime(1);
  return <AnimeClient initialData={initialData} />;
}
