"use client";

import { Server } from "lucide-react";
import type { ProviderIntegrationStatus, StreamSource } from "@/lib/streaming/types";

interface ServerSelectorProps {
  sources: StreamSource[];
  selectedSourceId: string | null;
  providerStatus: ProviderIntegrationStatus[];
  onSelectSource: (source: StreamSource) => void;
}

export function ServerSelector({
  sources,
  selectedSourceId,
  providerStatus,
  onSelectSource,
}: ServerSelectorProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0e13] p-3.5 shadow-xl sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-red-500">
          <Server size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Available sources</h3>
          <p className="text-[11px] text-white/40">Select a source manually. No automatic fallback.</p>
        </div>
      </div>

      {sources.length ? (
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => {
            const sourceKey = `${source.providerId}:${source.id}`;
            const active = sourceKey === selectedSourceId;
            return (
              <button
                key={sourceKey}
                type="button"
                onClick={() => onSelectSource(source)}
                aria-pressed={active}
                className={`rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${active ? "border-red-500 bg-red-600 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
              >
                <span className="block font-bold">{source.providerName}</span>
                <span className="mt-1 block text-[10px] opacity-70">{source.title} · {source.quality || source.kind.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs leading-5 text-white/55">No authorized playback sources were returned for this title.</p>
      )}

      {providerStatus.length > 0 && (
        <details className="mt-3 border-t border-white/10 pt-3">
          <summary className="cursor-pointer text-[11px] font-semibold text-white/55">Configured provider references and availability</summary>
          <ul className="mt-2 space-y-2">
            {providerStatus.map((provider) => (
              <li key={provider.id} className="text-[11px] leading-4">
                <span className="font-semibold text-white/70">{provider.name}: </span>
                <span className="text-white/45">{provider.reason || (provider.playbackAvailable ? "Playback integration available." : "No playback integration available.")}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
