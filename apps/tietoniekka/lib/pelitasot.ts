// Pelimuotojen tasonimet (pelimuotojen kehys ja jako, Heikki 25.10.2026; CD "TN Pelimuodot – kehys ja jako" 2a–2r).
// Tulosnäkymän otsikko, jakoteksti ja jakolinkin og:description käyttävät samaa nimeä. Nimet lasketaan tuloksesta
// (palvelimella jakolinkin ?tulos=-parametrista), joten jakoteksti ja esikatselu ovat aina samat.
// Tietovisan tapaan rajat 0/40/60/80/100 %; reittipeleissä ja Tuplassa designin omat tuomiot.

type Tasot = readonly [string, string, string, string, string];

const rajattu = (tasot: Tasot, oikein: number, kaikki: number) => {
  const pct = kaikki > 0 ? (oikein / kaikki) * 100 : 0;
  return tasot[pct >= 100 ? 4 : pct >= 80 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0];
};

/** Ikäjärjestys (design 2i: 8/10 → "Ikätarkka"). */
export const IKAJARJESTYS_TASOT: Tasot = ["Aikojen sekoittaja", "Aikalaisarvaaja", "Sukupolvien tuntija", "Ikätarkka", "Elävä väestörekisteri"];
/** Laita järjestykseen, Vaalit ja politiikka -pakat (design 2k: 6/8 → "Historian tuntija"). */
export const JARJESTA_VAALIT_TASOT: Tasot = ["Liikkuva äänestäjä", "Vaalivalvoja", "Puoluesihteeri", "Historian tuntija", "Valtioneuvos"];
/** Laita järjestykseen, muut kokoelmat (julkaisemattomat pakat). */
export const JARJESTA_TASOT: Tasot = ["Järjestyksen etsijä", "Suunta selvillä", "Järjestelmällinen", "Lähes täydellinen", "Täydellinen järjestys"];

export const ikajarjestysTaso = (oikein: number, kaikki: number) => rajattu(IKAJARJESTYS_TASOT, oikein, kaikki);
export const jarjestaTaso = (oikein: number, kaikki: number, kokoelma?: string | null) =>
  rajattu(kokoelma === "vaalit" ? JARJESTA_VAALIT_TASOT : JARJESTA_TASOT, oikein, kaikki);

/** Kuntaliitos ja Rajanaapurit (design 2c–2f): Ehjä reitti / Melkein perillä / Reitti katkesi. */
export function reittiTaso(oikein: number, kaikki: number): string {
  return oikein >= kaikki ? "Ehjä reitti" : oikein >= kaikki - 2 ? "Melkein perillä" : "Reitti katkesi";
}

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
