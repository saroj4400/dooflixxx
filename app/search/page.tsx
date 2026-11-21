import { Suspense } from "react";
import { SearchClient } from "@/components/SearchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-8 text-center text-white/40">
          <div className="h-12 w-full max-w-2xl mx-auto rounded-2xl bg-white/5 animate-pulse" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}