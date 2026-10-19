// JÄÄKIEKKO rungolla (runko vaihe 3 ryhmä 2, 19.10.2026). Osiot ovat entisen sivun erät (CD "TN Jaakiekko
// -teemasivu" 22.8.2026): liigaseurat, derbyt, Liigan kohokohdat, Leijonat ja NHL; visat osioihin
// quizzes.section_tags-tagista (migraatio 20261115_jaakiekko_tagit). Kaukalokartta ja paitaseinä pois
// (Heikki 19.10.: kartat pois kokoelmasivuilta). Liigaseurojen B-kortti = hallitseva mestari (Tappara).
import type { Kokoelma } from "./tyypit";
import { JK_HERO, jaakiekkoQuizImgKortti, jaakiekkoQuizPos } from "@/lib/jaakiekko";
import { kokoelmaKortti } from "./rekisteri";

export const JAAKIEKKO: Kokoelma = {
  slug: "jaakiekko",
  nimi: "Jääkiekko",
  eyebrow: "Teemakokoelma · Jääkiekko",
  title: "Kaikki ",
  highlight: "jääkiekosta",
  ingress: "Liigaseurat, Leijonien kultavuodet ja suomalaiset NHL:ssä.",
  accent: kokoelmaKortti("jaakiekko")!.mastery.color,
  hero: { image: JK_HERO.img, focalX: 0.5, focalY: 0.5, alt: "Jäähalli ennen ottelua" },
  cta: "suosituin",
  osiotNimi: "Erät",
  sections: [
    { slug: "liigaseurat", eyebrow: "1. erä", title: "Liigaseurat", featured: "tappara-tampere-kirvesrinnat-tietovisa" },
    { slug: "derbyt", eyebrow: "Paikallispelit", title: "Derbyvisat", chip: "Derbyt" },
    { slug: "liigan-kohokohdat", eyebrow: "Jatkoerä", title: "Liigan kohokohdat", chip: "Kohokohdat" },
    { slug: "leijonat", eyebrow: "2. erä", title: "Leijonien kultavisat", chip: "Leijonat" },
    { slug: "nhl", eyebrow: "3. erä", title: "Suomen NHL-historia", chip: "NHL" },
  ],
  related: ["jalkapallo", "urheilu", "tunnetut-henkilot"],
  mastery: { name: kokoelmaKortti("jaakiekko")!.mastery.name, icon: "kiekko" },
  haku: { category: "jaakiekko", sectionTags: true },
  korttikuva: jaakiekkoQuizImgKortti,
  korttikuvaPos: jaakiekkoQuizPos,
  kuvakrediitti: "Valokuvat: Wikimedia Commons, CC BY / CC BY-SA / public domain",
};
