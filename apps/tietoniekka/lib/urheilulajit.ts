// TIETONIEKKA 2.0 — URHEILUN TEEMASIVUN lohkomalli (CD "TN Urheilu
// -teemasivu" 26.8.2026, design_handoff_urheilu_teemasivu/README.md).
// Sivu on urheilun "muut lajit" -kokoelma: jääkiekolla ja jalkapallolla on
// omat teemasivut — tänne vain porttikortit, EI niiden visoja (README:n
// kielto). README:n tärkein vaatimus on LAAJENNETTAVUUS: uusi lohko tai visa
// lisätään TÄHÄN tiedostoon (ei sivukoodiin) — kirjain ("Lohko F"), tausta
// (parillinen tumma), kicker-väri (viimeinen oranssi) ja visamäärät ovat
// järjestyksen funktioita jotka sivu johtaa itse. Ei lohkokohtaista
// erikoiskoodia: Lohko A:n pääkortti on layout: "lead", ei F1-erikoisuus.
// card_ratio on rajattu enum; uuden lohkon suhde valitaan niin että se EROAA
// naapureistaan (toimituksellinen rytmisääntö, README §Laajennettavuus).
// Kaikki tekstit ovat CD:n designcopya — tarkistetaan copy/SEO-passissa.

export const ulImg = (id: string) => `/20/urheilulajit/${id}.webp`;

export type UlRatio = "21/9" | "16/9" | "16/10" | "4/5";

export type UlVisa = {
  quizSlug: string;
  tag: string;
  /** Lyhennetty kortin otsikko — visan virallinen nimi on kannassa */
  title: string;
  /** Kortin alaotsikko, 1 lause */
  sub: string;
  img: string;
  pos: string;
  color: string;
};

export type UlLohko = {
  /** Ankkuri (#f1) — ei koskaan kirjain, se johdetaan järjestyksestä */
  slug: string;
  title: string;
  /** Lohkovalinta-nauhan lyhyempi nimi (README: esim. "Historia") */
  navTitle: string;
  intro: string;
  /** "lead" = ensimmäinen visa nousee leveäksi 21/9-pääkortiksi */
  layout: "lead" | "grid";
  ratio: UlRatio;
  gridMin: number;
  visat: UlVisa[];
};

export const UL_HERO = {
  img: ulImg("ralli-jyvaskyla2"),
  titleLines: ["Kaasua, mailoja", "ja mitaleita"] as const,
  introLines: [
    "Formula 1, ralli, golf, tennis ja urheiluhistoria — viisi lohkoa, joissa",
    "testataan sekä kuningasluokan tieto että suomalaisten suuret hetket.",
  ] as const,
  // README: heron lime-pilleri ("N visaa · viisi lohkoa") poistettiin
  // tarkoituksella — EI palauteta, visamäärä ei kuulu heroon.
};

