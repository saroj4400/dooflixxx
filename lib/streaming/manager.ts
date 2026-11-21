
import { streamingProviders } from "./registry";
import { resolveProviderSource } from "./resolver";
import type {
  ProviderRunResult,
  StreamRequest,
  StreamSource,
  StreamingProvider,
} from "./types";

const PROVIDER_TIMEOUT_MS = 12_000;

type DiscoveryResult = {
  sources: StreamSource[];
  providers: ProviderRunResult[];
};

function supportsRequest(
  provider: StreamingProvider,
  request: StreamRequest
): boolean {
  if (!provider.enabled || !provider.supports[request.mediaType]) {
    return false;
  }

  if (request.mediaType === "movie") {
    return Boolean(provider.getMovieStreams || provider.getSources);
  }

  return Boolean(
    provider.getEpisodeStreams || provider.getSources
  );
}

async function runProvider(
  provider: StreamingProvider,
  request: StreamRequest,
  fetcher: typeof fetch,
  timeoutMs: number
): Promise<{
  sources: StreamSource[];
  result: ProviderRunResult;
}> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    if (provider.isConfigured && !provider.isConfigured()) {
      throw new Error("Provider configuration is incomplete");
    }

    const providerWork = async (): Promise<StreamSource[]> => {
      const rawSources =
        request.mediaType === "movie"
          ? await (provider.getMovieStreams || provider.getSources)!(request)
          : await (provider.getEpisodeStreams || provider.getSources)!(
              request as StreamRequest & {
                season: number;
                episode: number;
              }
            );

      if (!Array.isArray(rawSources)) {
        throw new Error("Provider returned an invalid source list");
      }

      const resolved = await Promise.all(
        rawSources.map((source) =>
          resolveProviderSource(source, provider, request, fetcher)
        )
      );

      return resolved.filter(
        (source): source is StreamSource => Boolean(source)
      );
    };

    const sources = await Promise.race([
      providerWork(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Provider timed out")),
          timeoutMs
        );
      }),
    ]);

    return {
      sources,
      result: {
        providerId: provider.id,
        providerName: provider.name,
        status: sources.length ? "ok" : "empty",
        sourceCount: sources.length,
        message: sources.length
          ? undefined
          : "No verified, playable media source returned",
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Provider request failed";

    return {
      sources: [],
      result: {
        providerId: provider.id,
        providerName: provider.name,
        status: "error",
        sourceCount: 0,
        message,
      },
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function discoverStreams(
  request: StreamRequest,
  providers: StreamingProvider[] = streamingProviders,
  fetcher: typeof fetch = fetch,
  providerTimeoutMs = PROVIDER_TIMEOUT_MS
): Promise<DiscoveryResult> {
  const eligible = providers.filter((provider) =>
    supportsRequest(provider, request)
  );

  const settled = await Promise.all(
    eligible.map((provider) =>
      runProvider(provider, request, fetcher, providerTimeoutMs)
    )
  );

  const sources = settled.flatMap((item) => item.sources);

  // Deduplicate sources by URL.
  const uniqueSources = [
    ...new Map(
      sources.map((source) => [source.url, source])
    ).values(),
  ];

  return {
    sources: uniqueSources,
    providers: settled.map((item) => item.result),
  };
}
