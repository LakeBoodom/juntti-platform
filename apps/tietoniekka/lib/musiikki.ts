// MUSIIKKI — kuvat (CD "TN Musiikki -teemasivu" 19.8.2026). Sivu on rungolla 19.10.2026 alkaen
// (lib/kokoelmat/musiikki.ts); osiot tulevat section_tags-tagista. Jokaisella visalla on kuva
// public/20/musiikki/<slug>.webp — Wikimedia Commonsin artistikuvia 640 × 360 -rajauksena (tekijät
// lib/kuvalahteet.ts).

export const MUSIIKKI_HERO = "/20/musiikki/hero.webp";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "abba-tietovisa",
  "antti-tuisku-visa-peto-on-irti",
  "apulanta-bandi-tietovisa",
  "ariana-grande-visa-tunnetko-poptahden",
  "bad-bunny-visa-tunnetko-latinotahden",
  "behm-visa-hei-rakas",
  "billie-eilish-visa-tunnetko-poptahden",
  "bob-marley-reggaen-legenda",
  "bruno-mars-visa-tunnetko-tahden",
  "bts-visa-tunnetko-kpop-ilmion",
  "cheek-visa-valot-sammuu",
  "coldplay-visa-tunnetko-yhtyeen",
  "drake-visa-tunnetko-hiphoptahden",
  "ed-sheeran-visa-tunnetko-lauluntekijan",
  "elastinen-visa-suomirapin-pioneeri",
  "eminem-visa-tunnetko-rap-legendan",
  "eppu-normaali-tietovisa",
  "future-visa-tunnetko-trapin-tahden",
  "haloo-helsinki-visa-beibi-fani",
  "jenni-vartiainen-visa-hittien-takana",
  "juha-tapio-visa-laulujen-tarinat",
  "kaija-koo-visa-hitit-ja-ura",
  "kari-tapio-visa-iskelmalegenda",
  "katri-helena-visa-iskelmalegenda",
  "nightwish-visa-sinfoninen-metalli",
  "popeda-visa-manserock",
  "suvi-terasniska-visa-iskelmatahti",
  "visa-mo5e4rgk",
  "j-balvin-visa-tunnetko-reggaetontahden",
  "juice-wrld-visa-tunnetko-tahden",
  "justin-bieber-visa-tunnetko-poptahden",
  "jvg-visa-haista-ikuiseen-vappuun",
  "kanye-west-visa-tunnetko-uudistajan",
  "kendrick-lamar-visa-tunnetko-rap-tahden",
  "lordi-hirviot-haltuun",
  "nylon-beat-visa-vuosikymmenen-hitit",
  "pmmp-visa-rusketusraidat",
  "post-malone-visa-tunnetko-tahden",
  "rihanna-visa-tunnetko-tahden",
  "robin-visa-frontside-ollie",
  "sanni-visa-prinsessoja-astronautteja",
  "taylor-swift-visa-tunnetko-supertahden",
  "the-weeknd-visa-tunnetko-rnb-tahden",
  "travis-scott-visa-tunnetko-rap-tahden",
  "ultra-bra-tietovisa",
]);

export function musiikkiImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/musiikki/${slug}.webp` : null;
}
