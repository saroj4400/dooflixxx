/**
 * CineMate Telegram Playback Service (Server-Side Only)
 *
 * Server 11 represents an authorized private Telegram channel containing content
 * that the site owner is authorized to distribute.
 *
 * SECURITY:
 * - TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must NEVER be exposed to client-side code.
 * - Do not prefix environment variables with NEXT_PUBLIC_.
 * - All Telegram API communication occurs strictly on the server.
 */

export interface TelegramMediaRef {
  tmdbId: string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  fileId: string;
  messageId?: number;
  caption?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface TelegramStreamInfo {
  streamUrl: string;
  title?: string;
  fileSize?: number;
}

/**
 * Registry of authorized media located in your private Telegram channel.
 *
 * Key format:
 * - Movies: "movie:{tmdb_id}" (e.g. "movie:550")
 * - TV episodes: "tv:{tmdb_id}:s{season}e{episode}" (e.g. "tv:1399:s1e1")
 *
 * You can register Telegram file IDs or message IDs of authorized content here.
 */
export const authorizedTelegramCatalog: Record<
  string,
  {
    fileId: string;
    messageId?: number;
    caption?: string;
    mimeType?: string;
  }
> = {
  // TODO: Add your authorized Telegram channel media file/message references here.
  // Example:
  // "movie:550": {
  //   fileId: "BAACAgIAAxkBAAI...",
  //   messageId: 42,
  //   caption: "Authorized Fight Club Stream",
  //   mimeType: "video/mp4"
  // }
};

/**
 * Generates the catalog key for lookup
 */
export function getTelegramCatalogKey(
  tmdbId: string,
  type: "movie" | "tv",
  season?: number,
  episode?: number
): string {
  if (type === "tv") {
    return `tv:${tmdbId}:s${season || 1}e${episode || 1}`;
  }
  return `movie:${tmdbId}`;
}

/**
 * Checks if Telegram environment configuration is present
 */
export function isTelegramConfigured(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  return Boolean(token && channelId);
}

/**
 * Identifies authorized media associated with a TMDB movie or TV episode
 * Returns TelegramMediaRef if available, or null when not found.
 */
export async function getAuthorizedTelegramMedia(params: {
  tmdbId: string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
}): Promise<TelegramMediaRef | null> {
  const { tmdbId, type, season, episode } = params;

  // Telegram credentials must be configured on the server
  if (!isTelegramConfigured()) {
    return null;
  }

  const key = getTelegramCatalogKey(tmdbId, type, season, episode);
  const catalogEntry = authorizedTelegramCatalog[key];

  if (!catalogEntry || !catalogEntry.fileId) {
    return null;
  }

  return {
    tmdbId,
    type,
    season,
    episode,
    fileId: catalogEntry.fileId,
    messageId: catalogEntry.messageId,
    caption: catalogEntry.caption,
    mimeType: catalogEntry.mimeType || "video/mp4"
  };
}

/**
 * Resolves the internal Telegram Bot API file download URL on the server.
 * WARNING: The returned URL contains the bot token and MUST NOT be exposed to the client.
 */
export async function getTelegramDirectFileUrl(fileId: string): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !fileId) {
    return null;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`);
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data.ok || !data.result?.file_path) {
      return null;
    }

    return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
  } catch (error) {
    console.error("Error retrieving Telegram file path:", error);
    return null;
  }
}
