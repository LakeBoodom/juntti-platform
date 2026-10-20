// LUONTO — kuvat (Heikki + CD). Kokoelmasivu on rungolla 20.10.2026 alkaen (lib/kokoelmat/luonto.ts); aiheet
// tulevat section_tags-tagista, kuva- ja äänivisat ovat V6-pelejä (lib/pelimuodot.ts).

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

/** Kokoelmasivun (runko) korttikuva: 800 px kopio (public/20/luonto/k/, 20.10.2026). */
export const luontoKorttikuva = (slug: string) => (IMG_SLUGS.has(slug) ? `/20/luonto/k/${slug}.webp` : null);
