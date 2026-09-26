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
import { KAUPUNGIT } from "./kaupungit";

/** Palkintoikonit (CD "TN Tupla tai kuitti" 1C): yksi SVG-symboli per palkinto,
    kasa rakennetaan toistamalla samaa symbolia. */
export type PalkintoIkoni = "kiekko" | "kolikko" | "pallo" | "karkki" | "lahja" | "vinyyli" | "kapy" | "lippu" | "popcorn";

export type Palkinto = {
  /** "kiekko" */
  yksi: string;
  /** partitiivi: "kiekkoa" */
  monta: string;
  /** yksikön genetiivi: "kiekon" (otit kiekon talteen) */
  yhden: string;
  /** monikon nominatiivi: "kiekot" (otatko kiekot talteen) */
  kaikki: string;
  /** monikon elatiivi: "kiekoista" (osa kiekoista on turvassa) */
  osa: string;
  ikoni: PalkintoIkoni;
};

/** Tuloksen toinen rivi — antaa pienellekin saaliille arvon (CD-ehdotus 5: teemakohtainen
    taulukko, rivi arvotaan). {N} = oikein-määrä sanana lauseen alussa ("Neljä"),
    {n} = lauseen keskellä ("neljä"), {turva} = turvattu määrä. */
export type Lauseet = { pieni: string[]; kuitattu: string[]; turva: string[]; nolla: string[]; taydet: string[] };

export type TuplaTeema = {
  slug: string;
  /** Näkyy sanamerkin alla: "Tupla tai kuitti – SM-liiga" */
  nimi: string;
  kuvaus: string;
  /** Teeman korostusväri = TUPLA-väri. Vähintään 30° päässä kullasta, vihreästä ja punaisesta. */
  accent: string;
  /** Yläosan kuvio (CSS background), esim. kaukalon aloitusympyrä */
  kuvio: string;
  palkinto: Palkinto;
  /** Väärän vastauksen huudahdus: yksi sana + huutomerkki, enintään 10 merkkiä */
  virhe: string;
  lauseet: Lauseet;
  /** Kausipainos (X VAI Y): X = talteen otettava (kulta), Y = häviö (punainen) */
  painos?: { x: string; y: string; nimi: string; tag: string };
  /** Aihesivun kortti (CD 3A): 3D-palkintoikoni ja yhden rivin kuvaus */
  kuva: string;
  nosto: string;
  /** Mistä kysymykset arvotaan: visojen slugit tai koko kokoelma (quizzes.collection) */
  visat: string[] | { kokoelma: string };
  paluu: { href: string; teksti: string };
};

/** Pelimuodon oma sivu — kaikki teemat samassa paikassa (Heikki 26.9.2026). */
export const TUPLA_SIVU = "/peli/tupla-tai-kuitti";

/** Oletuslauseet teemoille, joilla ei ole omia. */
export const LAUSEET_OLETUS: Lauseet = {
  pieni: ["Varma on varma. Ensi kierroksella rohkeammin?", "Pieni potti, mutta kokonaan sinun."],
  kuitattu: ["Kylmä pää palkittiin. {N} oikein putkeen.", "Tiesit, milloin lopettaa. {N} oikein putkeen."],
  turva: ["Turva piti. {N} oikein ja {turva} mukaan.", "Turvataso pelasti. {turva} jää sinulle."],
  nolla: ["Hups! Uusi sarja odottaa.", "Tällä kertaa ei. Seuraava sarja on jo arvottavissa."],
  taydet: ["Täydellinen kierros. Tästä puhutaan vielä pitkään."],
};

/** Potti oikeiden vastausten jälkeen: 1 oikein = 1, 2 = 2, … 10 = 512. */
export const POTTI = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512] as const;
/** Kysymysten vaikeustasot askelittain (questions.taso). */
export const ASKELEET = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5] as const;
/** Turvataso: montako oikein → potti on varmasti pelaajan. Heikki 26.9. (CD-ehdotus 1):
    siirretty 3 ja 5 oikein (4 ja 16) → 4 ja 6 oikein (8 ja 32). */
