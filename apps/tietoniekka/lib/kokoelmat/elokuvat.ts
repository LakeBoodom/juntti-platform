// ELOKUVAT rungolla (runko vaihe 3, 19.10.2026). Osiot ovat samat neljä aihepiiriä kuin ennen
// (CD "TN Elokuvat -teemasivu" 15.8.2026); visat osioihin quizzes.section_tags-tagista (migraatio
// 20261110_elokuvat_tagit). Entiset kolme "Tietoniekka suosittelee" -nostoa ovat Hollywood-osiossa,
// Odyssey osion B-korttina.
import type { Kokoelma } from "./tyypit";
import { ELOKUVAT_HERO, elokuvatImg } from "@/lib/elokuvat";
import { kokoelmaKortti } from "./rekisteri";

export const ELOKUVAT: Kokoelma = {
  slug: "elokuvat",
  nimi: "Elokuvat",
  eyebrow: "Teemakokoelma",
  title: "Elo",
  highlight: "kuvat",
  ingress: "Blockbusterit, kotimaiset klassikot ja ne elokuvat, joita ei myönnetä katsotuiksi.",
  accent: kokoelmaKortti("elokuvat")!.mastery.color,
  hero: { image: ELOKUVAT_HERO, focalX: 0.56, focalY: 0.32, alt: "Elokuvateatterin valkokangas ja punaiset istuimet" },
  cta: "suosituin",
  osiotNimi: "Aihepiirit",
  sections: [
    { slug: "hollywood", eyebrow: "Blockbusterit", title: "Hollywoodin hitit ja suuret elokuvasarjat", chip: "Hollywood", featured: "the-odyssey-nolan-2026" },
    { slug: "kotimaiset-elokuvat", eyebrow: "Kotimaa", title: "Kotimaiset elokuvat", chip: "Kotimaiset" },
    { slug: "elokuvaklassikot", eyebrow: "Kulttimaine", title: "Klassikot ja kulttielokuvat", chip: "Klassikot" },
    { slug: "ohjaajat", eyebrow: "Tekijät", title: "Ohjaajat ja elokuva-alan legendat", chip: "Ohjaajat" },
  ],
  related: ["tv", "musiikki", "tunnetut-henkilot"],
  mastery: { name: kokoelmaKortti("elokuvat")!.mastery.name, icon: "elokuva" },
  haku: { collection: "elokuvat" },
  korttikuva: elokuvatImg,
};
