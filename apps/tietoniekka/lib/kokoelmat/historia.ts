// HISTORIA rungolla (runko vaihe 3 ryhmä 3, 20.10.2026). V4 = aikajana, joka korvaa V3:n (CD-arkki kierros 2,
// kohta 2). Osiot ovat entisen sivun seitsemän aikakautta + läpileikkaavat teemat; visat osioihin
// quizzes.section_tags-tagista (migraatio 20261118_historia_tagit). Aikakauden visat julkaisujärjestyksessä
// (jarjestys "aika"), koska aikakaudet pelataan kronologisesti.
import type { Kokoelma } from "./tyypit";
import { kokoelmaKortti } from "./rekisteri";

/** Visat, joilla on 800 px korttikopio public/20/historia/k/ (myös Vaalit käyttää näitä). */
export const HISTORIA_KORTTIKUVAT = new Set([
  "autonomian-aika-visa", "kekkosen-suomi-kylma-sota-idansuhteet", "mannerheim-visa",
  "suomen-itsenaistyminen-visa", "suomen-presidentit-visa", "suomi-1980-luvulla",
]);

export const HISTORIA: Kokoelma = {
  slug: "historia",
  nimi: "Historia",
  eyebrow: "Teemakokoelma",
  title: "Suomen ",
  highlight: "historia",
  ingress: "Kivikaudesta nykypäivään. Pelaa aikakaudet järjestyksessä tai poimi jakso, joka kiinnostaa.",
  accent: kokoelmaKortti("historia")!.mastery.color,
  hero: { image: "/20/historia/hero-aikajana.webp", focalX: 0.5, focalY: 0.4, alt: "Suomen historia kivikaudesta nykypäivään" },
  cta: "suosituin",
  osiotNimi: "Aikakaudet",
  sections: [
    { slug: "esihistoria", eyebrow: "n. 9000 eaa. – 1100-luku", title: "Suomi ennen Suomea", chip: "Esihistoria", vuodet: "9000 eaa. – 1100-l." },
    { slug: "ruotsin-aika", eyebrow: "1100-luku – 1809", title: "Kun Suomi oli osa Ruotsia", chip: "Ruotsin aika", vuodet: "1100-l. – 1809" },
    { slug: "autonomia", eyebrow: "1809–1917", title: "Suuriruhtinaskunnan vuosisata", chip: "Autonomia", vuodet: "1809–1917" },
    { slug: "itsenaisyys", eyebrow: "1917–1918", title: "Itsenäinen Suomi syntyy", chip: "Itsenäisyys", vuodet: "1917–1918" },
    { slug: "sodat", eyebrow: "1939–1945", title: "Sotien Suomi", chip: "Sodat", vuodet: "1939–1945" },
    { slug: "jalleenrakennus", eyebrow: "1945–1960-luku", title: "Jälleenrakennuksen Suomi", chip: "Jälleenrak.", vuodet: "1945–1960-l." },
    { slug: "nykyaika", eyebrow: "1952–2000-luku", title: "Suomi maailmalle", chip: "Nykyaika", vuodet: "1952–2000-l." },
    { slug: "historian-teemat", eyebrow: "Kautta historian", title: "Läpileikkaavat teemat", chip: "Teemat", vuodet: "Kautta historian" },
  ],
  signature: "aikajana",
  signatureReplacesNav: true,
  tunnusosaTeksti: { eyebrow: "Aikajana", otsikko: "Seitsemän aikakautta" },
  jarjestys: "aika",
  related: ["vaalit", "kulttuuri", "kaupungit"],
  mastery: { name: kokoelmaKortti("historia")!.mastery.name, icon: "historia" },
  haku: { collection: "historia" },
  korttikuva: (slug) => (HISTORIA_KORTTIKUVAT.has(slug) ? `/20/historia/k/${slug}.webp` : null), // 800 px kopiot (20.10.2026)
};