export const TURVAT = [4, 6] as const;

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
    kuvaus: "Kymmenen kysymystä SM-liigasta, jokainen edellistä vaikeampi. Jokainen oikea vastaus tuplaa potin. Sinä päätät, milloin lopetat.",
    accent: JK_ACCENT,
    kuvio:
      "radial-gradient(circle at 50% -40px, transparent 0 130px, rgba(79,209,245,.26) 131px 133px, transparent 134px), linear-gradient(180deg, transparent 0 190px, rgba(79,209,245,.18) 190px 193px, transparent 193px), radial-gradient(120% 80% at 50% 0, rgba(79,209,245,.10), transparent 70%)",
    palkinto: { yksi: "kiekko", monta: "kiekkoa", yhden: "kiekon", kaikki: "kiekot", osa: "kiekoista", ikoni: "kiekko" },
    virhe: "Jäähy!",
    lauseet: {
      pieni: ["Varma maali on maali. Ensi kierroksella rohkeammin?", "Pieni saalis, mutta ei yhtään jäähyminuuttia."],
      kuitattu: ["Kylmä pää palkittiin. {N} oikein putkeen.", "Oikea vaihto oikeaan aikaan. {N} oikein putkeen."],
      turva: ["Turva piti. {N} oikein ja {turva} mukaan.", "Maalivahti pelasti: {turva} jää sinulle."],
      nolla: ["Kaksi minuuttia jäähyä, sitten uusi vaihto.", "Kiekko karkasi. Uusi vaihto odottaa jo."],
      taydet: ["Tästä puhutaan pukukopissa vielä pitkään."],
    },
    kuva: "/20/tupla/ikoni-kiekko.webp",
    nosto: "Liigan pelaajat, kaudet ja pudotuspelien muistot.",
    visat: SM_LIIGA_VISAT,
    paluu: { href: "/peli/tupla-tai-kuitti", teksti: "Kaikki Tupla tai kuitti -aiheet" },
  },
];

/* Aihekokoelmien teemat (Heikki 26.9.2026: järjestyksessä Suomen kaupungit, Luonto,
   Musiikki). Värit, palkinnot ja huudahdukset CD v0.2:n teemasäännöstä (1B, 2A). */
