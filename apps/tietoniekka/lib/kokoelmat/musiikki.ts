// MUSIIKKI rungolla (runko vaihe 3, 19.10.2026). Osiot ovat samat kuusi aihepiiriä kuin ennen
// (CD "TN Musiikki -teemasivu" 19.8.2026); visat osioihin quizzes.section_tags-tagista (migraatio
// 20261111_musiikki_tagit). Entiset nostot: Kaija Koo Suomipopin ja JVG Suomirapin B-korttina
// (Nylon Beat on Suomipop-osiossa, B:n jälkeen suosion mukaan).
import type { Kokoelma } from "./tyypit";
import { MUSIIKKI_HERO, musiikkiImg } from "@/lib/musiikki";
import { kokoelmaKortti } from "./rekisteri";

const KORTTI_RAJATUT = new Set(["kari-tapio-visa-iskelmalegenda"]);

export const MUSIIKKI: Kokoelma = {
  slug: "musiikki",
  nimi: "Musiikki",
  eyebrow: "Teemakokoelma",
  title: "Musiikki ja ",
  highlight: "artistit",
  ingress: "Suomirapin kingit, stadionien supertähdet ja biisit, jotka jäivät soimaan päähän.",
  accent: kokoelmaKortti("musiikki")!.mastery.color,
  /* Fokus Lauran ja Mikon kasvoissa (oikea kolmannes) — älä keskitä (CD 19.8.2026). */
  hero: { image: MUSIIKKI_HERO, focalX: 0.7, focalY: 0.4, alt: "Laura ja Mikko festareilla" },
  cta: "suosituin",
  osiotNimi: "Lajityypit",
  sections: [
    { slug: "suomirap", eyebrow: "Kotimaa", title: "Suomirap", featured: "jvg-visa-haista-ikuiseen-vappuun" },
    { slug: "suomipop", eyebrow: "Kotimaa", title: "Suomipop", featured: "kaija-koo-visa-hitit-ja-ura" },
    { slug: "suomirock", eyebrow: "Kotimaa", title: "Suomalainen rock ja klassikot", chip: "Rock ja klassikot" },
    { slug: "pop-supertahdet", eyebrow: "Maailmalta", title: "Popin supertähdet", chip: "Pop" },
    { slug: "rap-hiphop", eyebrow: "Maailmalta", title: "Rap ja hiphop" },
    { slug: "musiikki-ilmiot", eyebrow: "Maailmalta", title: "Maailman musiikki-ilmiöt", chip: "Ilmiöt" },
  ],
  /* Euroviisut nousee naapuriksi, kun se avautuu (avoin: false → ohitetaan, tilalle Elokuvat). */
  related: ["euroviisut", "tv", "tunnetut-henkilot", "elokuvat"],
  mastery: { name: kokoelmaKortti("musiikki")!.mastery.name, icon: "musiikki" },
  haku: { collection: "musiikki" },
  /* Kari Tapion heron kuva on "kuva + sumennettu jatke" -yhdistelmä → kortissa oma rajaus alkuperäisestä (21.10.2026). */
  korttikuva: (slug) => (KORTTI_RAJATUT.has(slug) ? `/20/musiikki/k/${slug}.webp` : musiikkiImg(slug)),
};
