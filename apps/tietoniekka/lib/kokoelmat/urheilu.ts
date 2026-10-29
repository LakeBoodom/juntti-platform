// URHEILU rungolla (runko vaihe 3 ryhmä 2, 19.10.2026). Osiot ovat samat viisi lajilohkoa kuin ennen
// (CD "TN Urheilu -teemasivu" 26.8.2026); visat osioihin quizzes.section_tags-tagista (migraatio
// 20261114_urheilu_tagit). Jääkiekolla ja jalkapallolla on omat kokoelmansa — entiset porttikortit ovat
// nyt V7-naapureita. Haku: collection 'urheilu' + tämän kokoelman tagit (sama collection sisältää myös
// jalkapallo- ja jääkiekkovisat, jotka eivät kuulu tänne).
import type { Kokoelma } from "./tyypit";
import { UL_HERO, urheilulajitKorttikuva, urheilulajitQuizPos } from "@/lib/urheilulajit";
import { kokoelmaKortti } from "./rekisteri";

export const URHEILU: Kokoelma = {
  slug: "urheilu",
  nimi: "Urheilu",
  eyebrow: "",
  title: "Kaasua, mailoja ja ",
  highlight: "mitaleita",
  ingress: "Formula 1, ralli, golf, tennis ja suomalaisen urheilun suuret hetket.",
  accent: kokoelmaKortti("urheilu")!.mastery.color,
  hero: { image: UL_HERO.img, focalX: 0.5, focalY: 0.45, alt: "Ralliauto hyppää Jyväskylän MM-rallissa" },
  cta: "suosituin",
  osiotNimi: "Lajit",
  sections: [
    { slug: "f1", eyebrow: "Autourheilu", title: "Formula 1", featured: "formula-1-tiedatko-f1n-perusteet" },
    { slug: "ralli", eyebrow: "Autourheilu", title: "Ralli" },
    { slug: "golf", eyebrow: "Mailapelit", title: "Golf" },
    { slug: "tennis", eyebrow: "Mailapelit", title: "Tennis" },
    { slug: "urheiluhistoria", eyebrow: "Muistot", title: "Urheiluhistoria", chip: "Historia" },
  ],
  related: ["jaakiekko", "jalkapallo", "tunnetut-henkilot"],
  mastery: { name: kokoelmaKortti("urheilu")!.mastery.name, icon: "urheilu" },
  haku: { collection: "urheilu", sectionTags: true },
  korttikuva: urheilulajitKorttikuva,
  korttikuvaPos: urheilulajitQuizPos,
};
