// KULTTUURI — flagship-teemakokoelma (Heikki 6.8.2026, CD "Tietoniekka - Kulttuuri")
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

/** Alakokoelmat CD:n chipijaon mukaan — kattaa kaikki 20 visaa. */
export const KULTTUURI_SUBS: Array<{ key: string; label: string }> = [
  { key: "taide-design", label: "Taide & Design" },
  { key: "kirjallisuus-tarinat", label: "Kirjallisuus & Tarinat" },
  { key: "musiikki-nayttamo", label: "Musiikki & Näyttämö" },
  { key: "elamantapa-ilmiot", label: "Elämäntapa & Ilmiöt" },
];

/** Kuratointi (Heikin vaihdettavissa): CTA-kohde, Lauran ja Mikon valinta,
    "Aloita näistä" -nostot. Slugit — visa haetaan kannasta nimineen. */
export const KULTTUURI_CURATED = {
  cta: "suomen-taiteen-kultakausi",
  lauranJaMikon: "suomalaisen-kirjallisuuden-klassikot",
  features: [
    "muumit-tove-jansson-visa",
    "suomen-taiteen-kultakausi",
    "suomalainen-design-tunnetko-klassikot",
  ],
};

export const DIFF_LABEL: Record<string, string> = {
  helppo: "Helppo",
  keski: "Keskitaso",
  vaikea: "Vaikea",
};
