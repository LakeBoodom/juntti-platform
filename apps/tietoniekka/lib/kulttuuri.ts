// KULTTUURI — kuvat (Heikki 6.8.2026, CD "Tietoniekka - Kulttuuri"). Sivu on rungolla 19.10.2026
// alkaen (lib/kokoelmat/kulttuuri.ts); osiot tulevat section_tags-tagista.
// Jokaisella kulttuurivisalla on oma AI-kuva (public/20/kulttuuri/<slug>.webp).
// Kuvaa käytetään landingin korteissa JA pelinäkymässä — tietoinen poikkeus
// SVG-korttisääntöön (PAATOKSET.md 2026-08-06). Uusi visa ilman kuvaa toimii
// silti: kulttuuriImg palauttaa null → pelikuori käyttää kokoelman herokuvaa.

export const KULTTUURI_HERO = "/20/kulttuuri/hero-kollaasi.webp";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "alvar-aalto-tiedatko-mestarin",
  "helene-schjerfbeck-elama-ja-taide",
  "jean-sibelius-saveltaja-ja-kansallinen-ikoni",
  "loylyn-arvoitus-saunahistoria-visa",
  "kalevala-tunnetko-kansalliseepoksemme",
  "suomalainen-design-tunnetko-klassikot",
  "suomalainen-designesine-tunnistatko-klassikot",
  "suomalainen-kansanperinne-ja-taruolennot",
  "suomalaisen-elokuvan-historia",
  "suomalaisen-kirjallisuuden-klassikot",
  "suomalaisen-musiikin-historia",
  "suomen-museot-tunnetko-kohteet",
  "suomen-kuuluisimmat-ravintolat",
  "suomen-murteet-ja-slangi",
  "suomen-taiteen-kultakausi",
  "suomalaisen-teatterin-suuret-naytamot-ja-tekijat",
  "suomen-tunnetuimmat-taideteokset",
  "suomen-tunnetuimmat-rakennukset",
  "muumit-tove-jansson-visa",
  "tunnetko-suomalaiset-kirjailijat",
]);

export function kulttuuriImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/kulttuuri/${slug}.webp` : null;
}
