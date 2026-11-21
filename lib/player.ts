import { PlayerProvider } from "@/types/player";

/**
 * ============================================================
 * CineMate Player Configuration
 * ============================================================
 *
 * IMPORTANT:
 *
 * This player does NOT:
 * - scan servers
 * - check server health
 * - automatically fallback
 * - rank servers
 * - select another server automatically
 * - modify the provider's internal player
 * - create quality/language controls
 *
 * Each Server button simply loads that provider's iframe.
 *
 * Server 1 → Provider 1 iframe
 * Server 2 → Provider 2 iframe
 * Server 3 → Provider 3 iframe
 * etc.
 *
 * The provider's own player controls remain untouched.
 *
 * Supported placeholders:
 *
 * Movies:
 *   {tmdb_id}
 *   {id}
 *
 * TV:
 *   {tmdb_id}
 *   {id}
 *   {season}
 *   {season_number}
 *   {episode}
 *   {episode_number}
 */

export const defaultPlayerProviders: PlayerProvider[] = [

  // ==========================================================
  // SERVER 1
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-1(multi-audio)",
    name: "Server 1 (Multi-Audio)",
    type: "iframe",

    // FIXED: removed extra }
    movieUrlTemplate:
      "https://nxsha.space/embed/movie/{id}",

    tvUrlTemplate:
      "https://nxsha.space/embed/tv/{id}/{season}/{episode}",

    enabled: true,
    priority: 1,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 1 iframe"
  },

  // ==========================================================
  // SERVER 2
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-2",
    name: "Server 2 (Download)",
    type: "iframe",

    movieUrlTemplate:
      "https://vidsync.pro/embed/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://vidsync.pro/embed/tv/{tmdb_id}/{season_number}/{episode_number}",

    enabled: true,
    priority: 2,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 2 iframe"
  },

  // ==========================================================
  // SERVER 3
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-3",
    name: "Server 3 (HD)",
    type: "iframe",

    movieUrlTemplate:
      "https://vidlink.pro/movie/{id}",

    tvUrlTemplate:
      "https://vidlink.pro/tv/{id}/{season}/{episode}",

    enabled: true,
    priority: 3,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 3 iframe"
  },

  // ==========================================================
  // SERVER 4
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-4",
    name: "Server 4(HD)",
    type: "iframe",

    movieUrlTemplate:
      "https://yapgrid.com/player/api/movie/{id}",

    tvUrlTemplate:
      "https://yapgrid.com/player/api/tv/{id}/{season}/{episode}",

    enabled: false,
    priority: 4,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 4 iframe"
  },

  // ==========================================================
  // SERVER 5
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-5",
    name: "Server 5 (Fast HD)",
    type: "iframe",

    movieUrlTemplate:
      "https://vidsrc.wtf/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://vvidsrc.wtf/tv/{tmdb_id}/{season}/{episode}",

    enabled: true,
    priority: 5,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 5 iframe"
  },

  // ==========================================================
  // SERVER 6
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-6",
    name: "Server 6",
    type: "iframe",

    movieUrlTemplate:
      "https://vidlink.pro/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://vidlink.pro/tv/{tmdb_id}/{season}/{episode}",

    enabled: false,
    priority: 6,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 6 iframe"
  },

  // ==========================================================
  // SERVER 7
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-7",
    name: "Server 7",
    type: "iframe",

    movieUrlTemplate:
      "https://viduki.net/1/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://viduki.net/1/tv/{tmdb_id}/{season}/{episode}",

    enabled: false,
    priority: 7,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 7 iframe"
  },

  // ==========================================================
  // SERVER 8
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-8",
    name: "Server 8",
    type: "iframe",

    movieUrlTemplate:
      "https://viduki.net/2/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://viduki.net/2/tv/{tmdb_id}/{season}/{episode}",

    enabled: false,
    priority: 8,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 8 iframe"
  },

  // ==========================================================
  // SERVER 9
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-9",
    name: "Server 9",
    type: "iframe",

    movieUrlTemplate:
      "https://viduki.net/3/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://viduki.net/3/tv/{tmdb_id}/{season}/{episode}",

    enabled: false,
    priority: 9,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 9 iframe"
  },

  // ==========================================================
  // SERVER 10
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-10",
    name: "Server 10",
    type: "iframe",

    movieUrlTemplate:
      "https://vidsrc.sbs/embed/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://vidsrc.sbs/embed/tv/{tmdb_id}/{season_number}/{episode_number}",

    enabled: false,
    priority: 10,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 10 iframe"
  },

  // ==========================================================
  // SERVER 12
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-12",
    name: "Server 12",
    type: "iframe",

    movieUrlTemplate:
      "https://vidsrc.xyz/embed/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://vidsrc.xyz/embed/tv/{tmdb_id}/{season_number}/{episode_number}",

    enabled: false,
    priority: 12,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 12 iframe"
  },

  // ==========================================================
  // SERVER 13
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-13",
    name: "Server 13",
    type: "iframe",

    movieUrlTemplate:
      "https://vidsrc.in/embed/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://vidsrc.in/embed/tv/{tmdb_id}/{season_number}/{episode_number}",

    enabled: false,
    priority: 13,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 13 iframe"
  },

  // ==========================================================
  // SERVER 14
  // To configure sandbox: set `sandboxMode: "strict" | "relaxed" | "none"` (defaults to "strict")
  // ==========================================================
  {
    id: "server-14",
    name: "Server 14",
    type: "iframe",

    movieUrlTemplate:
      "https://vidsrc.pm/embed/movie/{tmdb_id}",

    tvUrlTemplate:
      "https://vidsrc.pm/embed/tv/{tmdb_id}/{season_number}/{episode_number}",

    enabled: false,
    priority: 14,

    supportsMovie: true,
    supportsTV: true,

    description: "Provider 14 iframe"
  }
];


