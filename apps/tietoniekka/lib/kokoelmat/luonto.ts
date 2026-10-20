// LUONTO rungolla (runko vaihe 3 ryhmä 3, 20.10.2026). Osiot ovat entiset aihesuodattimet (subcollection);
// visat osioihin quizzes.section_tags-tagista (migraatio 20261121_luonto_tagit). Äänivisa ja luonnon kuvavisat
// ovat V6-pelejä (brief §3 V4: äänivisanosto on peli → V6; lib/pelimuodot.ts). Entiset nostot: Suomen
// suurpedot (heron CTA) ja Lauran ja Mikon valinta (Kansallispuistot) osioidensa B-kortteina.
import type { Kokoelma } from "./tyypit";
import { LUONTO_HERO, luontoKorttikuva } from "@/lib/luonto";
import { kokoelmaKortti } from "./rekisteri";

export const LUONTO: Kokoelma = {
  slug: "luonto",
  nimi: "Luonto",
  eyebrow: "Teemakokoelma",
  title: "Suomen ",
  highlight: "luonto",
  ingress: "Suurpedoista lintuihin, soista revontuliin. Tunnetko lähimetsäsi?",
  accent: kokoelmaKortti("luonto")!.mastery.color,
  hero: { image: LUONTO_HERO, focalX: 0.6, focalY: 0.45, alt: "Suomalainen järvimaisema" },
  cta: "suosituin",
  osiotNimi: "Aiheet",
  sections: [
    { slug: "elaimet", eyebrow: "Eläimet", title: "Eläimet", featured: "suomen-suurpedot-visa-tunnetko-huippupedot" },
    { slug: "maastot-vedet", eyebrow: "Maastot ja vedet", title: "Metsät, suot ja vedet", chip: "Maastot ja vedet", featured: "suomen-kansallispuistot-visa" },
    { slug: "kasvit-sienet", eyebrow: "Kasvit ja sienet", title: "Kasvit, marjat ja sienet", chip: "Kasvit ja sienet" },
    { slug: "ilmiot", eyebrow: "Ilmiöt", title: "Luonnon ilmiöt", chip: "Ilmiöt" },
  ],
  related: ["matkakohteet", "tiede", "kaupungit"],
  mastery: { name: kokoelmaKortti("luonto")!.mastery.name, icon: "luonto" },
  haku: { collection: "luonto" },
  korttikuva: luontoKorttikuva,
};
