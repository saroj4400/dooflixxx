import { LiveChannel } from "@/types/livetv";

const INDIA = "IN";

// Common Indian language code mappings
const LANGUAGE_NAME_MAP: Record<string, string> = {
  hin: "Hindi",
  eng: "English",
  tam: "Tamil",
  tel: "Telugu",
  ben: "Bengali",
  mal: "Malayalam",
  kan: "Kannada",
  mar: "Marathi",
  guj: "Gujarati",
  pan: "Punjabi",
  ori: "Odia",
  urd: "Urdu",
  asm: "Assamese",
  bho: "Bhojpuri",
  nep: "Nepali",
  san: "Sanskrit"
};

let languageDisplayNames: Intl.DisplayNames | null = null;

function resolveLanguageName(code: string): string {
  const normalized = code.toLowerCase().trim();
  if (LANGUAGE_NAME_MAP[normalized]) {
    return LANGUAGE_NAME_MAP[normalized];
  }
  try {
    if (!languageDisplayNames) {
      languageDisplayNames = new Intl.DisplayNames(["en"], { type: "language" });
    }
    const name = languageDisplayNames.of(normalized);
    if (name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  } catch {
    // fallback
  }
  return normalized ? normalized.toUpperCase() : "Hindi";
}

// Built-in sample channels (India only)
const SAMPLE_CHANNELS: LiveChannel[] = [
  {
    id: "sample-dd-india",
    name: "DD India HD",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Doordarshan_logo.svg/512px-Doordarshan_logo.svg.png",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    category: "News",
    country: "IN",
    language: "English",
    languages: ["English", "Hindi"]
  },
  {
    id: "sample-dd-national",
    name: "DD National",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Doordarshan_logo.svg/512px-Doordarshan_logo.svg.png",
    streamUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    category: "Entertainment",
    country: "IN",
    language: "Hindi",
    languages: ["Hindi"]
  },
  {
    id: "sample-dd-sports",
    name: "DD Sports Live",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Doordarshan_logo.svg/512px-Doordarshan_logo.svg.png",
    streamUrl: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    category: "Sports",
    country: "IN",
    language: "Hindi",
    languages: ["Hindi", "English"]
  },
  {
    id: "sample-247-movies",
    name: "24/7 Live Cinema",
    logo: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80",
    streamUrl: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    category: "Movies",
    country: "IN",
    language: "Hindi",
    languages: ["Hindi"]
  }
];

// Prettify category for display (capitalize first letter, replace '-' & '_' with spaces, title-case words)
export function formatCategory(raw?: string): string {
  const text = (raw || "general").trim();
  return text
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface RawChannel {
  id: string;
  name: string;
  alt_names?: string[];
  network?: string;
  owners?: string[];
  country?: string;
  categories?: string[];
  languages?: string[];
  is_nsfw?: boolean;
  launched?: string;
  closed?: string | null;
  replaced_by?: string;
  website?: string;
}

interface RawLogo {
  channel: string;
  url: string;
}

interface RawFeed {
  channel: string;
  id?: string;
  name?: string;
  is_main?: boolean;
  broadcast_area?: string[];
  timezones?: string[];
  languages?: string[];
  format?: string;
}

interface RawStream {
  channel?: string | null;
  url: string;
  user_agent?: string | null;
  referrer?: string | null;
  http_referrer?: string | null;
}

// Module-level in-memory cache with 30-minute TTL (only stores successful real Indian channels)
let cachedChannels: LiveChannel[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Fetch with 20-second AbortController timeout and standard User-Agent header
 */
async function fetchWithTimeout(url: string, timeoutMs = 20000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*"
      }
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch and return live channels with in-memory caching and fallback (India only).
 */
export async function getLiveChannels(): Promise<LiveChannel[]> {
  const rawBaseUrl = process.env.LIVE_TV_API_URL?.trim();

  if (!rawBaseUrl) {
    console.log("[livetv] LIVE_TV_API_URL is not set. Returning sample fallback channels.");
    return SAMPLE_CHANNELS;
  }

  // Return in-memory cached channels only if valid and has real data
  const now = Date.now();
  if (cachedChannels && cachedChannels.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedChannels;
  }

  try {
    const formattedUrl = rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
      ? rawBaseUrl
      : `https://${rawBaseUrl}`;
    const baseUrl = formattedUrl.replace(/\/+$/, "");

    console.log(`[livetv] Starting parallel fetch from baseUrl: ${baseUrl}`);

    const [streamsRes, channelsRes, logosRes, feedsRes] = await Promise.all([
      fetchWithTimeout(`${baseUrl}/streams.json`, 20000).catch((err) => {
        console.warn("[livetv] Error fetching streams.json:", err?.message || err);
        return { ok: false, status: err?.name === "AbortError" ? 408 : 500, json: async () => [] } as unknown as Response;
      }),
      fetchWithTimeout(`${baseUrl}/channels.json`, 20000).catch((err) => {
        console.warn("[livetv] Error fetching channels.json:", err?.message || err);
        return { ok: false, status: err?.name === "AbortError" ? 408 : 500, json: async () => [] } as unknown as Response;
      }),
      fetchWithTimeout(`${baseUrl}/logos.json`, 20000).catch((err) => {
        console.warn("[livetv] Error fetching logos.json:", err?.message || err);
        return { ok: false, status: err?.name === "AbortError" ? 408 : 500, json: async () => [] } as unknown as Response;
      }),
      fetchWithTimeout(`${baseUrl}/feeds.json`, 20000).catch((err) => {
        console.warn("[livetv] Error fetching feeds.json:", err?.message || err);
        return null;
      })
    ]);

    const feedsStatus = feedsRes ? feedsRes.status : "N/A";
    console.log(
      `[livetv] Fetches completed: streams=${streamsRes.status}, channels=${channelsRes.status}, logos=${logosRes.status}, feeds=${feedsStatus}`
    );

    if (!streamsRes.ok || !channelsRes.ok || !logosRes.ok) {
      console.warn(
        `[livetv] Failed to fetch one or more sources. streams=${streamsRes.status}, channels=${channelsRes.status}, logos=${logosRes.status}, feeds=${feedsStatus}. Returning sample list for this request only.`
      );
      return cachedChannels && cachedChannels.length > 0 ? cachedChannels : SAMPLE_CHANNELS;
    }

    const [rawStreams, rawChannels, rawLogos] = await Promise.all([
      streamsRes.json() as Promise<RawStream[]>,
      channelsRes.json() as Promise<RawChannel[]>,
      logosRes.json() as Promise<RawLogo[]>
    ]);

    let rawFeeds: RawFeed[] = [];
    if (feedsRes && feedsRes.ok) {
      try {
        rawFeeds = (await feedsRes.json()) as RawFeed[];
      } catch (feedErr) {
        console.warn("[livetv] Failed to parse feeds.json:", feedErr);
      }
    }

    // 1. Filter channels: India ONLY (country === "IN"), skip nsfw and closed channels
    const channelsById = new Map<string, RawChannel>();
    for (const ch of rawChannels) {
      if (ch.country !== INDIA) {
        continue;
      }
      const isClosed = typeof ch.closed === "string" ? ch.closed.trim() !== "" : Boolean(ch.closed);
      if (ch.is_nsfw === true || isClosed) {
        continue;
      }
      if (ch.id) {
        channelsById.set(ch.id, ch);
      }
    }

    // 2. Map logos by channel (first logo per channel)
    const logoByChannel = new Map<string, string>();
    for (const logo of rawLogos) {
      if (logo.channel && logo.url && !logoByChannel.has(logo.channel)) {
        logoByChannel.set(logo.channel, logo.url);
      }
    }

    // 3. Map feeds by channel (prefer main feed, fallback to first feed)
    const feedLanguagesByChannel = new Map<string, string[]>();
    for (const feed of rawFeeds) {
      if (!feed.channel || !Array.isArray(feed.languages) || feed.languages.length === 0) {
        continue;
      }
      const resolvedNames = feed.languages.map(resolveLanguageName).filter(Boolean);
      if (resolvedNames.length === 0) continue;

      if (feed.is_main || !feedLanguagesByChannel.has(feed.channel)) {
        feedLanguagesByChannel.set(feed.channel, resolvedNames);
      }
    }

    // 4. For each stream in streams.json
    const seenChannelIds = new Set<string>();
    const channels: LiveChannel[] = [];

    for (const stream of rawStreams) {
      if (!stream.channel || !channelsById.has(stream.channel)) {
        continue;
      }

      if (stream.user_agent || stream.referrer || stream.http_referrer) {
        continue;
      }

      if (!stream.url || !stream.url.includes(".m3u8")) {
        continue;
      }

      if (stream.url.startsWith("http://")) {
        continue;
      }

      if (seenChannelIds.has(stream.channel)) {
        continue;
      }

      seenChannelIds.add(stream.channel);

      const channel = channelsById.get(stream.channel)!;
      const altNames = Array.isArray(channel.alt_names)
        ? channel.alt_names.filter((name) => typeof name === "string" && name.trim() !== "")
        : undefined;

      let resolvedLangs = feedLanguagesByChannel.get(channel.id);
      if (!resolvedLangs || resolvedLangs.length === 0) {
        if (Array.isArray(channel.languages) && channel.languages.length > 0) {
          resolvedLangs = channel.languages.map(resolveLanguageName).filter(Boolean);
        }
      }
      if (!resolvedLangs || resolvedLangs.length === 0) {
        resolvedLangs = ["Hindi"];
      }

      channels.push({
        id: channel.id,
        name: channel.name,
        altNames: altNames && altNames.length > 0 ? altNames : undefined,
        logo: logoByChannel.get(channel.id) || undefined,
        streamUrl: stream.url,
        category: formatCategory(channel.categories?.[0]),
        country: "IN",
        language: resolvedLangs[0],
        languages: resolvedLangs
      });
    }

    // Sort alphabetically by channel name
    channels.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    console.log(`[livetv] Successfully loaded ${channels.length} Indian channels.`);

    // Only cache if we found real channels (never cache sample list)
    if (channels.length > 0) {
      cachedChannels = channels;
      cacheTimestamp = Date.now();
      return channels;
    }

    console.warn("[livetv] 0 Indian channels matched filters. Returning sample list for this request only.");
    return SAMPLE_CHANNELS;
  } catch (error: any) {
    console.error("[livetv] Error in getLiveChannels:", error?.message || error);
    return cachedChannels && cachedChannels.length > 0 ? cachedChannels : SAMPLE_CHANNELS;
  }
}

/**
 * Helper to fetch a single live channel by ID.
 */
export async function getLiveChannelById(id: string): Promise<LiveChannel | null> {
  const channels = await getLiveChannels();
  return channels.find((c) => c.id === id) || null;
}
