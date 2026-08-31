// URHEILU — visakohtaiset kuvakortit (Heikki toimitti Valioliiga-erän 13.8.2026)
// Sama malli kuin Kulttuuri (lib/kulttuuri.ts) ja Luonto (lib/luonto.ts):
// kuva public/20/urheilu/<slug>.webp näkyy hubin korteissa, etusivulla ja
// pelinäkymässä. Visa ilman kuvaa toimii silti: urheiluImg palauttaa null →
// kortti käyttää SVG-motiivia ja pelikuori kokoelman herokuvaa.
// Huom: Evertonille ei ole vielä kuvaa (ei löytynyt design-kansiosta 13.8.).

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "afc-bournemouth-kirsikoiden-visa",
  "arsenal-fc-legendat",
  "aston-villa-legendat",
  "brentford-pieni-pesa-kova-surina",
  "brighton-hove-albion-lokkien-lento-visa",
  "chelsea-fc-sinisten-syvin-arkisto-vaikea-visa",
  "coventry-city-pusb-visa",
  "crystal-palace-etela-lontoon-ylpeys-visa",
  "fulham-fc-mokin-mestarit-visa",
  "hull-city-meripihkan-ja-mustan-raidat-visa",
  "ipswich-town-suffolkin-sinipaidat-visa",
  "leeds-united-valkoinen-sota-visa",
  "liverpool-fc-legendat",
  "manchester-city-taivaansininen-imperiumi-visa",
  "manchester-united-seuravisa",
  "newcastle-united-legendat",
  "nottingham-forest-garibaldin-punainen-visa",
  "sunderland-afc-wearin-punavalkoiset-raidat-visa",
  "suomalaiset-valioliigassa-sisu-visa",
  "tottenham-hotspur-uskaltaa-on-tehda-visa",
  "valioliigan-derbyvisa-verivihollisten-kartasto-vaikea",
  "valioliigan-ennatysvisa-numerot-eivat-valehtele",
  "valioliigan-valmentajavisa-sivurintaman-nerot-vaikea",
]);

export function urheiluImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/urheilu/${slug}.webp` : null;
}
