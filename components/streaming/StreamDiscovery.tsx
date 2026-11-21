
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Server,
  XCircle,
} from "lucide-react";

import type {
  ProviderIntegrationStatus,
  ProviderRunResult,
  StreamSource,
} from "@/lib/streaming/types";

import { ServerSelector } from "@/components/ServerSelector";
import { StreamingVideoPlayer } from "@/components/VideoPlayer";

interface Props {
  tmdbId: string;
  mediaType: "movie" | "tv";
  title: string;
  season?: number;
  episode?: number;
  year?: number;
  poster?: string;
}

interface DiscoveryResponse {
  success: boolean;
  configuredProviders: number;
  sources: StreamSource[];
  providers: ProviderRunResult[];
  providerStatus: ProviderIntegrationStatus[];
  message?: string;
  error?: string;
}

export function StreamDiscovery(props: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiscoveryResponse | null>(null);
  const [selected, setSelected] = useState<StreamSource | null>(null);
  const [error, setError] = useState("");

  const discover = useCallback(async () => {
    setLoading(true);
    setError("");
    setData(null);
    setSelected(null);

    try {
      const response = await fetch("/api/streams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tmdbId: props.tmdbId,
          mediaType: props.mediaType,
          title: props.title,
          year: props.year,
          season: props.season,
          episode: props.episode,
        }),
      });

      const result = (await response.json()) as DiscoveryResponse;

      if (!response.ok) {
        throw new Error(
          result.error || "Source discovery failed"
        );
      }

      if (
        !Array.isArray(result.sources) ||
        !Array.isArray(result.providers) ||
        !Array.isArray(result.providerStatus)
      ) {
        throw new Error("Invalid response received from streaming API");
      }

      setData(result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Source discovery failed"
      );
    } finally {
      setLoading(false);
    }
  }, [
    props.tmdbId,
    props.mediaType,
    props.title,
    props.year,
    props.season,
    props.episode,
  ]);

  useEffect(() => {
    void discover();
  }, [discover]);

  const providerStatus = data?.providerStatus ?? [];
  const providerResults = data?.providers ?? [];
  const sources = data?.sources ?? [];

  return (
    <section className="w-full space-y-4 rounded-2xl border border-white/10 bg-[#09090e] p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server size={17} className="text-cinema" />

          <div>
            <h3 className="text-sm font-bold text-white">
              Authorized provider sources
            </h3>

            <p className="text-[11px] text-white/45">
              {props.mediaType === "tv"
                ? `TMDB ${props.tmdbId} · S${props.season ?? 1} E${props.episode ?? 1}`
                : `TMDB ${props.tmdbId}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={discover}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-cinema px-4 py-2 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}

          {loading ? "Searching providers…" : "Find sources"}
        </button>
      </div>

      {/* Errors */}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 text-xs text-red-300"
        >
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {/* Discovery summary */}
      {data && (
        <div className="flex flex-wrap gap-3 text-xs text-white/60">
          <span>
            Providers checked: {providerResults.length}
          </span>

          <span>
            Sources found: {sources.length}
          </span>

          <span>
            Playable sources: {sources.length}
          </span>
        </div>
      )}

      {/* General message */}
      {data?.message && (
        <p className="text-xs leading-5 text-amber-200/75">
          {data.message}
        </p>
      )}

      {/* Runtime provider results */}
      {providerResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-white/80">
            Discovery results
          </h4>

          {providerResults.map((provider) => (
            <div
              key={provider.providerId}
              className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.03] p-2"
            >
              {provider.status === "ok" ? (
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-green-400"
                />
              ) : provider.status === "error" ? (
                <XCircle
                  size={14}
                  className="mt-0.5 shrink-0 text-red-400"
                />
              ) : (
                <AlertCircle
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-400"
                />
              )}

              <div className="min-w-0">
                <p className="text-xs font-medium text-white">
                  {provider.providerName}
                  <span className="ml-2 text-white/45">
                    {provider.status}
                  </span>
                </p>

                <p className="text-[11px] text-white/50">
                  {provider.sourceCount} source(s)
                  {provider.message
                    ? ` · ${provider.message}`
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Integration diagnostics */}
      {providerStatus.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-white/80">
            Provider integration status
          </h4>

          {providerStatus.map((provider) => (
            <div
              key={provider.id}
              className="flex items-start gap-2 text-xs"
            >
              {provider.playbackAvailable ? (
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-green-400"
                />
              ) : (
                <AlertCircle
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-400"
                />
              )}

              <div className="min-w-0">
                <p className="font-medium text-white/80">
                  {provider.name}
                  <span className="ml-2 text-white/45">
                    {provider.playbackAvailable
                      ? "Playback verified"
                      : "Not verified"}
                  </span>
                </p>

                {provider.reason && (
                  <p className="mt-0.5 break-words text-[11px] text-white/45">
                    {provider.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Source selector */}
      <ServerSelector
        sources={sources}
        selectedSourceId={
          selected
            ? `${selected.providerId}:${selected.id}`
            : null
        }
        providerStatus={providerStatus}
        onSelectSource={setSelected}
      />

      {/* Player */}
      {selected && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white">
            Selected source: {selected.providerName} · {selected.title}
          </p>

          <StreamingVideoPlayer
            source={selected}
            title={props.title}
            poster={props.poster}
          />
        </div>
      )}
    </section>
  );
}
