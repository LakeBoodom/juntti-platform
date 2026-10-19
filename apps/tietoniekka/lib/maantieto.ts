// MAANTIETO — kuvat (CD:n design + Heikin kuvat 15.8.2026). Visakohtaiset kuvat
// (public/20/maantieto/<slug>.webp) kokoelmasivun korteissa, etusivun korteissa ja pelinäkymässä.
// Sivu on rungolla 19.10.2026 alkaen (lib/kokoelmat/matkakohteet.ts). Kokoelma-arvo kannassa on
// edelleen 'matkakohteet' (URL säilyy), näkyvä nimi "Maantieto".

export const MAANTIETO_HERO = "/20/maantieto/hero-landing.webp";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "hurjimmat-myrskyt-suomessa",
  "kanariansaaret-tiedatko-tarpeeksi",
  "maailman-korkeimmat-rakennukset-visa",
  "maailman-korkeimmat-vuoret-visa",
  "maailman-kuumimmat-kolkat",
  "maailman-kylmimmat-kolkat",
  "maailman-pisimmat-joet",
  "maailman-sateisimmat-kolkat",
  "maailman-suurimmat-jarvet",
  "maailman-suurimmat-kaupungit",
  "maailman-suurimmat-saaret",
  "maailman-syrjaisimmat-paikat",
  "new-york-big-apple",
  "pohjoisin-ja-etelaisin",
  "rooma-ikuinen-kaupunki",
  "sisilia-valimeren-helmi",
  "suomen-majakat",
  "tallinna-tietovisa",
  "tiedatko-lontoosta-kaiken",
  "valimeren-saaret-visa-tunnetko-saaristot",
]);

export function maantietoImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/maantieto/${slug}.webp` : null;
}
