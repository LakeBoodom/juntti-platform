// SUOMEN KAUPUNGIT rungolla (runko vaihe 3 ryhmä 3, 20.10.2026). Brief §3: kaupunkien kartta poistuu,
// matkapassin etapit ovat V3-osioita (alueet) ja eteneminen V2:ssa (metapeli). Visat osioihin
// quizzes.section_tags-tagista (migraatio 20261120_kaupungit_tagit); kannassa collection 'yleistieto'.
// Suomen kaupungit -megavisa on V6:ssa (pelimuotorekisteri).
import type { Kokoelma } from "./tyypit";
import { KAUPUNGIT_HERO_IMG, kaupunkiKorttikuva, kaupunkiKorttiPos } from "@/lib/kaupungit";
import { kokoelmaKortti } from "./rekisteri";

export const KAUPUNGIT_KOKOELMA: Kokoelma = {
  slug: "kaupungit",
  nimi: "Suomen kaupungit",
  eyebrow: "",
  title: "Matkusta halki ",
  highlight: "Suomen",
  ingress: "Jokaisella kaupungilla on oma visansa — Hangosta Lapin tuntureille.",
  accent: kokoelmaKortti("kaupungit")!.mastery.color,
  hero: { image: KAUPUNGIT_HERO_IMG, focalX: 0.75, focalY: 0.3, alt: "Laura ja Mikko matkalla" },
  cta: "suosituin",
  osiotNimi: "Alueet",
  sections: [
    // 31.10.2026 (Heikki): maakuntapohjaiset osiot. Yhden visan maakunnat on yhdistetty naapuriin, kunnes niihin tulee
    // lisää visoja — silloin jokainen maakunta voi saada oman osion. Pääkaupunkiseutu erotettu Uudestamaasta.
    { slug: "kaupungit-paakaupunkiseutu", eyebrow: "Etappi 1", title: "Pääkaupunkiseutu", featured: "helsinki-stadin-kovat-pahkinat" },
    { slug: "kaupungit-uusimaa", eyebrow: "Etappi 2", title: "Uusimaa" },
    { slug: "kaupungit-varsinais-suomi-ahvenanmaa", eyebrow: "Etappi 3", title: "Varsinais-Suomi ja Ahvenanmaa" },
    { slug: "kaupungit-satakunta-pirkanmaa", eyebrow: "Etappi 4", title: "Satakunta ja Pirkanmaa" },
    { slug: "kaupungit-hame", eyebrow: "Etappi 5", title: "Häme" },
    { slug: "kaupungit-kymenlaakso-etela-karjala", eyebrow: "Etappi 6", title: "Kymenlaakso ja Etelä-Karjala" },
    { slug: "kaupungit-savo-karjala", eyebrow: "Etappi 7", title: "Savo ja Karjala" },
    { slug: "kaupungit-keski-suomi-pohjanmaa", eyebrow: "Etappi 8", title: "Keski-Suomi ja Pohjanmaa" },
    { slug: "kaupungit-pohjois-pohjanmaa-kainuu-lappi", eyebrow: "Etappi 9", title: "Pohjois-Pohjanmaa, Kainuu ja Lappi" },
    { slug: "kaupungit-tunturit", eyebrow: "Etappi 10", title: "Tunturit ja hiihtokeskukset" },
  ],
  related: ["matkakohteet", "historia", "luonto"],
  mastery: { name: kokoelmaKortti("kaupungit")!.mastery.name, icon: "kaupunki" },
  haku: { sectionTags: true },
  korttikuva: kaupunkiKorttikuva,
  korttikuvaPos: kaupunkiKorttiPos,
};
