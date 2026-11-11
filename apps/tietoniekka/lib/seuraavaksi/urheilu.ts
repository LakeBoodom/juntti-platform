// "PELAA SEURAAVAKSI" -PILOTTI: URHEILUN LAJIT JA AIHEET (toteutusbrief 8.11.2026 §1.1, Heikin rajaus 9.11.: kaikki urheilu).
// Väliaikainen avainsanatunnistus, kunnes tietomallin henkilö- ja seuratiedot korvaavat sen (säännöt §3).
//
// Laji: henkilövisalla celebrities.laji, muilla quizzes.category/genre, ja jos ne puuttuvat (55 urheiluvisaa ilman genreä),
// nimen tunnistesanoista. Aihe = tarkennus lajin sisällä: seura, NHL, Leijonat, Valioliiga … Visa kuuluu aiheeseen, jos
// sen nimessä on aiheen sana tai sen subcollection on aiheen alaryhmä (jääkiekon nhl/arvokisat, jalkapallon valioliiga …).
// laaja = koko sarjan aihe (SM-liiga, Valioliiga): käytetään vasta seuran, NHL:n tai Leijonien kaltaisten tarkkojen aiheiden
// ja saman kaupungin jälkeen, jottei yksi sarjasana nosta kaikkia sarjan 27 visaa samalle portaalle.

export type Aihe = { avain: string; re: RegExp; sub?: string[]; laaja?: boolean };
export type Laji = {
  avain: string;
  nimi: string;
  /** Tulosnäkymän lajilinkki ("Jääkiekko →"). */
  hub: { href: string; teksti: string };
  /** Nimen tunnistesanat lajille, kun visalla ei ole category/genre-tietoa. */
  tunniste?: RegExp;
  aiheet: Aihe[];
};

const URHEILU_HUB = { href: "/kokoelma/urheilu", teksti: "Urheilu" };
const seura = (avain: string, re: RegExp): Aihe => ({ avain, re });

