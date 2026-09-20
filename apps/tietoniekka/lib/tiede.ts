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
    (sama sääntö kuin TV- ja Musiikki-sivuilla). */
export const TIEDE_ALOITA: Array<{ slug: string; nimi: string; hook: string }> = [
  { slug: "kehosi-katketyt-kummallisuudet", nimi: "Ihmiskeho", hook: "Kätketyt kummallisuudet" },
  { slug: "matka-planeetoilta-kuun-kraattereihin", nimi: "Aurinkokunta", hook: "Planeetoilta Kuun kraattereihin" },
  { slug: "tiedemyyttien-tarkastus-visa", nimi: "Tiedemyytit", hook: "Totta vai tarua?" },
  { slug: "kadonneen-ajan-jattilaiset", nimi: "Dinosaurukset", hook: "Kadonneen ajan jättiläiset" },
  { slug: "paan-sisalla-tapahtuu-enemman-kuin-huomaat", nimi: "Aivot ja mieli", hook: "Enemmän kuin huomaat" },
  { slug: "nerokkaita-oivalluksia-ja-onnekkaita-sattumia", nimi: "Keksinnöt", hook: "Nerokkaita oivalluksia ja onnekkaita sattumia" },
];

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

/** Neljä aihepiiriä (design: 01–04). Nimi ja koukku ovat designin copya —
    korteissa näytetään lyhyt nimi, ei visan koko otsikkoa. */
export const TIEDE_SECTIONS: Array<{
  number: string;
  title: string;
  id: string;
  intro: string;
  quizzes: Array<{ slug: string; nimi: string; hook: string }>;
}> = [
  {
    number: "01",
    title: "Elämä & ihminen",
    id: "elama-ja-ihminen",
    intro: "Soluista aivoihin ja evoluutiosta eläinten uskomattomiin kykyihin.",
    quizzes: [
      { slug: "kehosi-katketyt-kummallisuudet", nimi: "Ihmiskeho", hook: "Kätketyt kummallisuudet" },
      { slug: "paan-sisalla-tapahtuu-enemman-kuin-huomaat", nimi: "Aivot ja mieli", hook: "Enemmän kuin huomaat" },
      { slug: "mista-olet-tehty-oikeasti-genetiikka", nimi: "Genetiikka", hook: "Mistä olet tehty, oikeasti?" },
      { slug: "evoluutio-ja-biodiversiteetti-visa", nimi: "Evoluutio", hook: "Kaikki muuttuu, mutta ei niin kuin luulet" },
      { slug: "mikroskooppinen-maailma-nakymaton-elama", nimi: "Mikrobit", hook: "Näkymätön maailma silmiesi edessä" },
      { slug: "laaketieteen-lapimurrot-visa", nimi: "Lääketiede", hook: "Läpimurtoja leikkaussalista laboratorioon" },
      { slug: "kasvit-ja-sienet-ansoja-kauppoja-jattilaisia", nimi: "Kasvit ja sienet", hook: "Ansoja, kauppoja ja jättiläisiä" },
      { slug: "elainten-supervoimat-aistit-ja-ennatykset", nimi: "Eläinten supervoimat", hook: "Aisteja ja ennätyksiä" },
    ],
  },
  {
    number: "02",
    title: "Maa & avaruus",
    id: "maa-ja-avaruus",
    intro: "Miljardeja vuosia historiaa maan alla, meren syvyyksissä ja taivaalla.",
    quizzes: [
      { slug: "matka-planeetoilta-kuun-kraattereihin", nimi: "Aurinkokunta", hook: "Planeetoilta Kuun kraattereihin" },
      { slug: "elava-planeetta-liikkuu-jalkojesi-alla", nimi: "Geologia", hook: "Elävä planeetta jalkojesi alla" },
      { slug: "saa-ja-ilmakeha-taivaan-pikkuprintti", nimi: "Sää ja ilmakehä", hook: "Taivaan pikkuprintti" },
      { slug: "meret-ja-merentutkimus-visa", nimi: "Meret ja syvyydet", hook: "Pimeys, paine ja salaisuudet" },
      { slug: "kadonneen-ajan-jattilaiset", nimi: "Dinosaurukset", hook: "Kadonneen ajan jättiläiset" },
    ],
  },
  {
    number: "03",
    title: "Fysiikka, kemia & matematiikka",
    id: "fysiikka-kemia-matematiikka",
    intro: "Miksi asiat putoavat, reagoivat ja käyttäytyvät aivan eri tavalla kuin intuitio väittää?",
    quizzes: [
      { slug: "arjen-fysiikka-salamoista-sireeneihin", nimi: "Arjen fysiikka", hook: "Salamoista sireeneihin" },
      { slug: "kemia-ja-alkuaineet-visa", nimi: "Kemia", hook: "Kuplia, ruostetta ja tähtipölyä" },
      { slug: "arkijarki-vastaan-matematiikka", nimi: "Arkijärki vastaan matematiikka", hook: "Kun intuitio on väärässä" },
    ],
  },
  {
    number: "04",
    title: "Keksinnöt & tiedehistoria",
    id: "keksinnot-ja-tiedehistoria",
    intro: "Nerokkaita oivalluksia, vahinkoja, kilpailua ja ihmisiä, jotka muuttivat maailmaa.",
    quizzes: [
      { slug: "nerokkaita-oivalluksia-ja-onnekkaita-sattumia", nimi: "Keksinnöt", hook: "Nerokkaita oivalluksia ja onnekkaita sattumia" },
      { slug: "teknologian-ensimmaiset-hetket-visa", nimi: "Teknologian ensiaskeleet", hook: "Ensimmäinen sana, kuva ja soitto" },
      { slug: "neroja-omenoita-ja-yllattavia-kaanteita", nimi: "Tiedehistorian nerot", hook: "Omenoita ja yllättäviä käänteitä" },
      { slug: "tiedemyyttien-tarkastus-visa", nimi: "Tiedemyytit", hook: "Totta vai tarua?" },
    ],
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
