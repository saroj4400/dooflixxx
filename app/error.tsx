"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("doomsplay route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-xl shadow-red-500/10">
        <AlertTriangle size={36} />
      </div>

      <h1 className="mt-6 text-2xl font-black text-white sm:text-3xl">Playback Interrupted</h1>
      <p className="mt-2 text-sm text-white/50 leading-relaxed">
        We encountered an unexpected issue while preparing this title or section. You can try
        reloading the page or return to the doomsplay home feed.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-xl bg-cinema px-5 py-3 text-sm font-black text-black shadow-lg shadow-cinema/20 hover:bg-cinema-light transition active:scale-95"
        >
          <RotateCcw size={16} />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition active:scale-95"
        >
          <Home size={16} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