export const LAJIT: Laji[] = [
  {
    avain: "jaakiekko",
    nimi: "Jääkiekko",
    hub: { href: "/kokoelma/jaakiekko", teksti: "Jääkiekko" },
    tunniste: /jääkiek|NHL|Leijon|Stanley Cup/i,
    aiheet: [
      { avain: "NHL", re: /NHL|Stanley/i, sub: ["nhl"] },
      { avain: "Leijonat", re: /Leijon|maailmanmestar|olympiavoitt|olympiakult|MM-kult/i, sub: ["arvokisat"] },
      seura("Tappara", /Tappara/i),
      seura("Ilves", /Ilve[sk]/i),
      seura("HIFK", /HIFK|Helsingin IFK/i),
      seura("Jokerit", /Jokeri/i),
      seura("Kärpät", /Kärp/i),
      seura("TPS", /\bTPS\b|Turun Palloseura/i),
      seura("Lukko", /Lukko/i),
      seura("Ässät", /Äss[äi]/i),
      seura("KalPa", /KalPa/i),
      seura("JYP", /\bJYP\b/i),
      seura("Pelicans", /Pelicans/i),
      seura("HPK", /\bHPK\b/i),
      seura("SaiPa", /SaiPa/i),
      seura("Sport", /Vaasan Sport|\bSport\b/),
      seura("KooKoo", /KooKoo/i),
      seura("Jukurit", /Jukuri/i),
      seura("Kiekko-Espoo", /Kiekko-Espoo|Blues/i),
      seura("Ketterä", /Ketterä/i),
      seura("Kiekko-Vantaa", /Kiekko-Vantaa/i),
      seura("RoKi", /RoKi/),
      seura("TUTO", /TUTO/),
      { avain: "SM-liiga", re: /SM-liig|\bLiiga/i, sub: ["liiga"], laaja: true },
      { avain: "Mestis", re: /Mestis/i, sub: ["mestis"], laaja: true },
    ],
  },
  {
    avain: "jalkapallo",
    nimi: "Jalkapallo",
    hub: { href: "/kokoelma/jalkapallo", teksti: "Jalkapallo" },
    tunniste: /jalkapallo|Valioliig|Mestarien liig|eurokent|AC Milan|Ajax|Atlético|Leverkusen|Bayern|Benfica|Dortmund|Celtic|Barcelona|Inter Milan|Juventus|Napoli|Marseille|Paris Saint|Real Madrid|\bHJK\b|Huuhkaj/i,
    aiheet: [
      { avain: "Huuhkajat", re: /Huuhkaj|Suomen miesten jalkapallomaajoukkue|maajoukkuekapteeni|EM-kisojen/i },
      seura("Liverpool", /Liverpool|Anfield/i),
      seura("Manchester United", /Manchester United/i),
      seura("Manchester City", /Manchester City/i),
      seura("Arsenal", /Arsenal/i),
      seura("Chelsea", /Chelsea/i),
      seura("Tottenham", /Tottenham/i),
      seura("Newcastle", /Newcastle/i),
      seura("Real Madrid", /Real Madrid/i),
      seura("Barcelona", /Barcelona/i),
      seura("Bayern", /Bayern/i),
      seura("Juventus", /Juventus/i),
      seura("Ajax", /Ajax/i),
      seura("HJK", /\bHJK\b/),
      seura("AC Milan", /AC Milan/i),
      seura("Inter", /Inter Milan|\bInter\b/),
      seura("Dortmund", /Dortmund/i),
      seura("PSG", /Paris Saint|\bPSG\b/),
      { avain: "MM-kisat", re: /MM-kisat|maailmanmestaruu/i, sub: ["arvokisat"] },
      { avain: "Valioliiga", re: /Valioliig/i, sub: ["valioliiga"], laaja: true },
      { avain: "Mestarien liiga", re: /Mestarien liig|eurokent/i, laaja: true },
      { avain: "Maajoukkueet", re: /maajoukkue/i, sub: ["maajoukkueet"], laaja: true },
    ],
  },
  {
    avain: "moottoriurheilu",
    nimi: "Moottoriurheilu",
    hub: URHEILU_HUB,
    tunniste: /Formula|\bF1\b|ralli|Eläintarhan ajot/i,
    aiheet: [
      { avain: "F1", re: /Formula|\bF1/i, sub: ["formula-1"] },
      { avain: "Ralli", re: /ralli/i, sub: ["ralli"] },
    ],
  },
  {
    avain: "koripallo",
    nimi: "Koripallo",
    hub: URHEILU_HUB,
    tunniste: /koripallo|Korisliig|Susijeng|\bNBA\b|Kataja|Tiikerit|KTP-Basket|Kouvot|Vilpas|Honka/i,
    aiheet: [
      { avain: "NBA", re: /\bNBA\b/ },
      { avain: "Susijengi", re: /Susijeng/i },
      { avain: "Korisliiga", re: /Korisliig|Kataja|Tiikerit|KTP-Basket|Kouvot|Vilpas|Honka/i, laaja: true },
    ],
  },
  { avain: "salibandy", nimi: "Salibandy", hub: URHEILU_HUB, tunniste: /salibandy|F-liiga|Tampereen Classic|Seinäjoen SPV/i, aiheet: [] },
  { avain: "lentopallo", nimi: "Lentopallo", hub: URHEILU_HUB, tunniste: /lentopallo|Mestaruusliiga/i, aiheet: [] },
  { avain: "kasipallo", nimi: "Käsipallo", hub: URHEILU_HUB, tunniste: /käsipallo/i, aiheet: [] },
  { avain: "jaapallo", nimi: "Jääpallo", hub: URHEILU_HUB, tunniste: /jääpallo|Akilles/i, aiheet: [] },
  {
    avain: "tennis",
    nimi: "Tennis",
    hub: URHEILU_HUB,
    tunniste: /tennis|\bATP\b|\bWTA\b|Wimbledon|US Open|Grand Slam|Federer/i,
    aiheet: [{ avain: "Grand Slam", re: /Wimbledon|US Open|Grand Slam/i, sub: ["grand-slam"] }],
  },
  { avain: "golf", nimi: "Golf", hub: URHEILU_HUB, tunniste: /golf|\bPGA\b|DP World|The Open/i, aiheet: [{ avain: "Major", re: /The Open|major/i, sub: ["major"] }] },
  /* Vain henkilövisoja (celebrities.laji): ei omia visoja, joten portaat jatkuvat lajin henkilöistä urheiluun. */
  { avain: "talviurheilu", nimi: "Talviurheilu", hub: URHEILU_HUB, aiheet: [{ avain: "Hiihto", re: /hiiht/i }, { avain: "Mäkihyppy", re: /mäkihyp/i }, { avain: "Taitoluistelu", re: /taitoluist/i }] },
  { avain: "yleisurheilu", nimi: "Yleisurheilu", hub: URHEILU_HUB, aiheet: [] },
  { avain: "kamppailulajit", nimi: "Kamppailulajit", hub: URHEILU_HUB, aiheet: [] },
  { avain: "muu-urheilu", nimi: "Urheilu", hub: URHEILU_HUB, aiheet: [] },
];

