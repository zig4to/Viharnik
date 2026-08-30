// Fiksni seznam gorskih območij in višinskih nivojev, ki jih ARSO objavlja
// na strani "Modelska napoved višinskih vrednosti":
// https://meteo.arso.gov.si/uploads/probase/www/fproduct/text/sl/forecast_si-mountain/upperAir-long-index.html

export interface MountainRegion {
  /** ARSO URL slug, uporabljen v forecast_SI_<slug>_long.html */
  slug: string;
  /** Prikazno ime v slovenščini */
  name: string;
}

export const MOUNTAIN_REGIONS: MountainRegion[] = [
  { slug: "JULIAN-ALPS", name: "Julijske Alpe" },
  { slug: "JULIAN-ALPS_SOUTH-WEST", name: "Jugozahodne Julijske Alpe" },
  { slug: "KAMNIK-SAVINJA-ALPS", name: "Kamniško-Savinjske Alpe" },
  { slug: "KARAVANKE-ALPS", name: "Karavanke" },
  { slug: "POHORJE", name: "Pohorje" },
  { slug: "SNEZNIK", name: "Snežnik" },
  { slug: "SKOFJELOSKO-HRIBOVJE", name: "Škofjeloško hribovje" },
  { slug: "EAST-MOUNTAINS", name: "Vzhodnoslovensko hribovje" },
];

// Vertikalni nivoji vremenskega modela - enaki za vsa gorska območja
// (niso dejanska nadmorska višina vrha, temveč fiksni nivoji modela ECMWF/ALADIN).
export const ELEVATION_LEVELS = [500, 1000, 1500, 2000, 2500, 3000, 5500] as const;
export type ElevationLevel = (typeof ELEVATION_LEVELS)[number];

export function findRegion(slug: string): MountainRegion | undefined {
  return MOUNTAIN_REGIONS.find((r) => r.slug === slug);
}

export function forecastUrl(slug: string): string {
  return `https://meteo.arso.gov.si/uploads/probase/www/fproduct/text/sl/forecast_SI_${slug}_long.html`;
}
