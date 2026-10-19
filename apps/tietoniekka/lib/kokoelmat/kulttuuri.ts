// KULTTUURI rungolla (runko vaihe 3, 19.10.2026). Osiot ovat entiset neljä alakokoelmaa (sivun
// suodatinchipit); visat osioihin quizzes.section_tags-tagista (migraatio 20261113_kulttuuri_tagit,
// tagi = subcollection). Entiset nostot: Taiteen kultakausi (heron CTA) ja Lauran ja Mikon valinta
// (Kirjallisuuden klassikot) osioidensa B-kortteina. Vanhat ?suodata=<alakokoelma>-linkit ohjataan
// middlewaressa osion ankkuriin (#osio-<alakokoelma>).
import type { Kokoelma } from "./tyypit";
import { KULTTUURI_HERO, kulttuuriImgKortti } from "@/lib/kulttuuri";
import { kokoelmaKortti } from "./rekisteri";

export const KULTTUURI: Kokoelma = {
  slug: "kulttuuri",
  nimi: "Kulttuuri",
  eyebrow: "Teemakokoelma · Kulttuuri",
  title: "Suomen tarinat, tekijät ja ",
  highlight: "klassikot",
  ingress: "Taide, design, kirjallisuus, musiikki ja suomalaiset ilmiöt saunasta murteisiin.",
  accent: kokoelmaKortti("kulttuuri")!.mastery.color,
  hero: { image: KULTTUURI_HERO, focalX: 0.55, focalY: 0.45, alt: "Kollaasi suomalaisesta kulttuurista: kirja, lasiesineet, maalaus ja Jean Sibelius" },
  cta: "suosituin",
  osiotNimi: "Aihepiirit",
  sections: [
    { slug: "taide-design", eyebrow: "Kuvataide ja muotoilu", title: "Taide ja design", featured: "suomen-taiteen-kultakausi" },
    { slug: "kirjallisuus-tarinat", eyebrow: "Sanataide", title: "Kirjallisuus ja tarinat", chip: "Kirjallisuus", featured: "suomalaisen-kirjallisuuden-klassikot" },
    { slug: "musiikki-nayttamo", eyebrow: "Esittävä taide", title: "Musiikki ja näyttämö" },
    { slug: "elamantapa-ilmiot", eyebrow: "Arki", title: "Elämäntapa ja ilmiöt", chip: "Elämäntapa" },
  ],
  related: ["historia", "elokuvat", "musiikki"],
  mastery: { name: kokoelmaKortti("kulttuuri")!.mastery.name, icon: "kulttuuri" },
  haku: { collection: "kulttuuri" },
  korttikuva: kulttuuriImgKortti,
};

