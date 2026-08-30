"use client";

import { useState } from "react";
import type { ForecastData } from "@/lib/fetchForecast";
import { findRegion } from "@/lib/regions";
import { buildDayAggregates } from "@/lib/dayAggregate";
import { fullTimestampLabel } from "@/lib/time";

interface Props {
  data: ForecastData;
  regionSlug: string;
  elevation: number;
  onSelectDay: (dayKey: string) => void;
  onChangeSelection: () => void;
}

// Trajanje "zasveti obrobo" animacije ob kliku (glej .day-flash v globals.css) -
// preklop na urno napoved počakamo do konca, da je učinek viden.
const FLASH_DURATION_MS = 320;

export default function DailyOverview({ data, regionSlug, elevation, onSelectDay, onChangeSelection }: Props) {
  const region = findRegion(regionSlug);
  const days = buildDayAggregates(data, elevation);
  const approxNote = days.find((d) => d.iconIsApprox);
  const [flashingKey, setFlashingKey] = useState<string | null>(null);

  function handleSelectDay(dayKey: string) {
    if (flashingKey) return; // klik med animacijo prejšnjega dneva se ignorira
    setFlashingKey(dayKey);
    setTimeout(() => onSelectDay(dayKey), FLASH_DURATION_MS);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-wide text-white">
            {(region?.name ?? data.regionTitle).toUpperCase()}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Izračun: {data.issuedAt} · {elevation} m
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/35">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Podatki z ARSO pridobljeni: {fullTimestampLabel(new Date(data.fetchedAt))}
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
        {days.map((day) => {
          const [weekday, shortDate] = day.shortLabel.split(",").map((s) => s.trim());
          return (
            <button
              key={day.key}
              onClick={() => handleSelectDay(day.key)}
              className={`flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-violet-400/40 hover:bg-white/[0.07] ${
                flashingKey === day.key ? "day-flash" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 text-3xl">{day.icon.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-wide text-white">
                    {weekday} <span className="font-normal text-white/45">{shortDate}</span>
                  </p>
                  <p className="truncate text-xs text-white/50">{day.icon.label}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="text-base font-semibold text-white">
                  {day.maxTemp ?? "–"}° <span className="font-normal text-white/40">{day.minTemp ?? "–"}°</span>
                </p>
                <p className="flex items-center gap-1 text-xs font-medium text-violet-300">
                  <span aria-hidden>💨</span>
                  {day.maxWind ?? "–"} km/h
                </p>
              </div>
            </button>
          );
        })}
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
