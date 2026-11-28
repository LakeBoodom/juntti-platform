// EUROVIISUT (runko vaihe 2, 19.10.2026; CC-brief 28.11.2026) — kokoelma pelkästä asetuksesta: ei sivukohtaista
// komponenttia, V4 = sijoitusnauha (data kannasta, fact_entities kind eurovision_entry). Visat tulevat osioihin tagista
// (section_tags euroviisut-*). Sivu avautuu tuotannossa, kun julkaistuja visoja on ≥ 3 (EUROVIISUT_AUKI);
// esikatselussa se näkyy aina, luonnosvisat mukaan lukien (lib/kokoelmat/luonnokset.ts).
import type { Kokoelma } from "./tyypit";
import { musiikkiImg } from "@/lib/musiikki";

export const EUROVIISUT_AUKI = 3;
/** Julkaisukytkin (28.11.2026): artistiosion julkaistut henkilövisat täyttäisivät ≥ 3 -rajan heti, joten tuotanto
 *  avautuu vasta, kun Heikki päättää julkaista kokoelman ja tämä vaihdetaan true:ksi. Esikatselu näyttää sivun aina. */
export const EUROVIISUT_JULKAISTU = false;

/** Laskurit heroon (Heikki 28.11.2026): päivät UMK-finaaliin ja Euroviisujen finaaliin. Päivitä joka syksy, kun Yle ja
 *  EBU julkistavat päivät. Lähteet: yle.fi/a/20-10009660 (UMK27 20.2.2027 Tampere), eurovision.com (Burgas, finaali 15.5.2027). */
export const EUROVIISU_LASKURIT = [
  { avain: "umk", teksti: "UMK-finaaliin", pvm: { y: 2027, m: 2, d: 20 }, vkp: "la" },
  { avain: "esc", teksti: "Euroviisujen finaaliin", pvm: { y: 2027, m: 5, d: 15 }, vkp: "la" },
] as const;

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
  /* Herokuva: oikea Euroviisukuva (Heikki 28.11.2026, ei Laura ja Mikko -kuvitusta): Baselin 2025 lava, CC0. */
  hero: { image: "/20/euroviisut/hero.webp", focalX: 0.5, focalY: 0.45, alt: "Euroviisujen lava valoineen Baselissa 2025" },
  cta: "suosituin",
  osiotNimi: "Osiot",
  sections: [
    { slug: "euroviisut-suomi-umk", title: "Suomi ja UMK", chip: "Suomi ja UMK", jarjestys: ["suomi-euroviisuissa", "umk-uuden-musiikin-kilpailu"] },
    /* Heikki 28.11.2026: Euroviisuissa esiintyneiden suomalaisten henkilövisat (tagi euroviisut-artistit). */
    {
      slug: "euroviisut-artistit", title: "Suomalaiset artistit Euroviisuissa", chip: "Artistit",
      jarjestys: ["kaarija-euroopan-valloittanut-villi-kortti", "lordi-hirviot-haltuun", "krista-siegfrids-euroviisuista-tv-ruutuun"],
    },
    { slug: "euroviisut-historia", title: "Euroviisujen historia", chip: "Historia", jarjestys: ["euroviisut-kautta-aikojen", "euroviisut-tosifaneille"] },
  ],
  signature: "sijoitusnauha",
  related: ["musiikki", "tv", "tunnetut-henkilot"],
  mastery: { name: "Viisuniekka", icon: "viisut" },
  haku: { sectionTags: true },
  luonnoksetEsikatselussa: true,
  /* Henkilövisoilta puuttuu oma yläkuva → kortille henkilön kuva (celebrities.image_url), kuten Tunnetuissa henkilöissä. */
  henkilokuvaVaraksi: true,
  korttikuva: (slug) => musiikkiImg(slug),
};
