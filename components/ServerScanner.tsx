"use client";

import { Check, X, Loader2, Radio } from "lucide-react";

export interface ServerScanItem {
  id: string;
  status: "pending" | "checking" | "ready" | "failed";
  latencyMs?: number;
}

interface ServerScannerProps {
  title: string;
  subtitle?: string;
  totalServers: number;
  analyzedCount: number;
  remainingCount: number;
  statusResults: ServerScanItem[];
  isConnecting?: boolean;
}

export function ServerScanner({
  title,
  subtitle,
  totalServers,
  analyzedCount,
  remainingCount,
  statusResults,
  isConnecting = false
}: ServerScannerProps) {
  const percent =
    totalServers > 0 ? Math.min(100, Math.round((analyzedCount / totalServers) * 100)) : 0;

  return (
    <div className="relative aspect-video min-h-[340px] sm:min-h-[420px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xl select-none">
      {/* Ambient background glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Title Badge / Header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-white/80 mb-3 tracking-wide backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="truncate max-w-[240px] sm:max-w-md">
            {title} {subtitle ? `— ${subtitle}` : ""}
          </span>
        </div>

        {/* Dynamic Scanning Heading */}
        <h3 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center justify-center gap-2 mb-4">
          {isConnecting ? (
            <>
              <Loader2 className="animate-spin text-amber-400" size={20} />
              <span>Connecting to best server...</span>
            </>
          ) : (
            <>
              <Radio className="animate-pulse text-amber-400" size={18} />
              <span>Scanning high-speed servers...</span>
            </>
          )}
        </h3>

        {/* Yellow/Gold Gradient Progress Indicator */}
        <div className="w-full bg-white/10 h-2 sm:h-2.5 rounded-full overflow-hidden mb-2 relative border border-white/5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_14px_rgba(245,158,11,0.6)]"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Real-time Analyzed & Remaining Counters */}
        <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-mono font-bold tracking-wider mb-5 px-1">
          <span className="text-amber-400 font-extrabold flex items-center gap-1">
            <span>{analyzedCount}</span>
            <span className="text-amber-400/80">ANALYZED</span>
          </span>
          <span className="text-white/60 flex items-center gap-1">
            <span className="text-white font-extrabold">{remainingCount}</span>
            <span>REMAINING</span>
          </span>
        </div>

        {/* Anonymous Server Status Cards Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 max-h-[160px] sm:max-h-[180px] overflow-y-auto pr-1">
          {statusResults.map((item, idx) => {
            const isReady = item.status === "ready";
            const isFailed = item.status === "failed";
            const isChecking = item.status === "checking";

            return (
              <div
                key={item.id || idx}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  isReady
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-950/30"
                    : isFailed
                    ? "bg-red-950/20 border-red-500/20 text-red-400/70"
                    : isChecking
                    ? "bg-amber-950/25 border-amber-500/30 text-amber-300 animate-pulse"
                    : "bg-white/[0.02] border-white/5 text-white/30"
                }`}
              >
                {isReady && (
                  <Check size={14} className="text-emerald-400 flex-shrink-0 stroke-[3]" />
                )}
                {isFailed && (
                  <X size={14} className="text-red-400 flex-shrink-0 stroke-[2.5]" />
                )}
                {isChecking && (
                  <Loader2 size={13} className="text-amber-400 flex-shrink-0 animate-spin" />
                )}
                {item.status === "pending" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20 flex-shrink-0" />
                )}

                <span className="capitalize text-[11px] sm:text-xs">
                  {isReady
                    ? "Ready"
                    : isFailed
                    ? "Failed"
                    : isChecking
                    ? "Checking"
                    : "Standby"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
