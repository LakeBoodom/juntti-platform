// TIETOKETJU: IKÄJÄRJESTYS — ammatti → kategoria -mappaus.
//
// Kopioitu tarkoituksella components/tn20/PersonBrowser.tsx:n ja
// app/(tn20)/kokoelma/[collection]/page.tsx:n ROLE_GROUPS/roleGroup-logiikasta
// (26.–29.8.2026), jotta "Tunnetut henkilöt" -hubin nykyinen kategorisointi
// pysyy täysin ennallaan tämän uuden pelimuodon rinnalla. Ei tuotu jaetuksi
// importiksi noista tiedostoista, koska ne ovat jo tuotannossa eikä niiden
// julkista rajapintaa haluttu muuttaa tämän tehtävän yhteydessä — pieni
// data-const-duplikaatio on pienempi riski kuin toisen pelimuodon
// koskeminen. Jos mappaus joskus eriytyy, päivitä molemmat kohdat.

export const ROLE_GROUPS: Record<string, string[]> = {
  nayttelijat: ["näyttelijä"],
  artistit: [
    "laulaja", "muusikko", "räppäri", "rap-artisti", "pop-artisti", "pianisti",
    "oopperalaulaja", "kapellimestari", "dj", "viihdetaiteilija",
  ],
  urheilijat: [
    "jääkiekkoilija", "jalkapalloilija", "formulakuljettaja", "f1-kuljettaja", "hiihtäjä", "tennispelaaja",
    "mäkihyppääjä", "taitoluistelija", "jalkapallovalmentaja", "lentopalloilija", "alppihiihtäjä",
    "ralliautoilija", "rallikuljettaja", "painija", "golfaaja", "yleisurheilija", "seiväshyppääjä",
    "koripalloilija", "uimari", "kiekkoilija", "valmentaja",
  ],
  poliitikot: ["poliitikko", "presidentti", "ministeri", "kansanedustaja", "kuninkaallinen"],
};

/** Karkea kategoria roolitekstistä. "muut" jos mikään ryhmä ei osu — Tietoketju-pelin
    kategoriavalitsimessa "muut" ei näy omana chippinä, mutta kuuluu "Kaikki henkilöt" -poolin. */
export function roleGroup(role: string | null | undefined): string {
  const r = (role ?? "").toLowerCase();
  for (const [key, roles] of Object.entries(ROLE_GROUPS)) {
    if (roles.some((x) => r.includes(x) || x.includes(r))) return key;
  }
  return "muut";
}

/** Tietoketju: Ikäjärjestys -pelin kategoriachipit (CategoryPicker,
    CollectionPageGamePromo). Tehtävänannon lista — "Muut" jätetty pois
    omana chippinä (henkilöt sisältyvät silti "Kaikki henkilöt" -pooliin). */
export const CHAIN_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "kaikki", label: "Kaikki henkilöt" },
  { key: "nayttelijat", label: "Näyttelijät" },
  { key: "artistit", label: "Muusikot ja artistit" },
  { key: "urheilijat", label: "Urheilijat" },
  { key: "poliitikot", label: "Poliitikot ja merkkihenkilöt" },
];

export function chainCategoryLabel(key: string): string {
  return CHAIN_CATEGORIES.find((c) => c.key === key)?.label ?? "Kaikki henkilöt";
}
