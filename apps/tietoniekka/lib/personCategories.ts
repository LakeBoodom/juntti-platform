// TIETOKETJU: IKÄJÄRJESTYS — henkilökategoriat.
//
// Henkilön ryhmä luetaan kannasta (celebrities.ryhma, 19.9.2026):
// nayttelijat | artistit | urheilijat | poliitikot | muut. Kovakoodattu
// role → ryhmä -mappaus poistettiin kaikista kopioista (tämä tiedosto,
// kokoelmasivun henkilöhub). Tässä tiedostossa on enää kategoriachipit.

import { RYHMAT } from "./henkiloRyhmat";

/** Tietoketju: Ikäjärjestys -pelin kategoriachipit (CategoryPicker,
    CollectionPageGamePromo). Tehtävänannon lista — "Muut" jätetty pois
    omana chippinä (henkilöt sisältyvät silti "Kaikki henkilöt" -pooliin). */
export const CHAIN_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "kaikki", label: "Kaikki henkilöt" },
  // 3.10.2026 (erä B5): ryhmät 4 → 7, samat kuin henkilöhubissa ja henkilösivuilla.
  ...RYHMAT.map((r) => ({ key: r.key as string, label: r.nimi })),
];

export function chainCategoryLabel(key: string): string {
  return CHAIN_CATEGORIES.find((c) => c.key === key)?.label ?? "Kaikki henkilöt";
}
