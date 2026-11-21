/**
 * Unified static endpoint & provider reference extracted from DooFlix_v10.5_Fm.apk.
 *
 * IMPORTANT:
 * - "UNCONFIRMED" means the APK contains the endpoint string,
 *   but static string extraction does not prove its HTTP method.
 * - "observed" means a URL/string was present in the APK, not that it is live.
 * - Domain-only entries are not confirmed scraper APIs.
 * - Parameters and headers below are observed strings, not
 *   confirmed mappings to every endpoint.
 * - This is an inspection inventory, not a working scraper.
 * - No third-party movie/TV scraping or resolver calls are wired here.
 *   Connect only catalogs and media sources you own or are licensed to use.
 */

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "UNCONFIRMED";

export type EndpointEvidence = "URL observed" | "Path observed";

export type ProviderKind =
  | "metadata"
  | "account"
  | "media-host"
  | "scraper-domain"
  | "app-backend";

export type ProviderEvidence =
  | "confirmed-url-string"
  | "domain-only"
  | "path-pattern"
  | "inferred";

export interface EndpointRecord {
  name: string;
  baseUrl?: string;
  path: string;
  method: HttpMethod;
  parameters: string[];
  headers: string[];
  evidence: EndpointEvidence;
}

export interface ProviderDetail {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl?: string;
  domains: string[];
  endpoints: Record<string, string>;
  evidence: ProviderEvidence;
  notes: string;
  enabled: boolean;
}

export const observedHeaders = [
  "User-Agent",
  "Referer",
  "Origin",
  "Content-Type",
  "Accept",
  "Authorization",
  "Cookie",
  "X-Requested-With",
  "X-Req-Nonce",
] as const;

export const observedParameterNames = [
  "tmdb_id",
  "season",
  "episode",
  "action",
  "api_key",
  "key",
  "token",
  "url",
  "type",
  "quality",
  "source",
  "server",
  "year",
  "language",
  "arg_season",
  "arg_episode",
  "enableNonce",
  "nonce",
] as const;

export const observedHttpMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

