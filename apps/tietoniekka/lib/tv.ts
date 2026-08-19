// TV & SUORATOISTO — teemasivun kuratointi (CD "TN TV ja Suoratoisto
// -teemasivu" 19.8.2026, design_handoff_tv_suoratoisto/README.md).
// Rakenteellisesti Elokuvat-sivun (lib/elokuvat.ts) sisarus, kolme
// tarkoituksellista eroa (README "Erot Elokuvat-sivuun"):
//  1. Ruudukkokortissa on koukkuteksti (hook) nimen alla + tummempi scrim.
//  2. Navigaatio on pudotusvalikkopohjainen — hoidettu globaalilla TopBarilla.
//  3. Poimitut visat TOISTUVAT aihepiireissä (Heikin päätös 19.8.2026) —
//     toistuvilla korteilla eri koukku poiminnassa ja ruudukossa.
// Koukkutekstit ovat referenssistä sanasta sanaan. Kolme CD:n kirjoittamaa
// koukkua (HIMYM, Velipuolikuu, Ketonen & Myllyrinne) hyväksytty 19.8.2026;
// kaikki tekstit hiotaan vielä copy/SEO-ajossa.
// Jokaisella 41 visalla on kuva public/20/tv/<slug>.webp (Heikin alkuperäisistä
// PNG:istä; Simpsonit-GIF stillinä, Heikin päätös 19.8.2026 — ei animaatiota).
// Uusi visa ilman kuvaa/koukkua toimii silti: kortti saa typografisen
// fallback-pohjan ja koukkurivi jää pois (README "Reunatapaukset").

export const TV_HERO = "/20/tv/hero.webp";
/** README §Hero: fokuspiste Lauran kasvoissa — älä keskitä. */
export const TV_HERO_POSITION = "64% 40%";

export const TV_INTRO =
  "Sarjat joita katsottiin liian myöhään ja muistetaan liian hyvin — kotimaiset klassikot, kansainväliset hitit ja se realityformaatti jota et myönnä seuraavasi.";

/** Heron kolmas pilleri (README: kaksi ensimmäistä ovat lukumääriä datasta). */
export const TV_BADGE = "Sarjat joista puhutaan";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "breaking-bad-visa-tunnetko-rikosdraaman",
  "diili-sa-saat-potkut-visa",
  "erikoisjoukot-visa",
  "farmi-suomi-pehtoorin-pillin-tahdissa-visa",
  "frendit-visa-tunnetko-jengin",
  "game-of-thrones-visa-tunnetko-valtaistuinpelin",
  "greys-anatomy-leikkaussali-kutsuu",
  "how-i-met-your-mother-visa",
  "kauniit-ja-rohkeat-forresterien-maailma",
  "ketonen-ja-myllyrinne-visa",
  "kotikatu-visa-muistatko-kotimaisen-klassikon",
  "kummeli-visa",
  "luottomies-visa",
  "maajussille-morsian-sydan-maaseudulla-visa",
  "metsolat-ysarin-sukusaaga",
  "money-heist-suuri-keikka",
  "muumilaakson-tarinoita-visa",
  "pasila-aseman-sekopaat",
  "petolliset-tietovisa",
  "putous-visa-tunnetko-sketsisuosikin",
  "salkkarit-salatut-elamat-tietovisa",
  "seinfeld-visa-tunnetko-komediaklassikon",
  "selviytyjat-suomi-viidakon-lait-visa",
  "simpsonit-visa-tunnetko-springfieldin-perheen",
  "solsidan-visa-tunnetko-hittikomedian",
  "sorjonen-visa-kotimainen-rikossarja",
  "squid-game-tietovisa",
  "stranger-things-tosifanin-koetinkivi",
  "succession-visa-tunnetko-valtataistelun",
  "syke-sairaalan-sankarit",
  "tankki-tayteen-huoltamoklassikko-visa",
  "ted-lasso-tiedatko-sarjasta-kaiken",
  "temptation-island-suomi-viettelysten-saarella-visa",
  "big-bang-theory-visa",
  "the-crown-visa-tunnetko-kuninkaallisen-sarjan",
  "tohtori-house-visa",
  "the-office-usa-visa-tunnetko-dunder-mifflinin-porukan",
  "the-sopranos-perheen-sisapiiri",
  "uusi-paiva-virtauksen-vaen-visa",
  "vain-elamaa-tietovisa",
  "velipuolikuu-tietovisa",
]);

