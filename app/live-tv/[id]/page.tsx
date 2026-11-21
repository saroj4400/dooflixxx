import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLiveChannels, getLiveChannelById } from "@/lib/livetv";
import { LiveTVClient } from "@/components/LiveTVClient";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const channel = await getLiveChannelById(id);

  if (!channel) {
    return {
      title: "Channel Not Found — Live TV | doomsplay"
    };
  }

  return {
    title: `${channel.name} — Live TV | doomsplay`,
    description: `Watch ${channel.name} (${channel.category}) live stream in high quality on doomsplay.`
  };
}

export default async function LiveChannelPage({ params }: Props) {
  const { id } = await params;
  const [channels, channel] = await Promise.all([
    getLiveChannels(),
    getLiveChannelById(id)
  ]);

  if (!channel) {
    notFound();
  }

  return <LiveTVClient initialChannels={channels} initialChannelId={id} />;
}