export const endpoints: EndpointRecord[] = [
  // Metadata services
  {
    name: "TMDB API",
    baseUrl: "https://api.themoviedb.org/3/",
    path: "/3/",
    method: "UNCONFIRMED",
    parameters: ["api_key", "tmdb_id", "language"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "TMDB TV",
    baseUrl: "https://api.themoviedb.org/3/tv/",
    path: "/3/tv/",
    method: "UNCONFIRMED",
    parameters: ["api_key", "language"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "Trakt API",
    baseUrl: "https://api.trakt.tv/",
    path: "/",
    method: "UNCONFIRMED",
    parameters: ["client_id", "redirect_uri"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "Trakt OAuth authorize",
    baseUrl: "https://api.trakt.tv",
    path: "/oauth/authorize",
    method: "UNCONFIRMED",
    parameters: ["response_type", "client_id", "redirect_uri"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "Trakt OAuth token",
    baseUrl: "https://api.trakt.tv",
    path: "/oauth/token",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },

  // Provider/service endpoint strings
  {
    name: "PlayLT API",
    baseUrl: "https://api-plhq.playlt.xyz/apiv5/",
    path: "/apiv5/",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "HDMovie2 AJAX",
    baseUrl: "https://hdmovie2a.biz",
    path: "/wp-admin/admin-ajax.php",
    method: "UNCONFIRMED",
    parameters: ["action", "tmdb_id", "season", "episode"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "CercaFilm source",
    baseUrl: "https://cercafilm.net",
    path: "/api/source/",
    method: "UNCONFIRMED",
    parameters: ["url", "type"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "PixelDrain file API",
    baseUrl: "https://pixeldrain.com",
    path: "/api/file/",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "GoFile accounts",
    baseUrl: "https://api.gofile.io",
    path: "/accounts",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "GoFile create account",
    baseUrl: "https://api.gofile.io",
    path: "/createAccount",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "GoFile contents",
    baseUrl: "https://api.gofile.io",
    path: "/contents/",
    method: "UNCONFIRMED",
    parameters: ["contentId"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "GoFile get content",
    baseUrl: "https://api.gofile.io",
    path: "/getContent",
    method: "UNCONFIRMED",
    parameters: ["contentId"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "VidSrc episode AJAX",
    baseUrl: "https://vidsrc2.to",
    path: "/ajax/embed/episode/",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "Vicloud API",
    baseUrl: "https://vicloud.sbs",
    path: "/api/",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "VideoVard download API",
    baseUrl: "https://videovard.to",
    path: "/api/make/download/",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "Tau Video API",
    baseUrl: "https://tau-video.xyz",
    path: "/api/video/",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "Userload API",
    baseUrl: "https://userload.co",
    path: "/api/request/",
    method: "UNCONFIRMED",
    parameters: [],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },
  {
    name: "Linkbox file detail",
    baseUrl: "https://www.linkbox.to",
    path: "/api/file/detail",
    method: "UNCONFIRMED",
    parameters: ["itemId"],
    headers: [...observedHeaders],
    evidence: "URL observed",
  },

  // Generic route templates found in the APK
  {
    name: "Movie links route template",
    path: "/api/{provider}/movie/{id}/links",
    method: "UNCONFIRMED",
    parameters: ["provider", "id"],
    headers: [...observedHeaders],
    evidence: "Path observed",
  },
  {
    name: "Movie download-links route template",
    path: "/api/{provider}/movie/{id}/download-links",
    method: "UNCONFIRMED",
    parameters: ["provider", "id"],
    headers: [...observedHeaders],
    evidence: "Path observed",
  },
  {
    name: "TV episode links route template",
    path: "/api/{provider}/tv/{id}/season/{season}/episode/{episode}/links",
    method: "UNCONFIRMED",
    parameters: ["provider", "id", "season", "episode"],
    headers: [...observedHeaders],
    evidence: "Path observed",
  },
  {
    name: "TV episode download-links route template",
    path: "/api/{provider}/tv/{id}/season/{season}/episode/{episode}/download-links",
    method: "UNCONFIRMED",
    parameters: ["provider", "id", "season", "episode"],
    headers: [...observedHeaders],
    evidence: "Path observed",
  },
  {
    name: "Video stream route",
    path: "/api/video/stream/get",
    method: "UNCONFIRMED",
    parameters: ["url", "type", "quality"],
    headers: [...observedHeaders],
    evidence: "Path observed",
  },
  {
    name: "Video API route",
    path: "/api/v1/video",
    method: "UNCONFIRMED",
    parameters: ["id"],
    headers: [...observedHeaders],
    evidence: "Path observed",
  },
  {
    name: "AJAX search",
    path: "/ajax_search.php",
    method: "UNCONFIRMED",
    parameters: ["key", "type"],
    headers: [...observedHeaders],
    evidence: "Path observed",
  },
  {
    name: "Direct download AJAX",
    path: "/ajax.php?ajax=direct-download",
    method: "UNCONFIRMED",
    parameters: ["ajax", "url"],
    headers: [...observedHeaders],
    evidence: "Path observed",
  },
];

export const APP_BACKEND = {
  baseUrl: "https://api-plhq.playlt.xyz/apiv5/",
  // The APK contains the path below; request method and full parameter schema
  // were not established from the string scan.
  endpoints: {
    videoStreamGet: "api/video/stream/get",
  },
} as const;

export const APP_BACKEND_PROVIDER: ProviderDetail = {
  id: "app-backend",
  name: "PlayLT / App Backend",
  kind: "app-backend",
  baseUrl: APP_BACKEND.baseUrl,
  domains: ["api-plhq.playlt.xyz"],
  endpoints: {
    apiRoot: "/apiv5/",
    videoStreamGet: APP_BACKEND.endpoints.videoStreamGet,
  },
  evidence: "confirmed-url-string",
  notes:
    "Base URL and video stream route observed in static APK scan; request method and full parameter schema were not established.",
  enabled: false,
};

export const METADATA_PROVIDERS: ProviderDetail[] = [
  {
    id: "tmdb",
    name: "The Movie Database (TMDB)",
    kind: "metadata",
    baseUrl: "https://api.themoviedb.org/3/",
    domains: ["api.themoviedb.org", "image.tmdb.org"],
    endpoints: {
      apiRoot: "/3/",
      tv: "/3/tv/",
      images: "https://image.tmdb.org/",
    },
    evidence: "confirmed-url-string",
    notes:
      "API root and TV path observed. API key is required; image host is a separate CDN.",
    enabled: true,
  },
  {
    id: "trakt",
    name: "Trakt",
    kind: "account",
    baseUrl: "https://api.trakt.tv/",
    domains: ["api.trakt.tv", "trakt.tv"],
    endpoints: {
      apiRoot: "/",
      oauthAuthorize: "/oauth/authorize",
      oauthToken: "/oauth/token",
    },
    evidence: "confirmed-url-string",
    notes:
      "OAuth authorize/token URLs observed. Trakt API version and client headers are required.",
    enabled: true,
  },
  {
    id: "gofile-api",
    name: "Gofile API",
    kind: "media-host",
    baseUrl: "https://api.gofile.io/",
    domains: ["api.gofile.io", "gofile.io"],
    endpoints: {
      accounts: "/accounts",
      contents: "/contents/{contentId}",
      getContent: "/getContent?contentId={contentId}",
      createAccount: "/createAccount",
    },
    evidence: "confirmed-url-string",
    notes:
      "These are host API strings found in the APK, not a verified movie provider integration.",
    enabled: false,
  },
];

export const SCRAPER_PROVIDER_REFERENCES: ProviderDetail[] = [
  {
    id: "drivehub",
    name: "DriveHub / ExtraDrive",
    kind: "scraper-domain",
    domains: [
      "drivehub.cfd",
      "watchkar.com",
      "links.watchkar.com",
      "hubcloud.cx",
      "pixeldrain.com",
      "pixeldrain.dev",
      "gamerxyt.com",
      "bzzhr.co",
      "vdplay.pages.dev",
    ],
    endpoints: {},
    evidence: "domain-only",
    notes:
      "APK scraper identifiers include drivehub_java and drivehub_deep_java. Exact request contract is not reproduced.",
    enabled: false,
  },
  {
    id: "hdhub",
    name: "HDHub",
    kind: "scraper-domain",
    domains: ["4khdhub.one", "cluster.watchkar.com"],
    endpoints: {},
    evidence: "domain-only",
    notes:
      "HDHub Java scraper class/config flag observed. No stable public API contract confirmed.",
    enabled: false,
  },
  {
    id: "hdm2",
    name: "HDm2 / HDFLIX",
    kind: "scraper-domain",
    domains: [
      "hdm2.ink",
      "hdm2.biz",
      "hdmovie2a.biz",
      "hdmovie2a.live",
      "hdmovie2.click",
      "hdmovie2.ventures",
    ],
    endpoints: {
      playerPathPattern: "/hdm2-player/{slug}",
      ajaxPath: "/wp-admin/admin-ajax.php",
    },
    evidence: "path-pattern",
    notes:
      "Player and WordPress AJAX path strings were observed; not a supported or authorized integration API.",
    enabled: false,
  },
  {
    id: "mkv",
    name: "MKV",
    kind: "scraper-domain",
    domains: ["hubcloud.cx", "pixeldrain.com", "pixeldrain.dev"],
    endpoints: {},
    evidence: "domain-only",
    notes:
      "MKV Java scraper identifier observed; these domains also appear as downstream hosts.",
    enabled: false,
  },
  {
    id: "superstream",
    name: "SuperStream",
    kind: "scraper-domain",
    domains: [],
    endpoints: {
      playPathPattern: "/play/",
    },
    evidence: "path-pattern",
    notes:
      "SuperStreamJava class and /play/ path pattern observed. Config includes a TMDB key/origin setting; concrete origin was not confirmed in this scan.",
    enabled: false,
  },
  {
    id: "watchkar",
    name: "Watchkar",
    kind: "scraper-domain",
    domains: [
      "watchkar.com",
      "stream.watchkar.com",
      "cdn.watchkar.com",
      "cluster.watchkar.com",
      "links.watchkar.com",
    ],
    endpoints: {},
    evidence: "domain-only",
    notes:
      "WatchkarJava class and m3u8 handling were observed. No general public API contract confirmed.",
    enabled: false,
  },
  {
    id: "gdtot",
    name: "GDTOT / GDTOT-V2",
    kind: "scraper-domain",
    domains: ["gdtotv2.site"],
    endpoints: {
      downloadPathPattern: "/download/{id}",
      filePathPattern: "/file/{id}",
    },
    evidence: "path-pattern",
    notes:
      "Download/file URL patterns and resolver hooks were observed. Not enabled as a provider.",
    enabled: false,
  },
  {
    id: "hdmovie2",
    name: "HDMovie2",
    kind: "scraper-domain",
    domains: [
      "hdmovie2a.biz",
      "hdmovie2a.live",
      "hdmovie2.click",
      "hdmovie2.ventures",
    ],
    endpoints: {},
    evidence: "domain-only",
    notes:
      "HDMovie2 scraper/UI classes and domain configuration strings were observed.",
    enabled: false,
  },
];

export const RESOLVER_AND_HOST_REFERENCES: ProviderDetail[] = [
  {
    id: "hubcloud",
    name: "HubCloud",
    kind: "media-host",
    domains: ["hubcloud.cx", "gpdl.hubcloud.cx"],
    endpoints: {},
    evidence: "domain-only",
    notes:
      "Appears as a downstream host/resolver destination, not a catalog API.",
    enabled: false,
  },
  {
    id: "pixeldrain",
    name: "Pixeldrain",
    kind: "media-host",
    baseUrl: "https://pixeldrain.com/",
    domains: ["pixeldrain.com", "pixeldrain.dev"],
    endpoints: {
      fileApiPattern: "/api/file/{id}",
      userFilePattern: "/u/{id}",
    },
    evidence: "path-pattern",
    notes:
      "API/file URL patterns observed in the APK. Use only for content you are authorized to access.",
    enabled: false,
  },
  {
    id: "gofile",
    name: "Gofile",
    kind: "media-host",
    baseUrl: "https://gofile.io/",
    domains: ["gofile.io"],
    endpoints: {
      downloadPathPattern: "/d/{id}",
    },
    evidence: "path-pattern",
    notes: "Host URL pattern observed; see gofile-api for API strings.",
    enabled: false,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    kind: "media-host",
    domains: ["vidsrc.me", "vidsrc.net", "vidsrc.stream", "vidsrc2.to"],
    endpoints: {
      episodeAjaxPattern: "/ajax/embed/episode/{id}",
      rcpPath: "/rcp/",
    },
    evidence: "path-pattern",
    notes:
      "Embed-related URL strings were present. Not verified as authorized or stable APIs.",
    enabled: false,
  },
  {
    name: "Other embedded host domains",
    id: "other-hosts",
    kind: "media-host",
    domains: [
      "videovard.to",
      "videovard.sx",
      "streamwish.to",
      "streamwish.site",
    ],
    endpoints: {},
    evidence: "domain-only",
    notes:
      "Only domain strings were identified; no reliable API endpoint contract established.",
    enabled: false,
  },
];

export const ALL_PROVIDER_DETAILS: readonly ProviderDetail[] = [
  APP_BACKEND_PROVIDER,
  ...METADATA_PROVIDERS,
  ...SCRAPER_PROVIDER_REFERENCES,
  ...RESOLVER_AND_HOST_REFERENCES,
] as const;

export default ALL_PROVIDER_DETAILS;