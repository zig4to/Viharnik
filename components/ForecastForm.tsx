"use client";

import { useState } from "react";
import { MOUNTAIN_REGIONS, ELEVATION_LEVELS } from "@/lib/regions";
import { dayKey, dayLabel } from "@/lib/time";

export interface FormValue {
  region: string;
  elevation: number;
  dayKey: string;
  dayLabel: string;
}

interface Props {
  initial: FormValue;
  onSubmit: (value: FormValue) => void;
}

function buildDayOptions() {
  const options: { key: string; label: string }[] = [];
  for (let offset = 0; offset < 5; offset++) {
    const date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000);
    options.push({ key: dayKey(date), label: dayLabel(date) });
  }
  return options;
}

export default function ForecastForm({ initial, onSubmit }: Props) {
  const [region, setRegion] = useState(initial.region);
  const [elevation, setElevation] = useState(initial.elevation);
  const dayOptions = buildDayOptions();
  const [selectedDay, setSelectedDay] = useState(dayOptions[0]);

  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ region, elevation, dayKey: selectedDay.key, dayLabel: selectedDay.label });
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Gorovje</span>
        <select
          className="rounded-md border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-black/20"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {MOUNTAIN_REGIONS.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Nadmorska višina</span>
        <select
          className="rounded-md border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-black/20"
          value={elevation}
          onChange={(e) => setElevation(Number(e.target.value))}
        >
          {ELEVATION_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl} m
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Dan</span>
        <select
          className="rounded-md border border-black/15 bg-white px-3 py-2 dark:border-white/20 dark:bg-black/20"
          value={selectedDay.key}
          onChange={(e) => {
            const found = dayOptions.find((d) => d.key === e.target.value);
            if (found) setSelectedDay(found);
          }}
        >
          {dayOptions.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Prikaži napoved
      </button>
    </form>
  );
}
