import { forecastUrl } from "./regions";
import { parseForecastHtml, type ParsedForecast } from "./parseForecast";

const CACHE_TTL_MS = 45 * 60 * 1000; // ARSO osveži stran ~2x/dnevno, 45 min je dovolj sveže

export interface ForecastData extends ParsedForecast {
  /** Kdaj je NAŠ strežnik nazadnje dejansko prenesel stran z ARSO (ISO), ne iz predpomnilnika. */
  fetchedAt: string;
}

interface CacheEntry {
  data: ParsedForecast;
  fetchedAt: number;
}

// V-memory cache po slugu območja. Živi za življenjsko dobo procesa
// strežnika (dovolj za "priložnostno branje v živo" brez ločenega cron opravila).
// Opomba: na serverless gostovanju (npr. Vercel) se ob vsakem "cold startu"
// procesa ta cache izprazni - v praksi to pomeni še pogostejše sveže prenose.
const cache = new Map<string, CacheEntry>();

export async function getForecast(slug: string): Promise<ForecastData> {
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached.data, fetchedAt: new Date(cached.fetchedAt).toISOString() };
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
    if (cached) return { ...cached.data, fetchedAt: new Date(cached.fetchedAt).toISOString() };
    throw new Error(`ARSO stran za '${slug}' je vrnila HTTP ${res.status}: ${url}`);
  }

  const html = await res.text();
  const data = parseForecastHtml(html);
  const fetchedAt = Date.now();
  cache.set(slug, { data, fetchedAt });
  return { ...data, fetchedAt: new Date(fetchedAt).toISOString() };
}
