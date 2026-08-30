"use client";

import { useState } from "react";
import type { ParsedForecast } from "@/lib/parseForecast";
import ForecastForm, { type FormValue } from "./ForecastForm";
import ForecastView from "./ForecastView";
import { MOUNTAIN_REGIONS, ELEVATION_LEVELS } from "@/lib/regions";
import { dayKey, dayLabel } from "@/lib/time";

const initialValue: FormValue = {
  region: MOUNTAIN_REGIONS[0].slug,
  elevation: ELEVATION_LEVELS[2], // 1500 m - smiseln privzeti nivo za pohodništvo
  dayKey: dayKey(new Date()),
  dayLabel: dayLabel(new Date()),
};

export default function ForecastApp() {
  const [selection, setSelection] = useState<FormValue>(initialValue);
  const [data, setData] = useState<ParsedForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAndShow(value: FormValue) {
    setSelection(value);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forecast/${value.region}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setData(body as ParsedForecast);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Neznana napaka pri nalaganju napovedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Viharnik</h1>
        <p className="text-black/60 dark:text-white/60">
          Pregledna gorska vremenska napoved po podatkih ARSO.
        </p>
      </header>

      <ForecastForm initial={selection} onSubmit={loadAndShow} />

      {loading && <p className="text-sm text-black/60 dark:text-white/60">Nalagam napoved …</p>}

      {error && (
        <p className="rounded-lg border border-red-400/40 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {data && !loading && !error && (
        <ForecastView
          data={data}
          regionSlug={selection.region}
          elevation={selection.elevation}
          wantedDayKey={selection.dayKey}
          wantedDayLabel={selection.dayLabel}
        />
      )}
    </div>
  );
}
