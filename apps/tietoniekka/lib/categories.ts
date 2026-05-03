/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — Kategoriadatan keskitetty lähde
   Etusivun kategoria-kortit + /kategoria/[slug]-reitit lukevat täältä.
   ───────────────────────────────────────────────────────────────── */

export type Category = {
  slug: string;
  title: string;
  badge: string;
  description: string;
  intro: string;
  imageUrl: string;
  colorVar: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "urheilu",
    title: "URHEILU",
    badge: "URHEILU",
    description: "Jääkiekko, jalkapallo, yleisurheilu",
    intro: "Suomen urheilun huippuhetkistä ja suurista nimistä — Lasse Virénistä Saku Koivuun, Nykäsestä Kirvesniemeen.",
    imageUrl: "/urheilu_kuva.png",
    colorVar: "var(--color-cat-urheilu)",
  },
  {
    slug: "maantieto",
    title: "MAANTIETO",
    badge: "MAANTIETO",
    description: "Suomi, Eurooppa, maailma",
    intro: "Paikat, pääkaupungit, vuoret ja virrat — kuinka hyvin tunnet maailman?",
    imageUrl: "/maantieto_kuva.png",
    colorVar: "var(--color-cat-maantieto)",
  },
  {
    slug: "luonto",
    title: "LUONTO",
    badge: "LUONTO",
    description: "Suomen luonnon ihmeet ja eläimet",
    intro: "Testaa tietosi Suomen luonnosta, eläimistä, kasveista ja upeista maisemista.",
    imageUrl: "/luonto_kuva.png",
    colorVar: "var(--color-cat-luonto)",
  },
  {
    slug: "historia",
    title: "HISTORIA",
    badge: "HISTORIA",
    description: "Suomi, maailma, henkilöt",
    intro: "Tapahtumat, jotka muokkasivat aikaansa — ja meidän tämän päivän.",
    imageUrl: "/historia_kuva.png",
    colorVar: "var(--color-cat-historia)",
  },
  {
    slug: "tv-sarjat",
    title: "TV-SARJAT",
    badge: "TV-SARJAT",
    description: "Klassikot, uutuudet, kulttisarjat",
    intro: "Tuntemiisi sarjoihin yllättäviä yksityiskohtia. Kuinka tarkkaan katsot?",
    imageUrl: "/TV_kuva.png",
    colorVar: "var(--color-cat-tv-sarjat)",
  },
  {
    slug: "elokuvat",
    title: "ELOKUVAT",
    badge: "ELOKUVAT",
    description: "Kotimainen, Hollywood, Eurooppa",
    intro: "Klassikoista uusiin julkaisuihin — kuka teki ja milloin?",
    imageUrl: "/elokuvat_kuva.png",
    colorVar: "var(--color-cat-elokuvat)",
  },
  {
    slug: "musiikki",
    title: "MUSIIKKI",
    badge: "MUSIIKKI",
    description: "Hitit, klassikot, artistit",
    intro: "Suomalainen ja maailman musiikki. Kuka lauloi minkä ja milloin?",
    imageUrl: "/musiikki_kuva.png",
    colorVar: "var(--color-cat-musiikki)",
  },
  {
    slug: "ruoka-juoma",
    title: "RUOKA & JUOMA",
    badge: "RUOKA",
    description: "Ruokakulttuuri ja juomahistoria",
    intro: "Mitä syömme ja miksi — perinteistä ja uudesta keittiöstä.",
    imageUrl: "/ruokajajuoma_kuva.png",
    colorVar: "var(--color-cat-ruoka-juoma)",
  },
  {
    slug: "muoti-design",
    title: "MUOTI & DESIGN",
    badge: "MUOTI",
    description: "Suomalainen muoti, brändit, muotoilu",
    intro: "Marimekosta Iittalaan, Aaltoon ja Lapuan Kankureihin — suomalainen muotoilu on kantanut maailmalle.",
    imageUrl: "/muoti_design_kuva.png",
    colorVar: "var(--color-cat-muoti-design)",
  },
];

export const CATEGORY_BY_SLUG: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map(c => [c.slug, c])
);

export function getCategory(slug: string): Category | null {
  return CATEGORY_BY_SLUG[slug] ?? null;
}
