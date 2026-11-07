// PELIMUOTOREKISTERI (S4, runko §3 V6 — 19.10.2026). Yksi lista: jokainen pelimuoto ilmoittaa,
// mitä kokoelmia se palvelee (serves). Kokoelmasivun "Pelit tässä kokoelmassa" (V6) ja pelien
// tulosnäkymän "Seuraava peli" (K4) hakevat pelit täältä — kokoelman asetuksessa ei ole pelilistaa.
// Uusi pelimuoto tai Tupla tai kuitin aihe ilmestyy oikeille sivuille itsestään.
import { TEEMAT, TUPLA_SIVU } from "./tuplaTaiKuitti";
import { JULKAISTUT, pakkaHref } from "./jarjesta/pakat";
import { helsinginPaiva } from "./aika";
import { VIIKON_REITIT, maanantai, viikonReitti, viikonSiemen } from "./reittipeli/viikonReitit";

export type PeliIkoni = "kuva" | "aani" | "ika" | "jarjestys" | "kartta" | "tupla" | "kumpi" | "ketju";

export type Pelimuoto = {
  slug: string;
  /** Pelin oma nimi otsikkona ("Tupla tai kuitti: SM-liiga"). */
  nimi: string;
  ikoni: PeliIkoni;
  /** Yksi rivi. */
  kuvaus: string;
  href: string;
  tila: "pelattava" | "tulossa";
  /** Kokoelmat (kokoelmasivun slug), joita peli palvelee. */
  serves: string[];
  /** Pelin oma kuva kokoelmasivun pelikorttiin ikonin tilalle (P6, Heikki 21.10.2026; toistaiseksi Luonnon pelit).
   *  contain = kuvitus läpinäkyvällä taustalla kokonaisena (Tupla tai kuitin aiheikonit). */
  kuva?: { src: string; contain?: boolean; /** Neliömäinen versio kokoelmasivun 64–80 px:n kuvaan (reittipelit). */ ruutu?: string };
  /** Saman pelimuodon variantit (Rajanaapurit: Maailma / Yhdysvallat, CD-handoff 1.11.2026 7a): Maantieto-kortissa
   *  kahtia jaettu kuva ja varianttirivit. Kuva ja liput täydentyvät viikon reitistä (viikonKuvat). */
  variantit?: Array<{ slug: keyof typeof VIIKON_REITIT; nimi: string; href: string; kuva?: string; liput?: [string, string] | null }>;
};

/** Tupla tai kuitin aihe → kokoelma. Kausipainokset (Halloween, joulu) palvelevat Juhlia. */
const TUPLA_KOKOELMA: Record<string, string> = {
  "sm-liiga": "jaakiekko",
  "suomen-kaupungit": "kaupungit",
  luonto: "luonto",
  musiikki: "musiikki",
  kulttuuri: "kulttuuri",
  "tv-ja-suoratoisto": "tv",
  historia: "historia",
  maantieto: "matkakohteet",
};

