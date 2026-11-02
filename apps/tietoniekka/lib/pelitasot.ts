// Pelimuotojen tasonimet (pelimuotojen kehys ja jako, Heikki 25.10.2026; CD "TN Pelimuodot – kehys ja jako" 2a–2r).
// Tulosnäkymän otsikko, jakoteksti ja jakolinkin og:description käyttävät samaa nimeä. Nimet lasketaan tuloksesta
// (palvelimella jakolinkin ?tulos=-parametrista), joten jakoteksti ja esikatselu ovat aina samat.
// Tupla ja Vaalipiiriketju: designin omat tuomiot. Reittipeleissä ja Järjestässä ei tasonimiä (Heikki 2.11.2026).

/** Vaalipiiriketju (design 2g): Vaalikonkari / Melkein ehjä ketju / Ketju katkesi. */
export function vpkTaso(oikein: number, kaikki: number): string {
  return oikein >= kaikki ? "Vaalikonkari" : oikein >= kaikki - 2 ? "Melkein ehjä ketju" : "Ketju katkesi";
}

/** Tupla tai kuitti (design 2a): Täydet / Turva piti / Kuittasit ajoissa / Kaikki meni. */
export function tuplaTaso(syy: string, saalis: number): string | null {
  if (syy === "taydet") return "Täydet";
  if (syy === "jaahy") return saalis > 0 ? "Turva piti" : "Kaikki meni";
  if (syy === "kuittasi") return "Kuittasit ajoissa";
  return null;
}
