import * as cheerio from "cheerio";

/**
 * Parser za ARSO stran "Modelska napoved višinskih vrednosti" za posamezno
 * gorsko območje, npr.:
 * https://meteo.arso.gov.si/uploads/probase/www/fproduct/text/sl/forecast_SI_JULIAN-ALPS_long.html
 *
 * Stran je zgrajena kot en <table class="meteoSI-table">, kjer ima vsaka
 * podatkovna celica <td> atribut class enak ISO časovni oznaki koraka
 * (npr. class="2026-08-30 06:00:00") - to uporabimo kot ključ za združevanje
 * vrstic v časovno serijo. Vrstice si sledijo v ponavljajočih se sklopih:
 * "Vreme na X m" (ikona), "Temperatura" (naslov) + " na X m" (vrednost na
 * nivo), "Višina ničte izoterme", "Meja sneženja", "Veter" (naslov) +
 * (" na X m" ikona / "hitrost" km/h) na nivo, "Vlažnost" (naslov) + " na X m",
 * "Stabilnost". Med sklopi so distančne vrstice, kjer so vse podatkovne
 * celice prazne (&nbsp;).
 */

export interface LevelSeries {
  elevation: number;
  tempC: (number | null)[];
  humidityPct: (number | null)[];
  windSpeedKmh: (number | null)[];
  windDir: (string | null)[];
  /** Ikona vremena na tem nivoju - ARSO je objavlja le za nekaj (ne vseh) nivojev. */
  weatherIcon: (string | null)[] | null;
}

export interface ParsedForecast {
  regionTitle: string;
  issuedAt: string;
  times: string[];
  levels: Record<number, LevelSeries>;
  freezingLevelM: (number | null)[];
  snowLineM: (number | null)[];
  stability: (string | null)[];
}

const NBSP = / /g;

function cleanText(raw: string): string {
  return raw.replace(NBSP, " ").replace(/\s+/g, " ").trim();
}