export const UL_LOHKOT: UlLohko[] = [
  {
    slug: "f1", title: "Formula 1", navTitle: "Formula 1",
    intro: "Autourheilun kuningasluokka: maailmanmestarit, tallit ja se pieni maa, joka tuotti kolme mestaria.",
    layout: "lead", ratio: "16/10", gridMin: 300,
    visat: [
      { quizSlug: "formula-1-tiedatko-f1n-perusteet", tag: "Kuningasluokka", title: "Formula 1", sub: "Onko autourheilun kuningasluokan tieto hallussa? Mestarit, tallit ja radat.", img: ulImg("f1-kaikki"), pos: "center 46%", color: "#EF0107" },
      { quizSlug: "formula1-suuri-tietovisa", tag: "Megavisa", title: "Kaasu pohjaan", sub: "Suuri Formula 1 -tietovisa: pisimmät sarjat, kovimmat kaudet.", img: ulImg("f1-kaasu"), pos: "center 50%", color: "#E8A320" },
      { quizSlug: "formula1-suomalaiset", tag: "Suomi", title: "Lentävät suomalaiset", sub: "Suomi Formula 1:ssä — kolme mestaria ja pieni maa isolla varjolla.", img: ulImg("f1-suomi"), pos: "center 38%", color: "#4FD1F5" },
    ],
  },
  {
    slug: "ralli", title: "Ralli", navTitle: "Ralli",
    intro: "Sorateiden MM-sarja, Jyväskylän hyppyrit ja sukupolvi toisensa jälkeen suomalaisia maailmanmestareita.",
    layout: "grid", ratio: "4/5", gridMin: 250,
    visat: [
      { quizSlug: "rallin-mm-sarja-historia-huippuhetket-visa", tag: "MM-sarja", title: "Rallin MM-sarja", sub: "Sarjan kovin tietovisa: kaudet, autot ja ratkaisuhetket.", img: ulImg("ralli-mm"), pos: "center 35%", color: "#B6FF3C" },
      { quizSlug: "suomalaiset-rallin-mm-sarjassa-visa", tag: "Suomi", title: "Lentävät suomalaiset", sub: "Rallin MM-legendat testissä — Suomen pitkä voittoputki.", img: ulImg("ralli-suomi"), pos: "center 30%", color: "#4FD1F5" },
      { quizSlug: "suomen-mm-ralli-jyvaskyla", tag: "Suomen MM-ralli", title: "Jyväskylän MM-ralli", sub: "Kuinka hyvin tunnet sorateiden nopeimman osakilpailun?", img: ulImg("ralli-jyvaskyla"), pos: "center 30%", color: "#F5C518" },
    ],
  },
  {
    slug: "golf", title: "Golf", navTitle: "Golf",
    intro: "Kaksi suurta kiertuetta, lajin vanhin major ja suomalaiset, jotka pärjäsivät maailman kovimmilla kentillä.",
    layout: "grid", ratio: "16/10", gridMin: 270,
    visat: [
      { quizSlug: "pga-tour-tietovisa", tag: "PGA Tour", title: "PGA Tour", sub: "Amerikan kiertue: kaudet, kentät ja rahalistan kärki.", img: ulImg("golf-pga"), pos: "center 40%", color: "#35D6A0" },
      { quizSlug: "dp-world-tour-euroopan-golfkiertue-visa", tag: "DP World Tour", title: "DP World Tour", sub: "Euroopan golfkiertue Ryder Cupin varjossa ja valossa.", img: ulImg("golf-dpworld"), pos: "center 45%", color: "#B6FF3C" },
      { quizSlug: "the-open-golfin-vanhin-major", tag: "Major", title: "The Open", sub: "Golfin vanhin majorturnaus — linkkikentät, tuuli ja Claret Jug.", img: ulImg("golf-open"), pos: "center 45%", color: "#E8A320" },
      { quizSlug: "suomalaiset-golfin-ammattilaiskiertueilla-visa", tag: "Suomi", title: "Sinivalkoiset viheriöillä", sub: "Suomalaisgolfin kovin tietovisa — majorit ja läpimurrot.", img: ulImg("golf-suomi"), pos: "center 40%", color: "#4FD1F5" },
    ],
  },
  {
    slug: "tennis", title: "Tennis", navTitle: "Tennis",
    intro: "Legenda, major, kiertue ja Suomi. Neljä näkökulmaa lajiin, jossa ratkaisu tulee aina yhdellä pallolla.",
    layout: "grid", ratio: "4/5", gridMin: 240,
    visat: [
      { quizSlug: "atp-tour-historia-huippuhetket-visa", tag: "ATP", title: "Syöttöä ja breikkejä", sub: "ATP-kiertueen kovin tietovisa: rankingit ja ennätykset.", img: ulImg("tennis-atp"), pos: "center 30%", color: "#F5C518" },
      { quizSlug: "us-open-tennis-visa", tag: "Major", title: "US Open", sub: "Miten hyvin tunnet New Yorkin kovaäänisimmän majorin?", img: ulImg("tennis-usopen"), pos: "center 35%", color: "#3C6FF5" },
      { quizSlug: "suomalaiset-atp-wta-kiertueilla-visa", tag: "Suomi", title: "Kentän valloittajat", sub: "Suomen tennistähdet testissä — Davis Cupista maailmalle.", img: ulImg("tennis-suomi"), pos: "center 32%", color: "#4FD1F5" },
      { quizSlug: "roger-federer-tennislegenda", tag: "Legenda", title: "Roger Federer", sub: "Tennislegenda testissä: majorit, tyyli ja ennätykset.", img: ulImg("tennis-federer"), pos: "center 32%", color: "#E8A320" },
    ],
  },
  {
    slug: "historia", title: "Urheiluhistoria", navTitle: "Historia",
    intro: "Paikat, joissa suomalainen urheilu tapahtui — betonia, katsomoita ja katuja, jotka muistetaan vuosikymmeniä.",
    layout: "grid", ratio: "16/9", gridMin: 340,
    visat: [
      { quizSlug: "helsingin-olympiastadion", tag: "Stadion", title: "Helsingin olympiastadion", sub: "Onko stadikan historia hallussasi? Kesä 1952 ja kaikki sen jälkeen.", img: ulImg("historia-olympiastadion"), pos: "center 40%", color: "#E8A320" },
      { quizSlug: "elaintarhan-ajot", tag: "Katuratojen aika", title: "Eläintarhan ajot", sub: "Kaasua, mutkia ja historiaa Helsingin puistokaduilla.", img: ulImg("historia-elaintarha"), pos: "center 50%", color: "#EF0107" },
    ],
  },
];

/** Omat teemasivut -porttikortit (README: portteja, EI visalistoja —
    eivät koskaan avaudu paikan päällä eivätkä näytä yksittäisiä visoja). */
export const UL_GATES = [
  { title: "Jääkiekko", desc: "Liigajoukkueet, Leijonat ja suomalaiset NHL:ssä. Kokonainen teemasivu omalla rakenteellaan.", href: "/kokoelma/jaakiekko", img: ulImg("gate-hockey"), pos: "center 40%", color: "#4FD1F5" },
  { title: "Jalkapallo", desc: "Valioliiga, Euroopan suurseurat ja Mestarien liiga. Yli 40 visaa omalla teemasivullaan.", href: "/kokoelma/jalkapallo", img: ulImg("gate-football"), pos: "center 38%", color: "#B6FF3C" },
] as const;

/** Johdetut arvot (README §Laajennettavuus — ei koskaan kovakoodata):
    kirjain, tausta ja kicker-väri ovat lohkon PAIKAN funktioita. */
export const ulKicker = (index: number) => `Lohko ${"ABCDEFGHIJ"[index] ?? "?"}`;
export const ulDark = (index: number) => index % 2 === 1;
export const ulKickerColor = (index: number, count: number) =>
  index === count - 1 ? "#E8A320" : "#B6FF3C";

/** Päivän visa -kortin kuvahaku (etusivu): lajivisan quiz-slug → kuva. */
const QUIZ_IMG = new Map<string, string>(
  UL_LOHKOT.flatMap((l) => l.visat.map((v) => [v.quizSlug, v.img] as const)),
);

export function urheilulajitQuizImg(slug: string | null | undefined): string | null {
  return slug ? QUIZ_IMG.get(slug) ?? null : null;
}
