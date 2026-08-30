"use client";

import { useState } from "react";
import { MOUNTAIN_REGIONS, ELEVATION_LEVELS } from "@/lib/regions";

export interface FormValue {
  region: string;
  elevation: number;
}

interface Props {
  initial: FormValue;
  onSubmit: (value: FormValue) => void;
}

export default function ForecastForm({ initial, onSubmit }: Props) {
  const [region, setRegion] = useState(initial.region);
  const [elevation, setElevation] = useState(initial.elevation);

  return (
    <form
      className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-end sm:gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ region, elevation });
      }}
    >
      <label className="flex flex-1 flex-col gap-2 text-sm">
        <span className="font-medium text-white/70">Gorovje</span>
        <select
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400/60"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {MOUNTAIN_REGIONS.map((r) => (
            <option key={r.slug} value={r.slug} className="bg-[#171933] text-white">
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-2 text-sm sm:max-w-[160px]">
        <span className="font-medium text-white/70">Nadmorska višina</span>
        <select
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400/60"
          value={elevation}
          onChange={(e) => setElevation(Number(e.target.value))}
        >
          {ELEVATION_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl} className="bg-[#171933] text-white">
              {lvl} m
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-400 hover:to-indigo-400"
      >
        Prikaži napoved
      </button>
    </form>
  );
}
