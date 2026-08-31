// TIETONIEKKA 2.0 — JALKAPALLO-TEEMASIVUN sisältökonfiguraatio
// (CD "TN Jalkapallo -teemasivu" 25.8.2026, design_handoff_jalkapallo_teemasivu).
// Yhdeksäs teemasivu. Kaikki tekstit (hookit, kuvaukset, otsikot) ovat CD:n
// designcopya README:n ja design_ref-datataulukoiden mukaan — tarkistetaan
// copy/SEO-passissa. Kausisidonnainen badge JP_KAUSI:ssa.
// Kuvat: public/20/jalkapallo/<id>.webp — puretttu CD:n handover-paketin
// web-optimoiduista kuvista (max 900px, hero 1600px, README §Assets).

export const JP_KAUSI = {
  /** Heron pillerin teksti — päivitetään kausittain. */
  badge: "Kausipaketti 2026–27",
};

export const jpImg = (id: string) => `/20/jalkapallo/${id}.webp`;

export const JP_HERO = {
  img: jpImg("pl-derby"),
  titleLines: ["Kaikki", "jalkapallosta"] as const,
  introLines: [
    "Valioliiga, Euroopan suurseurat ja Mestarien liigan ikuiset illat.",
    "Yli 40 visaa — seurasi historia, legendat ja suomalaiset eurokentillä.",
  ] as const,
};

/** Osiovalinta heron alareunassa (CD: Lohko A/B/C). */
export const JP_PARTS = [
  { kicker: "Lohko A", title: "Valioliiga", meta: "19 seuravisaa + yleisvisat", href: "#valioliiga", color: "#B6FF3C" },
  { kicker: "Lohko B", title: "Suurseurat", meta: "Espanja, Italia, Saksa, Ranska", href: "#suurseurat", color: "#B6FF3C" },
  { kicker: "Lohko C", title: "Mestarien liiga", meta: "Historia, finaalit, suomalaiset", href: "#mestarienliiga", color: "#E8A320" },
] as const;

export type JpClub = {
  id: string; quizSlug: string; name: string; short: string; city: string;
  founded: number; stadium: string; color: string; tier: string; hook: string;
};

/** Lohko A — Valioliiga ja Englannin futis (19 seuraa, CD:n CLUBS-taulukko).
    quizSlug-mäppäys Supabasesta 25.8.2026 (kaikki julkaistuja). */
