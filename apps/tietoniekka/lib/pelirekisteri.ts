// Kokoelmakohtaiset pelit (5.10.2026, Vaalit-hub v1). Hubin pelirivit (päivän peli, Laita järjestykseen,
// Kumpi?) ja niiden mode-chipit renderöidään VAIN tämän rekisterin perusteella: kun peli julkaistaan,
// se lisätään tänne ja rivi ilmestyy hubiin ilman hubin koodimuutosta. Tyhjä lista = ei riviä, ei
// "Tulossa"-paikkoja (Cowork 5.10.: ei tyhjiä paikkoja).
import { JULKAISTUT, pakkaHref } from "./jarjesta/pakat";
import { VPK_NIMI, VPK_SIVU, vpkNumero } from "./vaalipiiriketju";

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
  /** Päivän peli: päivän numero (#1 = julkaisupäivä), lasketaan renderöidessä. */
  numero?: (iso: string) => number;
};

// Laita järjestykseen -pakat tulevat suoraan pakkakonfiguraatiosta (julkaistu: true).
export const PELIT: KokoelmaPeli[] = [
  {
    kokoelma: "vaalit",
    tyyppi: "paivan-peli",
    slug: "vaalipiiriketju",
    otsikko: VPK_NIMI,
    meta: "Kahdeksan kansanedustajaa, yksi ehjä ketju vaalipiiristä toiseen",
    href: VPK_SIVU,
    numero: vpkNumero,
  },
  ...JULKAISTUT.map((p) => ({
    kokoelma: p.collection.slug,
    tyyppi: "jarjesta" as const,
    slug: p.slug,
    otsikko: p.kortti.otsikko,
    meta: p.kortti.meta,
    href: pakkaHref(p),
  })),
];

export const kokoelmanPelit = (kokoelma: string, tyyppi?: PeliTyyppi) =>
  PELIT.filter((p) => p.kokoelma === kokoelma && (!tyyppi || p.tyyppi === tyyppi));
