export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 space-y-10">
      {/* Hero Skeleton */}
      <div className="relative min-h-[460px] sm:min-h-[560px] w-full rounded-3xl bg-white/[0.03] animate-pulse border border-white/5 p-8 flex flex-col justify-end">
        <div className="h-6 w-32 rounded-lg bg-white/10 mb-4" />
        <div className="h-12 w-3/4 max-w-lg rounded-xl bg-white/10 mb-4" />
        <div className="h-4 w-1/2 max-w-md rounded-lg bg-white/10 mb-6" />
        <div className="flex gap-3">
          <div className="h-12 w-32 rounded-xl bg-white/10" />
          <div className="h-12 w-32 rounded-xl bg-white/5" />
        </div>
      </div>

      {/* Row 1 Skeleton */}
      <div>
        <div className="h-7 w-48 rounded-lg bg-white/10 mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[160px] sm:w-[190px] flex-none aspect-[2/3] rounded-2xl bg-white/[0.04] animate-pulse border border-white/5"
            />
          ))}
        </div>
      </div>

      {/* Row 2 Skeleton */}
      <div>
        <div className="h-7 w-56 rounded-lg bg-white/10 mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[160px] sm:w-[190px] flex-none aspect-[2/3] rounded-2xl bg-white/[0.04] animate-pulse border border-white/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
