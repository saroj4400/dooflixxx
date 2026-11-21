import type { StreamRequest, StreamSource, StreamingProvider, ProviderTitle } from "../types";

const PROVIDER_ID = "hdmovie2";
const PROVIDER_NAME = "HDMovie2";
const DEFAULT_BASE_URL = "https://hdmovie2a.biz";
const TIMEOUT_MS = 10_000;

type SearchHit = { url: string; title: string; year?: number; kind: "movie" | "tv" };

function baseUrl(): URL {
  const raw = process.env.HDMOVIE2_BASE_URL?.trim() || DEFAULT_BASE_URL;
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("HDMovie2 must use HTTPS");
  return url;
}

function allowedHosts(): string[] {
  const values = process.env.HDMOVIE2_MEDIA_HOSTS?.split(",").map((host) => host.trim().toLowerCase()).filter(Boolean) ?? [];
  return [...new Set([baseUrl().hostname, ...values])];
}

function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&amp;/gi, "&").replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"').replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\s+/g, " ").trim();
}

function decodeUrl(value: string): string {
  return value.replace(/\\\//g, "/").replace(/\\u0026/gi, "&").replace(/&amp;/gi, "&")
    .replace(/&#0*58;/gi, ":").replace(/&#0*47;/gi, "/").replace(/&quot;/gi, '"');
}

function normalizedTitle(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim();
}

function titleSimilarity(left: string, right: string): number {
  const a = normalizedTitle(left);
  const b = normalizedTitle(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const as = new Set(a.split(" "));
  const bs = new Set(b.split(" "));
  const intersection = [...as].filter((word) => bs.has(word)).length;
  return (2 * intersection) / (as.size + bs.size);
}

function supportedUrl(raw: string, base: URL): { url: string; kind: StreamSource["kind"] } | null {
  try {
    const url = new URL(decodeUrl(raw), base);
    if (url.protocol !== "https:" || !allowedHosts().includes(url.hostname.toLowerCase())) return null;
    if (/\.m3u8(?:$|[?#])/i.test(url.href)) return { url: url.href, kind: "hls" };
    if (/\.mp4(?:$|[?#])/i.test(url.href)) return { url: url.href, kind: "mp4" };
    return null;
  } catch {
    return null;
  }
}

function extractSources(raw: unknown, base: URL, title: string): StreamSource[] {
  const response = decodeUrl(typeof raw === "string" ? raw : JSON.stringify(raw ?? ""));
  const urls = new Set<string>();
  const directPattern = /https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?/gi;
  for (const match of response.matchAll(directPattern)) urls.add(match[0]);
  const iframePattern = /(?:src|embed_url)\s*[=:]\s*["']([^"']+)["']/gi;
  for (const match of response.matchAll(iframePattern)) urls.add(match[1]);
  if (typeof raw === "object" && raw !== null) {
    const embedUrl = (raw as { embed_url?: unknown }).embed_url;
    if (typeof embedUrl === "string") urls.add(embedUrl);
  }

  const result: StreamSource[] = [];
  for (const rawUrl of urls) {
    const decoded = decodeUrl(rawUrl);
    const direct = supportedUrl(decoded, base);
    if (direct) {
      result.push({ id: `${PROVIDER_ID}-${result.length}`, providerId: PROVIDER_ID, providerName: PROVIDER_NAME, title, url: direct.url, kind: direct.kind });
      continue;
    }
    try {
      const embed = new URL(decoded, base);
      if (embed.protocol !== "https:" || !allowedHosts().includes(embed.hostname.toLowerCase())) continue;
      result.push({ id: `${PROVIDER_ID}-embed-${result.length}`, providerId: PROVIDER_ID, providerName: PROVIDER_NAME, title: `${title} (embedded player)`, url: embed.href, kind: "iframe", requiresProviderPlayer: true });
    } catch {
      // Ignore malformed and untrusted player values.
    }
  }
  return result;
}

async function fetchText(url: URL, init: RequestInit = {}): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "error",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Doomsplay/1.0)",
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
        ...(init.headers || {}),
      },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HDMovie2 returned HTTP ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseSearch(html: string, base: URL, kind: "movie" | "tv"): SearchHit[] {
  const hits: SearchHit[] = [];
  const articlePattern = /<article\b[\s\S]*?<\/article>/gi;
  for (const articleMatch of html.matchAll(articlePattern)) {
    const article = articleMatch[0];
    const href = article.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
    const title = article.match(/(?:title|data-title)=["']([^"']+)["']/i)?.[1]
      ?? article.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1];
    if (!href || !title) continue;
    try {
      const url = new URL(decodeUrl(href), base);
      if (url.hostname !== base.hostname || url.protocol !== "https:") continue;
      const cleanTitle = plainText(title);
      const year = Number(article.match(/(?:year|release)[^>]*>\s*(\d{4})/i)?.[1] ?? article.match(/\b(19\d{2}|20\d{2})\b/)?.[1]) || undefined;
      hits.push({ url: url.href, title: cleanTitle, year, kind });
    } catch {
      // Ignore malformed result cards.
    }
  }
  return hits;
}

async function search(title: string, kind: "movie" | "tv"): Promise<SearchHit[]> {
  if (!title.trim()) return [];
  const base = baseUrl();
  const searchUrl = new URL("/", base);
  searchUrl.searchParams.set("s", title.trim());
  searchUrl.searchParams.set("post_type", kind === "tv" ? "tvshows" : "movies");
  const html = await fetchText(searchUrl, { headers: { Referer: base.href, Origin: base.origin } });
  return parseSearch(html, base, kind);
}

function bestHit(hits: SearchHit[], request: StreamRequest): SearchHit | null {
  const titles = [request.title, ...(request.titleVariants ?? [])].filter((value): value is string => Boolean(value?.trim()));
  const ranked = hits
    .filter((hit) => hit.kind === request.mediaType)
    .map((hit) => ({ hit, score: Math.max(...titles.map((title) => titleSimilarity(hit.title, title))) + (request.year && hit.year === request.year ? 0.15 : 0) }))
    .filter(({ hit, score }) => score >= 0.8 && (!request.year || !hit.year || Math.abs(hit.year - request.year) <= 1))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.hit ?? null;
}

function playerOptions(html: string, request: StreamRequest): Array<{ post: string; nume: string; type: string }> {
  const entries: Array<{ post: string; nume: string; type: string }> = [];
  const pattern = /<[^>]+(?:data-post|data-id)=["'](\d+)["'][^>]*>/gi;
  for (const match of html.matchAll(pattern)) {
    const tag = match[0];
    const nume = tag.match(/data-nume=["'](\d+)["']/i)?.[1] ?? "0";
    const type = tag.match(/data-type=["']([^"']+)["']/i)?.[1] ?? (request.mediaType === "tv" ? "tv" : "movie");
    const season = tag.match(/data-season=["'](\d+)["']/i)?.[1];
    const episode = tag.match(/data-episode=["'](\d+)["']/i)?.[1];
    if (request.mediaType === "tv" && (!season || !episode || Number(season) !== request.season || Number(episode) !== request.episode)) continue;
    entries.push({ post: match[1], nume, type });
  }
  const post = html.match(/(?:data-post|post_id)["'\s:=]+(\d+)/i)?.[1];
  if (!entries.length && post && request.mediaType === "movie") entries.push({ post, nume: "0", type: "movie" });
  return [...new Map(entries.map((entry) => [`${entry.post}:${entry.nume}:${entry.type}`, entry])).values()];
}

async function resolveDetail(hit: SearchHit, request: StreamRequest): Promise<StreamSource[]> {
  const base = baseUrl();
  const detailUrl = new URL(hit.url);
  const html = await fetchText(detailUrl, { headers: { Referer: base.href, Origin: base.origin } });
  const options = playerOptions(html, request);
  const found: StreamSource[] = [];
  for (const option of options.slice(0, 8)) {
    const ajax = new URL("/wp-admin/admin-ajax.php", base);
    const body = new URLSearchParams({ action: "doo_player_ajax", post: option.post, nume: option.nume, type: option.type });
    const response = await fetchText(ajax, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Referer: detailUrl.href,
        Origin: base.origin,
      },
      body,
    });
    let payload: unknown = response;
    try { payload = JSON.parse(response) as unknown; } catch { /* HTML or plain URL response */ }
    found.push(...extractSources(payload, base, `${request.title || hit.title}${request.mediaType === "tv" ? ` S${request.season}E${request.episode}` : ""}`));
  }
  return found;
}

async function getStreams(request: StreamRequest): Promise<StreamSource[]> {
  if (request.mediaType === "tv" && (!request.season || !request.episode)) return [];
  if (!request.title) throw new Error("A title is required to match HDMovie2 content");
  const queries = [...new Set([request.title, ...(request.titleVariants ?? [])].filter(Boolean))].slice(0, 4);
  const searchResults = await Promise.all(queries.map((query) => search(query, request.mediaType)));
  const hit = bestHit(searchResults.flat(), request);
  if (!hit) return [];
  return resolveDetail(hit, request);
}

function toProviderTitle(hit: SearchHit, query: string): ProviderTitle {
  return { tmdbId: "", mediaType: hit.kind, title: hit.title, year: hit.year, overview: `Matched against “${query}” by title and release year.` };
}

export const hdmovie2Provider: StreamingProvider = {
  id: PROVIDER_ID,
  name: PROVIDER_NAME,
  enabled: process.env.HDMOVIE2_ENABLED !== "false",
  supports: { movie: true, tv: true },
  allowedHosts: allowedHosts(),
  isConfigured: () => Boolean(process.env.HDMOVIE2_BASE_URL?.trim() || DEFAULT_BASE_URL),
  async searchMovie(query) { return (await search(query, "movie")).map((hit) => toProviderTitle(hit, query)); },
  async searchSeries(query) { return (await search(query, "tv")).map((hit) => toProviderTitle(hit, query)); },
  async getMovieStreams(request) { return getStreams({ ...request, mediaType: "movie" }); },
  async getEpisodeStreams(request) { return getStreams({ ...request, mediaType: "tv" }); },
};
