// ARSO časovne oznake so podane brez pripone (npr. "2026-08-30 06:00:00"),
// a dejansko predstavljajo UTC trenutek (glede na primerjavo z izpisanimi
// CEST oznakami na strani). Tu jih pretvorimo v pravi Date in nato za prikaz
// uporabimo časovni pas Europe/Ljubljana, da so ure/dnevi pravilni ne glede
// na poletni/zimski čas.

export function parseArsoTime(raw: string): Date {
  return new Date(raw.replace(" ", "T") + "Z");
}

const TIME_ZONE = "Europe/Ljubljana";

/** Ključ za združevanje po (lokalnem) dnevu - "YYYY-MM-DD". */
export function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE }).format(date);
}

/** Prikazni naslov dneva, npr. "nedelja, 30. avgust 2026". */
export function dayLabel(date: Date): string {
  const label = new Intl.DateTimeFormat("sl-SI", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Prikaz ure, npr. "08:00". */
export function hourLabel(date: Date): string {
  return new Intl.DateTimeFormat("sl-SI", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
