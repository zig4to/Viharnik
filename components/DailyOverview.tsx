"use client";

import type { ParsedForecast } from "@/lib/parseForecast";
import { findRegion } from "@/lib/regions";
import { buildDayAggregates } from "@/lib/dayAggregate";

interface Props {
  data: ParsedForecast;
  regionSlug: string;
  elevation: number;
  onSelectDay: (dayKey: string) => void;
  onChangeSelection: () => void;
}

export default function DailyOverview({ data, regionSlug, elevation, onSelectDay, onChangeSelection }: Props) {
  const region = findRegion(regionSlug);
  const days = buildDayAggregates(data, elevation);
  const approxNote = days.find((d) => d.iconIsApprox);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-white">
            {(region?.name ?? data.regionTitle).toUpperCase()}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Izračun: {data.issuedAt} · {elevation} m
          </p>
        </div>
        <button
          onClick={onChangeSelection}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition hover:border-violet-400/50 hover:text-white"
        >
          Spremeni izbiro
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {days.map((day) => (
          <button
            key={day.key}
            onClick={() => onSelectDay(day.key)}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-violet-400/40 hover:bg-white/[0.07]"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{day.icon.emoji}</span>
              <div>
                <p className="font-semibold text-white">{day.label}</p>
                <p className="text-sm text-white/50">{day.icon.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-right">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">Veter</p>
                <p className="font-medium text-violet-300">{day.maxWind ?? "–"} km/h</p>
              </div>
              <div className="min-w-[70px]">
                <p className="text-lg font-semibold text-white">
                  {day.maxTemp ?? "–"}° <span className="text-white/40">{day.minTemp ?? "–"}°</span>
                </p>
              </div>
              <span className="text-white/30">›</span>
            </div>
          </button>
        ))}
      </div>

      {approxNote && (
        <p className="text-xs text-white/40">
          Opomba: ARSO objavlja opis vremena (ikono) le za nekaj nivojev - za {elevation} m je prikazan približek z
          nivoja {approxNote.iconSourceElevation} m.
        </p>
      )}
    </div>
  );
}
