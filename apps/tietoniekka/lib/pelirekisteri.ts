// Kokoelmakohtaiset pelit (5.10.2026, Vaalit-hub v1). Hubin pelirivit (päivän peli, Laita järjestykseen,
// Kumpi?) ja niiden mode-chipit renderöidään VAIN tämän rekisterin perusteella: kun peli julkaistaan,
// se lisätään tänne ja rivi ilmestyy hubiin ilman hubin koodimuutosta. Tyhjä lista = ei riviä, ei
// "Tulossa"-paikkoja (Cowork 5.10.: ei tyhjiä paikkoja).
export type PeliTyyppi = "paivan-peli" | "jarjesta" | "kumpi";

export type KokoelmaPeli = {
  kokoelma: string;
  tyyppi: PeliTyyppi;
  slug: string;
  otsikko: string;
  /** Kortin alarivi, esim. "8 nimeä". */
  meta: string;
  href: string;
  /** Laita järjestykseen: puolikaarimotiivin korostettavat paikat (0 = kahdeksan satunnaista). */
  korosta?: number;
};

export const PELIT: KokoelmaPeli[] = [];

export const kokoelmanPelit = (kokoelma: string, tyyppi?: PeliTyyppi) =>
  PELIT.filter((p) => p.kokoelma === kokoelma && (!tyyppi || p.tyyppi === tyyppi));
