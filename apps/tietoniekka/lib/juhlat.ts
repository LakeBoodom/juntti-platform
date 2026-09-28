// JUHLAT-KOKOELMA — vuoden juhlat, niiden päivämäärät ja visat (CD "Juhlat-kokoelma" +
// "Juhlat-banneri v0.2", 28.9.2026). Sama lähde kokoelmasivulle (/kokoelma/juhlat) ja
// etusivun bannerille. Puhdas moduuli: ei kantaa, ei selainrajapintoja.
//
// Heikin linjaukset 28.9.2026:
//  - Nosto näyttää AINA lähimmän juhlan (designin 28 päivän ikkuna ohitetaan).
//  - Nostoon pääsee vain iso juhla, jolla on vähintään yksi julkaistu visa. Pienet
//    juhlat (pyhäinpäivä, kiitospäivä, Lucia, Kalevalan päivä) näkyvät vuosikellossa.
//  - Visa julkaistaan vasta kun sillä on kuva (kuvat: public/20/juhlat/).
//
// Kaikki päivälaskenta tehdään kalenteripäivinä Suomen ajassa (lib/aika.ts). Päivät
// esitetään UTC-keskiyön millisekunteina, jotta kesäaika ei siirrä päivälaskuria.

export const JUHLAT_SIVU = "/kokoelma/juhlat";
export const JUHLAT_KOKOELMA = "juhlat";
export const JUHLAT_ACCENT = "#E8A320";

const I = "/20/juhlat/";

export type Fakta = { label: string; k: string; t: string };

/** Etusivun bannerin koukku: kysymys visasta (ei saa paljastaa vastausta). */
export type Koukku = { visa: string; kysymys: string; korostus: string; ala: string; cta: string };

export type Juhla = {
  slug: string;
  nimi: string;
  /** Nostossa otsikko riveittäin, jos nimi on liian pitkä yhdelle riville */
  rivit?: string[];
  iso: boolean;
  accent: string;
  /** Pääkuva (vaaka, ≥ 1448 px): nosto, vuosikellon kortti ja banneri */
  kuva?: string;
  /** Vain vuosikellon kortin kuva (pieni lähde, ei kelpaa nostoon) */
  korttikuva?: string;
  paiva: (vuosi: number) => number;
  /** Juhlan kesto päivinä alkupäivän jälkeen (joulu 24.–26.12. → 2) */
  loppu?: number;
  /** Laskurin kohde päivinä alkupäivästä (uusivuosi: vuoden vaihtuminen 1.1. → 1) */
  kohde?: number;
  /** Nostun laskurin otsikko ("Halloweeniin") */
  laskuri?: string;
  /** Bannerin laskurin illatiivi ("päivää halloweeniin") */
  ill: string;
  visat: string[];
  faktat?: Fakta[] | ((vuosi: number) => Fakta[]);
  koukku?: Koukku;
};

/* ── Päivämäärät ── */
const PV = 864e5;
export const pvm = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
const lisaa = (t: number, n: number) => t + n * PV;
const viikonpaiva = (t: number) => new Date(t).getUTCDay();
/** n:s viikonpäivä kuukaudessa (vp 0 = sunnuntai) */
function nsVp(y: number, m: number, vp: number, n: number) {
  const eka = pvm(y, m, 1);
  return lisaa(eka, ((vp - viikonpaiva(eka) + 7) % 7) + 7 * (n - 1));
}
/** Ensimmäinen viikonpäivä vp alkaen päivästä t */
const seuraavaVp = (t: number, vp: number) => lisaa(t, (vp - viikonpaiva(t) + 7) % 7);
/** Pääsiäispäivä (gregoriaaninen, Meeus/Jones/Butcher) */
function paasiainen(y: number) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return pvm(y, Math.floor(n / 31), (n % 31) + 1);
}
const pyhainpaiva = (y: number) => seuraavaVp(pvm(y, 10, 31), 6);

