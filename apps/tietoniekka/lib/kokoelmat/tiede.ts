// TIEDE & TEKNOLOGIA rungolla (runko vaihe 3 ryhmä 2, 19.10.2026). Osiot ovat entisen sivun neljä aihepiiriä
// (CD 20.9.2026); visat osioihin quizzes.section_tags-tagista (= subcollection, migraatio 20261117_tiede_tagit).
// Entiset "Tietoniekka suosittelee" -poiminnat ja nostettu visa (Tiedemyytit) osioidensa B-kortteina.
// Visat ovat kannassa collection='yleistieto', category='tiede-teknologia'.
import type { Kokoelma } from "./tyypit";
import { TIEDE_HERO, TIEDE_KATEGORIA, tiedeKorttikuva } from "@/lib/tiede";
import { kokoelmaKortti } from "./rekisteri";

export const TIEDE: Kokoelma = {
  slug: "tiede",
  nimi: "Tiede & teknologia",
  eyebrow: "Teemakokoelma",
  title: "Tiede & ",
  highlight: "teknologia",
  ingress: "Maailma on kummallisempi kuin luulet. Kehosta avaruuteen ja keksintöjen syntytarinoihin.",
  accent: kokoelmaKortti("tiede")!.mastery.color,
  hero: { image: TIEDE_HERO.img, focalX: 0.22, focalY: 0.5, alt: "Kollaasi tieteestä: avaruus, aivot ja keksinnöt" },
  cta: "suosituin",
  osiotNimi: "Aihepiirit",
  sections: [
    { slug: "elama-ja-ihminen", eyebrow: "Biologia", title: "Elämä ja ihminen", featured: "kehosi-katketyt-kummallisuudet" },
    { slug: "maa-ja-avaruus", eyebrow: "Maa ja taivas", title: "Maa ja avaruus", featured: "matka-planeetoilta-kuun-kraattereihin" },
    { slug: "fysiikka-kemia-matematiikka", eyebrow: "Luonnontieteet", title: "Fysiikka, kemia ja matematiikka", chip: "Fysiikka ja kemia" },
    { slug: "keksinnot-ja-tiedehistoria", eyebrow: "Historia", title: "Keksinnöt ja tiedehistoria", chip: "Keksinnöt", featured: "tiedemyyttien-tarkastus-visa" },
  ],
  related: ["luonto", "historia", "matkakohteet"],
  mastery: { name: kokoelmaKortti("tiede")!.mastery.name, icon: "tiede" },
  haku: { category: TIEDE_KATEGORIA, sectionTags: true },
  korttikuva: tiedeKorttikuva,
};
