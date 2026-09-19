// TIETOKETJU: IKÄJÄRJESTYS — henkilökategoriat.
//
// Henkilön ryhmä luetaan kannasta (celebrities.ryhma, 19.9.2026):
// nayttelijat | artistit | urheilijat | poliitikot | muut. Kovakoodattu
// role → ryhmä -mappaus poistettiin kaikista kopioista (tämä tiedosto,
// kokoelmasivun henkilöhub). Tässä tiedostossa on enää kategoriachipit.

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
