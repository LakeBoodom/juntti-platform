// TIETONIEKKA 2.0 — TIEDE & TEKNOLOGIA -teemasivun sisältökonfiguraatio
// (CD "Tietoniekka – Tiede ja teknologia -teemasivu", 20.9.2026).
// Kokoelman 12. teemasivu. Kaikki tekstit (otsikot, koukut, osiokuvaukset)
// ovat designin copya.
//
// Visat ovat kannassa collection='yleistieto', category='tiede-teknologia'
// (20 kpl). Kokoelma tunnistetaan kategoriasta, ks. lib/visanKokoelma.ts.
// Kuvat: public/20/tiede/<slug>.webp (640×360, designin kuvat 20.9.2026).

export const TIEDE_ACCENT = "#5BE1FF";
export const TIEDE_KATEGORIA = "tiede-teknologia";

export const tiedeImg = (slug: string) => `/20/tiede/${slug}.webp`;

export const TIEDE_HERO = {
  img: "/20/tiede/hero.webp",
  /** Kollaasin painopiste (design: object-position 22% center) */
  pos: "22% center",
  kicker: "Teemakokoelma",
  titleLines: ["Tiede &", "teknologia"] as const,
  lead: "Maailma on kummallisempi kuin luulet.",
  intro:
    "Kehosta avaruuteen, mikrobeista matematiikkaan ja sattumalta syntyneistä keksinnöistä tieteen suuriin läpimurtoihin.",
  cta: "Aloita tutkimusmatka",
  /** Toinen luku täydennetään kysymysmäärästä kannassa. */
  meta: ["20 tietovisaa", "satoja kysymyksiä"] as const,
};

/** "Aloita näistä" — kuusi poimintaa. Poimitut TOISTUVAT aihepiireissä
    (sama sääntö kuin TV- ja Musiikki-sivuilla). Designissa v0.2 poiminnoilla
    on oma copynsa: koko nimi otsikkona ja pidempi kuvaus (ei sama koukku kuin
    aihepiirikorteissa). */
export const TIEDE_ALOITA: Array<{ slug: string; nimi: string; hook: string }> = [
  {
    slug: "kehosi-katketyt-kummallisuudet",
    nimi: "Ihmiskeho – kätketyt kummallisuudet",
    hook: "Luita, soluja ja reaktioita, joita kannat mukanasi joka päivä huomaamatta.",
  },
  {
    slug: "matka-planeetoilta-kuun-kraattereihin",
    nimi: "Aurinkokunta – planeetoilta Kuun kraattereihin",
    hook: "Naapuruston kiertoradat, kuut ja ilmiöt, joita voi katsoa omalta pihalta.",
  },
  {
    slug: "tiedemyyttien-tarkastus-visa",
    nimi: "Tiedemyytit – totta vai tarua?",
    hook: "Sitkeimmät koulussa opitut totuudet, jotka eivät kestä lähempää tarkastelua.",
  },
  {
    slug: "kadonneen-ajan-jattilaiset",
    nimi: "Dinosaurukset – kadonneen ajan jättiläiset",
    hook: "Mitä fossiilit oikeasti kertovat maailman kuuluisimmista eläimistä.",
  },
  {
    slug: "paan-sisalla-tapahtuu-enemman-kuin-huomaat",
    nimi: "Aivot ja mieli – enemmän kuin huomaat",
    hook: "Muisti, aistiharhat ja päätökset, jotka teet ennen kuin ehdit ajatella.",
  },
  {
    slug: "nerokkaita-oivalluksia-ja-onnekkaita-sattumia",
    nimi: "Keksinnöt – oivalluksia ja onnekkaita sattumia",
    hook: "Arkiset esineet, joiden syntytarina on paljon outompi kuin uskoisi.",
  },
];

/** Poimintaruudukon ylänurkan pikkuotsikko (design v0.2). */
export const TIEDE_ALOITA_KICKER = "Tietoniekka suosittelee";

/** Nostettu visa aihepiirien 02 ja 03 välissä. */
export const TIEDE_NOSTO = {
  slug: "tiedemyyttien-tarkastus-visa",
  kicker: "Nostettu visa",
  title: "Tiedätkö enemmän kuin arkijärkesi?",
  text:
    "Käytämmekö vain 10 % aivoistamme? Näkyykö Kiinan muuri avaruudesta? Tiede on täynnä sitkeitä uskomuksia – kuinka monta sinä tunnistat?",
  cta: "Testaa uskomuksesi",
  meta: "Tiedemyytit – totta vai tarua?",
};

/** Neljä aihepiiriä (design: 01–04) — vain otsikot ja kuvaukset.
 *
 *  Mikä visa kuuluu mihinkin aihepiiriin tulee kannasta:
 *  `quizzes.subcollection` = `id` alla. Kortin lyhyt nimi on
 *  `quizzes.display_title` ja koukku `quizzes.teaser`. Sama tapa kuin
 *  Historialla, Luonnolla ja Kulttuurilla (migraatio 20.9.2026).
 *  Uusi tiedevisa ilmestyy sivulle ilman koodimuutosta, kunhan sille
 *  asetetaan kannassa category='tiede-teknologia' ja subcollection.
 *
 *  Järjestys aihepiirin sisällä: published_at nousevasti. */
export const TIEDE_SECTIONS: Array<{
  number: string;
  title: string;
  id: string;
  intro: string;
}> = [
  {
    number: "01",
    title: "Elämä & ihminen",
    id: "elama-ja-ihminen",
    intro: "Soluista aivoihin ja evoluutiosta eläinten uskomattomiin kykyihin.",
  },
  {
    number: "02",
    title: "Maa & avaruus",
    id: "maa-ja-avaruus",
    intro: "Miljardeja vuosia historiaa maan alla, meren syvyyksissä ja taivaalla.",
  },
  {
    number: "03",
    title: "Fysiikka, kemia & matematiikka",
    id: "fysiikka-kemia-matematiikka",
    intro: "Miksi asiat putoavat, reagoivat ja käyttäytyvät aivan eri tavalla kuin intuitio väittää?",
  },
  {
    number: "04",
    title: "Keksinnöt & tiedehistoria",
    id: "keksinnot-ja-tiedehistoria",
    intro: "Nerokkaita oivalluksia, vahinkoja, kilpailua ja ihmisiä, jotka muuttivat maailmaa.",
  },
];

export const TIEDE_FOOTNOTE = "Kokoelma kasvaa – uusia aiheita ja pelimuotoja tulossa.";

/** Etusivun mainosbanneri (design: "Etusivun mainosbanneri"). */
export const TIEDE_BANNERI = {
  kicker: "Uusi kokoelma",
  title: "Tiede & teknologia",
  text: "Maailma on kummallisempi kuin luulet. 20 uutta visaa kehosta avaruuteen.",
  cta: "Aloita tutkimusmatka",
  meta: "20 visaa",
  href: "/kokoelma/tiede",
};