export const JP_CLUBS: JpClub[] = [
  { id: "arsenal", quizSlug: "arsenal-fc-legendat", name: "Arsenal", short: "Arsenal", city: "Lontoo", founded: 1886, stadium: "Emirates Stadium", color: "#EF0107", tier: "Valioliiga", hook: "Highburyn marmorikäytäviltä Emiratesille — ja se kausi 2003–04, jolloin yhtäkään liigapeliä ei hävitty." },
  { id: "liverpool", quizSlug: "liverpool-fc-legendat", name: "Liverpool", short: "Liverpool", city: "Liverpool", founded: 1892, stadium: "Anfield", color: "#C8102E", tier: "Valioliiga", hook: "Anfieldin Kop, You’ll Never Walk Alone ja Istanbulin yö 2005. Kuinka tarkkaan muistat punaisen historian?" },
  { id: "mancity", quizSlug: "manchester-city-taivaansininen-imperiumi-visa", name: "Manchester City", short: "Man City", city: "Manchester", founded: 1880, stadium: "Etihad Stadium", color: "#6CABDD", tier: "Valioliiga", hook: "Maine Roadin vuosista Etihadin ylivaltaan. Sinitaivas peittää nykyään koko Manchesterin." },
  { id: "manutd", quizSlug: "manchester-united-seuravisa", name: "Manchester United", short: "Man Utd", city: "Manchester", founded: 1878, stadium: "Old Trafford", color: "#DA291C", tier: "Valioliiga", hook: "Old Trafford, Busby Babes ja Barcelonan 1999 lisäajan kaksi minuuttia, jotka muuttivat kaiken." },
  { id: "chelsea", quizSlug: "chelsea-fc-sinisten-syvin-arkisto-vaikea-visa", name: "Chelsea", short: "Chelsea", city: "Lontoo", founded: 1905, stadium: "Stamford Bridge", color: "#2C64C8", tier: "Valioliiga", hook: "Stamford Bridge, Münchenin 2012 rangaistuspotkut ja Euroopan vilkkain valmentajakaruselli." },
  { id: "tottenham", quizSlug: "tottenham-hotspur-uskaltaa-on-tehda-visa", name: "Tottenham", short: "Spurs", city: "Lontoo", founded: 1882, stadium: "Tottenham Hotspur Stadium", color: "#C9D2DC", tier: "Valioliiga", hook: "To Dare Is To Do: vuoden 1961 tupla, Wembleyn välivuodet ja Amsterdamin ihme 2019." },
  { id: "newcastle", quizSlug: "newcastle-united-legendat", name: "Newcastle", short: "Newcastle", city: "Newcastle", founded: 1892, stadium: "St James’ Park", color: "#DDDDDD", tier: "Valioliiga", hook: "St James’ Park kaupungin keskellä, Toon Army ja Keeganin hyökkäysfutis 90-luvulla." },
  { id: "astonvilla", quizSlug: "aston-villa-legendat", name: "Aston Villa", short: "Villa", city: "Birmingham", founded: 1874, stadium: "Villa Park", color: "#95BFE5", tier: "Valioliiga", hook: "Villa Park ja Rotterdamin yö 1982 — kerran Birminghamista tuli Euroopan mestari." },
  { id: "brighton", quizSlug: "brighton-hove-albion-lokkien-lento-visa", name: "Brighton", short: "Brighton", city: "Brighton", founded: 1901, stadium: "Amex Stadium", color: "#0057B8", tier: "Valioliiga", hook: "Lokit nousivat konkurssin partaalta liigan tyylitietoisimmaksi joukkueeksi." },
  { id: "bournemouth", quizSlug: "afc-bournemouth-kirsikoiden-visa", name: "Bournemouth", short: "Cherries", city: "Bournemouth", founded: 1899, stadium: "Vitality Stadium", color: "#DA291C", tier: "Valioliiga", hook: "Yksi liigan pienimmistä stadioneista ja yksi sen hurjimmista nousutarinoista." },
  { id: "brentford", quizSlug: "brentford-pieni-pesa-kova-surina", name: "Brentford", short: "Brentford", city: "Lontoo", founded: 1889, stadium: "Gtech Community Stadium", color: "#E30613", tier: "Valioliiga", hook: "Mehiläiset palasivat pääsarjaan 74 vuoden tauon jälkeen — datalla ja kurinalaisuudella." },
  { id: "palace", quizSlug: "crystal-palace-etela-lontoon-ylpeys-visa", name: "Crystal Palace", short: "Palace", city: "Lontoo", founded: 1905, stadium: "Selhurst Park", color: "#4A7BD8", tier: "Valioliiga", hook: "Selhurst Park, Holmesdalen rummut ja Lontoon äänekkäin kotikatsomo." },
  { id: "forest", quizSlug: "nottingham-forest-garibaldin-punainen-visa", name: "Nottingham Forest", short: "Forest", city: "Nottingham", founded: 1865, stadium: "City Ground", color: "#DD0000", tier: "Valioliiga", hook: "Brian Clough, City Ground ja kaksi peräkkäistä Euroopan cupia 1979 ja 1980." },
  { id: "fulham", quizSlug: "fulham-fc-mokin-mestarit-visa", name: "Fulham", short: "Fulham", city: "Lontoo", founded: 1879, stadium: "Craven Cottage", color: "#EDEDED", tier: "Valioliiga", hook: "Craven Cottage Thamesin rannalla — liigan viehättävin stadion ja sen mökki." },
  { id: "sunderland", quizSlug: "sunderland-afc-wearin-punavalkoiset-raidat-visa", name: "Sunderland", short: "Sunderland", city: "Sunderland", founded: 1879, stadium: "Stadium of Light", color: "#EB172B", tier: "Valioliiga", hook: "Stadium of Light, Wearsiden kaivosperintö ja ikuinen Tyne–Wear-derby." },
  { id: "leeds", quizSlug: "leeds-united-valkoinen-sota-visa", name: "Leeds United", short: "Leeds", city: "Leeds", founded: 1919, stadium: "Elland Road", color: "#FFCD00", tier: "Valioliiga", hook: "Elland Road, Marching on Together ja Revie-kauden pelätyin joukkue." },
  { id: "hull", quizSlug: "hull-city-meripihkan-ja-mustan-raidat-visa", name: "Hull City", short: "Hull", city: "Hull", founded: 1904, stadium: "MKM Stadium", color: "#F5A12D", tier: "Englannin futis", hook: "Tiikerit: mustakeltaiset raidat ja lyhyet mutta värikkäät pääsarjakaudet." },
  { id: "coventry", quizSlug: "coventry-city-pusb-visa", name: "Coventry City", short: "Coventry", city: "Coventry", founded: 1883, stadium: "Coventry Building Society Arena", color: "#8FC3F0", tier: "Englannin futis", hook: "Sky Blues ja vuoden 1987 FA Cup, josta Coventryssä ei lakata puhumasta." },
  { id: "ipswich", quizSlug: "ipswich-town-suffolkin-sinipaidat-visa", name: "Ipswich Town", short: "Ipswich", city: "Ipswich", founded: 1878, stadium: "Portman Road", color: "#2A6EBB", tier: "Englannin futis", hook: "Portman Road, Bobby Robson ja UEFA Cupin voitto 1981." },
];

