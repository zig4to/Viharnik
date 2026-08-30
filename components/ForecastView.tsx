"use client";

import type { ParsedForecast } from "@/lib/parseForecast";
import { parseArsoTime, dayKey, dayLabel, hourLabel } from "@/lib/time";
import { findRegion } from "@/lib/regions";

interface Props {
  data: ParsedForecast;
  regionSlug: string;
  elevation: number;
  wantedDayKey: string;
  wantedDayLabel: string;
}

const DIR_SL: Record<string, string> = {
  N: "S",
  S: "J",
  E: "V",
  W: "Z",
  NE: "SV",
  NW: "SZ",
  SE: "JV",
  SW: "JZ",
};

function translateDir(dir: string | null): string {
  if (!dir) return "–";
  return DIR_SL[dir] ?? dir;
}

function fmt(value: number | null, unit: string): string {
  return value === null ? "–" : `${value}${unit}`;
}

export default function ForecastView({ data, regionSlug, elevation, wantedDayKey, wantedDayLabel }: Props) {
  const region = findRegion(regionSlug);
  const series = data.levels[elevation];

  if (!series) {
    return (
      <p className="rounded-lg border border-amber-400/40 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Za nivo {elevation} m ni podatkov na ARSO strani za {region?.name ?? regionSlug}.
      </p>
    );
  }

  const parsedTimes = data.times.map(parseArsoTime);
  const dayKeys = parsedTimes.map(dayKey);

  let indices = dayKeys
    .map((k, i) => (k === wantedDayKey ? i : -1))
    .filter((i) => i >= 0);

  let effectiveDayLabel = wantedDayLabel;
  let fallbackNote: string | null = null;

  if (indices.length === 0) {
    // Izbrani dan je zunaj razpona napovedi (npr. zadnji dan, ki ga ARSO objavi
    // le deloma) - pokažemo najbližji razpoložljivi dan namesto prazne strani.
    const wanted = new Date(wantedDayKey + "T12:00:00Z").getTime();
    let bestKey = dayKeys[0];
    let bestDiff = Infinity;
    for (const k of dayKeys) {
      const diff = Math.abs(new Date(k + "T12:00:00Z").getTime() - wanted);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestKey = k;
      }
    }
    indices = dayKeys.map((k, i) => (k === bestKey ? i : -1)).filter((i) => i >= 0);
    effectiveDayLabel = dayLabel(parsedTimes[indices[0]]);
    fallbackNote = `Za izbrani dan (${wantedDayLabel}) ARSO še ne objavlja podatkov za to območje - prikazan je najbližji razpoložljivi dan.`;
  }

  const speedsThisDay = indices.map((i) => series.windSpeedKmh[i]).filter((v): v is number => v !== null);
  const maxWind = speedsThisDay.length ? Math.max(...speedsThisDay) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
        <div>
          <h2 className="text-xl font-semibold">{region?.name ?? data.regionTitle}</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            {elevation} m · {effectiveDayLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-black/60 dark:text-white/60">Najvišja hitrost vetra ta dan</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{fmt(maxWind, " km/h")}</p>
        </div>
      </div>

      {fallbackNote && (
        <p className="rounded-lg border border-amber-400/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {fallbackNote}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-black/5 dark:bg-white/10">
              <th className="sticky left-0 bg-inherit p-2 text-left font-medium">Ura</th>
              {indices.map((i) => (
                <th key={i} className="p-2 text-center font-medium whitespace-nowrap">
                  {hourLabel(parsedTimes[i])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.weatherIcon && (
              <tr className="border-t border-black/5 dark:border-white/10">
                <td className="sticky left-0 bg-inherit p-2 font-medium">Vreme</td>
                {indices.map((i) => (
                  <td key={i} className="p-2 text-center">
                    {series.weatherIcon![i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://meteo.arso.gov.si${series.weatherIcon![i]}`}
                        alt=""
                        className="mx-auto h-6 w-6"
                      />
                    ) : (
                      "–"
                    )}
                  </td>
                ))}
              </tr>
            )}
            <tr className="border-t border-black/5 dark:border-white/10">
              <td className="sticky left-0 bg-inherit p-2 font-medium">Temperatura</td>
              {indices.map((i) => (
                <td key={i} className="p-2 text-center">
                  {fmt(series.tempC[i], " °C")}
                </td>
              ))}
            </tr>
            <tr className="border-t border-black/5 bg-blue-50/60 dark:border-white/10 dark:bg-blue-950/20">
              <td className="sticky left-0 bg-inherit p-2 font-medium">Veter</td>
              {indices.map((i) => (
                <td key={i} className="p-2 text-center font-medium">
                  {fmt(series.windSpeedKmh[i], " km/h")} {translateDir(series.windDir[i])}
                </td>
              ))}
            </tr>
            <tr className="border-t border-black/5 dark:border-white/10">
              <td className="sticky left-0 bg-inherit p-2 font-medium">Vlažnost</td>
              {indices.map((i) => (
                <td key={i} className="p-2 text-center">
                  {fmt(series.humidityPct[i], " %")}
                </td>
              ))}
            </tr>
            <tr className="border-t border-black/5 dark:border-white/10">
              <td className="sticky left-0 bg-inherit p-2 font-medium">Meja ničte izoterme</td>
              {indices.map((i) => (
                <td key={i} className="p-2 text-center">
                  {fmt(data.freezingLevelM[i], " m")}
                </td>
              ))}
            </tr>
            <tr className="border-t border-black/5 dark:border-white/10">
              <td className="sticky left-0 bg-inherit p-2 font-medium">Meja sneženja</td>
              {indices.map((i) => (
                <td key={i} className="p-2 text-center">
                  {fmt(data.snowLineM[i], " m")}
                </td>
              ))}
            </tr>
            <tr className="border-t border-black/5 dark:border-white/10">
              <td className="sticky left-0 bg-inherit p-2 font-medium">Stabilnost ozračja</td>
              {indices.map((i) => (
                <td key={i} className="p-2 text-center whitespace-nowrap">
                  {data.stability[i] ?? "–"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-black/50 dark:text-white/50">
        Izračun: {data.issuedAt} · vir: ARSO (Agencija RS za okolje) - modelska napoved, ne izmerjeni podatki.
      </p>
    </div>
  );
}
