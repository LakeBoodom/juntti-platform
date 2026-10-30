// TV JA SUORATOISTO rungolla (runko vaihe 1, 19.10.2026). Ensimmäinen kokoelma, joka siirtyi
// yhteiselle rungolle (components/tn20/runko). Osiot ovat samat viisi genreä kuin ennen
// (lib/tv.ts TV_SECTIONS); visat tulevat osioihin quizzes.section_tags-tagista (migraatio
// 20261108_quiz_section_tags). Osion B-kortti = entinen "Tietoniekka suosittelee" -nosto,
// jos sellainen oli osiossa.
import type { Kokoelma } from "./tyypit";
import { TV_HERO, tvImg } from "@/lib/tv";
import { kokoelmaKortti } from "./rekisteri";

const MAA: Record<string, string> = { kotimaiset: "Kotimainen", ulkomaiset: "Ulkomainen" };

export const TV: Kokoelma = {
  slug: "tv",
  nimi: "TV ja suoratoisto",
  eyebrow: "",
  title: "TV ja ",
  highlight: "suoratoisto",
  ingress: "Kotimaiset klassikot, maailman puhutuimmat sarjat ja tosi-tv:n suurimmat hetket.",
  accent: "#FF3D9E",
  hero: { image: TV_HERO, focalX: 0.64, focalY: 0.4, alt: "Laura katsoo televisiota sohvalla" },
  cta: "suosituin",
  osiotNimi: "Genret",
  sections: [
    { slug: "komedia", eyebrow: "Naurattaa", title: "Komedia", featured: "ted-lasso-tiedatko-sarjasta-kaiken" },
    { slug: "draama", eyebrow: "Sydämeen", title: "Draama ja ihmissuhteet", chip: "Draama", featured: "syke-sairaalan-sankarit" },
    { slug: "rikos", eyebrow: "Jännittää", title: "Rikos ja jännitys", chip: "Rikos" },
    { slug: "fantasia", eyebrow: "Toiset maailmat", title: "Fantasia, scifi ja seikkailu", chip: "Fantasia ja scifi" },
    { slug: "reality", eyebrow: "Tosi-tv", title: "Reality ja kilpailut", chip: "Reality", featured: "masked-singer-suomi-visa-naamion-takana" },
  ],
  related: ["elokuvat", "musiikki", "tunnetut-henkilot"],
  mastery: { name: kokoelmaKortti("tv")!.mastery.name, icon: "tv" },
  haku: { collection: "tv" },
  korttikuva: tvImg,
  metarivi: (v) => (v.subcollection && MAA[v.subcollection]) || "",
};
