/** Server-side contracts for DoomsPlay's modular streaming provider system. */
export type MediaKind = "movie" | "tv";
export type StreamKind = "hls" | "dash" | "mp4" | "webm" | "iframe";

export interface StreamRequest {
  tmdbId: string;
  mediaType: MediaKind;
  title?: string;
  titleVariants?: string[];
  year?: number;
  season?: number;
  episode?: number;
}

export interface StreamSource {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  url: string;
  kind: StreamKind;
  quality?: string;
  language?: string;
  /** True when the provider requires its own authorized embed player. */
  requiresProviderPlayer?: boolean;
  subtitles?: Array<{
    url: string;
    language: string;
    label: string;
    isDefault?: boolean;
  }>;
}

export interface ProviderIntegrationStatus {
  id: string;
  name: string;
  playbackAvailable: boolean;
  reason?: string;
}

export interface ProviderTitle {
  tmdbId: string;
  mediaType: MediaKind;
  title: string;
  year?: number;
  overview?: string;
}

export interface ProviderSeason {
  season: number;
  title?: string;
  episodeCount?: number;
}

export interface ProviderEpisode {
  season: number;
  episode: number;
  title?: string;
}

export interface ProviderCapabilities {
  searchMovie: boolean;
  getMovieDetails: boolean;
  searchSeries: boolean;
  getSeasons: boolean;
  getEpisodes: boolean;
  getMovieStreams: boolean;
  getEpisodeStreams: boolean;
}

export interface StreamingProvider {
  id: string;
  name: string;
  enabled: boolean;
  supports: { movie: boolean; tv: boolean };
  /** Explicit host allowlist copied from this integration's own documentation. */
  allowedHosts?: string[];
  /** Optional check for the configuration needed by this module. */
  isConfigured?(): boolean;
  /** Optional catalog methods. Implementations run server-side and retain TMDB identity. */
  searchMovie?(query: string): Promise<ProviderTitle[]>;
  getMovieDetails?(tmdbId: string): Promise<ProviderTitle | null>;
  searchSeries?(query: string): Promise<ProviderTitle[]>;
  getSeasons?(tmdbId: string): Promise<ProviderSeason[]>;
  getEpisodes?(tmdbId: string, season: number): Promise<ProviderEpisode[]>;
  /** Stream methods are split by media capability; legacy modules may use getSources. */
  getMovieStreams?(request: StreamRequest): Promise<StreamSource[]>;
  getEpisodeStreams?(request: StreamRequest & { season: number; episode: number }): Promise<StreamSource[]>;
  getSources?(request: StreamRequest): Promise<StreamSource[]>;
  /** Optional provider-owned URL resolution. Must not bypass DRM, login walls or access controls. */
  resolve?(source: StreamSource, request: StreamRequest): Promise<StreamSource | null>;
}

export function getProviderCapabilities(provider: StreamingProvider): ProviderCapabilities {
  return {
    searchMovie: Boolean(provider.searchMovie),
    getMovieDetails: Boolean(provider.getMovieDetails),
    searchSeries: Boolean(provider.searchSeries),
    getSeasons: Boolean(provider.getSeasons),
    getEpisodes: Boolean(provider.getEpisodes),
    getMovieStreams: Boolean(provider.getMovieStreams || provider.getSources),
    getEpisodeStreams: Boolean(provider.getEpisodeStreams || provider.getSources),
  };
}

export interface ProviderRunResult {
  providerId: string;
  providerName: string;
  status: "ok" | "empty" | "error";
  sourceCount: number;
  message?: string;
}

export interface ProviderDiagnostic {
  id: string;
  name: string;
  kind: string;
  providerEvidence: string;
  implementationExists: boolean;
  configurationComplete: boolean;
  documentedApi: boolean;
  searchMethodConfirmed: boolean;
  movieStreamExtractionConfirmed: boolean;
  tvEpisodeExtractionConfirmed: boolean;
  resolverConfirmed: boolean;
  testRequestSucceeded: boolean | null;
  playableMediaVerified: boolean;
  failureReason: string;
  endpoints: Array<{
    name: string;
    baseUrl?: string;
    path: string;
    method: string;
    evidence: string;
  }>;
}

export function toProviderIntegrationStatus(
  result: ProviderRunResult
): ProviderIntegrationStatus {
  return {
    id: result.providerId,
    name: result.providerName,
    playbackAvailable: result.status === "ok" && result.sourceCount > 0,
    reason:
      result.status === "ok" && result.sourceCount > 0
        ? undefined
        : result.message ??
          (result.status === "empty"
            ? "Provider returned no playable sources."
            : "Provider integration failed."),
  };
}
