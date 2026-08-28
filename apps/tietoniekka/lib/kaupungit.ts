// SUOMEN KAUPUNGIT — teemasivun data (CD "TN Suomen kaupungit -teemasivu"
// 27.8.2026, design_handoff_suomen_kaupungit/README.md). Kymmenes teemasivu;
// idea on matkapassi: käyttäjä valitsee kaupungin Suomen kartalta (tai
// ruudukosta), pelaa sen visan ja ansaitsee leiman.
//
// - Kartan koordinaatit (px/py) ja Suomen SVG-path ovat design-arvoja,
//   käsin asemoitu prototyypin SVG-Suomen päälle — säilytetty sellaisenaan
//   (README: "EI pyöristetä eikä lasketa uudelleen").
// - quizSlug-arvot löydetty ja varmistettu Supabasesta 28.8.2026 (Heikki
//   toimitti kaupunki→otsikko-mäppäyksen chattiin, koska visojen slugit
//   eivät vastaa README:n design-id:tä). Kaikki 20 julkaistu (aiemmin
//   draft, 10 kysymystä/visa — README oletti 20, todellisuus on 10).
// - Leima ansaitaan PELAAMALLA visa loppuun, ei tuloksesta riippuen
//   (Heikin päätös 28.8.2026). Ei kirjautumista — leimat localStoragessa
//   (sama periaate kuin Putki), avain "tn_kaupunkileimat" (ks. GameClient.tsx
//   stampCity()). Kirjautumaton käyttäjä näkee siis aina oman selaimensa
//   leimatilanteen, ei synkkaa laitteiden välillä (README:n avoin kysymys
//   #2 ratkaistu näin — designattu tila ei ollut valmis).

export type KaupunkiSuunta =
  | "Pääkaupunkiseutu"
  | "Etelä-Suomi"
  | "Lounais-Suomi"
  | "Länsi-Suomi"
  | "Itä-Suomi"
  | "Pohjois-Suomi";

export type Kaupunki = {
  /** Design-id — käytetään myös kuvatiedoston nimenä (public/20/kaupungit/{id}.webp). */
  id: string;
  name: string;
  slogan: string;
  region: KaupunkiSuunta;
  /** Kartan sijainti prosentteina (aspect-ratio 600/1000). Design-arvo, ei lasketa uudelleen. */
  px: number;
  py: number;
  /** Visan slug quizzes/quiz_cards-taulussa (varmistettu Supabasesta 28.8.2026). */
  quizSlug: string;
};

