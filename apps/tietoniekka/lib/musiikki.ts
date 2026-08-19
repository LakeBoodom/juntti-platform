// MUSIIKKI — teemasivun kuratointi (CD "TN Musiikki -teemasivu" 19.8.2026,
// design_handoff_musiikki/README.md). Rakenteellisesti IDENTTINEN TV &
// Suoratoisto -sivun kanssa — sama komponenttiperhe (.tne-*), erot ovat
// konfiguraatiota: kokoelmaväri violetti #A24BFF/#C68BFF, kuusi aihepiiriä,
// oma herokuva (Laura ja Mikko festareilla, fokus 70% 50%) ja oma sisältö.
// Heikin päätökset 19.8.2026:
//  - Poimitut visat TOISTUVAT aihepiireissä (sama sääntö kuin TV:llä —
//    README vaatii saman päätöksen kaikille kokoelmille). Eri koukku
//    poiminnassa ja ruudukossa (Taylor Swift, Eppu Normaali, JVG).
//  - Kolme festarivisaa (Blockfest, Suomi euroviisuissa, Weekend Festival)
//    JÄTETÄÄN POIS sivulta — design on totuus, ei niille ole kuvia eikä
//    osiota. Ne löytyvät edelleen megoista/tikkeristä.
//  - Lordi-visan lyhytnimi kannassa päivitetty "Lordi"-muotoon (design).
// Koukkutekstit referenssistä sanasta sanaan; CD:n huomautus: 36 koukkua +
// 3 poimintakuvausta EI ole hyväksytetty → tarkistetaan copy/SEO-passissa.
// Artistinimien kirjoitusasu on osa dataa (SANNI, Haloo Helsinki!, Juice
// WRLD, The Weeknd, J Balvin, BTS) — uppercase tehdään CSS:llä.
// Jokaisella 36 visalla on kuva public/20/musiikki/<slug>.webp (Heikin
// alkuperäisistä PNG:istä; AI-lavakuvituksia, ei oikeita artistikuvia).

export const MUSIIKKI_HERO = "/20/musiikki/hero.webp";
/** README §Hero: fokus Lauran ja Mikon kasvoissa (oikea kolmannes) — älä keskitä. */
export const MUSIIKKI_HERO_POSITION = "70% 50%";

/** Esittelyteksti — visamäärä tulee datasta (README: älä kovakoodaa lukua). */
export function musiikkiIntro(count: number): string {
  return `Suomirapin kingit, stadionien supertähdet ja ne biisit jotka jäivät soimaan päähän — ${count} visaa niille jotka kuuntelevat tarkasti.`;
}

/** Heron kolmas pilleri. */
export const MUSIIKKI_BADGE = "Kotimaasta maailmalle";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "abba-tietovisa",
  "antti-tuisku-visa-peto-on-irti",
  "apulanta-bandi-tietovisa",
  "ariana-grande-visa-tunnetko-poptahden",
  "bad-bunny-visa-tunnetko-latinotahden",
  "behm-visa-hei-rakas",
  "billie-eilish-visa-tunnetko-poptahden",
  "bob-marley-reggaen-legenda",
  "bruno-mars-visa-tunnetko-tahden",
  "bts-visa-tunnetko-kpop-ilmion",
  "cheek-visa-valot-sammuu",
  "coldplay-visa-tunnetko-yhtyeen",
  "drake-visa-tunnetko-hiphoptahden",
  "ed-sheeran-visa-tunnetko-lauluntekijan",
  "elastinen-visa-suomirapin-pioneeri",
  "eminem-visa-tunnetko-rap-legendan",
  "eppu-normaali-tietovisa",
  "future-visa-tunnetko-trapin-tahden",
  "haloo-helsinki-visa-beibi-fani",
  "visa-mo5e4rgk",
  "j-balvin-visa-tunnetko-reggaetontahden",
  "juice-wrld-visa-tunnetko-tahden",
  "justin-bieber-visa-tunnetko-poptahden",
  "jvg-visa-haista-ikuiseen-vappuun",
  "kanye-west-visa-tunnetko-uudistajan",
  "kendrick-lamar-visa-tunnetko-rap-tahden",
  "lordi-hirviot-haltuun",
  "pmmp-visa-rusketusraidat",
  "post-malone-visa-tunnetko-tahden",
  "rihanna-visa-tunnetko-tahden",
  "robin-visa-frontside-ollie",
  "sanni-visa-prinsessoja-astronautteja",
  "taylor-swift-visa-tunnetko-supertahden",
  "the-weeknd-visa-tunnetko-rnb-tahden",
  "travis-scott-visa-tunnetko-rap-tahden",
  "ultra-bra-tietovisa",
]);