TEEMAT.push(
  {
    slug: "suomen-kaupungit",
    nimi: "Suomen kaupungit",
    kuvaus: "Kymmenen kysymystä Suomen kaupungeista, jokainen edellistä vaikeampi. Jokainen oikea vastaus tuplaa potin.",
    accent: "#7FB2FF",
    kuvio: "repeating-radial-gradient(circle at 88% -40px, transparent 0 16px, rgba(127,178,255,.16) 16px 17px)",
    palkinto: { yksi: "kolikko", monta: "kolikkoa", yhden: "kolikon", kaikki: "kolikot", osa: "kolikoista", ikoni: "kolikko" },
    virhe: "Hups!",
    lauseet: {
      pieni: ["Pienikin matkakassa on matkakassa. Ensi kierroksella pidemmälle?", "Varma kolikko taskussa."],
      kuitattu: ["Hyvin suunnistettu. {N} oikein putkeen.", "Kaupunkikierros kannatti. {N} oikein putkeen."],
      turva: ["Turva piti. {N} oikein ja {turva} mukaan.", "Väärä liittymä, mutta {turva} jää sinulle."],
      nolla: ["Hups! Väärä liittymä, mutta uusi reitti odottaa.", "Tällä kertaa eksyit. Uusi kierros odottaa."],
      taydet: ["Täydellinen kaupunkikierros. Tunnet Suomen kuin omat taskusi."],
    },
    kuva: "/20/tupla/ikoni-kaupunki.webp",
    nosto: "Kaupunkien historia, maamerkit ja paikalliset erikoisuudet.",
    visat: KAUPUNGIT.map((k) => k.quizSlug),
    paluu: { href: "/peli/tupla-tai-kuitti", teksti: "Kaikki Tupla tai kuitti -aiheet" },
  },
  {
    slug: "luonto",
    nimi: "Luonto",
    kuvaus: "Kymmenen kysymystä eläimistä, kasveista ja luonnon ilmiöistä, jokainen edellistä vaikeampi. Jokainen oikea vastaus tuplaa potin.",
    accent: "#2DD4BF",
    kuvio: "repeating-radial-gradient(ellipse at 15% 0, transparent 0 14px, rgba(45,212,191,.16) 14px 15px)",
    palkinto: { yksi: "käpy", monta: "käpyä", yhden: "kävyn", kaikki: "kävyt", osa: "kävyistä", ikoni: "kapy" },
    virhe: "Pusikkoon!",
    lauseet: {
      pieni: ["Käpy kourassa on parempi kuin kaksi puussa.", "Pieni saalis, mutta metsä odottaa."],
      kuitattu: ["Kävyt korissa ennen pusikkoa. {N} oikein putkeen.", "Hyvä vainu. {N} oikein putkeen."],
      turva: ["Turva piti. {N} oikein ja {turva} mukaan.", "Pusikkoon meni, mutta {turva} jää sinulle."],
      nolla: ["Pusikkoon meni. Metsä ei karkaa, uusi retki odottaa.", "Polku katosi. Uusi sarja odottaa."],
      taydet: ["Täydet kävyt. Luonto on sinulle avoin kirja."],
    },
    kuva: "/20/tupla/ikoni-kapy.webp",
    nosto: "Eläimet, kasvit ja luonnon ihmeet.",
    visat: { kokoelma: "luonto" },
    paluu: { href: "/peli/tupla-tai-kuitti", teksti: "Kaikki Tupla tai kuitti -aiheet" },
  },
  {
    slug: "musiikki",
    nimi: "Musiikki",
    kuvaus: "Kymmenen kysymystä musiikista kotimaasta maailmalle, jokainen edellistä vaikeampi. Jokainen oikea vastaus tuplaa potin.",
    accent: "#A855F7",
    kuvio: "repeating-radial-gradient(circle at 100% 0, rgba(168,85,247,.16) 0 1px, transparent 1px 8px)",
    palkinto: { yksi: "levy", monta: "levyä", yhden: "levyn", kaikki: "levyt", osa: "levyistä", ikoni: "vinyyli" },
    virhe: "Falski!",
    lauseet: {
      pieni: ["Yksikin levy on kokoelman alku.", "Varma single. Ensi kerralla albumi?"],
      kuitattu: ["Oikea lopetus oikeaan aikaan. {N} oikein putkeen.", "Encore jäi väliin, mutta {n} oikein putkeen."],
      turva: ["Falski nuotti, mutta {turva} jää sinulle.", "Turva piti. {N} oikein ja {turva} mukaan."],
      nolla: ["Falski! Seuraava kappale on jo soimassa.", "Levy hyppäsi. Uusi sarja odottaa."],
      taydet: ["Täydet levyt. Tästä tehdään kultalevy."],
    },
    kuva: "/20/tupla/ikoni-vinyyli.webp",
    nosto: "Artistit, hitit ja levyt kotimaasta maailmalle.",
    visat: { kokoelma: "musiikki" },
    paluu: { href: "/peli/tupla-tai-kuitti", teksti: "Kaikki Tupla tai kuitti -aiheet" },
  },
  // Heikki 26.9.2026: Kulttuuri (pääsylippu) ja TV ja suoratoisto (popcorn)
  {
    slug: "kulttuuri",
    nimi: "Kulttuuri",
    kuvaus: "Kymmenen kysymystä suomalaisesta kulttuurista, jokainen edellistä vaikeampi. Jokainen oikea vastaus tuplaa potin.",
    accent: "#F472B6",
    kuvio: "repeating-linear-gradient(90deg, rgba(244,114,182,.14) 0 3px, transparent 3px 26px)",
    palkinto: { yksi: "lippu", monta: "lippua", yhden: "lipun", kaikki: "liput", osa: "lipuista", ikoni: "lippu" },
    virhe: "Esirippu!",
    lauseet: {
      pieni: ["Yksikin lippu vie katsomoon. Ensi kerralla eturiviin?", "Pieni saalis, mutta paikka salissa on varma."],
      kuitattu: ["Aplodit! {N} oikein putkeen.", "Oikea poistuminen oikeaan aikaan. {N} oikein putkeen."],
      turva: ["Esirippu laski, mutta {turva} jää sinulle.", "Turva piti. {N} oikein ja {turva} mukaan."],
      nolla: ["Esirippu laski. Seuraava näytös alkaa pian.", "Tällä kertaa ei aplodeja. Uusi sarja odottaa."],
      taydet: ["Täydet liput. Seisovat aplodit!"],
    },
    kuva: "/20/tupla/ikoni-lippu.webp",
    nosto: "Suomalainen taide, design, kirjallisuus ja perinteet.",
    visat: { kokoelma: "kulttuuri" },
    paluu: { href: "/peli/tupla-tai-kuitti", teksti: "Kaikki Tupla tai kuitti -aiheet" },
  },
  {
    slug: "tv-ja-suoratoisto",
    nimi: "TV ja suoratoisto",
    kuvaus: "Kymmenen kysymystä tv-sarjoista ja -ohjelmista kotimaasta maailmalle, jokainen edellistä vaikeampi. Jokainen oikea vastaus tuplaa potin.",
    accent: "#FF3D9E",
    kuvio: "repeating-linear-gradient(180deg, rgba(255,61,158,.10) 0 2px, transparent 2px 6px)",
    palkinto: { yksi: "popcorn", monta: "popcornia", yhden: "popcornin", kaikki: "popcornit", osa: "popcorneista", ikoni: "popcorn" },
    virhe: "Katkos!",
    lauseet: {
      pieni: ["Pienikin kulhollinen on parempi kuin tyhjä sohva.", "Varma popcorn. Ensi jaksossa rohkeammin?"],
      kuitattu: ["Lopetit kuin kauden finaaliin. {N} oikein putkeen.", "Hyvä ajoitus. {N} oikein putkeen."],
      turva: ["Katkos tuli, mutta {turva} jää sinulle.", "Turva piti. {N} oikein ja {turva} mukaan."],
      nolla: ["Katkos! Jatkuu seuraavassa jaksossa.", "Lähetys katkesi. Uusi sarja odottaa."],
      taydet: ["Täydet popcornit. Ahmimisen mestari."],
    },
    kuva: "/20/tupla/ikoni-popcorn.webp",
    nosto: "Sarjat, hahmot ja ohjelmat kotisohvalta.",
    visat: { kokoelma: "tv" },
    paluu: { href: "/peli/tupla-tai-kuitti", teksti: "Kaikki Tupla tai kuitti -aiheet" },
  },
);

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

