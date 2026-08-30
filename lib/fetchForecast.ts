import { forecastUrl } from "./regions";
import { parseForecastHtml, type ParsedForecast } from "./parseForecast";

const CACHE_TTL_MS = 45 * 60 * 1000; // ARSO osveži stran ~2x/dnevno, 45 min je dovolj sveže

interface CacheEntry {
  data: ParsedForecast;
  fetchedAt: number;
}

// V-memory cache po slugu območja. Živi za življenjsko dobo procesa
// strežnika (dovolj za "priložnostno branje v živo" brez ločenega cron opravila).
const cache = new Map<string, CacheEntry>();

export async function getForecast(slug: string): Promise<ParsedForecast> {
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = forecastUrl(slug);
  const res = await fetch(url, {
    headers: {
      // Header vrednosti morajo biti ASCII (brskalniki/fetch to strogo preverjajo).
      "User-Agent": "Viharnik/0.1 (osebni pripomocek za gorsko vremensko napoved; kontakt: tina.brdnik@gmail.com)",
    },
    // ARSO stran ni podprta za CDN/edge caching s strani Next.js - sami upravljamo cache zgoraj.
    cache: "no-store",
  });

  if (!res.ok) {
    // Če imamo star (čeprav zastarel) cache, je bolje vrniti njega kot pasti aplikacijo.
    if (cached) return cached.data;
    throw new Error(`ARSO stran za '${slug}' je vrnila HTTP ${res.status}: ${url}`);
  }

  const html = await res.text();
  const data = parseForecastHtml(html);
  cache.set(slug, { data, fetchedAt: Date.now() });
  return data;
}
