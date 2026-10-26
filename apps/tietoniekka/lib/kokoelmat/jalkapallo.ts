// JALKAPALLO rungolla (runko vaihe 3 ryhmä 2, 19.10.2026). Osiot ovat entisen sivun lohkot (CD "TN Jalkapallo
// -teemasivu" 25.8.2026): Valioliigan seurat, Valioliigan yleisvisat, Euroopan suurseurat, Mestarien liiga ja
// suomalaiset eurokentillä; visat osioihin quizzes.section_tags-tagista (migraatio 20261116_jalkapallo_tagit).
// Paitaseinä ja suurseurojen maasuodatin pois. Entiset "Pinnalla nyt" -nostot: Arsenal ja Real Madrid
// osioidensa B-kortteina. Vanhat ?seura=-linkit ohjataan middlewaressa #osio-valioliigan-seurat-ankkuriin.
import type { Kokoelma } from "./tyypit";
import { JP_HERO, jalkapalloQuizImg, jalkapalloQuizPos } from "@/lib/jalkapallo";
import { kokoelmaKortti } from "./rekisteri";

export const JALKAPALLO: Kokoelma = {
  slug: "jalkapallo",
  nimi: "Jalkapallo",
  eyebrow: "",
  title: "Kaikki ",
  highlight: "jalkapallosta",
  ingress: "Valioliiga, Euroopan suurseurat ja Mestarien liigan ikuiset illat.",
  accent: kokoelmaKortti("jalkapallo")!.mastery.color,
  hero: { image: JP_HERO.img, focalX: 0.5, focalY: 0.45, alt: "Valioliigan ottelu täydellä stadionilla" },
  cta: "suosituin",
  osiotNimi: "Lohkot",
  sections: [
    { slug: "valioliigan-seurat", eyebrow: "Englanti", title: "Valioliigan seurat", chip: "Seurat", featured: "arsenal-fc-legendat" },
    { slug: "valioliiga", eyebrow: "Englanti", title: "Kaikki Valioliigasta", chip: "Valioliiga" },
    { slug: "suurseurat", eyebrow: "Eurooppa", title: "Euroopan suurseurat", chip: "Suurseurat", featured: "euroopan-suurseurat-real-madrid" },
    { slug: "mestarien-liiga", eyebrow: "Eurooppa", title: "Mestarien liiga" },
    { slug: "suomalaiset-euroopassa", eyebrow: "Suomi", title: "Suomalaiset eurokentillä", chip: "Suomalaiset" },
  ],
  related: ["jaakiekko", "urheilu", "tunnetut-henkilot"],
  mastery: { name: kokoelmaKortti("jalkapallo")!.mastery.name, icon: "pallo" },
  haku: { collection: "urheilu", sectionTags: true },
  korttikuva: jalkapalloQuizImg,
  korttikuvaPos: jalkapalloQuizPos,
};
