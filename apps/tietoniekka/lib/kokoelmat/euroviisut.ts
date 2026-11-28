// EUROVIISUT (runko vaihe 2, 19.10.2026; CC-brief 28.11.2026) — kokoelma pelkästä asetuksesta: ei sivukohtaista
// komponenttia, V4 = sijoitusnauha (data kannasta, fact_entities kind eurovision_entry). Visat tulevat osioihin tagista
// (section_tags euroviisut-*). Sivu avautuu tuotannossa, kun julkaistuja visoja on ≥ 3 (EUROVIISUT_AUKI);
// esikatselussa se näkyy aina, luonnosvisat mukaan lukien (lib/kokoelmat/luonnokset.ts).
import type { Kokoelma } from "./tyypit";
import { musiikkiImg } from "@/lib/musiikki";

export const EUROVIISUT_AUKI = 3;

export const EUROVIISUT: Kokoelma = {
  slug: "euroviisut",
  nimi: "Euroviisut",
  eyebrow: "Euroviisut · visat ja pelit",
  /* H1 versio A (brief 28.11.); versio B esikatselussa ?h1=b, Heikki valitsee. */
  title: "Euroviisuissa kaikki ovat tuomareita. ",
  highlight: "Entä kun kysytään?",
  h1B: { title: "Douze points vai ", highlight: "nolla pistettä?" },
  /* Ei saa paljastaa visojen vastauksia (Waterloo ja Cha Cha Cha ovat vain kysymysteksteissä). Älä lisää sanoja
     Hallelujah, Brighton, Måneskin, Loreen, Lena tai Malta. */
  ingress:
    "Waterloosta Cha Cha Chahan – Euroviisujen historiassa on voittoja, nollapisteitä ja ihmeitä, joita kukaan ei olisi uskonut. Muistatko, miten Suomen kävi, ketkä voittivat ja mitä UMK:ssa oikeasti tapahtui?",
  accent: "#FB7185",
  /* Herokuva (Laura ja Mikko euroviisutunnelmissa) puuttuu vielä → raidallinen paikka. Heikki teettää kuvan. */
  hero: { image: "", alt: "" },
  cta: "suosituin",
  osiotNimi: "Osiot",
  sections: [
    { slug: "euroviisut-suomi-umk", title: "Suomi ja UMK", jarjestys: ["suomi-euroviisuissa", "umk-uuden-musiikin-kilpailu"] },
    { slug: "euroviisut-historia", title: "Euroviisujen historia", jarjestys: ["euroviisut-kautta-aikojen", "euroviisut-tosifaneille"] },
  ],
  signature: "sijoitusnauha",
  related: ["musiikki", "tv", "tunnetut-henkilot"],
  mastery: { name: "Viisuniekka", icon: "viisut" },
  haku: { sectionTags: true },
  luonnoksetEsikatselussa: true,
  korttikuva: (slug) => musiikkiImg(slug),
};
