// URHEILU rungolla (runko vaihe 3 ryhmä 2, 19.10.2026). Osiot ovat entiset viisi lajilohkoa
// (CD "TN Urheilu -teemasivu" 26.8.2026) + viisi palloilulajia (3.11.2026); visat osioihin quizzes.section_tags-tagista
// (migraatiot 20261114_urheilu_tagit, 20261129_palloilu_lajeittain). Jääkiekolla ja jalkapallolla on omat kokoelmansa — entiset porttikortit ovat
// nyt V7-naapureita. Haku: collection 'urheilu' + tämän kokoelman tagit (sama collection sisältää myös
// jalkapallo- ja jääkiekkovisat, jotka eivät kuulu tänne).
import type { Kokoelma } from "./tyypit";
import { UL_HERO, urheilulajitKorttikuva, urheilulajitQuizPos } from "@/lib/urheilulajit";
import { kokoelmaKortti } from "./rekisteri";

export const URHEILU: Kokoelma = {
  slug: "urheilu",
  nimi: "Urheilu",
  eyebrow: "",
  title: "",
  highlight: "Urheilu",
  ingress: "Palloilu, moottoriurheilu, golf, tennis ja suomalaisen urheilun suuret hetket.",
  accent: kokoelmaKortti("urheilu")!.mastery.color,
  hero: { image: UL_HERO.img, focalX: 0.62, focalY: 0.28, alt: "Marcus Grönholm haastattelussa rallin MM-osakilpailussa" },
  cta: "suosituin",
  osiotNimi: "Lajit",
  sections: [
    // 3.11.2026 (Heikki): ajankohtaisimmat lajit ensin, palloilu lajeittain. 14.11.2026: osioiden sisäinen järjestys
    // käsin (jarjestys) arvokkaimmasta vähiten arvokkaaseen.
    { slug: "koripallo", eyebrow: "Palloilu", title: "Koripallo", jarjestys: ["koripallon-suomalaislegendat", "susijengin-arvokisatarina", "korisliigan-historia-ja-mestarit", "tapiolan-honka", "kotkan-ktp-basket", "joensuun-kataja", "kouvolan-kouvot", "salon-vilpas"] },
    { slug: "lentopallo", eyebrow: "Palloilu", title: "Lentopallo", jarjestys: ["veljekset-lentopallomiehet", "lentopallon-legendat-suomessa", "lentopallon-mestaruusliiga", "kokkolan-tiikerit"] },
    { slug: "salibandy", eyebrow: "Palloilu", title: "Salibandy", jarjestys: ["suomi-salibandyn-mm-kisoissa", "salibandyn-tahdet-ja-legendat", "f-liiga-salibandyn-paasarja", "suomen-salibandynaiset", "tampereen-classic", "seinajoen-peliveljet-spv"] },
    { slug: "kasipallo", eyebrow: "Palloilu", title: "Käsipallo" },
    { slug: "jaapallo", eyebrow: "Palloilu", title: "Jääpallo", featured: "jaapallo-pakkasen-pallopeli" },
    { slug: "f1", eyebrow: "Autourheilu", title: "Formula 1", featured: "formula-1-tiedatko-f1n-perusteet" },
    { slug: "ralli", eyebrow: "Autourheilu", title: "Ralli" },
    { slug: "golf", eyebrow: "Mailapelit", title: "Golf" },
    { slug: "tennis", eyebrow: "Mailapelit", title: "Tennis", jarjestys: ["atp-tour-historia-huippuhetket-visa", "suomalaiset-atp-wta-kiertueilla-visa", "us-open-tennis-visa"] },
    { slug: "urheiluhistoria", eyebrow: "Muistot", title: "Urheiluhistoria", chip: "Historia" },
  ],
  related: ["jaakiekko", "jalkapallo", "tunnetut-henkilot"],
  mastery: { name: kokoelmaKortti("urheilu")!.mastery.name, icon: "urheilu" },
  haku: { collection: "urheilu", sectionTags: true },
  korttikuva: urheilulajitKorttikuva,
  korttikuvaPos: urheilulajitQuizPos,
};
