import { NextResponse } from "next/server";
import { getLiveChannels } from "@/lib/livetv";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const rawBaseUrl = process.env.LIVE_TV_API_URL?.trim() || "";
  const hasEnv = Boolean(rawBaseUrl);

  const formattedUrl = rawBaseUrl
    ? (rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
        ? rawBaseUrl
        : `https://${rawBaseUrl}`
      ).replace(/\/+$/, "")
    : "";

  const fetchStatuses: Record<string, number | string> = {};
  let errorMsg: string | undefined;

  if (formattedUrl) {
    const endpoints = ["streams.json", "channels.json", "logos.json", "feeds.json"];
    await Promise.all(
      endpoints.map(async (ep) => {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 10000);
          const res = await fetch(`${formattedUrl}/${ep}`, {
            cache: "no-store",
            signal: controller.signal,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              Accept: "application/json, text/plain, */*"
            }
          });
          clearTimeout(timer);
          fetchStatuses[ep] = res.status;
        } catch (err: any) {
          fetchStatuses[ep] = err?.name === "AbortError" ? "TIMEOUT_10S" : `ERROR: ${err?.message || "fetch_failed"}`;
        }
      })
    );
  }

  let channels: any[] = [];
  try {
    channels = await getLiveChannels();
  } catch (err: any) {
    errorMsg = err?.message || String(err);
  }

  const isSample =
    channels.length <= 4 &&
    channels.some((c) => c.id && c.id.startsWith("sample-"));

  return NextResponse.json({
    hasEnv,
    baseUrl: formattedUrl || "NOT_SET",
    fetchStatuses,
    channelCount: channels.length,
    usedSample: isSample,
    error: errorMsg
  });
}
