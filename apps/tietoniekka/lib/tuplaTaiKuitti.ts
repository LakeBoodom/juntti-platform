// TUPLA TAI KUITTI — yleinen riskipelin mekaniikka (Heikki 25.9.2026).
//
// Jokaisen oikean vastauksen jälkeen pelaaja päättää: kuittaa potin (peli päättyy)
// vai tuplaa vaikeampaan kysymykseen. Väärä vastaus vie potin; 3. ja 5. oikean
// vastauksen jälkeen osa potista on turvassa. Kysymykset etenevät helposta vaikeaan
// kysymyskohtaisen vaikeustason (questions.taso 1–5) mukaan.
//
// Teema = nimi, palkinto (kiekot, jalkapallot, karkit …), sävy ja visajoukko, josta
// kysymykset arvotaan. Uusi teema on uusi rivi TEEMAT-listaan — koodia ei tarvita,
// kunhan teeman visojen kysymyksille on annettu taso.
//
// Sarja on siemen: sama siemen → samat kysymykset samassa järjestyksessä samoin
// vaihtoehdoin. Oletuksena päivän sarja (kaikki pelaavat tänään saman), "Arvo uusi"
// antaa satunnaisen siemenen, ja haastelinkki kuljettaa siemenen kaverille.

import { JK_ACCENT } from "./jaakiekko";

export type Palkinto = {
  /** "kiekko" */
  yksi: string;
  /** partitiivi: "kiekkoa" */
  monta: string;
  /** monikon nominatiivi: "kiekot" (otatko kiekot talteen) */
  kaikki: string;
  /** monikon elatiivi: "kiekoista" (osa kiekoista on turvassa) */
  osa: string;
  ikoni: "kiekko" | "kolikko";
};

export type TuplaTeema = {
  slug: string;
  /** Näkyy nimen jälkeen: "Tupla tai kuitti – SM-liiga" */
  nimi: string;
  kuvaus: string;
  accent: string;
  palkinto: Palkinto;
  /** Väärän vastauksen huudahdus */
  virhe: string;
  /** Mistä kysymykset arvotaan (quizzes.slug) */
  visat: string[];
  paluu: { href: string; teksti: string };
};

/** Potti oikeiden vastausten jälkeen: 1 oikein = 1, 2 = 2, … 10 = 512. */
export const POTTI = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512] as const;
/** Kysymysten vaikeustasot askelittain (questions.taso). */
export const ASKELEET = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5] as const;
/** Turvataso: montako oikein → potti on varmasti pelaajan (Heikki: 3 ja 5 oikein). */
export const TURVAT = [3, 5] as const;

/** Turvassa oleva määrä, kun `oikein` vastausta on takana. */
export function turvassa(oikein: number): number {
  let t = 0;
  for (const raja of TURVAT) if (oikein >= raja) t = POTTI[raja - 1];
  return t;
}

export function maara(n: number, p: Palkinto) {
  return `${n.toLocaleString("fi-FI")} ${n === 1 ? p.yksi : p.monta}`;
}

const SM_LIIGA_VISAT = [
  "tappara-tampere-kirvesrinnat-tietovisa", "ilves-tampere-keltamustat-tietovisa", "tps-turku-jaakiekko-tietovisa",
  "karpat-tietovisa-legendat", "hifk-helsinki-punavalkoiset-tietovisa", "jokerit-helsinki-liigahistoria-tietovisa",
  "assat-isomaen-ukkoset-tietovisa", "hpk-rinkelinmaen-ritarit-tietovisa", "rauman-lukko-visa",
  "jyp-hippoksen-hurmaa-tietovisa", "kalpa-niiralan-montun-kovin-tietovisa", "pelicans-kolme-kertaa-hopealla-tietovisa",
  "saipa-saimaan-syketta-tietovisa", "kookoo-kiekko-kimpassa-tietovisa", "sport-punavalkoinen-tarina-tietovisa",
  "jukurit-sisasavolaista-sisua-tietovisa", "kiekko-espoo-tuhkasta-liigaan-tietovisa",
  "sm-liiga-stadin-derby-hifk-jokerit", "sm-liiga-tampereen-derby-ilves-tappara", "sm-liiga-satakunnan-derby-assat-lukko",
  "sm-liiga-maalivahtilegendat", "sm-liiga-kaikkien-aikojen-pistekuninkaat", "sm-liiga-finaalidraamat",
  "sm-liiga-valmentajadraamat-tulisielut", "sm-liiga-ulkomaalaisvahvistukset", "sm-liigan-legendaariset-pomot-visa",
  "sm-liiga-ikonisimmat-maalitykit", "sm-liiga-jaahykuninkaat-kovanaamat", "sm-liiga-tuomarilegendat",
];