/** Henkilöiden lajit (celebrities.laji), jotka kuuluvat urheilupilottiin. */
export const URHEILULAJIT = new Set(["jaakiekko", "jalkapallo", "moottoriurheilu", "talviurheilu", "koripallo", "tennis", "yleisurheilu", "golf", "kamppailulajit", "muu-urheilu"]);

export const YLEINEN: Laji = { avain: "urheilu", nimi: "Urheilu", hub: URHEILU_HUB, aiheet: [] };
const LAJI = new Map(LAJIT.map((l) => [l.avain, l]));
export const lajiAvaimella = (avain: string) => LAJI.get(avain) ?? YLEINEN;

/** Tunnistusjärjestys nimen perusteella: tarkat lajit ennen laajoja ("Turun Palloseura" on jo categoryllä jääkiekko). */
const TUNNISTUS = ["jalkapallo", "koripallo", "salibandy", "lentopallo", "kasipallo", "jaapallo", "moottoriurheilu", "tennis", "golf", "jaakiekko"];

export type LajiLahde = { title: string; display_title?: string | null; category?: string | null; genre?: string | null; henkilonLaji?: string | null };

export function visanLaji(v: LajiLahde): Laji {
  if (v.henkilonLaji) return lajiAvaimella(v.henkilonLaji);
  if (v.category === "jaakiekko" || v.genre === "jaakiekko") return lajiAvaimella("jaakiekko");
  if (v.genre && LAJI.has(v.genre)) return lajiAvaimella(v.genre);
  const nimi = nimiteksti(v);
  for (const avain of TUNNISTUS) if (LAJI.get(avain)!.tunniste?.test(nimi)) return lajiAvaimella(avain);
  return YLEINEN;
}

/** Nimi ja näyttönimi yhdessä: henkilövisoissa seura ja sarja ovat usein vain toisessa
 *  ("Patrik Laine – Tapparasta NHL:n maalintekijäksi" vs. "Patrik Laine – kovan laukauksen hyökkääjä"). */
export const nimiteksti = (v: { title: string; display_title?: string | null }) => `${v.title} ${v.display_title ?? ""}`;

/** Visan aiheet lajin sisällä. */
export function visanAiheet(laji: Laji, v: { title: string; display_title?: string | null; subcollection?: string | null }): Aihe[] {
  const t = nimiteksti(v);
  return laji.aiheet.filter((a) => a.re.test(t) || (!!v.subcollection && !!a.sub?.includes(v.subcollection)));
}
