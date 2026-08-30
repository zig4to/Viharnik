"use client";

import type { ForecastData } from "@/lib/fetchForecast";
import { findRegion } from "@/lib/regions";
import { buildDayAggregates, pickIconSeries } from "@/lib/dayAggregate";
import { parseArsoTime, hourLabel, fullTimestampLabel } from "@/lib/time";
import { describeWeather, windArrowRotation } from "@/lib/weatherIcon";

interface Props {
  data: ForecastData;
  regionSlug: string;
  elevation: number;
  selectedDayKey: string;
  onSelectDay: (dayKey: string) => void;
  onBack: () => void;
}

export default function HourlyView({ data, regionSlug, elevation, selectedDayKey, onSelectDay, onBack }: Props) {
  const region = findRegion(regionSlug);
  const days = buildDayAggregates(data, elevation);
  const day = days.find((d) => d.key === selectedDayKey) ?? days[0];
  const series = data.levels[elevation];
  const { values: iconValues } = pickIconSeries(data, elevation);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1 text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Nazaj na dneve
        </button>
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

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((d) => (
          <button
            key={d.key}
            onClick={() => onSelectDay(d.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide whitespace-nowrap transition ${
              d.key === day.key
                ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-900/40"
                : "border border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
            }`}
          >
            {d.shortLabel}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {day.indices.map((i) => {
          const info = describeWeather(iconValues[i] ?? null);
          const rotation = windArrowRotation(series?.windDir[i] ?? null);
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-md shadow-black/10 backdrop-blur-xl"
            >
              <div className="w-14 shrink-0 text-sm tabular-nums text-white/70">
                {hourLabel(parseArsoTime(data.times[i]))}
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="shrink-0 text-2xl">{info.emoji}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {series?.tempC[i] ?? "–"}&nbsp;°C
                  </p>
                  <p className="truncate text-sm text-white/50">{info.label}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-medium text-violet-300">{series?.windSpeedKmh[i] ?? "–"} km/h</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10">
                  <span
                    className="text-violet-300"
                    style={{ display: "inline-block", transform: rotation !== null ? `rotate(${rotation}deg)` : undefined }}
                  >
                    {rotation !== null ? "↑" : "–"}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