export const PELIMUODOT: Pelimuoto[] = [
  ...TEEMAT.map((t) => ({
    slug: `tupla-${t.slug}`,
    nimi: `Tupla tai kuitti: ${t.nimi}`,
    ikoni: "tupla" as const,
    kuvaus: "Tuplaa potti tai kuittaa ajoissa.",
    href: `${TUPLA_SIVU}/${t.slug}`,
    tila: "pelattava" as const,
    serves: [TUPLA_KOKOELMA[t.slug] ?? (t.painos ? "juhlat" : "")].filter(Boolean),
    /* Pelin oma kuva kaikissa korteissa (pelimuotojen kehys, Heikki 25.10.2026): teeman 3D-palkintoikoni. */
    kuva: { src: t.kuva, contain: true },
  })),
  /* Reittipelien kuvat: viikon reitin lähtö ja maali vaalealla kartalla (malli 6c, app/og/reitti), viikko lisätään viikonKuvat-apurissa. */
  { slug: "kuntaliitos", nimi: "Kuntaliitos", ikoni: "ketju", kuvaus: "Rakenna reitti naapurikuntien kautta.", href: "/peli/kuntaliitos", tila: "pelattava", serves: ["kaupungit", "matkakohteet"], kuva: { src: "/og/reitti/kuntaliitos/kortti" } },
  { slug: "rajanaapurit", nimi: "Rajanaapurit", ikoni: "ketju", kuvaus: "Rakenna reitti rajanaapureiden kautta.", href: "/peli/rajanaapurit", tila: "pelattava", serves: ["matkakohteet"], kuva: { src: "/og/reitti/rajanaapurit/kortti" },
    variantit: [
      { slug: "rajanaapurit", nimi: "Maailma", href: "/peli/rajanaapurit" },
      { slug: "osavaltiot", nimi: "Yhdysvallat", href: "/peli/rajanaapurit/osavaltiot" },
    ] },
  { slug: "vaalipiiriketju", nimi: "Vaalipiiriketju", ikoni: "ketju", kuvaus: "Kulje vaalipiiristä toiseen kansanedustajien kautta.", href: "/peli/vaalipiiriketju", tila: "pelattava", serves: ["vaalit"], kuva: { src: "/20/vaalit/vaalipiiriketju-kortti.webp" } },
  { slug: "ikajarjestys", nimi: "Ikäjärjestys", ikoni: "ika", kuvaus: "Järjestä tunnetut suomalaiset iän mukaan.", href: "/peli/jarjesta/tunnetut-suomalaiset", tila: "pelattava", serves: ["tunnetut-henkilot"], kuva: { src: "/20/pelit/k/ikajarjestys.webp" } },
  /* Viikon kuvavisa (15 kuvaa, vaihtuu maanantaisin) — entinen "Tämän viikon visa" -kaista Kuvavisat-sivulla. */
  { slug: "kuvavisa-viikko", nimi: "Viikon kuvavisa", ikoni: "kuva", kuvaus: "15 kuvaa, uusi visa joka maanantai.", href: "/kuvavisa/viikko", tila: "pelattava", serves: ["kuvavisat"], kuva: { src: "/20/pelit/k/kuvavisat.webp" } },
  { slug: "kuvavisat", nimi: "Kuvavisat", ikoni: "kuva", kuvaus: "Tunnista liput, vaakunat, eläimet ja maalaukset kuvasta.", href: "/kokoelma/kuvavisat", tila: "pelattava", serves: ["matkakohteet"], kuva: { src: "/20/pelit/k/kuvavisat.webp" } },
  { slug: "aanivisat", nimi: "Äänivisa: Suomen linnut", ikoni: "aani", kuvaus: "Tunnista lintu laulusta.", href: "/aanivisa/suomen-linnut", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/aanivisat.webp" } },
  /* Luonnon kuvavisat omina peleinään (runko vaihe 3, 20.10.2026: Luonto-sivun "Valitse pelimuoto" -kortit → V6). */
  { slug: "kuvavisa-linnut", nimi: "Kuvavisa: Suomen linnut", ikoni: "kuva", kuvaus: "Siivet, nokat ja höyhenpuvut lähikuvassa.", href: "/kuvavisa/linnut", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-linnut.webp" } },
  { slug: "kuvavisa-elaimet", nimi: "Kuvavisa: Suomen eläimet", ikoni: "kuva", kuvaus: "Pedot, sorkkaeläimet, kalat ja matelijat kuvasta.", href: "/kuvavisa/elaimet?alue=suomi", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-elaimet.webp" } },
  { slug: "kuvavisa-kasvit", nimi: "Kuvavisa: Suomen kasvit ja puut", ikoni: "kuva", kuvaus: "Lehti, kukka ja kaarna tunnistettavina.", href: "/kuvavisa/kasvit", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-kasvit.webp" } },
  /* Suomen kaupungit -megavisa — entisen Kaupungit-sivun nosto (runko vaihe 3, 20.10.2026). Rekisteri on staattinen,
     joten kuvauksissa ei ole kysymysmääriä (Heikki 20.10.: luvut datasta) — määrä näkyy megan omalla sivulla. */
  { slug: "mega-suomen-kaupungit", nimi: "Megavisa: Suomen kaupungit", ikoni: "jarjestys", kuvaus: "Suomen kaupungit yhdessä pelihetkessä.", href: "/peli?mega=suomen-kaupungit-mega", tila: "pelattava", serves: ["kaupungit"], kuva: { src: "/20/pelit/k/megavisat.webp" } },
  /* Laita järjestykseen -pakat (julkaistut, lib/jarjesta/pakat.ts) palvelevat oman kokoelmansa sivua
     (runko vaihe 3, 20.10.2026: Vaalit-hubin pakkakortit → V6). */
  ...JULKAISTUT.map((p) => ({
    slug: `jarjesta-${p.slug}`,
    nimi: `Laita järjestykseen: ${p.kortti.otsikko}`,
    ikoni: "jarjestys" as const,
    kuvaus: p.kortti.meta,
    href: pakkaHref(p),
    tila: "pelattava" as const,
    serves: [p.collection.slug],
    /* Pakan oma korttikuva (pakat.ts korttikuva; kevyet kopiot, lähteet kuvalahteet.ts). */
    kuva: { src: p.korttikuva },
  })),
  { slug: "megavisat", nimi: "Megavisat", ikoni: "jarjestys", kuvaus: "Pitkät visat yhdellä istumalla.", href: "/megavisat", tila: "pelattava", serves: [], kuva: { src: "/20/pelit/k/megavisat.webp" } },
];

/** Kokoelman pelit: pelattavat ensin, sitten tulossa olevat. */
/** Reittipelien kuvat ja liput viikon reitistä: /og/reitti/<peli>/kortti → ?reitti=viikko-<ma> (CDN-välimuisti vaihtuu
 *  maanantaina), varianttirivien liput = viikon reitin lähtö ja maali (7a). Muut pelit sellaisenaan. */
const LIPPU = (peli: keyof typeof VIIKON_REITIT, k: string) => `/20/rajanaapurit/liput/${peli === "osavaltiot" ? "us-" : ""}${k.toLowerCase()}.webp`;
export function viikonKuvat(p: Pelimuoto, paivaIso = helsinginPaiva().iso): Pelimuoto {
  if (!p.kuva?.src.startsWith("/og/reitti/")) return p;
  const viikko = maanantai(paivaIso);
  const q = `?reitti=${viikonSiemen(viikko)}`;
  return {
    ...p,
    kuva: { ...p.kuva, src: p.kuva.src + q, ruutu: p.kuva.src.replace(/\/kortti$/, "/ruutu") + q },
    variantit: p.variantit?.map((v) => {
      const r = viikonReitti(v.slug, viikko)?.reitti;
      return { ...v, kuva: `/og/reitti/${v.slug}/puolikas${q}`, liput: r ? [LIPPU(v.slug, r[0]), LIPPU(v.slug, r[r.length - 1])] : null };
    }),
  };
}

export const kokoelmanPelimuodot = (kokoelma: string) =>
  PELIMUODOT.filter((p) => p.serves.includes(kokoelma)).sort((a, b) => Number(a.tila === "tulossa") - Number(b.tila === "tulossa")).map((p) => viikonKuvat(p));

/** K4 "Seuraava peli" (§4): 2–3 peliä rekisteristä, saman kokoelman pelit ensin, nykyinen peli pois.
 *  Ensin eri pelimuodot (yksi per ikoni), sitten täydennys. */
export function seuraavatPelit(nykyinen: string, koti?: string, n = 3): Pelimuoto[] {
  const ehdokkaat = PELIMUODOT.filter((p) => p.slug !== nykyinen && p.tila === "pelattava");
  const kotona = (p: Pelimuoto) => !!koti && p.serves.includes(koti);
  const jarj = [...ehdokkaat.filter(kotona), ...ehdokkaat.filter((p) => !kotona(p))];
  const valitut: Pelimuoto[] = [];
  for (const p of jarj) if (valitut.length < n && !valitut.some((v) => v.ikoni === p.ikoni)) valitut.push(p);
  for (const p of jarj) if (valitut.length < n && !valitut.includes(p)) valitut.push(p);
  return valitut.map((p) => viikonKuvat(p));
}

/* ── ETUSIVUN "VALITSE PELI" (etusivu v5, 28.10.2026) ─────────────────────────────────────────────────────
   Pelimuodot ryhmittäin. Tulossa-sääntö: tila "tulossa" näkyy vain, jos julkaisu on enintään
   TULOSSA_PAIVAA päivän päässä; ryhmä, jossa on pelkkiä Tulossa-kortteja, piilotetaan. Uusi pelimuoto
   syttyy vaihtamalla tila = "pelattava" — etusivua ei muuteta. Kicker-määrä lasketaan näkyvistä korteista. */
export type EtusivuRyhma = "tietovisat" | "kuva-aani" | "kartta" | "jarjesta";
export const ETUSIVU_RYHMAT: Array<{ avain: EtusivuRyhma; nimi: string; kaikki?: { href: string; teksti: string } }> = [
  { avain: "tietovisat", nimi: "Tietovisat" },
  { avain: "kuva-aani", nimi: "Kuva- ja äänivisat" },
  { avain: "kartta", nimi: "Karttapelit", kaikki: { href: "/peli/karttapelit", teksti: "Kaikki karttapelit" } },
  { avain: "jarjesta", nimi: "Järjestä ja Kumpi?" },
];
/** Ryhmän nimi näkyvien korttien lajeista (Heikki 28.10.: "Järjestä ja Kumpi?" ilman Kumpi?-korttia → "Järjestä").
 *  Kaksi "-visat"-osaa yhdistetään: Kuvavisat + Äänivisat → "Kuva- ja äänivisat". */
const LAJI_RYHMASSA: Record<string, string> = {
  Tietovisa: "Tietovisat", Kuvavisa: "Kuvavisat", "Äänivisa": "Äänivisat", Karttapeli: "Karttapelit", "Järjestä": "Järjestä", "Kumpi?": "Kumpi?",
};
export function ryhmanNimi(kortit: Array<Pick<EtusivunPelimuoto, "laji">>, oletus: string): string {
  const osat = [...new Set(kortit.map((k) => LAJI_RYHMASSA[k.laji] ?? k.laji))];
  if (!osat.length) return oletus;
  if (osat.length === 1) return osat[0];
  const [a, b] = [osat.slice(0, -1).join(", "), osat[osat.length - 1]];
  if (osat.length === 2 && a.endsWith("visat") && b.endsWith("visat")) return `${a.slice(0, -5)}- ja ${b.toLowerCase()}`;
  return `${a} ja ${b}`;
}
export type EtusivunPelimuoto = {
  slug: string;
  ryhma: EtusivuRyhma;
  /** Pieni yläotsikko kortissa ("Tietovisa", "Karttapeli"). */
  laji: string;
  nimi: string;
  /** Mobiilitiilen katkaisukohdat yhdyssanarajoille ("Kunta|liitos" → U+00AD). Vain yli 9-kirjaimisille sanoille. */
  tavut?: string;
  /** Yksi rivi kuvausta (etusivu_rivi). {visat} korvataan sivuston visamäärällä ("800+"). */
  etusivu_rivi: string;
  href: string;
  kuva: string | null;
  kuvaPos?: string;
  /** Lajin väri (piste kortissa). */
  aksentti: string;
  tila: "pelattava" | "tulossa";
  /** Julkaisupäivä (YYYY-MM-DD) Tulossa-kortille; null = ei näytetä ennen julkaisua. */
  julkaisu: string | null;
};
export const TULOSSA_PAIVAA = 35;
const TIETO = "#F0A24B", KUVA = "#22D3EE", KARTTA = "#4ADE80", JARJ = "#C4A1FF", MAA = "#B4532A";
export const ETUSIVUN_PELIMUODOT: EtusivunPelimuoto[] = [
  { slug: "klassinen", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Klassinen visa", etusivu_rivi: "{visat} visaa kaikista aiheista", href: "/kokoelmat", kuva: "/20/hero-mikko-laura.webp", kuvaPos: "70% 24%", aksentti: TIETO, tila: "pelattava", julkaisu: null },
  { slug: "tupla", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Tupla tai kuitti", etusivu_rivi: "Tuplaa pisteet tai pidä ne", href: "/peli/tupla-tai-kuitti", kuva: "/20/tupla/banneri-desk.webp", kuvaPos: "64% 38%", aksentti: TIETO, tila: "pelattava", julkaisu: null },
  { slug: "megavisat", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Megavisat", etusivu_rivi: "Laajat teemavisat yhdellä istumalla", href: "/megavisat", kuva: "/20/megavisat/mikko-hero-900.webp", kuvaPos: "50% 22%", aksentti: TIETO, tila: "pelattava", julkaisu: null },
  { slug: "mika-maa", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Mikä maa?", etusivu_rivi: "Tunnista maa vihjeistä ja siluetista", href: "/peli/mika-maa", kuva: null, aksentti: MAA, tila: "tulossa", julkaisu: "2026-11-30" },
  { slug: "pikapeli", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Pikapeli", etusivu_rivi: "Vastaa ennen kuin aika loppuu", href: "", kuva: null, aksentti: TIETO, tila: "tulossa", julkaisu: null },
  { slug: "kuvavisat", ryhma: "kuva-aani", laji: "Kuvavisa", nimi: "Kuvavisat", etusivu_rivi: "Tunnista kuvista maiden liput, maakuntien vaakunat, eläimiä, lintuja ja monta muuta aihetta", href: "/kokoelma/kuvavisat", kuva: "/20/kuvavisat/hero-800.webp", aksentti: KUVA, tila: "pelattava", julkaisu: null },
  /* Viikon kuvavisa pois etusivulta (CD v8, 30.10.2026): Kuvavisat-kortti kattaa sen. */
  { slug: "aanivisat", ryhma: "kuva-aani", laji: "Äänivisa", nimi: "Äänivisat", etusivu_rivi: "Tunnista lintu laulusta", href: "/aanivisa/suomen-linnut", kuva: "/20/pelit/k/aanivisat.webp", aksentti: KUVA, tila: "pelattava", julkaisu: null },
  /* Karttapelit omina kortteinaan (Heikki 1.11.2026): yksi kortti jätti tilaa käyttämättä; koonti ryhmän otsikon linkissä. */
  { slug: "rajanaapurit", ryhma: "kartta", laji: "Karttapeli", nimi: "Rajanaapurit", tavut: "Raja|naapurit", etusivu_rivi: "Järjestä maat ketjuksi, jossa jokainen maa rajautuu seuraavaan", href: "/peli/rajanaapurit", kuva: "/20/rajanaapurit/banneri-kartta.webp", aksentti: KARTTA, tila: "pelattava", julkaisu: null },
  { slug: "kuntaliitos", ryhma: "kartta", laji: "Karttapeli", nimi: "Kuntaliitos", tavut: "Kunta|liitos", etusivu_rivi: "Järjestä kunnat ketjuksi, jossa jokainen kunta rajautuu seuraavaan", href: "/peli/kuntaliitos", kuva: "/20/kuntaliitos/palapeli.webp", aksentti: KARTTA, tila: "pelattava", julkaisu: null },
  /* Yhdysvallat (CD "Rajanaapurit Yhdysvallat etusivun bannerit" 8b): kuvitus PeliKuvitus, kuva jakokuville. */
  { slug: "rajanaapurit-yhdysvallat", ryhma: "kartta", laji: "Karttapeli", nimi: "Rajanaapurit: Yhdysvallat", etusivu_rivi: "Rakenna reitti lähdöstä maaliin osavaltio kerrallaan", href: "/peli/rajanaapurit/osavaltiot", kuva: "/20/rajanaapurit/banneri-kartta.webp", aksentti: KARTTA, tila: "pelattava", julkaisu: null },
  /* CD "TN Etusivu Järjestä-kortti" (Heikki 31.10.2026): Laita järjestykseen ja Ikäjärjestys yhdeksi Järjestä-kortiksi → hub.
     Vain otsikko, ei kuvausta; kuvitus PeliKuvitus "jarjesta". */
  { slug: "jarjesta", ryhma: "jarjesta", laji: "Järjestä", nimi: "Järjestä", etusivu_rivi: "", href: "/peli/jarjesta", kuva: null, aksentti: "#F0A24B", tila: "pelattava", julkaisu: null },
  { slug: "vaalipiiriketju", ryhma: "jarjesta", laji: "Järjestä", nimi: "Vaalipiiriketju", tavut: "Vaali|piiri|ketju", etusivu_rivi: "Ketjuta kansanedustajat vaalipiireittäin", href: "/peli/vaalipiiriketju", kuva: "/20/vaalit/vaalipiiriketju.webp", aksentti: JARJ, tila: "pelattava", julkaisu: null },
  { slug: "kumpi", ryhma: "jarjesta", laji: "Kumpi?", nimi: "Kumpi?", etusivu_rivi: "Vanhempi, suurempi, korkeampi – valitse parista", href: "", kuva: null, aksentti: JARJ, tila: "tulossa", julkaisu: null },
];

/** Pelimuoto tänään: Tulossa-kortti, jolla on osoite, syttyy pelattavaksi julkaisupäivänä ilman käsin vaihtoa
 *  (Mikä maa? 30.11.2026). Esikatselussa ja paikallisesti julkaisupäivää ei odoteta, jotta kortin voi testata etukäteen. */
export function pelimuotoTanaan(p: EtusivunPelimuoto, tanaan: string): EtusivunPelimuoto {
  const esikatselu = typeof window === "undefined" && process.env.VERCEL_ENV !== "production";
  return p.tila === "tulossa" && p.julkaisu && p.href && (tanaan >= p.julkaisu || esikatselu) ? { ...p, tila: "pelattava" } : p;
}

/** Näkyykö pelimuoto etusivulla tänään (Tulossa-sääntö). tanaan = YYYY-MM-DD. */
export function nakyyEtusivulla(p: EtusivunPelimuoto, tanaan: string): boolean {
  if (p.tila === "pelattava") return true;
  if (!p.julkaisu) return false;
  const ero = (Date.parse(p.julkaisu) - Date.parse(tanaan)) / 864e5;
  return ero >= 0 && ero <= TULOSSA_PAIVAA;
}
