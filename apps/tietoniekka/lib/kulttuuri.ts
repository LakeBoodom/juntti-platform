// KULTTUURI — kuvat (Heikki 6.8.2026, CD "Tietoniekka - Kulttuuri"). Sivu on rungolla 19.10.2026
// alkaen (lib/kokoelmat/kulttuuri.ts); osiot tulevat section_tags-tagista.
// Jokaisella kulttuurivisalla on oma kuva (public/20/kulttuuri/<slug>.webp). 25.10.2026: AI-kuvat vaihdettu
// oikeisiin valokuviin ja PD-maalauksiin (Wikimedia Commons, tekijät lib/kuvalahteet.ts); AI-kuvina jäivät
// Alvar Aalto, Suomen museot ja Suomalainen sauna (paremmat valokuvat haussa).
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
  "saamelainen-suomi-visa",
  "suomenruotsalainen-suomi-visa",
]);

export function kulttuuriImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/kulttuuri/${slug}.webp` : null;
}

/** Kokoelmasivun korttikuva: 800 px kopio (public/20/kulttuuri/k/), alkuperäiset 1600–1672 px jäävät pelinäkymälle.
    Runko vaihe 3 (19.10.2026): alkuperäiset korteissa nostivat sivupainoa ~1 Mt. */
export function kulttuuriImgKortti(slug: string | null | undefined): string | null {
  return kulttuuriImg(slug)?.replace("/20/kulttuuri/", "/20/kulttuuri/k/") ?? null;
}
