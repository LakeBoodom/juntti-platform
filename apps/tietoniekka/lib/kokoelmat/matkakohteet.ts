// MAANTIETO (/kokoelma/matkakohteet) rungolla (runko vaihe 3, 19.10.2026). Sivulla ei ennen ollut
// osioita; 20 visaa jaettiin kolmeen osioon entisen ruudukon ryhmistä (migraatio 20261112_maantieto_tagit).
// Entiset nostot osioiden B-kortteina: Syrjäisimmät paikat (heron CTA ja 1. poiminta), Kylmimmät kolkat
// (poiminta) ja Kanariansaaret (Lauran ja Mikon valinta). Kokoelma-arvo kannassa on 'matkakohteet'.
import type { Kokoelma } from "./tyypit";
import { MAANTIETO_HERO, maantietoImgKortti } from "@/lib/maantieto";
import { kokoelmaKortti } from "./rekisteri";

export const MATKAKOHTEET: Kokoelma = {
  slug: "matkakohteet",
  nimi: "Maantieto",
  eyebrow: "Teemakokoelma · Maantieto",
  title: "Maailman ääriltä ",
  highlight: "kotia kohti",
  ingress: "Vuoret, joet, saaret ja kaupungit — myös ne, jotka luulet tuntevasi.",
  accent: kokoelmaKortti("matkakohteet")!.mastery.color,
  hero: { image: MAANTIETO_HERO, focalX: 0.47, focalY: 0.3, alt: "Vuorenhuippu vuonojen keskellä" },
  cta: "suosituin",
  osiotNimi: "Osiot",
  sections: [
    { slug: "maapallon-ennatykset", eyebrow: "Ääripäät", title: "Maapallon ennätykset", chip: "Ennätykset", featured: "maailman-syrjaisimmat-paikat" },
    { slug: "saa-ja-ilmasto", eyebrow: "Sää", title: "Sää ja ilmasto", featured: "maailman-kylmimmat-kolkat" },
    { slug: "matkakohteet", eyebrow: "Matkalle", title: "Kaupungit, saaret ja rannikot", chip: "Matkakohteet", featured: "kanariansaaret-tiedatko-tarpeeksi" },
  ],
  related: ["kaupungit", "luonto", "historia"],
  mastery: { name: kokoelmaKortti("matkakohteet")!.mastery.name, icon: "kompassi" },
  haku: { collection: "matkakohteet" },
  korttikuva: maantietoImgKortti,
};
