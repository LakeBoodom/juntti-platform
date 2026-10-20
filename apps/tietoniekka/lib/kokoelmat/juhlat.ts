// JUHLAT rungolla (runko vaihe 3 ryhmä 3, 20.10.2026). Kokoelma on päivämääräohjattu (Heikki 28.9.2026: lähin
// juhla aina ylimpänä), joten osiot rakennetaan pyynnön päivästä: juhlat tästä päivästä vuoden eteenpäin
// lähin ensin (lib/juhlat.ts juhlaKalenteri), lopuksi "Ympäri vuoden". Visat osioihin quizzes.section_tags-
// tagista (= juhlan slug, migraatio 20261119_juhlat_tagit); yhteinen visa näkyy vain lähimmässä juhlassa.
// V4 = juhlakello (laskuri + vuosikello), korvaa V3:n. Heron nappi vie lähimmän juhlan visaan.
import type { Kokoelma, KokoelmaOsio } from "./tyypit";
import { kokoelmaKortti } from "./rekisteri";
import { lyhyt, paavisa, type Esiintyma } from "@/lib/juhlat";

const OLETUSKUVA = "/20/kokoelmakortit/juhlat.webp";
/** Juhlan pääkuvan 800 px versio (public/20/juhlat/<nimi>-800.webp) — heroon riittää. */
const kevyt = (src: string) => src.replace(/(?<!-800)\.webp$/, "-800.webp");

export function juhlatKokoelma(kalenteri: Esiintyma[], nosto: Esiintyma | null): Kokoelma {
  const sections: KokoelmaOsio[] = kalenteri.map((o) => ({
    slug: o.slug,
    eyebrow: lyhyt(o.alku),
    title: o.nimi,
    featured: o.julkaistut.length ? paavisa(o) : undefined,
  }));
  sections.push({ slug: "ympari-vuoden", eyebrow: "Ympäri vuoden", title: "Juhlia ympäri vuoden", chip: "Ympäri vuoden" });
  return {
    slug: "juhlat",
    nimi: "Juhlat ja pyhät",
    eyebrow: "Teemakokoelma",
    title: "",
    highlight: "Juhlat",
    ingress: "Visat vuoden juhliin ja perinteisiin. Ajankohtainen juhla on aina ylimpänä.",
    accent: kokoelmaKortti("juhlat")!.mastery.color,
    hero: nosto?.kuva
      ? { image: nosto.kuva, focalX: 0.5, focalY: 0.45, alt: nosto.nimi }
      : { image: OLETUSKUVA, alt: "Juhlat" },
    cta: "suosituin",
    ctaSelite: nosto ? `Lähin juhla: ${nosto.nimi} ${lyhyt(nosto.alku)}` : undefined,
    osiotNimi: "Vuosikello",
    sections,
    signature: "vuosikiekko",
    signatureReplacesNav: true,
    tunnusosaTeksti: { eyebrow: "Vuosikello", otsikko: "Vuosikello" },
    uniikitOsiot: true,
    lapset: true,
    /* Korttikuvat: juhlakuvien valmiit 800 px versiot (1600 px alkuperäiset painoivat 1,8 Mt, 20.10.2026). */
    kuvaKevyt: (src) => (src.startsWith("/20/juhlat/") ? kevyt(src) : src),
    related: ["kulttuuri", "historia", "tv"],
    mastery: { name: kokoelmaKortti("juhlat")!.mastery.name, icon: "juhla" },
    haku: { collection: "juhlat" },
  };
}