const VP = ["su", "ma", "ti", "ke", "to", "pe", "la"];
const KK = ["tammi", "helmi", "maalis", "huhti", "touko", "kesä", "heinä", "elo", "syys", "loka", "marras", "joulu"];
const KUUKAUSI = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"];
export const lyhyt = (t: number) => { const d = new Date(t); return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`; };
export const pitka = (t: number) => `${VP[viikonpaiva(t)]} ${lyhyt(t)}${new Date(t).getUTCFullYear()}`;
export const vpLyhyt = (t: number) => `${VP[viikonpaiva(t)]} ${lyhyt(t)}`;
export const kkLyhyt = (t: number) => KK[new Date(t).getUTCMonth()];
export const kuukausi = (t: number) => KUUKAUSI[new Date(t).getUTCMonth()];

/* ── Juhlat vuodenkierrossa (järjestys ei ratkaise; lajitellaan päivämäärän mukaan) ──
   Faktat eivät saa paljastaa saman juhlan visan vastauksia (tarkistettu 28.9.2026
   kysymyksiä vasten: designin Samhain-, Tuntematon sotilas-, tinanvalanta- ja
   joulurauha-faktat vaihdettiin, koska ne olivat visojen oikeita vastauksia). */
export const JUHLAT: Juhla[] = [
  {
    slug: "halloween", nimi: "Halloween", iso: true, accent: "#FF7A1A", kuva: I + "halloween.webp",
    paiva: (y) => pvm(y, 10, 31), laskuri: "Halloweeniin", ill: "halloweeniin",
    visat: ["halloween-historia-ja-symbolit"],
    faktat: (y) => {
      const py = pyhainpaiva(y), sama = py === pvm(y, 10, 31);
      return [
        {
          label: "Pyhäinpäivä", k: sama ? "Sama päivä" : vpLyhyt(py),
          t: `Pyhäinpäivää vietetään 31.10.–6.11. välisenä lauantaina. ${sama ? `Vuonna ${y} se osuu samalle päivälle halloweenin kanssa.` : `Vuonna ${y} se on ${vpLyhyt(py)}`}`.trim(),
        },
        { label: "Kasvitiede", k: "Marja", t: "Kasvitieteellisesti kurpitsa on marja. Se kuuluu samaan kurkkukasvien heimoon kuin kurkku ja meloni." },
      ];
    },
    koukku: {
      visa: "halloween-historia-ja-symbolit",
      kysymys: "Mistä Halloween-lyhdyt veistettiin ennen kurpitsaa?", korostus: "kurpitsaa?",
      ala: "Vastaus yllättää. Testaa tietosi!", cta: "Selvitä vastaus",
    },
  },
  {
    slug: "pyhainpaiva", nimi: "Pyhäinpäivä", iso: false, accent: "#C9B89A", kuva: I + "pyhainpaiva.webp",
    paiva: pyhainpaiva, ill: "pyhäinpäivään", visat: ["kekrista-pyhainpaivaan-visa"],
  },
  {
    slug: "isanpaiva", nimi: "Isänpäivä", iso: true, accent: "#7FB2E5", kuva: I + "isanpaiva.webp",
    paiva: (y) => nsVp(y, 11, 0, 2), laskuri: "Isänpäivään", ill: "isänpäivään",
    visat: ["isanpaiva-ja-aitienpaiva-visa"],
    koukku: {
      visa: "isanpaiva-ja-aitienpaiva-visa",
      kysymys: "Missä Pohjoismaassa isää juhlitaan kesäkuussa?", korostus: "kesäkuussa?",
      ala: "Isän ja äidin kunniaksi – testaa tietosi!", cta: "Pelaa visa",
    },
  },
  {
    slug: "kiitospaiva", nimi: "Kiitospäivä", iso: false, accent: "#D98A4A", kuva: I + "kiitospaiva.webp",
    paiva: (y) => nsVp(y, 11, 4, 4), ill: "kiitospäivään", visat: ["kiitospaiva-thanksgiving-visa"],
  },
  {
    slug: "itsenaisyyspaiva", nimi: "Itsenäisyyspäivä", rivit: ["Itsenäisyys-", "päivä"], iso: true, accent: "#6FA8FF",
    kuva: I + "itsenaisyyspaiva.webp", paiva: (y) => pvm(y, 12, 6), laskuri: "Itsenäisyyspäivään", ill: "itsenäisyyspäivään",
    visat: ["itsenaisyyspaivan-vietto-visa"],
    faktat: [
      { label: "Linnan juhlat", k: "1919", t: "Presidentin itsenäisyyspäivän vastaanotto järjestettiin ensimmäisen kerran vuonna 1919." },
      { label: "Eduskunta", k: "100–88", t: "Eduskunta hyväksyi senaatin itsenäisyysjulistuksen 6.12.1917 äänin 100–88." },
    ],
    koukku: {
      visa: "itsenaisyyspaivan-vietto-visa",
      kysymys: "Missä kaupungissa Linnan juhlat pidettiin vuonna 2013?", korostus: "2013?",
      ala: "Linnan juhlista soihtukulkueeseen.", cta: "Pelaa visa",
    },
  },
  {
    slug: "lucia", nimi: "Lucian päivä", iso: false, accent: "#F4E3B0", kuva: I + "lucia.webp",
    paiva: (y) => pvm(y, 12, 13), ill: "Lucian päivään", visat: ["lucian-paiva-visa"],
  },
  {
    slug: "joulu", nimi: "Joulu", iso: true, accent: "#E8453C", kuva: I + "joulupoyta.webp",
    paiva: (y) => pvm(y, 12, 24), loppu: 2, laskuri: "Jouluaattoon", ill: "jouluaattoon",
    visat: [
      "adventista-jouluaattoon-visa", "joulupukki-visa", "joulupoydan-antimet-visa", "joulu-maailmalla-visa",
      "joulun-historia-ja-perinteet-visa", "suomalaisen-joulun-hiljaiset-tavat", "joulun-kulttuuri-ikonit-visa",
    ],
    faktat: [
      { label: "Rovaniemi", k: "100+ maata", t: "Joulupukin Pääposti saa kirjeitä yli sadasta maasta." },
    ],
    koukku: {
      visa: "joulupoydan-antimet-visa",
      kysymys: "Mihin graavilohen nimi alun perin viittaa?", korostus: "graavilohen",
      ala: "Joulupöydän herkuilla on yllättäviä tarinoita.", cta: "Selvitä vastaus",
    },
  },
  {
    slug: "uusivuosi", nimi: "Uusivuosi", iso: true, accent: "#FFD23F", kuva: I + "uusivuosi.webp",
    paiva: (y) => pvm(y, 12, 31), loppu: 1, kohde: 1, laskuri: "Vuoden vaihtumiseen", ill: "vuoden vaihtumiseen",
    visat: ["uudenvuoden-taiat-ja-lupaukset-visa"],
    faktat: [
      { label: "Ensimmäisenä", k: "UTC+14", t: "Vuosi vaihtuu ensimmäisenä Kiribatin Linesaarilla keskellä Tyyntämerta." },
      { label: "Viimeisenä", k: "UTC−12", t: "Viimeisenä vuosi vaihtuu asumattomilla Bakerin- ja Howlandinsaarilla." },
    ],
    koukku: {
      visa: "uudenvuoden-taiat-ja-lupaukset-visa",
      kysymys: "Montako viinirypälettä espanjalaiset syövät keskiyöllä?", korostus: "viinirypälettä",
      ala: "Tinat, raketit ja lupaukset.", cta: "Pelaa visa",
    },
  },
  {
    slug: "loppiainen", nimi: "Loppiainen", iso: true, accent: "#9FC7E8", kuva: I + "loppiainen.webp",
    paiva: (y) => pvm(y, 1, 6), laskuri: "Loppiaiseen", ill: "loppiaiseen",
    visat: ["loppiainen-ja-nuutinpaiva-visa"],
    faktat: [{ label: "Nuutinpäivä", k: "13.1.", t: "Nuutinpäivänä joulu on perinteisesti ajettu ulos talosta." }],
    koukku: {
      visa: "loppiainen-ja-nuutinpaiva-visa",
      kysymys: "Kuka tuo italialaisille lapsille lahjat loppiaisena?", korostus: "loppiaisena?",
      ala: "Tietäjistä tiernapoikiin ja nuuttipukkeihin.", cta: "Selvitä vastaus",
    },
  },
  {
    slug: "laskiainen", nimi: "Laskiainen", iso: true, accent: "#BFE3FF", kuva: I + "laskiainen.webp",
    paiva: (y) => lisaa(paasiainen(y), -47), laskuri: "Laskiaiseen", ill: "laskiaiseen",
    visat: ["laskiainen-perinteet-ja-herkut-visa"],
    koukku: {
      visa: "laskiainen-perinteet-ja-herkut-visa",
      kysymys: "Mitä pitkän mäenlaskun uskottiin ennustavan?", korostus: "mäenlaskun",
      ala: "Pulkkamäestä pullapöytään.", cta: "Selvitä vastaus",
    },
  },
  {
    slug: "ystavanpaiva", nimi: "Ystävänpäivä", iso: true, accent: "#FF5C8A", kuva: I + "ystavanpaiva.webp",
    paiva: (y) => pvm(y, 2, 14), laskuri: "Ystävänpäivään", ill: "ystävänpäivään",
    visat: ["ystavanpaiva-suomessa-ja-maailmalla-visa"],
    koukku: {
      visa: "ystavanpaiva-suomessa-ja-maailmalla-visa",
      kysymys: "Mitä japanilaiset naiset antavat miehille ystävänpäivänä?", korostus: "japanilaiset",
      ala: "Sydänten juhla Suomessa ja maailmalla.", cta: "Pelaa visa",
    },
  },
  {
    slug: "kalevalanpaiva", nimi: "Kalevalan päivä", iso: false, accent: "#6FA8FF",
    paiva: (y) => pvm(y, 2, 28), ill: "Kalevalan päivään", visat: [],
  },
  {
    slug: "paasiainen", nimi: "Pääsiäinen", iso: true, accent: "#F2D64B", kuva: I + "paasiainen.webp",
    paiva: paasiainen, laskuri: "Pääsiäiseen", ill: "pääsiäiseen",
    visat: ["paasiainen-perinteet-ja-herkut-visa"],
    koukku: {
      visa: "paasiainen-perinteet-ja-herkut-visa",
      kysymys: "Mikä Fazerin herkku valmistetaan aitoon munankuoreen?", korostus: "munankuoreen?",
      ala: "Virpomisesta mämmiin.", cta: "Selvitä vastaus",
    },
  },
  {
    slug: "vappu", nimi: "Vappu", iso: true, accent: "#FFD23F", kuva: I + "vappu.webp",
    paiva: (y) => pvm(y, 5, 1), laskuri: "Vappuun", ill: "vappuun",
    visat: ["vappu-perinteet-historia-suomi"],
    koukku: {
      visa: "vappu-perinteet-historia-suomi",
      kysymys: "Minne noitien uskottiin lentävän vapunaattona?", korostus: "noitien",
      ala: "Simasta ylioppilaslakkeihin.", cta: "Selvitä vastaus",
    },
  },
  {
    slug: "aitienpaiva", nimi: "Äitienpäivä", iso: true, accent: "#F28BB0", kuva: I + "aitienpaiva.webp",
    paiva: (y) => nsVp(y, 5, 0, 2), laskuri: "Äitienpäivään", ill: "äitienpäivään",
    visat: ["isanpaiva-ja-aitienpaiva-visa"],
    koukku: {
      visa: "isanpaiva-ja-aitienpaiva-visa",
      kysymys: "Miksi äitienpäivän keksijä kääntyi juhlaa vastaan?", korostus: "vastaan?",
      ala: "Isän ja äidin kunniaksi – testaa tietosi!", cta: "Selvitä vastaus",
    },
  },
  {
    slug: "juhannus", nimi: "Juhannus", iso: true, accent: "#7FD67A",
    paiva: (y) => seuraavaVp(pvm(y, 6, 19), 5), loppu: 1, laskuri: "Juhannukseen", ill: "juhannukseen", visat: [],
  },
];

/** Ympäri vuoden -visat (Kaikki juhlavisat -listan viimeinen ryhmä) */
export const JUHLAT_YMPARI_VUODEN = ["juhlia-maailman-ympari-visa", "suomalainen-juhlakahvipoyta-visa"];

export type Esiintyma = Juhla & { alku: number; loppuPv: number; julkaistut: string[] };

/** Juhlat tästä päivästä vuoden eteenpäin, lähin ensin. Käynnissä oleva juhla
    (joulu 24.–26.12.) pysyy listassa loppuunsa asti. */
export function juhlaKalenteri(tanaan: number, julkaistut: Set<string>): Esiintyma[] {
  const vuosi = new Date(tanaan).getUTCFullYear();
  const out: Esiintyma[] = [];
  for (const y of [vuosi - 1, vuosi, vuosi + 1]) {
    for (const j of JUHLAT) {
      const alku = j.paiva(y), loppuPv = lisaa(alku, j.loppu ?? 0);
      if (loppuPv >= tanaan && alku < lisaa(tanaan, 365)) {
        out.push({ ...j, alku, loppuPv, julkaistut: j.visat.filter((s) => julkaistut.has(s)) });
      }
    }
  }
  return out.sort((a, b) => a.alku - b.alku);
}

/** Nosto: lähin iso juhla, jolla on julkaistu visa (Heikki 28.9.2026: aina lähin). */
export const nostettava = (kalenteri: Esiintyma[]) => kalenteri.find((o) => o.iso && o.julkaistut.length > 0) ?? null;

export const paiviaValissa = (a: number, b: number) => Math.round((a - b) / PV);

/** Juhlan faktat vuodelle */
export const faktat = (o: Esiintyma): Fakta[] =>
  typeof o.faktat === "function" ? o.faktat(new Date(o.alku).getUTCFullYear()) : o.faktat ?? [];

/** Nostun visa: koukun visa, jos se on julkaistu, muuten juhlan ensimmäinen julkaistu. */
export const paavisa = (o: Esiintyma) =>
  o.koukku && o.julkaistut.includes(o.koukku.visa) ? o.koukku.visa : o.julkaistut[0];

/** Suomen ajan keskiyö (epoch ms) kalenteripäivälle — laskurin kohde. */
export function helsinginKeskiyo(t: number): number {
  const d = new Date(t);
  const arvio = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - 2 * 36e5;
  const tunti = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Helsinki", hour: "2-digit", hourCycle: "h23" }).format(arvio));
  return tunti === 0 ? arvio : arvio - tunti * 36e5;
}

export const visaHref = (slug: string) => `/peli?visa=${slug}`;
