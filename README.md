# Viharnik

Pregledna spletna aplikacija za gorsko vremensko napoved, ki podatke pridobi
neposredno iz [ARSO](https://meteo.arso.gov.si) strani "Modelska napoved
višinskih vrednosti" (osem gorskih območij, ki jih objavlja ARSO) in jih
prikaže po izbranem gorovju, nadmorski višini in dnevu.

## Zakaj HTML in ne XML

ARSO na strani [meteo.arso.gov.si/met/sl/service/](https://meteo.arso.gov.si/met/sl/service/)
sicer omenja XML/RSS/HTML formate, a to velja za splošne vremenske napovedi po
(upravnih) regijah Slovenije - ne za ta specifičen produkt gorskih napovedi.
Za gorske napovedi ARSO objavlja samo HTML, zato jih aplikacija razčleni sama
(glej `lib/parseForecast.ts`).

## Razvoj

```bash
npm install
npm run dev
```

Odpri [http://localhost:3000](http://localhost:3000).

API endpoint: `GET /api/forecast/<REGION>`, kjer je `<REGION>` eden izmed
slug-ov iz `lib/regions.ts` (npr. `JULIAN-ALPS`, `POHORJE`, ...).

### Preizkus parserja brez omrežja

```bash
npx tsx scripts/test-parse.ts
```

Uporablja shranjen primer strani v `fixtures/forecast_SI_JULIAN-ALPS_long.html`.

## Struktura

- `lib/regions.ts` - fiksen seznam 8 gorskih območij in 7 višinskih nivojev modela.
- `lib/parseForecast.ts` - razčlenjevanje ARSO HTML tabele v strukturiran JSON.
- `lib/fetchForecast.ts` - prenos strani + predpomnilnik (45 min TTL).
- `lib/time.ts` - pretvorba ARSO časovnih oznak v lokalni čas (Europe/Ljubljana).
- `app/api/forecast/[region]/route.ts` - API endpoint.
- `components/ForecastForm.tsx`, `ForecastView.tsx`, `ForecastApp.tsx` - uporabniški vmesnik.
