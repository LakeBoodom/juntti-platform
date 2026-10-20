// SUOMEN KAUPUNGIT — kaupunkien data ja kuvat (CD "TN Suomen kaupungit -teemasivu" 27.8.2026). Kokoelmasivu on
// rungolla 20.10.2026 alkaen (lib/kokoelmat/kaupungit.ts): kartta ja matkapassin pelilauta poistuivat (brief §3),
// alueet ovat osioita. px/py-kartta-arvot jäävät dataan, mutta niitä ei enää piirretä. GameClient kirjoittaa yhä
// leimat (tn_kaupunkileimat), vaikka sivu ei niitä näytä — metapelin eteneminen korvaa ne V2:ssa.
// quizSlug-arvot varmistettu Supabasesta 28.8.2026.

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
  /** Kuvan rajaus (object-position), jos kohde ei ole keskellä. Oletus CSS:ssä "center 32%" (11.10.2026). */
  kuvaPos?: string;
};

export const KAUPUNGIT: Kaupunki[] = [
  { id: "helsinki", name: "Helsinki", slogan: "Suuri Helsinki -tietovisa", region: "Pääkaupunkiseutu", px: 42.6, py: 96.6, quizSlug: "helsinki-stadin-kovat-pahkinat" },
  { id: "espoo", name: "Espoo", slogan: "Viiden keskustan kaupunki", region: "Pääkaupunkiseutu", px: 38.4, py: 96.3, quizSlug: "espoo-viiden-keskustan-kaupunki" },
  { id: "vantaa", name: "Vantaa", slogan: "Kehä kolmosen kuningaskunta", region: "Pääkaupunkiseutu", px: 45.6, py: 93.3, quizSlug: "vantaa-kehakolmosen-kuningaskunta", kuvaPos: "80% 32%" },
  { id: "porvoo", name: "Porvoo", slogan: "Vanhan kaupungin kujilla", region: "Etelä-Suomi", px: 49.8, py: 94.6, quizSlug: "porvoo-punaiset-aitat-historia-visa" },
  { id: "lahti", name: "Lahti", slogan: "Suomen Chicagon salaisuudet", region: "Etelä-Suomi", px: 47.3, py: 89.6, quizSlug: "lahti-suomen-chicagon-salaisuudet" },
  { id: "hameenlinna", name: "Hämeenlinna", slogan: "Hämptonin harmaakivi ja Aulangon salat", region: "Etelä-Suomi", px: 39.4, py: 89.5, quizSlug: "hameenlinna-harmaakivi-aulanko-visa" },
  { id: "kouvola", name: "Kouvola", slogan: "Aktiivisten kaupunki", region: "Etelä-Suomi", px: 54.1, py: 90.5, quizSlug: "kouvola-visa-raiteiden-risteyksessa" },
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
  { id: "rovaniemi", name: "Rovaniemi", slogan: "Napapiirin pintaa syvemmältä", region: "Pohjois-Suomi", px: 47.7, py: 40.4, quizSlug: "napapiirin-pintaa-syvemmalta-tentti", kuvaPos: "66% 32%" },
];

export const kaupunkiImg = (id: string) => `/20/kaupungit/${id}.webp`;
export const KAUPUNGIT_HERO_IMG = "/20/kaupungit/hero-laura-mikko.webp";

/** Kokoelmasivun (runko) korttikuva ja rajaus visan slugista: 800 px kopio (public/20/kaupungit/k/, 20.10.2026). */
const KAUPUNKI_SLUGISTA = new Map(KAUPUNGIT.map((k) => [k.quizSlug, k]));
export const kaupunkiKorttikuva = (slug: string) => {
  const k = KAUPUNKI_SLUGISTA.get(slug);
  return k ? `/20/kaupungit/k/${k.id}.webp` : null;
};
export const kaupunkiKorttiPos = (slug: string) => KAUPUNKI_SLUGISTA.get(slug)?.kuvaPos ?? "center 32%";