export function musiikkiImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/musiikki/${slug}.webp` : null;
}

/** "Tietoniekka suosittelee" — täsmälleen 3 (README: 1 = #A24BFF,
    2 = #FF5C3D, 3 = #E8A320). Poiminnan koukku pidempi kuin ruudukon. */
export const MUSIIKKI_FEATURED: Array<{ slug: string; rankColor: string; hook: string }> = [
  {
    slug: "taylor-swift-visa-tunnetko-supertahden",
    rankColor: "#A24BFF",
    hook: "Kausi kaudelta uudelleen keksitty poptähti. Kymmenen kysymystä sanoituksista, kiertueista ja kissoista.",
  },
  {
    slug: "eppu-normaali-tietovisa",
    rankColor: "#FF5C3D",
    hook: "Suomirockin kestävin kokoonpano. Muistatko levyt, riffit ja Martin sanaparret?",
  },
  {
    slug: "jvg-visa-haista-ikuiseen-vappuun",
    rankColor: "#E8A320",
    hook: "Vesalan ja Jareen bilehitit. Kuinka hyvin tunnet kaksikon matkan Vantaalta stadionille?",
  },
];

/** Kuusi aihepiiriä (README §"Aihepiiriosiot 01–06"). Järjestys ja koukut
    referenssistä. Osion väri VAIN numerossa ja hover-reunassa. */
export const MUSIIKKI_SECTIONS: Array<{
  number: string;
  title: string;
  accent: string;
  quizzes: Array<{ slug: string; hook: string }>;
}> = [
  {
    number: "01",
    title: "Suomirap",
    accent: "#E8A320",
    quizzes: [
      { slug: "elastinen-visa-suomirapin-pioneeri", hook: "Pitkän linjan kingi mikin takana" },
      { slug: "cheek-visa-valot-sammuu", hook: "Timantit on ikuisia — entä muistikuvasi?" },
      { slug: "jvg-visa-haista-ikuiseen-vappuun", hook: "Bileiden ykkösnimi kymmenessä kysymyksessä" },
    ],
  },
  {
    number: "02",
    title: "Suomipop",
    accent: "#FF4FA8",
    quizzes: [
      { slug: "sanni-visa-prinsessoja-astronautteja", hook: "Kuinka tarkkaan olet kuunnellut?" },
      { slug: "behm-visa-hei-rakas", hook: "Hittien uusi aalto puntarissa" },
      { slug: "robin-visa-frontside-ollie", hook: "Frontsivelho ja teinitähtien vuodet" },
      { slug: "antti-tuisku-visa-peto-on-irti", hook: "En kommentoi — mutta sinä vastaat" },
      { slug: "haloo-helsinki-visa-beibi-fani", hook: "Beibi, tunnetko bändin tarinan?" },
      { slug: "pmmp-visa-rusketusraidat", hook: "Rusketusraidat ja muut klassikot" },
      { slug: "ultra-bra-tietovisa", hook: "Isot kuorot ja 90-luvun tunnelmat" },
    ],
  },
  {
    number: "03",
    title: "Suomalainen rock & klassikot",
    accent: "#FF5C3D",
    quizzes: [
      { slug: "lordi-hirviot-haltuun", hook: "Hard Rock Hallelujah — muistatko euroillan?" },
      { slug: "eppu-normaali-tietovisa", hook: "Suomirockin pitkäikäisin bändi puntarissa" },
      { slug: "apulanta-bandi-tietovisa", hook: "Kolme jätkää ja kolme vuosikymmentä" },
      { slug: "visa-mo5e4rgk", hook: "Glamin kotimaiset kapinalliset" },
    ],
  },
  {
    number: "04",
    title: "Popin supertähdet",
    accent: "#A24BFF",
    quizzes: [
      { slug: "the-weeknd-visa-tunnetko-rnb-tahden", hook: "Blinding Lights ja yön puolella" },
      { slug: "ariana-grande-visa-tunnetko-poptahden", hook: "Poninhäntä ja seitsemän sormusta" },
      { slug: "coldplay-visa-tunnetko-yhtyeen", hook: "Stadionpopin tähtitaivas" },
      { slug: "rihanna-visa-tunnetko-tahden", hook: "Barbadokselta maailman huipulle" },
      { slug: "billie-eilish-visa-tunnetko-poptahden", hook: "Kuiskausten kuningatar" },
      { slug: "ed-sheeran-visa-tunnetko-lauluntekijan", hook: "Yksi mies, kitara ja loop-pedaali" },
      { slug: "bruno-mars-visa-tunnetko-tahden", hook: "24K-viihdyttäjä lavan päällä" },
      { slug: "taylor-swift-visa-tunnetko-supertahden", hook: "Kausien läpi kymmenellä kysymyksellä" },
      { slug: "justin-bieber-visa-tunnetko-poptahden", hook: "Nettilöydöstä poptähdeksi" },
    ],
  },
  {
    number: "05",
    title: "Rap & hiphop",
    accent: "#4DD4FF",
    quizzes: [
      { slug: "kanye-west-visa-tunnetko-uudistajan", hook: "Egot, tuotannot ja klassikkolevyt" },
      { slug: "travis-scott-visa-tunnetko-rap-tahden", hook: "Astroworldin arkkitehti" },
      { slug: "kendrick-lamar-visa-tunnetko-rap-tahden", hook: "Comptonin tarinankertoja" },
      { slug: "future-visa-tunnetko-trapin-tahden", hook: "Atlantan trap-pioneeri" },
      { slug: "juice-wrld-visa-tunnetko-tahden", hook: "999 ja sukupolven tunnelmat" },
      { slug: "eminem-visa-tunnetko-rap-legendan", hook: "Detroitin nopein suu" },
      { slug: "post-malone-visa-tunnetko-tahden", hook: "Genrerajat rikkova hittikone" },
      { slug: "drake-visa-tunnetko-hiphoptahden", hook: "Toronton kuudennen kaupungin kingi" },
    ],
  },
  {
    number: "06",
    title: "Maailman musiikki-ilmiöt",
    accent: "#B6FF3C",
    quizzes: [
      { slug: "abba-tietovisa", hook: "Waterloosta ikuisiksi klassikoiksi" },
      { slug: "bob-marley-reggaen-legenda", hook: "Reggaen sanansaattaja" },
      { slug: "j-balvin-visa-tunnetko-reggaetontahden", hook: "Reggaetónin värikkäin nimi" },
      { slug: "bad-bunny-visa-tunnetko-latinotahden", hook: "Puerto Ricon globaali ilmiö" },
      { slug: "bts-visa-tunnetko-kpop-ilmion", hook: "Seitsemän jäsentä, miljoonat fanit" },
    ],
  },
];
