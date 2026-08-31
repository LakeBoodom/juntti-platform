// LUONTO — flagship-teemakokoelma (Heikki 7.8.2026)
// Sama malli kuin Kulttuuri (lib/kulttuuri.ts): jokaisella luontovisalla on
// oma AI-kuva (public/20/luonto/<slug>.webp). Kuvaa käytetään landingin
// korteissa JA pelinäkymässä — sama tietoinen poikkeus SVG-korttisääntöön.
// Uusi visa ilman kuvaa toimii silti: luontoImg palauttaa null → pelikuori
// käyttää kokoelman herokuvaa.

export const LUONTO_HERO = "/20/luonto/hero-landing.webp";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "itameri-visa",
  "jarvien-katketyt-ihmeet-visa",
  "jokien-salainen-elama-visa",
  "karhu-suomen-metsien-kuningas",
  "kuikka-visa",
  "merikotka-visa",
  "naali-tunturien-salaperainen-kettu",
  "revontulet-tiedatko-mista-ne-tulevat",
  "saimaan-norppa",
  "suomen-elaimet-visa",
  "suomen-hyonteiset-pienen-vaen-suuret-temput",
  "suomen-kalat-visa",
  "suomen-kansallispuistot-visa",
  "suomen-kasvit-myrkkyja-taikaa-ja-pelastavia-jauhoja",
  "suomen-linnut-visa",
  "suomen-marjat-visa",
  "suomen-matelijat-ja-sammakot-selviytyjien-salaisuudet",
  "suomen-metsat-visa",
  "suomen-pollot-yon-aanettomat-mestarit",
  "suomen-sienet-visa",
  "suomen-suot-visa",
  "suomen-suurpedot-visa-tunnetko-huippupedot",
  "tiedatko-metsosta-kaiken",
  "tunturin-salainen-elama-lappi-visa",
]);

export function luontoImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/luonto/${slug}.webp` : null;
}

/** Alakokoelmat — kattaa kaikki 24 visaa. */
export const LUONTO_SUBS: Array<{ key: string; label: string }> = [
  { key: "elaimet", label: "Eläimet" },
  { key: "kasvit-sienet", label: "Kasvit & Sienet" },
  { key: "maastot-vedet", label: "Maastot & Vedet" },
  { key: "ilmiot", label: "Ilmiöt" },
];

/** Kuratointi (Heikin vaihdettavissa): CTA-kohde, Lauran ja Mikon valinta,
    "Aloita näistä" -nostot. */
export const LUONTO_CURATED = {
  cta: "suomen-suurpedot-visa-tunnetko-huippupedot",
  lauranJaMikon: "suomen-kansallispuistot-visa",
  features: [
    "suomen-suurpedot-visa-tunnetko-huippupedot",
    "revontulet-tiedatko-mista-ne-tulevat",
    "saimaan-norppa",
  ],
};
