// Prevod ARSO ikonskih kod (imena datotek v style/img/weather/*.png) v emoji
// in slovenski opis. ARSO kode sestavljajo osnovno stanje neba, opcijsko
// združeno s podčrtajem z intenziteto+vrsto padavin, npr.
// "prevCloudy_lightRA.png" -> pretežno oblačno + rahel dež.

export interface WeatherInfo {
  emoji: string;
  label: string;
}

const BASE_LABELS: Record<string, string> = {
  clear: "jasno",
  mostClear: "pretežno jasno",
  partCloudy: "delno oblačno",
  prevCloudy: "pretežno oblačno",
  overcast: "oblačno",
};

const BASE_EMOJI: Record<string, string> = {
  clear: "☀️",
  mostClear: "🌤️",
  partCloudy: "⛅",
  prevCloudy: "🌥️",
  overcast: "☁️",
};

const INTENSITY_LABELS: Record<string, string> = {
  light: "rahel",
  mod: "zmeren",
  heavy: "močan",
};

const PRECIP_LABELS: Record<string, string> = {
  RA: "dež",
  SHRA: "ploha dežja",
  SN: "sneg",
  SHSN: "snežna ploha",
  TS: "nevihta",
  FG: "megla",
};

const PRECIP_EMOJI: Record<string, string> = {
  RA: "🌧️",
  SHRA: "🌦️",
  SN: "🌨️",
  SHSN: "🌨️",
  TS: "⛈️",
  FG: "🌫️",
};

function iconFileName(iconPath: string): string {
  return iconPath.split("/").pop()?.replace(/\.png$/i, "") ?? "";
}

export function describeWeather(iconPath: string | null): WeatherInfo {
  if (!iconPath) return { emoji: "❔", label: "ni podatka" };

  const file = iconFileName(iconPath);
  const [base, suffix] = file.split("_");
  const baseLabel = BASE_LABELS[base] ?? "spremenljivo";
  const baseEmoji = BASE_EMOJI[base] ?? "⛅";

  if (!suffix) return { emoji: baseEmoji, label: baseLabel };

  const match = suffix.match(/^(light|mod|heavy)([A-Z]+)$/);
  if (!match) return { emoji: baseEmoji, label: baseLabel };

  const [, intensity, precipCode] = match;
  const precipLabel = PRECIP_LABELS[precipCode] ?? "padavine";
  const intensityLabel = INTENSITY_LABELS[intensity] ?? intensity;
  const emoji = PRECIP_EMOJI[precipCode] ?? "🌦️";

  return { emoji, label: `${baseLabel}, ${intensityLabel} ${precipLabel}` };
}

const DIR_DEGREES: Record<string, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
};

/**
 * Rotacija (v stopinjah) za puščico, ki naj kaže smer, KAM veter piha
 * (ARSO ikona smeri vetra pove, OD KOD veter piha - zato prištejemo 180°).
 */
export function windArrowRotation(dir: string | null): number | null {
  if (!dir || !(dir in DIR_DEGREES)) return null;
  return (DIR_DEGREES[dir] + 180) % 360;
}
