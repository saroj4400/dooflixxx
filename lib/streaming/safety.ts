import type { StreamSource } from "./types";

/** Accept only public HTTPS playback URLs. This prevents accidental localhost/private-network URLs. */
export function isSafePlaybackUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
    // Provider streams must resolve through a public hostname, never a literal IP.
    if (/^[\d.]+$/.test(host) || host.includes(":") || host.startsWith("[")) return false;
    return true;
  } catch {
    return false;
  }
}

export function normalizeSource(source: StreamSource): StreamSource | null {
  if (!source.id || !source.providerId || !source.providerName || !source.title) return null;
  if (!isSafePlaybackUrl(source.url)) return null;
  if (!["hls", "dash", "mp4", "webm", "iframe"].includes(source.kind)) return null;
  const subtitles = source.subtitles?.filter((track) =>
    Boolean(track.label && track.language && isSafePlaybackUrl(track.url))
  );
  return { ...source, url: new URL(source.url).toString(), subtitles };
}
