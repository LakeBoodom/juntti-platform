// MAAKUNTIEN VAAKUNAT (CD "Järjestä yhtenäinen UX", Heikki 2.11.2026): omat kevyet kopiot public/20/jarjesta/vaakunat/
// (enintään 192 px, ~8 kt; alkuperäiset 960–1280 px PNG:t ovat 39–288 kt). Krediitit lib/kuvalahteet.ts.
// Tavallinen moduuli: kierros.ts, hub ja kuvalähteet käyttävät tätä.

const SLUGIT: Record<string, string> = {
  "Ahvenanmaa": "ahvenanmaa",
  "Etelä-Karjala": "etela-karjala",
  "Etelä-Pohjanmaa": "etela-pohjanmaa",
  "Etelä-Savo": "etela-savo",
  "Kainuu": "kainuu",
  "Kanta-Häme": "kanta-hame",
  "Keski-Pohjanmaa": "keski-pohjanmaa",
  "Keski-Suomi": "keski-suomi",
  "Kymenlaakso": "kymenlaakso",
  "Lappi": "lappi",
  "Päijät-Häme": "paijat-hame",
  "Pirkanmaa": "pirkanmaa",
  "Pohjanmaa": "pohjanmaa",
  "Pohjois-Karjala": "pohjois-karjala",
  "Pohjois-Pohjanmaa": "pohjois-pohjanmaa",
  "Pohjois-Savo": "pohjois-savo",
  "Satakunta": "satakunta",
  "Uusimaa": "uusimaa",
  "Varsinais-Suomi": "varsinais-suomi",
};

export const VAAKUNAT = Object.keys(SLUGIT);

export const vaakunaSlug = (maakunta: string) => SLUGIT[maakunta] ?? null;

/** Maakunnan vaakunan oma kopio tai null, jolloin rivi näytetään kuvattomana (ei koskaan henkilösiluettia). */
export function vaakunaKuva(maakunta: string): string | null {
  const s = vaakunaSlug(maakunta);
  return s ? `/20/jarjesta/vaakunat/${s}.webp` : null;
}