export function tvImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/tv/${slug}.webp` : null;
}

/** "Tietoniekka suosittelee" — täsmälleen 3 (README: 1 = #FF3D9E,
    2 = #B79BE8, 3 = #E8A320). Poiminnan koukku on pidempi kuin ruudukon. */
export const TV_FEATURED: Array<{ slug: string; rankColor: string; hook: string }> = [
  {
    slug: "ted-lasso-tiedatko-sarjasta-kaiken",
    rankColor: "#FF3D9E",
    hook: "Amerikkalainen valmentaja, englantilainen jalkapalloseura ja kymmenen kysymystä uskosta parempaan.",
  },
  {
    slug: "syke-sairaalan-sankarit",
    rankColor: "#B79BE8",
    hook: "Kotimaisen sairaalasarjan pisin päivystysvuoro. Muistatko kenen kanssa kukin oli ja milloin?",
  },
  {
    slug: "succession-visa-tunnetko-valtataistelun",
    rankColor: "#E8A320",
    hook: "Perheyhtiö, jossa kukaan ei voita. Kuinka hyvin tunnet valtataistelun huipulla?",
  },
];

/** Viisi aihepiiriä (README §"Aihepiiriosiot 01–05"). Järjestys ja koukut
    referenssistä. Osion väri VAIN numerossa ja hover-reunassa. */
export const TV_SECTIONS: Array<{
  number: string;
  title: string;
  accent: string;
  quizzes: Array<{ slug: string; hook: string }>;
}> = [
  {
    number: "01",
    title: "Komedia",
    accent: "#FF3D9E",
    quizzes: [
      { slug: "pasila-aseman-sekopaat", hook: "Aseman sekopäät puntarissa" },
      { slug: "simpsonit-visa-tunnetko-springfieldin-perheen", hook: "Tunnetko television kuuluisimman keltaisen perheen?" },
      { slug: "big-bang-theory-visa", hook: "Uskaltaudutko nörttiporukan tietovisaan?" },
      { slug: "luottomies-visa", hook: "Lähde mukaan Juhiksen ja Tommin säätöihin!" },
      { slug: "how-i-met-your-mother-visa", hook: "Yhdeksän kautta yhtä ainoaa tarinaa" },
      { slug: "solsidan-visa-tunnetko-hittikomedian", hook: "Kuinka hyvin tunnet tämän rakastetun hittikomedian?" },
      { slug: "velipuolikuu-tietovisa", hook: "Kotimaisen huumorin kestokulttisarja" },
      { slug: "putous-visa-tunnetko-sketsisuosikin", hook: "Se olisi sitten sinulla näytön paikka!" },
      { slug: "ketonen-ja-myllyrinne-visa", hook: "Sketsiduon parhaat hetket kymmenessä kysymyksessä" },
      { slug: "the-office-usa-visa-tunnetko-dunder-mifflinin-porukan", hook: "Kuinka hyvin tunnet Dunder Mifflinin porukan?" },
      { slug: "kummeli-visa", hook: "Lähteekö? Kyllä!" },
      { slug: "seinfeld-visa-tunnetko-komediaklassikon", hook: "Kuinka hyvin tunnet tämän legendaarisen komediasarjan?" },
      { slug: "frendit-visa-tunnetko-jengin", hook: "Jos saat kaikki 10 oikein, olet todellinen fani!" },
      { slug: "ted-lasso-tiedatko-sarjasta-kaiken", hook: "Kuinka hyvin tunnet valmentajan ja Richmondin?" },
      { slug: "tankki-tayteen-huoltamoklassikko-visa", hook: "Kympin kierros legendaarisella huoltamolla" },
    ],
  },
  {
    number: "02",
    title: "Draama ja ihmissuhteet",
    accent: "#B79BE8",
    quizzes: [
      { slug: "succession-visa-tunnetko-valtataistelun", hook: "Kuinka hyvin tunnet valtataistelun huipulla?" },
      { slug: "syke-sairaalan-sankarit", hook: "Kuinka hyvin tunnet sairaalan sankarit?" },
      { slug: "the-crown-visa-tunnetko-kuninkaallisen-sarjan", hook: "Kuinka hyvin tunnet kuninkaallisen draamasarjan?" },
      { slug: "salkkarit-salatut-elamat-tietovisa", hook: "Oletko tosifani? Selvitä kuinka hyvin tunnet!" },
      { slug: "tohtori-house-visa", hook: "Miten hyvin muistat sarjan tapahtumat?" },
      { slug: "greys-anatomy-leikkaussali-kutsuu", hook: "Leikkaussali kutsuu! Montako oikein saat?" },
      { slug: "kotikatu-visa-muistatko-kotimaisen-klassikon", hook: "Kuinka hyvin muistat rakastetun kotimaisen draamasarjan?" },
      { slug: "uusi-paiva-virtauksen-vaen-visa", hook: "Muistatko vielä Virtauksen väen?" },
      { slug: "metsolat-ysarin-sukusaaga", hook: "Muistatko vielä tien kotiin?" },
      { slug: "kauniit-ja-rohkeat-forresterien-maailma", hook: "Uskaltaudutko Forresterien maailmaan?" },
    ],
  },
  {
    number: "03",
    title: "Rikos ja jännitys",
    accent: "#FF5C3D",
    quizzes: [
      { slug: "sorjonen-visa-kotimainen-rikossarja", hook: "Kuinka hyvin tunnet kotimaisen rikossarjan?" },
      { slug: "squid-game-tietovisa", hook: "Tunnetko sarjan?" },
      { slug: "the-sopranos-perheen-sisapiiri", hook: "Pääsetkö perheen sisäpiiriin?" },
      { slug: "breaking-bad-visa-tunnetko-rikosdraaman", hook: "Kuinka hyvin tunnet tämän palkitun rikosdraaman?" },
      { slug: "money-heist-suuri-keikka", hook: "Selviätkö suuresta keikasta?" },
    ],
  },
  {
    number: "04",
    title: "Fantasia, scifi ja seikkailu",
    accent: "#B6FF3C",
    quizzes: [
      { slug: "game-of-thrones-visa-tunnetko-valtaistuinpelin", hook: "Kuinka hyvin tunnet valtaistuinpelin?" },
      { slug: "muumilaakson-tarinoita-visa", hook: "Visa, joka herättää talviunilta!" },
      { slug: "stranger-things-tosifanin-koetinkivi", hook: "Tosifanin koetinkivi" },
    ],
  },
  {
    number: "05",
    title: "Reality ja kilpailut",
    accent: "#E8A320",
    quizzes: [
      { slug: "vain-elamaa-tietovisa", hook: "Onko tänään sinun päiväsi?" },
      { slug: "petolliset-tietovisa", hook: "Olisitko uskollinen vai petollinen?" },
      { slug: "farmi-suomi-pehtoorin-pillin-tahdissa-visa", hook: "Pehtoorin pillin tahdissa" },
      { slug: "temptation-island-suomi-viettelysten-saarella-visa", hook: "Viettelysten saarella" },
      { slug: "selviytyjat-suomi-viidakon-lait-visa", hook: "Viidakon lait" },
      { slug: "diili-sa-saat-potkut-visa", hook: "Sä saat potkut!" },
      { slug: "erikoisjoukot-visa", hook: "Kuulutko sinäkin Erikoisjoukkoihin?" },
      { slug: "maajussille-morsian-sydan-maaseudulla-visa", hook: "Sydän maaseudulla" },
    ],
  },
];