export const TEEMAT: TuplaTeema[] = [
  {
    slug: "sm-liiga",
    nimi: "SM-liiga",
    kuvaus: "Seurat, legendat, finaalit ja jäähyaitio. Kymmenen kysymystä, jokainen edellistä vaikeampi.",
    accent: JK_ACCENT,
    palkinto: { yksi: "kiekko", monta: "kiekkoa", kaikki: "kiekot", osa: "kiekoista", ikoni: "kiekko" },
    virhe: "Jäähy!",
    visat: SM_LIIGA_VISAT,
    paluu: { href: "/kokoelma/jaakiekko", teksti: "Jääkiekkovisat" },
  },
];

export const teema = (slug: string) => TEEMAT.find((t) => t.slug === slug) ?? null;

/* ── Sarjan arvonta ──────────────────────────────────────────────────── */

export type TuplaKysymys = {
  id: string;
  kysymys: string;
  vaihtoehdot: string[];
  oikea: string;
  selitys: string | null;
  taso: number;
  /** Lähdevisan nimi pienenä rivinä */
  visa: string;
};

export type KysymysRivi = {
  id: string;
  quiz_id: string;
  question_text: string;
  explanation: string | null;
  answers: Array<{ text: string; is_correct: boolean }> | null;
  taso: number | null;
};

function hajautus(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** mulberry32 — pieni deterministinen satunnaislukugeneraattori siemenestä. */
export function satunnainen(siemen: string) {
  let a = hajautus(siemen);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sekoita<T>(a: T[], r: () => number): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Kymmenen kysymyksen sarja siemenestä. Sama visa ei toistu, eikä kahdella
    kysymyksellä ole samaa oikeaa vastausta (vähentää ristiinpaljastusta). Jos tasolta
    loppuvat ehdokkaat, otetaan lähin taso. */
export function arvoSarja(rivit: KysymysRivi[], visaNimet: Map<string, string>, siemen: string): TuplaKysymys[] {
  const r = satunnainen(siemen);
  const kelvot = rivit.filter((x) => {
    const v = (x.answers ?? []).filter((a) => a?.text?.trim());
    return x.taso != null && v.length === 4 && v.filter((a) => a.is_correct).length === 1;
  });
  const tasoittain = new Map<number, KysymysRivi[]>();
  for (const t of [1, 2, 3, 4, 5]) tasoittain.set(t, sekoita(kelvot.filter((x) => x.taso === t), r));
  const visat = new Set<string>();
  const vastaukset = new Set<string>();
  const valitut: TuplaKysymys[] = [];
  for (const taso of ASKELEET) {
    const jarjestys = [taso, taso + 1, taso - 1, taso + 2, taso - 2].filter((t) => t >= 1 && t <= 5);
    let osuma: KysymysRivi | undefined;
    for (const sallitaanSamaVisa of [false, true]) {
      for (const t of jarjestys) {
        osuma = tasoittain.get(t)!.find((x) => {
          const oikea = x.answers!.find((a) => a.is_correct)!.text.trim().toLowerCase();
          return !valitut.some((v) => v.id === x.id) && (sallitaanSamaVisa || !visat.has(x.quiz_id)) && !vastaukset.has(oikea);
        });
        if (osuma) break;
      }
      if (osuma) break;
    }
    if (!osuma) break;
    const v = osuma.answers!.filter((a) => a?.text?.trim());
    const oikea = v.find((a) => a.is_correct)!.text.trim();
    visat.add(osuma.quiz_id);
    vastaukset.add(oikea.toLowerCase());
    valitut.push({
      id: osuma.id,
      kysymys: osuma.question_text.trim(),
      vaihtoehdot: sekoita(v.map((a) => a.text.trim()), r),
      oikea,
      selitys: osuma.explanation?.trim() || null,
      taso: osuma.taso!,
      visa: visaNimet.get(osuma.quiz_id) ?? "",
    });
  }
  return valitut;
}

/** Lyhyt satunnainen siemen "Arvo uusi" -napille ja haastelinkkiin. */
export const uusiSiemen = () => Math.random().toString(36).slice(2, 8);