function extractNumber(text: string): number | null {
  const cleaned = cleanText(text);
  const match = cleaned.match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

/** Iz imena datoteke ikone vetra (npr. "modNW.png") izlušči smer ("NW"). */
function windDirFromIcon(src: string): string | null {
  const file = src.split("/").pop() ?? "";
  const match = file.match(/([NSEW]{1,2})\.png$/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * ARSO vremenske ikone so relativne poti (npr. "/uploads/meteo/style/img/weather/clear.png").
 * Shranimo celotno pot, da jo lahko frontend neposredno prikaže kot <img>.
 */
function weatherIconSrc(src: string): string | null {
  return src || null;
}

class ParseError extends Error {}

export function parseForecastHtml(html: string): ParsedForecast {
  const $ = cheerio.load(html);
  const table = $("table.meteoSI-table");
  if (table.length === 0) {
    throw new ParseError(
      "Pričakovane tabele 'table.meteoSI-table' ni na strani - je ARSO spremenil obliko?"
    );
  }

  const regionTitle = cleanText(table.find("th.meteoSI-header").first().text());
  const rows = table.find("tbody > tr").toArray();
  if (rows.length === 0) {
    throw new ParseError("Tabela ne vsebuje vrstic (tbody > tr).");
  }

  // Prva vrstica nosi napis "Izračun: ..." v prvi celici; preostale celice so
  // le dnevne oznake stolpcev (redundantne s časovnimi žigi v razredih
  // podatkovnih celic), zato jih preskočimo.
  const firstRowFirstCell = $(rows[0]).find("td").first();
  const issuedAt = cleanText(firstRowFirstCell.text()).replace(/^Izračun:\s*/, "");
  if (!issuedAt) {
    throw new ParseError("Ni bilo mogoče najti besedila 'Izračun: ...' v prvi vrstici tabele.");
  }

  const times: string[] = [];
  const timeIndex = new Map<string, number>();
  function indexForTime(time: string): number {
    let idx = timeIndex.get(time);
    if (idx === undefined) {
      idx = times.length;
      times.push(time);
      timeIndex.set(time, idx);
    }
    return idx;
  }

  const levels: Record<number, LevelSeries> = {};
  function levelFor(elevation: number): LevelSeries {
    let series = levels[elevation];
    if (!series) {
      series = {
        elevation,
        tempC: [],
        humidityPct: [],
        windSpeedKmh: [],
        windDir: [],
        weatherIcon: null,
      };
      levels[elevation] = series;
    }
    return series;
  }

  const freezingLevelM: (number | null)[] = [];
  const snowLineM: (number | null)[] = [];
  const stability: (string | null)[] = [];

  let currentSection = "";
  /** Nivo, na katerega se nanaša naslednja vrstica "hitrost" (za veter). */
  let pendingWindLevel: number | null = null;

  for (let i = 1; i < rows.length; i++) {
    const tds = $(rows[i]).find("td").toArray();
    if (tds.length < 2) continue;

    const label = cleanText($(tds[0]).text());
    const dataTds = tds.slice(1);
    const hasData = dataTds.some((td) => $(td).find("img").length > 0 || cleanText($(td).text()) !== "");

    if (!hasData) {
      if (label !== "") currentSection = label;
      continue; // distančna vrstica ali čista naslovna vrstica sekcije
    }

    // Za vsako podatkovno celico dobimo indeks časovnega koraka iz njenega class="ISO čas".
    const cellsWithTime = dataTds.map((td) => {
      const cls = $(td).attr("class") ?? "";
      return { td, time: cls };
    });

    const weatherMatch = label.match(/^Vreme na (\d+) m$/);
    const levelMatch = label.match(/^na (\d+) m$/);

    if (weatherMatch) {
      const elevation = Number(weatherMatch[1]);
      const series = levelFor(elevation);
      const icons: (string | null)[] = new Array(times.length).fill(null);
      for (const { td, time } of cellsWithTime) {
        const idx = indexForTime(time);
        const src = $(td).find("img").attr("src") ?? "";
        icons[idx] = weatherIconSrc(src);
      }
      series.weatherIcon = mergeSparse(series.weatherIcon, icons, times.length);
    } else if (levelMatch && currentSection === "Temperatura") {
      const elevation = Number(levelMatch[1]);
      const series = levelFor(elevation);
      for (const { td, time } of cellsWithTime) {
        const idx = indexForTime(time);
        series.tempC[idx] = extractNumber($(td).text());
      }
    } else if (levelMatch && currentSection === "Veter") {
      // Vrstica z ikono smeri/jakosti vetra za ta nivo; hitrost sledi v naslednji vrstici.
      const elevation = Number(levelMatch[1]);
      pendingWindLevel = elevation;
      const series = levelFor(elevation);
      for (const { td, time } of cellsWithTime) {
        const idx = indexForTime(time);
        const src = $(td).find("img").attr("src") ?? "";
        series.windDir[idx] = windDirFromIcon(src);
      }
    } else if (label === "hitrost" && currentSection === "Veter") {
      if (pendingWindLevel === null) {
        throw new ParseError("Vrstica 'hitrost' se je pojavila brez predhodne vrstice smeri vetra.");
      }
      const series = levelFor(pendingWindLevel);
      for (const { td, time } of cellsWithTime) {
        const idx = indexForTime(time);
        series.windSpeedKmh[idx] = extractNumber($(td).text());
      }
      pendingWindLevel = null;
    } else if (levelMatch && currentSection === "Vlažnost") {
      const elevation = Number(levelMatch[1]);
      const series = levelFor(elevation);
      for (const { td, time } of cellsWithTime) {
        const idx = indexForTime(time);
        series.humidityPct[idx] = extractNumber($(td).text());
      }
    } else if (label === "Višina ničte izoterme") {
      for (const { td, time } of cellsWithTime) {
        const idx = indexForTime(time);
        freezingLevelM[idx] = extractNumber($(td).text());
      }
    } else if (label === "Meja sneženja") {
      for (const { td, time } of cellsWithTime) {
        const idx = indexForTime(time);
        snowLineM[idx] = extractNumber($(td).text());
      }
    } else if (label === "Stabilnost") {
      for (const { td, time } of cellsWithTime) {
        const idx = indexForTime(time);
        stability[idx] = cleanText($(td).text()) || null;
      }
    }
    // Neznane vrstice (npr. nova sekcija, ki je ARSO še nismo videli) tiho
    // preskočimo - namenoma ne mečemo napake tukaj, ker gre lahko za
    // dodaten, za nas nepomemben podatek.
  }

  if (times.length === 0) {
    throw new ParseError("V tabeli ni bilo najdene nobene časovne oznake - struktura strani je verjetno spremenjena.");
  }
  if (Object.keys(levels).length === 0) {
    throw new ParseError("V tabeli ni bilo najdenega nobenega višinskega nivoja.");
  }

  // Poravnaj dolžino vseh serij na times.length (manjkajoče vrednosti = null).
  for (const series of Object.values(levels)) {
    padTo(series.tempC, times.length);
    padTo(series.humidityPct, times.length);
    padTo(series.windSpeedKmh, times.length);
    padTo(series.windDir, times.length);
  }
  padTo(freezingLevelM, times.length);
  padTo(snowLineM, times.length);
  padTo(stability, times.length);

  return { regionTitle, issuedAt, times, levels, freezingLevelM, snowLineM, stability };
}

function padTo<T>(arr: (T | null)[], length: number): void {
  while (arr.length < length) arr.push(null);
}

function mergeSparse(
  existing: (string | null)[] | null,
  incoming: (string | null)[],
  length: number
): (string | null)[] {
  const base = existing ? [...existing] : new Array(length).fill(null);
  padTo(base, incoming.length);
  padTo(incoming, base.length);
  for (let i = 0; i < base.length; i++) {
    if (incoming[i] !== null) base[i] = incoming[i];
  }
  return base;
}
