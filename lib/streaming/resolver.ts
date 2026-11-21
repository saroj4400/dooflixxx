import type { StreamRequest, StreamSource, StreamingProvider } from "./types";
import { isSafePlaybackUrl, normalizeSource } from "./safety";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;

function hostAllowed(hostname: string, allowedHosts: string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return allowedHosts.some((allowed) => allowed.toLowerCase().replace(/\.$/, "") === host);
}

function mediaKindFromContentType(value: string | null): Exclude<StreamSource["kind"], "iframe"> | null {
  const mime = value?.split(";", 1)[0].trim().toLowerCase();
  if (["application/vnd.apple.mpegurl", "application/x-mpegurl", "audio/mpegurl", "application/mpegurl"].includes(mime || "")) return "hls";
  if (mime === "application/dash+xml") return "dash";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
  return null;
}

async function requestHeaders(url: URL, fetcher: typeof fetch): Promise<Response> {
  let response = await fetcher(url.toString(), { method: "HEAD", redirect: "manual" });
  if (response.status !== 405 && response.status !== 501) return response;
  await response.body?.cancel();
  response = await fetcher(url.toString(), {
    method: "GET",
    headers: { Range: "bytes=0-0" },
    redirect: "manual",
  });
  await response.body?.cancel();
  return response;
}

/**
 * Follow only explicitly allowlisted provider redirects. This checks response MIME
 * before a URL reaches the player, so an HTML interstitial is never treated as media.
 */
export async function resolveAuthorizedRedirect(
  rawUrl: string,
  allowedHosts: string[],
  fetcher: typeof fetch = fetch,
): Promise<{ url: string; kind: Exclude<StreamSource["kind"], "iframe"> } | null> {
  if (!allowedHosts.length || !isSafePlaybackUrl(rawUrl)) return null;
  let current: URL;
  try {
    current = new URL(rawUrl);
  } catch {
    return null;
  }

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    if (!isSafePlaybackUrl(current.toString()) || !hostAllowed(current.hostname, allowedHosts)) return null;
    let response: Response;
    try {
      response = await requestHeaders(current, fetcher);
    } catch {
      return null;
    }

    if (REDIRECT_STATUSES.has(response.status)) {
      if (redirectCount === MAX_REDIRECTS) return null;
      const location = response.headers.get("location");
      if (!location) return null;
      try {
        current = new URL(location, current);
      } catch {
        return null;
      }
      continue;
    }

    if (!response.ok) return null;
    const kind = mediaKindFromContentType(response.headers.get("content-type"));
    return kind ? { url: current.toString(), kind } : null;
  }
  return null;
}

/** Resolve a source only through its registered provider and declared host allowlist. */
export async function resolveProviderSource(
  source: StreamSource,
  provider: StreamingProvider,
  request: StreamRequest,
  fetcher: typeof fetch = fetch,
): Promise<StreamSource | null> {
  if (source.providerId !== provider.id || source.providerName !== provider.name) return null;
  const providerSource = provider.resolve ? await provider.resolve(source, request) : source;
  if (!providerSource) return null;
  const normalized = normalizeSource(providerSource);
  if (!normalized || !provider.allowedHosts?.length) return null;

  let url: URL;
  try {
    url = new URL(normalized.url);
  } catch {
    return null;
  }
  if (!hostAllowed(url.hostname, provider.allowedHosts)) return null;

  if (normalized.kind === "iframe") {
    return normalized.requiresProviderPlayer ? normalized : null;
  }

  const resolved = await resolveAuthorizedRedirect(normalized.url, provider.allowedHosts, fetcher);
  if (!resolved) return null;
  return { ...normalized, url: resolved.url, kind: resolved.kind };
}
