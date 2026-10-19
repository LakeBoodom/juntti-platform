// ELOKUVAT — kuvat (CD "TN Elokuvat -teemasivu" 15.8.2026). Sivu on rungolla 19.10.2026 alkaen
// (lib/kokoelmat/elokuvat.ts); osiot tulevat section_tags-tagista. Jokaisella elokuvavisalla on oma kuva
// (public/20/elokuvat/<slug>.webp) — sama poikkeus SVG-korttisääntöön kuin
// Kulttuurilla (PAATOKSET.md 2026-08-06). Uusi visa ilman kuvaa toimii silti:
// elokuvatImg palauttaa null → kortti näyttää typografisen fallback-pohjan
// (README "Reunatapaukset" — kuva puuttuu).

export const ELOKUVAT_HERO = "/20/elokuvat/hero.webp";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "uuno-turhapuro-elokuvat",
  "titanic-elokuva-tiedatko-kaiken",
  "alfred-hitchcock-jannityksen-mestari",
  "top-gun-maverick-2022-tietovisa",
  "dune-osa-kaksi-2024-tietovisa",
  "barbie-2023-tietovisa",
  "oppenheimer-2023-tietovisa",
  "joker-2019-tietovisa",
  "casablanca-elokuva",
  "frozen-huurteinen-seikkailu",
  "jurassic-park-dinosaurussaari",
  "leijonakuningas-ylpeyskallio",
  "toy-story-lelujen-seikkailu",
  "hajyt-2-pohjalaisdraama",
  "tappajahai-kesahitti",
  "matrix-heraa-totuuteen",
  "takaisin-tulevaisuuteen-aikamatka",
  "forrest-gump-elamantarina",
  "myrskyluodon-maija-saaristodraama",
  "talvisota-sotaklassikko",
  "luottomies-all-in-komedia",
  "pulp-fiction-rikoksen-ydin",
  "taru-sormusten-herrasta-keski-maa",
  "kummiseta-corleonen-perhe",
  "the-odyssey-nolan-2026",
  "hamahakkimies-brand-new-day",
  "star-wars-tietovisa",
  "james-bond-elokuvat",
  "aki-kaurismaki-tunnetko-mestarisi",
]);

export function elokuvatImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/elokuvat/${slug}.webp` : null;
}
