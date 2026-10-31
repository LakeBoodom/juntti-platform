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
  ingress: "Jokaisella kaupungilla on oma visansa — Helsingistä Rovaniemelle.",
  accent: kokoelmaKortti("kaupungit")!.mastery.color,
  hero: { image: KAUPUNGIT_HERO_IMG, focalX: 0.75, focalY: 0.3, alt: "Laura ja Mikko matkalla" },
  cta: "suosituin",
  osiotNimi: "Alueet",
  sections: [
    // 31.10.2026: Pääkaupunkiseutu-osio poistettu (Helsinki, Espoo ja Vantaa kannassa kaupungit-etela), tunturit viimeisenä.
    { slug: "kaupungit-etela", eyebrow: "Etappi 1", title: "Etelä-Suomi", featured: "helsinki-stadin-kovat-pahkinat" },
    { slug: "kaupungit-lounais", eyebrow: "Etappi 2", title: "Lounais-Suomi" },
    { slug: "kaupungit-lansi", eyebrow: "Etappi 3", title: "Länsi-Suomi" },
    { slug: "kaupungit-ita", eyebrow: "Etappi 4", title: "Itä-Suomi" },
    { slug: "kaupungit-pohjoinen", eyebrow: "Etappi 5", title: "Pohjois-Suomi" },
    { slug: "kaupungit-tunturit", eyebrow: "Etappi 6", title: "Tunturit ja hiihtokeskukset" },
  ],
  related: ["matkakohteet", "historia", "luonto"],
  mastery: { name: kokoelmaKortti("kaupungit")!.mastery.name, icon: "kaupunki" },
  haku: { sectionTags: true },
  korttikuva: kaupunkiKorttikuva,
  korttikuvaPos: kaupunkiKorttiPos,
};
