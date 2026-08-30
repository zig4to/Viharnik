import type { ParsedForecast } from "./parseForecast";
import { parseArsoTime, dayKey, dayLabel } from "./time";
import { describeWeather, type WeatherInfo } from "./weatherIcon";

export interface DayAggregate {
  key: string;
  label: string;
  /** Kratka oznaka za zavihek, npr. "SOB, 29. AVG". */
  shortLabel: string;
  indices: number[];
  minTemp: number | null;
  maxTemp: number | null;
  maxWind: number | null;
  icon: WeatherInfo;
  /** Nivo, s katerega dejansko izvira prikazana ikona/opis vremena. */
  iconSourceElevation: number | null;
  /** true, če izbrani nivo nima lastnega opisa vremena in je prikazan približek s sosednjega nivoja. */
  iconIsApprox: boolean;
}

/**
 * ARSO objavlja besedilni opis/ikono vremena le za nekaj (ne vseh 7) višinskih
 * nivojev - in ta nabor se razlikuje med gorovji (npr. Pohorje ima samo
 * 1500 m, Julijske Alpe pa 1500 m in 2500 m). Če izbrani nivo nima lastne
 * ikone, vzamemo najbližji nivo, ki jo ima.
 */
export function pickIconSeries(
  data: ParsedForecast,
  elevation: number
): { values: (string | null)[]; sourceElevation: number | null } {
  const direct = data.levels[elevation]?.weatherIcon;
  if (direct) return { values: direct, sourceElevation: elevation };

  const candidates = Object.values(data.levels).filter((lvl) => lvl.weatherIcon);
  if (candidates.length === 0) {
    return { values: new Array(data.times.length).fill(null), sourceElevation: null };
  }

  candidates.sort((a, b) => Math.abs(a.elevation - elevation) - Math.abs(b.elevation - elevation));
  const nearest = candidates[0];
  return { values: nearest.weatherIcon as (string | null)[], sourceElevation: nearest.elevation };
}

export function buildDayAggregates(data: ParsedForecast, elevation: number): DayAggregate[] {
  const series = data.levels[elevation];
  const parsedTimes = data.times.map(parseArsoTime);
  const { values: iconValues, sourceElevation } = pickIconSeries(data, elevation);

  const groups = new Map<string, number[]>();
  parsedTimes.forEach((date, i) => {
    const key = dayKey(date);
    const list = groups.get(key);
    if (list) list.push(i);
    else groups.set(key, [i]);
  });

  return Array.from(groups.entries()).map(([key, indices]) => {
    const temps = indices.map((i) => series?.tempC[i] ?? null).filter((v): v is number => v !== null);
    const winds = indices.map((i) => series?.windSpeedKmh[i] ?? null).filter((v): v is number => v !== null);

    // Ikona za dan: čim bližje lokalnemu poldnevu, sicer prvi razpoložljivi podatek.
    let bestIdx = indices[0];
    let bestDiff = Infinity;
    for (const i of indices) {
      const hour = parsedTimes[i].getUTCHours(); // groba primerjava zadostuje za izbiro "opoldanske" ure
      const diff = Math.abs(hour - 12);
      if (iconValues[i] !== null && diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    }

    const label = dayLabel(parsedTimes[indices[0]]);
    const shortLabel = new Intl.DateTimeFormat("sl-SI", {
      timeZone: "Europe/Ljubljana",
      weekday: "short",
      day: "numeric",
      month: "short",
    })
      .format(parsedTimes[indices[0]])
      .toUpperCase()
      .replace(/\.$/, "");

    return {
      key,
      label,
      shortLabel,
      indices,
      minTemp: temps.length ? Math.min(...temps) : null,
      maxTemp: temps.length ? Math.max(...temps) : null,
      maxWind: winds.length ? Math.max(...winds) : null,
      icon: describeWeather(iconValues[bestIdx] ?? null),
      iconSourceElevation: sourceElevation,
      iconIsApprox: sourceElevation !== null && sourceElevation !== elevation,
    };
  });
}