/** Kymmenen kysymyksen sarja siemenestä. Sama visa ei toistu, kahdella kysymyksellä ei
    ole samaa oikeaa vastausta, eikä kysymyksen oikea vastaus saa esiintyä toisen
    kysymyksen tekstissä (esim. Joensuu-kysymys mainitsee Stenbäckin, joka on Mikkeli-
    kysymyksen vastaus). Jos tasolta loppuvat ehdokkaat, otetaan lähin taso. */
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
  const tekstit: string[] = [];
  // Lyhyet vastaukset (esim. "1", "JYP") osuisivat sattumalta tekstiin → vain ≥ 4 merkkiä
  const paljastaa = (vastaus: string, teksti: string) => vastaus.length >= 4 && teksti.includes(vastaus);
  const valitut: TuplaKysymys[] = [];
  for (const taso of ASKELEET) {
    const jarjestys = [taso, taso + 1, taso - 1, taso + 2, taso - 2].filter((t) => t >= 1 && t <= 5);
    let osuma: KysymysRivi | undefined;
    for (const sallitaanSamaVisa of [false, true]) {
      for (const t of jarjestys) {
        osuma = tasoittain.get(t)!.find((x) => {
          const oikea = x.answers!.find((a) => a.is_correct)!.text.trim().toLowerCase();
          const teksti = x.question_text.toLowerCase();
          const ristiin = tekstit.some((tx) => paljastaa(oikea, tx)) || [...vastaukset].some((v) => paljastaa(v, teksti));
          return !valitut.some((v) => v.id === x.id) && (sallitaanSamaVisa || !visat.has(x.quiz_id)) && !vastaukset.has(oikea) && !ristiin;
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
    tekstit.push(osuma.question_text.toLowerCase());
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
