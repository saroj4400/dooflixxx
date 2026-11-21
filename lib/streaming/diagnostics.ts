
import {
  ALL_PROVIDER_DETAILS,
  endpoints,
  type EndpointRecord,
  type ProviderDetail,
} from "./providers";

import { streamingProviders } from "./registry";

import type {
  ProviderDiagnostic,
  StreamingProvider,
} from "./types";

export interface StreamingDiagnostics {
  generatedAt: string;
  providers: ProviderDiagnostic[];
  endpointRecords: EndpointRecord[];
  unassignedEndpointRecords: EndpointRecord[];
}

interface ProbeResult {
  succeeded: boolean | null;
  reason: string;
}

function endpointHost(record: EndpointRecord): string | null {
  if (!record.baseUrl) return null;

  try {
    return new URL(record.baseUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getImplementation(
  provider: ProviderDetail
): StreamingProvider | undefined {
  return streamingProviders.find(
    (candidate) => candidate.id === provider.id
  );
}

function isConfigurationComplete(
  implementation?: StreamingProvider
): boolean {
  if (!implementation || !implementation.enabled) {
    return false;
  }

  try {
    return implementation.isConfigured?.() ?? true;
  } catch (error) {
    console.error(
      `[Streaming diagnostics] Configuration check failed for ${implementation.id}`,
      error
    );

    return false;
  }
}

function hasPlaybackMethod(
  implementation?: StreamingProvider
): boolean {
  if (!implementation) return false;

  return Boolean(
    implementation.getMovieStreams ||
    implementation.getEpisodeStreams ||
    implementation.getSources
  );
}

function providerFailure(
  provider: ProviderDetail,
  implementation?: StreamingProvider,
  configured = false
): string {
  if (provider.id === "tmdb") {
    return "TMDB provides metadata, not playable media streams. A successful metadata request does not verify playback.";
  }

  if (!implementation) {
    if (provider.id === "trakt") {
      return "No runtime playback integration is registered. Observed API/OAuth paths do not establish an authorized stream delivery contract.";
    }

    if (provider.id === "app-backend") {
      return "No runtime integration is registered. The documented request method, parameters, authentication, response schema and authorization are missing.";
    }

    if (provider.kind === "scraper-domain") {
      return "No runtime integration is registered. A documented and authorized movie and episode playback contract is required.";
    }

    if (provider.kind === "media-host") {
      return "No runtime integration is registered. Authorized content mapping and a documented media delivery contract are required.";
    }

    return "No runtime provider implementation is registered.";
  }

  if (!implementation.enabled) {
    return "The provider implementation exists but is disabled.";
  }

  if (!configured) {
    return "The provider implementation is enabled, but its required configuration is incomplete or its configuration check failed.";
  }

  if (!hasPlaybackMethod(implementation)) {
    return "The provider is registered but has no movie or TV playback method implemented.";
  }

  return "The provider is registered and configured, but successful media extraction and playback have not been verified.";
}

async function probeTmdbMetadata(
  fetcher: typeof fetch,
  configuredKey?: string
): Promise<ProbeResult> {
  const key = (
    configuredKey ?? process.env.TMDB_API_KEY
  )?.trim();

  if (!key || key === "your_tmdb_api_key") {
    return {
      succeeded: null,
      reason:
        "TMDB metadata was not tested because TMDB_API_KEY is not configured. This probe does not test playback.",
    };
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 8000);

  try {
    const tmdbBase = (
      process.env.TMDB_BASE_URL?.trim() ||
      "https://api.themoviedb.org/3"
    ).replace(/\/+$/, "");

    const url = new URL(`${tmdbBase}/movie/550`);

    url.searchParams.set("api_key", key);

    const response = await fetcher(url, {
      method: "GET",
      redirect: "error",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        succeeded: false,
        reason: `TMDB metadata probe returned HTTP ${response.status}. This does not test playback.`,
      };
    }

    const data = (await response.json()) as {
      id?: number;
    };

    if (data.id !== 550) {
      return {
        succeeded: false,
        reason:
          "TMDB metadata probe returned an unexpected response. This does not test playback.",
      };
    }

    return {
      succeeded: true,
      reason:
        "TMDB metadata probe succeeded. TMDB metadata access does not provide or verify playable media.",
    };
  } catch (error) {
    const timedOut =
      error instanceof Error && error.name === "AbortError";

    return {
      succeeded: false,
      reason: timedOut
        ? "TMDB metadata probe timed out."
        : "TMDB metadata probe failed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getStreamingDiagnostics(
  options: {
    probe?: boolean;
    fetcher?: typeof fetch;
    tmdbApiKey?: string;
  } = {}
): Promise<StreamingDiagnostics> {
  const fetcher = options.fetcher || fetch;

  const providers = await Promise.all(
    ALL_PROVIDER_DETAILS.map(
      async (provider): Promise<ProviderDiagnostic> => {
        const implementation = getImplementation(provider);

        const implemented = Boolean(implementation);

        const configured = isConfigurationComplete(
          implementation
        );

        const isTmdb = provider.id === "tmdb";

        const probe: ProbeResult =
          isTmdb && options.probe
            ? await probeTmdbMetadata(
                fetcher,
                options.tmdbApiKey
              )
            : {
                succeeded: null,
                reason: providerFailure(
                  provider,
                  implementation,
                  configured
                ),
              };

        const providerHosts = new Set(
          provider.domains.map((domain) =>
            domain.toLowerCase()
          )
        );

        if (provider.baseUrl) {
          try {
            providerHosts.add(
              new URL(provider.baseUrl).hostname.toLowerCase()
            );
          } catch {
            // Ignore invalid inventory URLs.
          }
        }

        const relatedEndpoints = endpoints.filter(
          (record) => {
            const host = endpointHost(record);

            return Boolean(
              host && providerHosts.has(host)
            );
          }
        );

        return {
          id: provider.id,
          name: provider.name,
          kind: provider.kind,

          providerEvidence: provider.evidence,

          implementationExists: implemented,
          configurationComplete: configured,

          // TMDB's documented API is for metadata, not playback.
          documentedApi: isTmdb,

          // This indicates a registered search method, not a successful live search.
          searchMethodConfirmed: Boolean(
            implementation?.searchMovie ||
            implementation?.searchSeries
          ),

          // These remain false until actual extraction tests are implemented.
          movieStreamExtractionConfirmed: false,
          tvEpisodeExtractionConfirmed: false,

          // Indicates a provider-specific resolver hook is registered.
          // It does not prove that the resolver works.
          resolverConfirmed: Boolean(implementation?.resolve),

          // The optional TMDB probe tests metadata only.
          testRequestSucceeded: isTmdb
            ? probe.succeeded
            : null,

          // Never mark playback verified from metadata or configuration alone.
          playableMediaVerified: false,

          failureReason: probe.reason,

          endpoints: relatedEndpoints.map((record) => ({
            name: record.name,
            baseUrl: record.baseUrl,
            path: record.path,
            method: record.method,
            evidence: record.evidence,
          })),
        };
      }
    )
  );

  const assignedEndpointNames = new Set(
    providers.flatMap((provider) =>
      provider.endpoints.map((endpoint) => endpoint.name)
    )
  );

  return {
    generatedAt: new Date().toISOString(),

    providers,

    endpointRecords: endpoints,

    unassignedEndpointRecords: endpoints.filter(
      (record) =>
        !record.baseUrl ||
        !assignedEndpointNames.has(record.name)
    ),
  };
}
