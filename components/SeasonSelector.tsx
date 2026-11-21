
"use client";

interface SeasonSelectorProps {
  seasons: number[];
  activeSeason: number;
  onSeasonChange: (season: number) => void;
  totalEpisodes: number;
}

export function SeasonSelector({
  seasons,
  activeSeason,
  onSeasonChange,
  totalEpisodes,
}: SeasonSelectorProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0e13] p-4 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            Select Season
          </h3>
          <p className="mt-1 text-xs text-white/40">
            Choose a season to browse its episodes.
          </p>
        </div>

        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60">
          {totalEpisodes} Episodes
        </span>
      </div>

      {seasons.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {seasons.map((season) => {
            const active = season === activeSeason;

            return (
              <button
                key={season}
                type="button"
                onClick={() => onSeasonChange(season)}
                aria-pressed={active}
                className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  active
                    ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                Season {season}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-white/45">
          No seasons available.
        </p>
      )}
    </div>
  );
}