export const KAUPUNGIT: Kaupunki[] = [
  { id: "helsinki", name: "Helsinki", slogan: "Suuri Helsinki -tietovisa", region: "Pääkaupunkiseutu", px: 42.6, py: 96.6, quizSlug: "helsinki-stadin-kovat-pahkinat" },
  { id: "espoo", name: "Espoo", slogan: "Viiden keskustan kaupunki", region: "Pääkaupunkiseutu", px: 38.4, py: 96.3, quizSlug: "espoo-viiden-keskustan-kaupunki" },
  { id: "vantaa", name: "Vantaa", slogan: "Kehä kolmosen kuningaskunta", region: "Pääkaupunkiseutu", px: 45.6, py: 93.3, quizSlug: "vantaa-kehakolmosen-kuningaskunta" },
  { id: "porvoo", name: "Porvoo", slogan: "Vanhan kaupungin kujilla", region: "Etelä-Suomi", px: 49.8, py: 94.6, quizSlug: "porvoo-punaiset-aitat-historia-visa" },
  { id: "lahti", name: "Lahti", slogan: "Suomen Chicagon salaisuudet", region: "Etelä-Suomi", px: 47.3, py: 89.6, quizSlug: "lahti-suomen-chicagon-salaisuudet" },
  { id: "hameenlinna", name: "Hämeenlinna", slogan: "Hämptonin harmaakivi ja Aulangon salat", region: "Etelä-Suomi", px: 39.4, py: 89.5, quizSlug: "hameenlinna-harmaakivi-aulanko-visa" },
  { id: "kouvola", name: "Kouvola", slogan: "Kouvostoliittoon", region: "Etelä-Suomi", px: 54.1, py: 90.5, quizSlug: "kouvola-visa-tervetuloa-kouvostoliittoon" },
  { id: "lappeenranta", name: "Lappeenranta", slogan: "Rajakaupungin salat", region: "Etelä-Suomi", px: 63.8, py: 89.0, quizSlug: "lappeenranta-rajakaupungin-salat" },
  { id: "turku", name: "Turku", slogan: "Aurajoen arvoitukset", region: "Lounais-Suomi", px: 25.1, py: 93.8, quizSlug: "aurajoen-arvoitukset-turku-visa" },
  { id: "salo", name: "Salo", slogan: "Signaalien kaupunki", region: "Lounais-Suomi", px: 30.7, py: 94.4, quizSlug: "kannykkakaupungin-arvoitukset-salo" },
  { id: "pori", name: "Pori", slogan: "Jazzia, dyynejä ja karhun katse", region: "Lounais-Suomi", px: 22.0, py: 85.5, quizSlug: "pori-jazzia-dyyneja-karhun-katse" },
  { id: "tampere", name: "Tampere", slogan: "Manserock ja Manse", region: "Länsi-Suomi", px: 34.8, py: 85.4, quizSlug: "tampere-visa-savupiippujen-kaupunki" },
  { id: "jyvaskyla", name: "Jyväskylä", slogan: "Suomen Ateena", region: "Länsi-Suomi", px: 47.8, py: 79.2, quizSlug: "suomen-ateena-jyvaskyla-tietovisa" },
  { id: "seinajoki", name: "Seinäjoki", slogan: "Avaruuden pääkaupungin arvoitukset", region: "Länsi-Suomi", px: 28.8, py: 74.5, quizSlug: "seinajoki-avaruuden-paakaupungin-arvoitukset" },
  { id: "vaasa", name: "Vaasa", slogan: "Lyhteen kaupunki", region: "Länsi-Suomi", px: 20.8, py: 71.9, quizSlug: "vaasa-lyhteen-kaupunki-tietovisa" },
  { id: "mikkeli", name: "Mikkeli", slogan: "Päämajan kaupunki", region: "Itä-Suomi", px: 57.8, py: 83.8, quizSlug: "paamajakaupungin-arvoitukset-mikkeli" },
  { id: "kuopio", name: "Kuopio", slogan: "Viäntäen syvältä Savosta", region: "Itä-Suomi", px: 60.5, py: 73.6, quizSlug: "kuopio-viantaen-syvalta-savosta" },
  { id: "joensuu", name: "Joensuu", slogan: "Karjalan pääkaupunki", region: "Itä-Suomi", px: 74.1, py: 76.1, quizSlug: "jonssi-tentissa-joensuu-visa" },
  { id: "oulu", name: "Oulu", slogan: "Tervan tuoksua ja Merikosken kohinaa", region: "Pohjois-Suomi", px: 46.0, py: 54.7, quizSlug: "oulu-tervan-tuoksua-merikosken-kohinaa" },
  { id: "rovaniemi", name: "Rovaniemi", slogan: "Napapiirin pintaa syvemmältä", region: "Pohjois-Suomi", px: 47.7, py: 40.4, quizSlug: "napapiirin-pintaa-syvemmalta-tentti" },
];

export const KAUPUNKI_REGIONS: KaupunkiSuunta[] = [
  "Pääkaupunkiseutu", "Etelä-Suomi", "Lounais-Suomi", "Länsi-Suomi", "Itä-Suomi", "Pohjois-Suomi",
];

/** Maantieteellisesti järkevä kierrosreitti (README:n data, ei aakkosjärjestys) —
    ohjaa matkareitin piirtymisen ja "seuraava etappi" -laskennan. */
export const KAUPUNKI_REITTI: string[] = [
  "helsinki", "vantaa", "porvoo", "kouvola", "lappeenranta", "mikkeli", "kuopio",
  "joensuu", "jyvaskyla", "tampere", "hameenlinna", "lahti", "espoo", "salo",
  "turku", "pori", "seinajoki", "vaasa", "oulu", "rovaniemi",
];

export const kaupunkiImg = (id: string) => `/20/kaupungit/${id}.webp`;

export const KAUPUNGIT_HERO_IMG = "/20/kaupungit/hero-laura-mikko.webp";

/** Suomen SVG-path (viewBox 0 0 600 1000) — design-referenssistä VERBATIM, ei piirretä uudelleen. */
export const SUOMI_PATH =
  "M398.629,137.806L392.836,213.579L452.89,283.551L416.716,360.233L462.357,471.82L435.933,552.51L471.259,620.603L455.292,678.699L513.367,738.397L498.53,781.868L462.074,830.234L378.14,934.172L306.924,940.506L237.827,969.416L173.958,986L151.208,942.927L113.198,916.844L121.959,836.548L102.883,760.731L121.676,710.419L157.284,655.171L247.011,556.899L273.152,537.402L269.196,497.62L214.512,452.454L201.371,414.587L200.24,258.741L139.056,186.581L86.633,133.339L110.23,104.103L153.893,162.225L205.045,156.881L247.153,183.116L284.598,134.829L303.956,52.839L364.858,14L415.162,59.571Z";

/** Suomi-megavisa CTA-kohde: "kaikki-suomesta-mega" on jo olemassa Supabasessa
    (draft, kuten kaikki muutkin megat 26.8.2026 asti — Heikin päätös: ei
    julkaista ennen 2.0-launchia). Sama linkkitapa kuin megavisat-sivulla:
    pelattava suoralla slugilla RLS:n ansiosta vaikka status on draft. */
export const SUOMI_MEGA_SLUG = "kaikki-suomesta-mega";
