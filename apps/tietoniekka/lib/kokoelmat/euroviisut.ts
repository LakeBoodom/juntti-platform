// EUROVIISUT (runko vaihe 2, 19.10.2026) — ensimmäinen kokoelma, joka syntyy pelkästä asetuksesta:
// ei sivukohtaista komponenttia, V4 = sijoitusnauha. Visat tulevat osioihin tagista (section_tags
// euroviisut-*), joten sama visa voi kuulua myös toiseen kokoelmaan (esim. Krista Siegfrids myös
// Tunnetuissa henkilöissä). Sivu avautuu tuotannossa, kun julkaistuja visoja on ≥ 3 (EUROVIISUT_AUKI);
// esikatselussa se näkyy aina.
import type { Kokoelma } from "./tyypit";

export const EUROVIISUT_AUKI = 3;

export const EUROVIISUT: Kokoelma = {
  slug: "euroviisut",
  nimi: "Euroviisut",
  eyebrow: "Uusi kokoelma",
  title: "",
  highlight: "Euroviisut",
  ingress: "Suomen viisutaival vuodesta 1961, voittajat ja UMK:n suurimmat hetket.",
  accent: "#FB7185",
  hero: { image: "", alt: "" },
  cta: "suosituin",
  osiotNimi: "Osiot",
  sections: [
    { slug: "euroviisut-suomi", eyebrow: "Suomi", title: "Suomi Euroviisuissa" },
    { slug: "euroviisut-voittajat", eyebrow: "Voittajat", title: "Voittajat" },
    { slug: "euroviisut-umk", eyebrow: "UMK", title: "Uuden Musiikin Kilpailu", chip: "UMK" },
  ],
  signature: "sijoitusnauha",
  related: ["musiikki", "tv", "tunnetut-henkilot"],
  mastery: { name: "Viisuniekka", icon: "viisut" },
  haku: { sectionTags: true },
};