export type JpEuroClub = {
  id: string; quizSlug: string; name: string; country: string;
  founded: number; stadium: string; color: string; hook: string;
};

/** Lohko B — Euroopan suurseurat (15, CD:n EURO-taulukko).
    Leverkusen on kannassa draft → renderöityy Tulossa-tilassa kunnes
    Heikki julkaisee sen. */
export const JP_EURO: JpEuroClub[] = [
  { id: "realmadrid", quizSlug: "euroopan-suurseurat-real-madrid", name: "Real Madrid", country: "Espanja", founded: 1902, stadium: "Santiago Bernabéu", color: "#E8A320", hook: "Los Blancos, Bernabéun valkoinen mytologia ja Euroopan cupin ennätysmäärä." },
  { id: "barcelona", quizSlug: "euroopan-suurseurat-barcelona", name: "FC Barcelona", country: "Espanja", founded: 1899, stadium: "Camp Nou", color: "#A50044", hook: "Més que un club: La Masia, tiki-taka ja Camp Noun mosaiikkikatsomo." },
  { id: "atletico", quizSlug: "euroopan-suurseurat-atletico-madrid", name: "Atlético Madrid", country: "Espanja", founded: 1903, stadium: "Metropolitano", color: "#CB3524", hook: "Colchoneros — Madridin toinen puoli ja Euroopan kurinalaisin kollektiivi." },
  { id: "milan", quizSlug: "euroopan-suurseurat-ac-milan", name: "AC Milan", country: "Italia", founded: 1899, stadium: "San Siro", color: "#FB090B", hook: "Rossoneri, San Siron portaat ja Sacchin sekä Capellon dynastiat." },
  { id: "inter", quizSlug: "euroopan-suurseurat-inter", name: "Inter", country: "Italia", founded: 1908, stadium: "San Siro", color: "#3C6FF5", hook: "Nerazzurri, Mourinhon 2010 kolmoisvoitto ja Milanon sinimusta puoli." },
  { id: "juventus", quizSlug: "euroopan-suurseurat-juventus", name: "Juventus", country: "Italia", founded: 1897, stadium: "Allianz Stadium", color: "#D5DCE2", hook: "Vanha rouva Torinosta: raidat, Scudettot ja Del Pieron vapaapotkut." },
  { id: "napoli", quizSlug: "euroopan-suurseurat-napoli", name: "Napoli", country: "Italia", founded: 1926, stadium: "Stadio Maradona", color: "#5BC0EB", hook: "Vesuviuksen varjossa — Maradonan perintö ja sinisen kaupungin hurmos." },
  { id: "bayern", quizSlug: "euroopan-suurseurat-bayern-munchen", name: "Bayern München", country: "Saksa", founded: 1900, stadium: "Allianz Arena", color: "#E2231A", hook: "Die Roten, Allianz Arenan punainen hehku ja Bundesliigan pysyvä valtakausi." },
  { id: "dortmund", quizSlug: "euroopan-suurseurat-borussia-dortmund", name: "Borussia Dortmund", country: "Saksa", founded: 1909, stadium: "Signal Iduna Park", color: "#FDE100", hook: "Keltainen seinä: Euroopan kovin kotiyleisö ja Ruhrin alueen sydän." },
  { id: "leverkusen", quizSlug: "euroopan-suurseurat-bayer-leverkusen", name: "Bayer Leverkusen", country: "Saksa", founded: 1904, stadium: "BayArena", color: "#E32221", hook: "Werkself ja kausi 2023–24, jolloin Bundesliiga voitettiin ilman ainuttakaan tappiota." },
  { id: "psg", quizSlug: "euroopan-suurseurat-psg", name: "Paris Saint-Germain", country: "Ranska", founded: 1970, stadium: "Parc des Princes", color: "#4D6FE0", hook: "Parc des Princes, Pariisin tähdet ja pitkä matka Euroopan kruunuun." },
  { id: "marseille", quizSlug: "euroopan-suurseurat-marseille", name: "Olympique Marseille", country: "Ranska", founded: 1899, stadium: "Stade Vélodrome", color: "#7FC3E8", hook: "Vélodromen kattamaton intohimo ja 1993 — Ranskan ainoa Mestarien liigan voitto." },
  { id: "ajax", quizSlug: "euroopan-suurseurat-ajax", name: "Ajax", country: "Muu Eurooppa", founded: 1900, stadium: "Johan Cruijff ArenA", color: "#D2122E", hook: "Johan Cruijff, totaalifutis ja maailman kuuluisin junioriakatemia." },
  { id: "celtic", quizSlug: "euroopan-suurseurat-celtic", name: "Celtic", country: "Muu Eurooppa", founded: 1887, stadium: "Celtic Park", color: "#35D6A0", hook: "Celtic Park, Lisbon Lions 1967 ja Glasgow’n vihreä puoli." },
  { id: "benfica", quizSlug: "euroopan-suurseurat-benfica", name: "Benfica", country: "Muu Eurooppa", founded: 1904, stadium: "Estádio da Luz", color: "#E8443A", hook: "Lissabonin kotkat, Eusébio ja Estádio da Luzin punainen meri." },
];

