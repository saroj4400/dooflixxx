export type ProviderType = "iframe" | "video" | "telegram";

export interface AudioTrack {
  id: string;
  label: string;
  isDefault?: boolean;
}

export interface PlayerProvider {
  id: string;
  name: string;
  type: ProviderType;
  movieUrlTemplate?: string;
  tvUrlTemplate?: string;
  enabled: boolean;
  priority: number;
  description?: string;
  isDirectVideo?: boolean;
  supportsMovie?: boolean;
  supportsTV?: boolean;
  sandboxMode?: "strict" | "relaxed" | "none";
  audioTracks?: AudioTrack[];
  languageUrlTemplates?: Record<
    string,
    {
      movieUrlTemplate?: string;
      tvUrlTemplate?: string;
    }
  >;
}

export interface ProviderHealthResult {
  providerId: string;
  healthy: boolean;
  latencyMs?: number;
  status: "pending" | "checking" | "ready" | "failed";
  reason?: string;
}

export interface NormalizedPlaybackSource {
  status: "ready" | "connecting" | "error" | "unavailable";
  providerId: string;
  playbackUrl: string | null;
  playbackType: ProviderType;
  audioTracks: AudioTrack[];
  selectedAudioTrackId?: string;
  isDirectVideo?: boolean;
}

export type PlayerState =
  | "IDLE"
  | "SCANNING"
  | "CONNECTING"
  | "PLAYING"
  | "SWITCHING_SOURCE"
  | "ERROR"
  | "AD PLAYING";

export interface MoviePlayer {
  movieId: string;
  title: string;
  providerId: string;
  url: string;
  isDirectVideo?: boolean;
}

export interface TVPlayer {
  tvId: string;
  title: string;
  season: number;
  episode: number;
  providerId: string;
  url: string;
  isDirectVideo?: boolean;
}

export type PlayerMode = "movie" | "tv";

export interface PlayerSource {
  provider: PlayerProvider;
  url: string;
  isDirectVideo: boolean;
}
