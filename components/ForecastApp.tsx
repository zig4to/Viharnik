"use client";

import { useState } from "react";
import type { ParsedForecast } from "@/lib/parseForecast";
import ForecastForm, { type FormValue } from "./ForecastForm";
import DailyOverview from "./DailyOverview";
import HourlyView from "./HourlyView";
import { MOUNTAIN_REGIONS, ELEVATION_LEVELS } from "@/lib/regions";

type View = "form" | "days" | "hours";

const initialValue: FormValue = {
  region: MOUNTAIN_REGIONS[0].slug,
  elevation: ELEVATION_LEVELS[2], // 1500 m - smiseln privzeti nivo za pohodništvo
};

export default function ForecastApp() {
  const [view, setView] = useState<View>("form");
  const [selection, setSelection] = useState<FormValue>(initialValue);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [data, setData] = useState<ParsedForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(value: FormValue) {
    setSelection(value);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/forecast/${value.region}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setData(body as ParsedForecast);
      setView("days");
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Neznana napaka pri nalaganju napovedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-xl font-bold tracking-wide text-white">Viharnik</h1>
        <p className="text-sm text-white/50">Pregledna gorska vremenska napoved po podatkih ARSO.</p>
      </header>

      {view === "form" && <ForecastForm initial={selection} onSubmit={handleSubmit} />}

      {loading && <p className="text-sm text-white/60">Nalagam napoved …</p>}

      {error && (
        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>
      )}

      {view === "days" && data && !loading && (
        <DailyOverview
          data={data}
          regionSlug={selection.region}
          elevation={selection.elevation}
          onSelectDay={(key) => {
            setSelectedDayKey(key);
            setView("hours");
          }}
          onChangeSelection={() => setView("form")}
        />
      )}

      {view === "hours" && data && selectedDayKey && (
        <HourlyView
          data={data}
          regionSlug={selection.region}
          elevation={selection.elevation}
          selectedDayKey={selectedDayKey}
          onSelectDay={setSelectedDayKey}
          onBack={() => setView("days")}
        />
      )}
    </div>
  );
}