export const JP_FILTERS = ["Kaikki", "Espanja", "Italia", "Saksa", "Ranska", "Muu Eurooppa"] as const;

export type JpCard = {
  quizSlug: string; tag: string; title: string; desc: string;
  img: string; pos: string; color: string;
};

/** Pinnalla nyt (CD: showFeatured) — kolme visaa, kolme liigaa. */
export const JP_FEATURED = [
  { quizSlug: "arsenal-fc-legendat", league: "Valioliiga", title: "Arsenal", desc: "Invincibles, Wenger ja Tykkimiesten vuosikymmenet.", img: jpImg("arsenal"), pos: "center 45%", color: "#EF0107" },
  { quizSlug: "euroopan-suurseurat-bayern-munchen", league: "Bundesliiga", title: "Bayern München", desc: "Allianz Arena ja Saksan pysyvä mestari.", img: jpImg("bayern"), pos: "center 40%", color: "#E2231A" },
  { quizSlug: "euroopan-suurseurat-real-madrid", league: "La Liga", title: "Real Madrid", desc: "Bernabéu, valkoinen paita ja Euroopan ennätykset.", img: jpImg("realmadrid"), pos: "center 45%", color: "#E8A320" },
] as const;

/** Valioliigan yleisvisat (4, pystykortit 4/5). */
export const JP_PL_GENERAL: JpCard[] = [
  { quizSlug: "valioliigan-ennatysvisa-numerot-eivat-valehtele", tag: "Yleisvisa", title: "Kaikki Valioliigasta", desc: "Mestarit, ennätykset ja tilastot yli kolmen vuosikymmenen ajalta.", img: jpImg("pl-kaikki"), pos: "center 40%", color: "#E8A320" },
  { quizSlug: "valioliigan-derbyvisa-verivihollisten-kartasto-vaikea", tag: "Derbyt", title: "Suuri derbyvisa", desc: "North West, North London, Merseyside — Englannin kuumimmat paikallispelit.", img: jpImg("pl-derby"), pos: "center 35%", color: "#B6FF3C" },
  { quizSlug: "valioliigan-valmentajavisa-sivurintaman-nerot-vaikea", tag: "Penkin takana", title: "Legendaariset valmentajat", desc: "Ferguson, Wenger, Mourinho, Klopp. Kuka voitti mitä ja missä?", img: jpImg("pl-valmentajat"), pos: "center 30%", color: "#F5C518" },
  { quizSlug: "suomalaiset-valioliigassa-sisu-visa", tag: "Suomi", title: "Suomalaiset Valioliigassa", desc: "Hyypiä, Litmanen, Forss ja muut siniristin lähetit Englannissa.", img: jpImg("pl-suomalaiset"), pos: "center 40%", color: "#4FD1F5" },
];