/**
 * ============================================================
 * Main provider list
 * ============================================================
 */

export const playerProviders: PlayerProvider[] =
  defaultPlayerProviders;


/**
 * ============================================================
 * Get all configured providers
 * ============================================================
 */

export function getPlayerProviders(
  onlyEnabled: boolean = true
): PlayerProvider[] {

  const list = onlyEnabled
    ? defaultPlayerProviders.filter(
      (provider) => provider.enabled
    )
    : defaultPlayerProviders;

  return [...list].sort(
    (a, b) => a.priority - b.priority
  );
}


/**
 * ============================================================
 * Get providers for Movie / TV
 * ============================================================
 *
 * This only filters the list.
 *
 * It does NOT:
 * - check availability
 * - scan servers
 * - fallback
 */

export function getEligibleProviders(
  mediaType: "movie" | "tv",
  onlyEnabled: boolean = true
): PlayerProvider[] {

  const providers =
    getPlayerProviders(onlyEnabled);

  return providers.filter((provider) => {

    if (
      mediaType === "movie" &&
      provider.supportsMovie === false
    ) {
      return false;
    }

    if (
      mediaType === "tv" &&
      provider.supportsTV === false
    ) {
      return false;
    }

    /*
     * Only iframe providers are used by the web player.
     */
    if (provider.type !== "iframe") {
      return false;
    }

    return true;
  });
}


/**
 * ============================================================
 * Get one provider by ID
 * ============================================================
 */

export function getPlayerProviderById(
  providerId: string
): PlayerProvider | undefined {

  return defaultPlayerProviders.find(
    (provider) => provider.id === providerId
  );
}


/**
 * ============================================================
 * Default provider
 * ============================================================
 *
 * This means Server 1 is loaded initially.
 *
 * It does NOT mean fallback.
 */

export function getDefaultProvider():
  PlayerProvider {

  const enabled =
    getPlayerProviders(true);

  return (
    enabled[0] ||
    defaultPlayerProviders[0]
  );
}


/**
 * ============================================================
 * Build Movie iframe URL
 * ============================================================
 */

export function buildMovieUrl(
  template: string,
  tmdbId: string
): string {

  const encodedId =
    encodeURIComponent(tmdbId);

  return template
    .replace(
      /\{tmdb_id\}/gi,
      encodedId
    )
    .replace(
      /\{id\}/gi,
      encodedId
    )
    .replace(
      /\[TMDB_ID\]/gi,
      encodedId
    );
}


/**
 * ============================================================
 * Build TV iframe URL
 * ============================================================
 */

export function buildTVUrl(
  template: string,
  tmdbId: string,
  season: number,
  episode: number
): string {

  const encodedId =
    encodeURIComponent(tmdbId);

  return template

    .replace(
      /\{tmdb_id\}/gi,
      encodedId
    )

    .replace(
      /\{id\}/gi,
      encodedId
    )

    .replace(
      /\[TMDB_ID\]/gi,
      encodedId
    )

    .replace(
      /\{season_number\}/gi,
      String(season)
    )

    .replace(
      /\{season\}/gi,
      String(season)
    )

    .replace(
      /\[SEASON\]/gi,
      String(season)
    )

    .replace(
      /\{episode_number\}/gi,
      String(episode)
    )

    .replace(
      /\{episode\}/gi,
      String(episode)
    )

    .replace(
      /\[EPISODE\]/gi,
      String(episode)
    );
}


/**
 * ============================================================
 * Get Movie iframe URL
 * ============================================================
 *
 * IMPORTANT:
 *
 * This function returns ONLY the selected provider URL.
 *
 * No language replacement.
 * No fallback.
 * No scanning.
 */

