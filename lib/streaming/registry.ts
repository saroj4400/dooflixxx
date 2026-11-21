
import type { StreamingProvider } from "./types";
import { hdmovie2Provider } from "./providers/hdmovie2";

/**
 * Only add providers here after their server-side integration is implemented,
 * documented, configured and tested.
 *
 * An empty registry means no playback providers are currently available.
 * Do not add inventory-only entries as runtime providers.
 */
export const streamingProviders: StreamingProvider[] = [hdmovie2Provider];

export function getRegisteredProviders(): StreamingProvider[] {
  return streamingProviders.filter((provider) => provider.enabled);
}