/** Lohko C — Mestarien liiga (5). */
export const JP_CL: JpCard[] = [
  { quizSlug: "mestarien-liiga-historia", tag: "Historia", title: "Mestarien liigan historia", desc: "Synnystä nykypäivään: Euroopan cupista maailman katsotuimmaksi seurakilpailuksi.", img: jpImg("cl-historia"), pos: "center 40%", color: "#B6FF3C" },
  { quizSlug: "mestarien-liiga-legendaariset-finaalit", tag: "Finaalit", title: "Yön ihmeet", desc: "Mestarien liigan legendaariset finaalit — Istanbul, Lissabon, Wembley.", img: jpImg("cl-finaalit"), pos: "center 35%", color: "#E8A320" },
  { quizSlug: "mestarien-liiga-maalintekijat", tag: "Maalintekijät", title: "Verkko heilumaan", desc: "Mestarien liigan maalintekijät ja pistepörssien kärkinimet.", img: jpImg("cl-maalintekijat"), pos: "center 40%", color: "#F5C518" },
  { quizSlug: "mestarien-liiga-stadionit", tag: "Stadionit", title: "Euroopan pyhätöt", desc: "Mestarien liigan stadionit — tunnistatko areenan katsomon kaarteesta?", img: jpImg("cl-stadionit"), pos: "center 45%", color: "#4FD1F5" },
  { quizSlug: "mestarien-liiga-comebackit-yllatykset", tag: "Comebackit", title: "Comebackit ja yllätykset", desc: "Illat, joina kolmen maalin tappioasema ei riittänyt lopettamaan mitään.", img: jpImg("cl-comebackit"), pos: "center 40%", color: "#35D6A0" },
];

/** Suomalaiset eurokentillä (3, teksti kokonaan kuvan päällä). */
export const JP_FINNS: JpCard[] = [
  { quizSlug: "mestarien-liiga-suomalaiset", tag: "Mestarien liiga", title: "Sinivalkoiset Euroopan huipulla", desc: "Suomalaiset Mestarien liigassa: Litmanen, Hyypiä ja muut tunnelin läpi kulkeneet.", img: jpImg("cl-suomalaiset2"), pos: "center 40%", color: "#4FD1F5" },
  { quizSlug: "suomalaiset-euroopassa-historia", tag: "Seurat", title: "Suomalaisseurat eurokentillä", desc: "Karsintakierrosten sankarit ja ne illat, jolloin Suomi voitti Euroopassa.", img: jpImg("cl-eurokentat"), pos: "center 40%", color: "#B6FF3C" },
  { quizSlug: "suomalaiset-euroopassa-hjk", tag: "HJK", title: "HJK:n eurotarina", desc: "Kesä 1998 ja tie Mestarien liigan lohkovaiheeseen — Suomen ainoa.", img: jpImg("cl-hjk"), pos: "center 35%", color: "#3C6FF5" },
];

/** Päivän visa -kortin kuvahaku (etusivu): jalkapallovisan quiz-slug → kuva.
    Sama periaate kuin teemakohtaiset <teema>Img-funktiot, mutta avaimena on
    quiz-slug koska kuvatiedostot on nimetty design-id:n mukaan. */
const QUIZ_IMG = new Map<string, string>([
  ...JP_CLUBS.map((c) => [c.quizSlug, jpImg(c.id)] as const),
  ...JP_EURO.map((c) => [c.quizSlug, jpImg(c.id)] as const),
  ...[...JP_PL_GENERAL, ...JP_CL, ...JP_FINNS].map((c) => [c.quizSlug, c.img] as const),
]);

export function jalkapalloQuizImg(slug: string | null | undefined): string | null {
  return slug ? QUIZ_IMG.get(slug) ?? null : null;
}