export function getMoviePlayerUrl(
  providerId: string,
  id: string
): string | null {

  const provider =
    getPlayerProviderById(providerId);

  if (!provider) {
    return null;
  }

  if (!provider.enabled) {
    return null;
  }

  if (provider.type !== "iframe") {
    return null;
  }

  if (!provider.movieUrlTemplate) {
    return null;
  }

  return buildMovieUrl(
    provider.movieUrlTemplate,
    id
  );
}


/**
 * ============================================================
 * Get TV iframe URL
 * ============================================================
 *
 * Again:
 *
 * TV Server 1 → Server 1 iframe
 * TV Server 2 → Server 2 iframe
 *
 * Nothing else.
 */

export function getTVPlayerUrl(
  providerId: string,
  id: string,
  season: number,
  episode: number
): string | null {

  const provider =
    getPlayerProviderById(providerId);

  if (!provider) {
    return null;
  }

  if (!provider.enabled) {
    return null;
  }

  if (provider.type !== "iframe") {
    return null;
  }

  if (!provider.tvUrlTemplate) {
    return null;
  }

  return buildTVUrl(
    provider.tvUrlTemplate,
    id,
    season,
    episode
  );
}


/**
 * ============================================================
 * Generic iframe URL function
 * ============================================================
 *
 * This is the function your WatchClient should use.
 */

export function getProviderEmbedUrl(
  provider: PlayerProvider,
  options: {
    id: string | number;
    type: "movie" | "tv";
    season?: number;
    episode?: number;
  }
): string | null {

  if (!provider) {
    return null;
  }

  if (!provider.enabled) {
    return null;
  }

  if (provider.type !== "iframe") {
    return null;
  }

  const id =
    String(options.id);

  if (options.type === "movie") {

    if (!provider.movieUrlTemplate) {
      return null;
    }

    return buildMovieUrl(
      provider.movieUrlTemplate,
      id
    );
  }

  if (
    options.season === undefined ||
    options.episode === undefined
  ) {
    return null;
  }

  if (!provider.tvUrlTemplate) {
    return null;
  }

  return buildTVUrl(
    provider.tvUrlTemplate,
    id,
    options.season,
    options.episode
  );
}


/**
 * ============================================================
 * Compatibility functions
 * ============================================================
 *
 * These are kept so other existing files that import them
 * don't immediately break.
 *
 * They DO NOT perform automatic fallback.
 */


/**
 * Return the next provider manually if another part of the
 * application asks for it.
 *
 * This function does NOT automatically switch anything.
 */

export function getNextProvider(
  currentProviderId: string,
  triedIds: string[] = []
): PlayerProvider | null {

  const providers =
    getPlayerProviders(true);

  const currentIndex =
    providers.findIndex(
      (provider) =>
        provider.id === currentProviderId
    );

  if (currentIndex === -1) {
    return null;
  }

  for (
    let index = currentIndex + 1;
    index < providers.length;
    index++
  ) {

    const provider =
      providers[index];

    if (
      !triedIds.includes(provider.id) &&
      provider.type === "iframe"
    ) {
      return provider;
    }
  }

  return null;
}


/**
 * ============================================================
 * Legacy health function
 * ============================================================
 *
 * Kept only for compatibility with old imports.
 *
 * It deliberately does NOT perform a network check.
 */

export async function checkProviderHealth(
  provider: PlayerProvider,
  media: {
    id: string;
    type: "movie" | "tv";
    season?: number;
    episode?: number;
  },
  _signal?: AbortSignal
) {

  const url =
    getProviderEmbedUrl(
      provider,
      {
        id: media.id,
        type: media.type,
        season: media.season,
        episode: media.episode
      }
    );

  return {
    providerId: provider.id,
    healthy: Boolean(url),
    latencyMs: 0,
    status: url ? "ready" : "failed",
    reason: url
      ? "Iframe URL generated"
      : "No iframe URL configured"
  } as const;
}


/**
 * ============================================================
 * Legacy ranking function
 * ============================================================
 *
 * IMPORTANT:
 *
 * This is NOT used by the new manual server selector.
 *
 * It is retained only so old imports won't break.
 *
 * Providers are returned in configuration order.
 */

export function rankAvailableProviders(
  providers: PlayerProvider[],
  _healthResults: any[] = [],
  _preferredLanguage?: string,
  _failedProviderIds: string[] = []
): PlayerProvider[] {

  return [...providers]
    .filter(
      (provider) =>
        provider.enabled &&
        provider.type === "iframe"
    )
    .sort(
      (a, b) =>
        a.priority - b.priority
    );
}


/**
 * ============================================================
 * Legacy best-provider function
 * ============================================================
 *
 * New WatchClient should NOT use this for fallback.
 */

export function selectBestProvider(
  providers: PlayerProvider[]
): PlayerProvider | null {

  return (
    providers.find(
      (provider) =>
        provider.enabled &&
        provider.type === "iframe"
    ) || null
  );
}