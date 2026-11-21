import { Metadata } from "next";
import { getLiveChannels } from "@/lib/livetv";
import { LiveTVClient } from "@/components/LiveTVClient";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Live TV — doomsplay",
  description: "Watch live television channels, sports, news, and entertainment on doomsplay."
};

export default async function LiveTVPage() {
  const channels = await getLiveChannels();
  return <LiveTVClient initialChannels={channels} />;
}
