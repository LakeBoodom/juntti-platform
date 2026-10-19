// KOKOELMARUNKO — asetusmalli (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys" §1, 19.10.2026).
// Periaate: yhteinen runko, oma iho, yksi tunnusosa. Kokoelma on dataa: uusi kokoelma, osio tai visa
// syntyy ilman sivukohtaista koodia. Visat osioihin tulevat quizzes.section_tags-sarakkeesta (S3).

export type KokoelmaOsio = {
  /** Osiotunniste = quizzes.section_tags-arvo. */
  slug: string;
  eyebrow?: string;
  title: string;
  /** V3-chipin teksti (oletus title). */
  chip?: string;
  /** Visan slug, joka nostetaan osion B-kortiksi (S1). */
  featured?: string;
};

export type Tunnusosa = "aikajana" | "vuosikiekko" | "laskuri" | "sijoitusnauha" | "synttarit";
export type Pääteema = "viihde" | "urheilu" | "tieto";

export type Kokoelma = {
  slug: string;
  /** Näkyvä nimi (murupolku, V7-kortti). */
  nimi: string;
  eyebrow: string;
  /** h1; highlight korostetaan teemavärillä h1:n lopussa. */
  title: string;
  highlight?: string;
  /** ≤ 2 riviä 390 px:ssä. */
  ingress: string;
  /** Teemaväri = mestaruusmerkin väri. */
  accent: string;
  /** image "" = kuvaa ei vielä ole → raidallinen paikka (CD 6a). */
  hero: { image: string; focalX?: number; focalY?: number; alt: string };
  /** Heron Pelaa-napin kohde: ensikävijälle suosituin, palaavalle seuraava pelaamaton. */
  cta: "suosituin" | "seuraava" | "arvo";
  /** V3-otsikko ja osion lopun "↑ <nimi>" -linkki. */
  osiotNimi: string;
  sections: KokoelmaOsio[];
  signature?: Tunnusosa;
  /** true = V4 korvaa V3:n (aikajana, vuosikiekko). */
  signatureReplacesNav?: boolean;
  /** V7-naapurit; tyhjä → sama pääteema ja suosituimmat (S6). */
  related?: string[];
  /** Tulossa-rivit näkyviin (nyt vain historia). */
  showSoon?: boolean;
  /** Mestaruus (metapeli, piilossa METAPELI_ENABLED-lipun takana). */
  mastery: { name: string; icon: string };
  /** Mistä kokoelman visat haetaan (quiz_cards). */
  /** sectionTags: true = kokoelman visat ovat ne, joilla on jokin tämän kokoelman osiotageista
   *  (uusi kokoelma ilman omaa collection-arvoa, esim. Euroviisut; visa voi kuulua useaan kokoelmaan). */
  haku: { collection?: string; category?: string; sectionTags?: boolean };
  /** Korttikuva visan slugista; oletuksena quizzes.hero_image. */
  korttikuva?: (slug: string) => string | null;
  /** Kortin metarivi (vuosi, maa, aihe). Kysymysmäärä lisätään automaattisesti vain, jos ≠ 10. */
  metarivi?: (v: { genre: string | null; subcollection: string | null; category: string | null }) => string;
};

/** Kokoelmasivun visa rungolle normalisoituna. */
export type RunkoVisa = {
  id: string;
  slug: string;
  nimi: string;
  href: string;
  kuva: string | null;
  kuvaPos?: string;
  meta: string;
  pelattu?: boolean;
  soon?: boolean;
  playCount: number;
};
