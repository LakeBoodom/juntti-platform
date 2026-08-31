// ELOKUVAT — teemasivun kuratointi (CD "TN Elokuvat -teemasivu" 15.8.2026,
// design_handoff_elokuvat/README.md). Jokaisella elokuvavisalla on oma kuva
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

/** "Tietoniekka suosittelee" — täsmälleen 3, järjestysväri kortti kerrallaan
    (README §"Tietoniekka suosittelee": 1 = #FF5C3D, 2 = #E8A320, 3 = #B79BE8).
    Poimitut eivät toistu aihepiireissä (§"Data"-huomiot). */
export const ELOKUVAT_FEATURED: Array<{ slug: string; rankColor: string; hook: string }> = [
  {
    slug: "the-odyssey-nolan-2026",
    rankColor: "#FF5C3D",
    hook: "Christopher Nolanin odotetuin eepos — testaa tietosi ennen ensi-iltaa.",
  },
  {
    slug: "hamahakkimies-brand-new-day",
    rankColor: "#E8A320",
    hook: "Koko Hämähäkkimies-elokuvasarja ja tuleva Brand New Day samassa visassa.",
  },
  {
    slug: "joker-2019-tietovisa",
    rankColor: "#B79BE8",
    hook: "Gothamin synkin tarina — kestätkö Arthur Fleckin tietovisan?",
  },
];

/** Neljä aihepiiriä (README §"Aihepiiriosiot 01–04"). Kiinteä käsivalinta,
    ei automaattista genreä — sama malli kuin Kulttuurin alakokoelmachipit. */
export const ELOKUVAT_SECTIONS: Array<{ number: string; title: string; accent: string; slugs: string[] }> = [
  {
    number: "01",
    title: "Hollywoodin hitit ja suuret elokuvasarjat",
    accent: "#FF5C3D",
    slugs: [
      "star-wars-tietovisa",
      "james-bond-elokuvat",
      "jurassic-park-dinosaurussaari",
      "top-gun-maverick-2022-tietovisa",
      "dune-osa-kaksi-2024-tietovisa",
      "barbie-2023-tietovisa",
      "oppenheimer-2023-tietovisa",
      "taru-sormusten-herrasta-keski-maa",
      "titanic-elokuva-tiedatko-kaiken",
      "leijonakuningas-ylpeyskallio",
      "toy-story-lelujen-seikkailu",
      "frozen-huurteinen-seikkailu",
      "tappajahai-kesahitti",
    ],
  },
  {
    number: "02",
    title: "Kotimaiset elokuvat",
    accent: "#B6FF3C",
    slugs: [
      "uuno-turhapuro-elokuvat",
      "hajyt-2-pohjalaisdraama",
      "talvisota-sotaklassikko",
      "myrskyluodon-maija-saaristodraama",
      "luottomies-all-in-komedia",
    ],
  },
  {
    number: "03",
    title: "Klassikot ja kulttielokuvat",
    accent: "#E8A320",
    slugs: [
      "casablanca-elokuva",
      "kummiseta-corleonen-perhe",
      "pulp-fiction-rikoksen-ydin",
      "matrix-heraa-totuuteen",
      "takaisin-tulevaisuuteen-aikamatka",
      "forrest-gump-elamantarina",
    ],
  },
  {
    number: "04",
    title: "Ohjaajat ja elokuva-alan legendat",
    accent: "#B79BE8",
    slugs: [
      "alfred-hitchcock-jannityksen-mestari",
      "aki-kaurismaki-tunnetko-mestarisi",
    ],
  },
];
