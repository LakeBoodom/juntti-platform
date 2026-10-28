// PELIMUOTOREKISTERI (S4, runko §3 V6 — 19.10.2026). Yksi lista: jokainen pelimuoto ilmoittaa,
// mitä kokoelmia se palvelee (serves). Kokoelmasivun "Pelit tässä kokoelmassa" (V6) ja pelien
// tulosnäkymän "Seuraava peli" (K4) hakevat pelit täältä — kokoelman asetuksessa ei ole pelilistaa.
// Uusi pelimuoto tai Tupla tai kuitin aihe ilmestyy oikeille sivuille itsestään.
import { TEEMAT, TUPLA_SIVU } from "./tuplaTaiKuitti";
import { JULKAISTUT, pakkaHref } from "./jarjesta/pakat";

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
  kuva?: { src: string; contain?: boolean };
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
    kuva: TUPLA_KOKOELMA[t.slug] === "luonto" ? { src: t.kuva, contain: true } : undefined,
  })),
  { slug: "kuntaliitos", nimi: "Kuntaliitos", ikoni: "ketju", kuvaus: "Rakenna reitti naapurikuntien kautta.", href: "/peli/kuntaliitos", tila: "pelattava", serves: ["kaupungit", "matkakohteet"] },
  { slug: "rajanaapurit", nimi: "Rajanaapurit", ikoni: "ketju", kuvaus: "Ketjuta maat yhteisen rajan kautta.", href: "/peli/rajanaapurit", tila: "pelattava", serves: ["matkakohteet"] },
  { slug: "vaalipiiriketju", nimi: "Vaalipiiriketju", ikoni: "ketju", kuvaus: "Kulje vaalipiiristä toiseen kansanedustajien kautta.", href: "/peli/vaalipiiriketju", tila: "pelattava", serves: ["vaalit"] },
  { slug: "ikajarjestys", nimi: "Ikäjärjestys", ikoni: "ika", kuvaus: "Järjestä tunnetut henkilöt iän mukaan.", href: "/peli/ikajarjestys", tila: "pelattava", serves: ["tunnetut-henkilot"] },
  /* Viikon kuvavisa (15 kuvaa, vaihtuu maanantaisin) — entinen "Tämän viikon visa" -kaista Kuvavisat-sivulla. */
  { slug: "kuvavisa-viikko", nimi: "Viikon kuvavisa", ikoni: "kuva", kuvaus: "15 kuvaa, uusi visa joka maanantai.", href: "/kuvavisa/viikko", tila: "pelattava", serves: ["kuvavisat"] },
  { slug: "kuvavisat", nimi: "Kuvavisat", ikoni: "kuva", kuvaus: "Tunnista liput, vaakunat, eläimet ja maalaukset kuvasta.", href: "/kokoelma/kuvavisat", tila: "pelattava", serves: ["matkakohteet"] },
  { slug: "aanivisat", nimi: "Äänivisa: Suomen linnut", ikoni: "aani", kuvaus: "Tunnista lintu laulusta.", href: "/aanivisa/suomen-linnut", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/aanivisat.webp" } },
  /* Luonnon kuvavisat omina peleinään (runko vaihe 3, 20.10.2026: Luonto-sivun "Valitse pelimuoto" -kortit → V6). */
  { slug: "kuvavisa-linnut", nimi: "Kuvavisa: Suomen linnut", ikoni: "kuva", kuvaus: "Siivet, nokat ja höyhenpuvut lähikuvassa.", href: "/kuvavisa/linnut", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-linnut.webp" } },
  { slug: "kuvavisa-elaimet", nimi: "Kuvavisa: Suomen eläimet", ikoni: "kuva", kuvaus: "Pedot, sorkkaeläimet, kalat ja matelijat kuvasta.", href: "/kuvavisa/elaimet?alue=suomi", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-elaimet.webp" } },
  { slug: "kuvavisa-kasvit", nimi: "Kuvavisa: Suomen kasvit ja puut", ikoni: "kuva", kuvaus: "Lehti, kukka ja kaarna tunnistettavina.", href: "/kuvavisa/kasvit", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-kasvit.webp" } },
  /* Suomen kaupungit -megavisa — entisen Kaupungit-sivun nosto (runko vaihe 3, 20.10.2026). Rekisteri on staattinen,
     joten kuvauksissa ei ole kysymysmääriä (Heikki 20.10.: luvut datasta) — määrä näkyy megan omalla sivulla. */
  { slug: "mega-suomen-kaupungit", nimi: "Megavisa: Suomen kaupungit", ikoni: "jarjestys", kuvaus: "Kaikki 20 kaupunkia yhdessä istunnossa.", href: "/peli?mega=suomen-kaupungit-mega", tila: "pelattava", serves: ["kaupungit"] },
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
  })),
  { slug: "megavisat", nimi: "Megavisat", ikoni: "jarjestys", kuvaus: "Pitkät visat yhdellä istumalla.", href: "/megavisat", tila: "pelattava", serves: [] },
];

/** Kokoelman pelit: pelattavat ensin, sitten tulossa olevat. */
export const kokoelmanPelimuodot = (kokoelma: string) =>
  PELIMUODOT.filter((p) => p.serves.includes(kokoelma)).sort((a, b) => Number(a.tila === "tulossa") - Number(b.tila === "tulossa"));

/** K4 "Seuraava peli" (§4): 2–3 peliä rekisteristä, saman kokoelman pelit ensin, nykyinen peli pois.
 *  Ensin eri pelimuodot (yksi per ikoni), sitten täydennys. */
export function seuraavatPelit(nykyinen: string, koti?: string, n = 3): Pelimuoto[] {
  const ehdokkaat = PELIMUODOT.filter((p) => p.slug !== nykyinen && p.tila === "pelattava");
  const kotona = (p: Pelimuoto) => !!koti && p.serves.includes(koti);
  const jarj = [...ehdokkaat.filter(kotona), ...ehdokkaat.filter((p) => !kotona(p))];
  const valitut: Pelimuoto[] = [];
  for (const p of jarj) if (valitut.length < n && !valitut.some((v) => v.ikoni === p.ikoni)) valitut.push(p);
  for (const p of jarj) if (valitut.length < n && !valitut.includes(p)) valitut.push(p);
  return valitut;
}

/* ── ETUSIVUN "VALITSE PELI" (etusivu v5, 28.10.2026) ─────────────────────────────────────────────────────
   Pelimuodot ryhmittäin. Tulossa-sääntö: tila "tulossa" näkyy vain, jos julkaisu on enintään
   TULOSSA_PAIVAA päivän päässä; ryhmä, jossa on pelkkiä Tulossa-kortteja, piilotetaan. Uusi pelimuoto
   syttyy vaihtamalla tila = "pelattava" — etusivua ei muuteta. Kicker-määrä lasketaan näkyvistä korteista. */
export type EtusivuRyhma = "tietovisat" | "kuva-aani" | "kartta" | "jarjesta";
export const ETUSIVU_RYHMAT: Array<{ avain: EtusivuRyhma; nimi: string }> = [
  { avain: "tietovisat", nimi: "Tietovisat" },
  { avain: "kuva-aani", nimi: "Kuva- ja äänivisat" },
  { avain: "kartta", nimi: "Karttapelit" },
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
  { slug: "klassinen", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Klassinen visa", etusivu_rivi: "{visat} visaa kaikista aiheista", href: "/kokoelmat", kuva: "/20/hero-mikko-laura.webp", kuvaPos: "center 30%", aksentti: TIETO, tila: "pelattava", julkaisu: null },
  { slug: "tupla", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Tupla tai kuitti", etusivu_rivi: "Tuplaa pisteet tai pidä ne", href: "/peli/tupla-tai-kuitti", kuva: "/20/tupla/banneri-desk.webp", aksentti: TIETO, tila: "pelattava", julkaisu: null },
  { slug: "megavisat", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Megavisat", etusivu_rivi: "Laajat teemavisat yhdellä istumalla", href: "/megavisat", kuva: "/20/megavisat/mikko-hero-900.webp", kuvaPos: "center 20%", aksentti: TIETO, tila: "pelattava", julkaisu: null },
  { slug: "pikapeli", ryhma: "tietovisat", laji: "Tietovisa", nimi: "Pikapeli", etusivu_rivi: "Vastaa ennen kuin aika loppuu", href: "", kuva: null, aksentti: TIETO, tila: "tulossa", julkaisu: null },
  { slug: "kuvavisat", ryhma: "kuva-aani", laji: "Kuvavisa", nimi: "Kuvavisat", etusivu_rivi: "Tunnista lippu, vaakuna tai lintu", href: "/kokoelma/kuvavisat", kuva: "/20/kuvavisat/hero-800.webp", aksentti: KUVA, tila: "pelattava", julkaisu: null },
  { slug: "kuvavisa-viikko", ryhma: "kuva-aani", laji: "Kuvavisa", nimi: "Viikon kuvavisa", etusivu_rivi: "Uusi setti joka maanantai", href: "/kuvavisa/viikko", kuva: "/20/etusivu/banneri-kuvavisat-liput.webp", aksentti: KUVA, tila: "pelattava", julkaisu: null },
  { slug: "aanivisat", ryhma: "kuva-aani", laji: "Äänivisa", nimi: "Äänivisat", etusivu_rivi: "Tunnista lintu laulusta", href: "/aanivisa/suomen-linnut", kuva: "/20/pelit/k/aanivisat.webp", aksentti: KUVA, tila: "pelattava", julkaisu: null },
  { slug: "kuntaliitos", ryhma: "kartta", laji: "Karttapeli", nimi: "Kuntaliitos", tavut: "Kunta|liitos", etusivu_rivi: "Rakenna reitti kunnasta toiseen", href: "/peli/kuntaliitos", kuva: "/20/kuntaliitos/palapeli.webp", aksentti: KARTTA, tila: "pelattava", julkaisu: null },
  { slug: "rajanaapurit", ryhma: "kartta", laji: "Karttapeli", nimi: "Rajanaapurit", tavut: "Raja|naapurit", etusivu_rivi: "Kulje maasta toiseen rajojen yli", href: "/peli/rajanaapurit", kuva: "/20/rajanaapurit/banneri-kartta.webp", aksentti: KARTTA, tila: "pelattava", julkaisu: null },
  { slug: "vaalipiiriketju", ryhma: "kartta", laji: "Karttapeli", nimi: "Vaalipiiriketju", tavut: "Vaali|piiri|ketju", etusivu_rivi: "Ketjuta vaalipiirit rajojen yli", href: "/peli/vaalipiiriketju", kuva: "/20/vaalit/vaalipiiriketju.webp", aksentti: KARTTA, tila: "pelattava", julkaisu: null },
  { slug: "mika-maa", ryhma: "kartta", laji: "Karttapeli", nimi: "Mikä maa?", etusivu_rivi: "Tunnista maa vihjeistä ja siluetista", href: "", kuva: null, aksentti: MAA, tila: "tulossa", julkaisu: "2026-11-30" },
  { slug: "ikajarjestys", ryhma: "jarjesta", laji: "Järjestä", nimi: "Ikäjärjestys", tavut: "Ikä|järjestys", etusivu_rivi: "Laita tunnetut ikäjärjestykseen", href: "/peli/ikajarjestys", kuva: "/20/teema-tunnetut-henkilot-800.webp", aksentti: JARJ, tila: "pelattava", julkaisu: null },
  { slug: "laita-jarjestykseen", ryhma: "jarjesta", laji: "Järjestä", nimi: "Laita järjestykseen", tavut: "Laita järjes|tykseen", etusivu_rivi: "Kahdeksan nimeä, yksi oikea järjestys", href: "/peli/jarjesta/presidentit", kuva: "/20/vaalit/hero-kortti.webp", aksentti: JARJ, tila: "pelattava", julkaisu: null },
  { slug: "kumpi", ryhma: "jarjesta", laji: "Kumpi?", nimi: "Kumpi?", etusivu_rivi: "Vanhempi, suurempi, korkeampi – valitse parista", href: "", kuva: null, aksentti: JARJ, tila: "tulossa", julkaisu: null },
];

/** Näkyykö pelimuoto etusivulla tänään (Tulossa-sääntö). tanaan = YYYY-MM-DD. */
export function nakyyEtusivulla(p: EtusivunPelimuoto, tanaan: string): boolean {
  if (p.tila === "pelattava") return true;
  if (!p.julkaisu) return false;
  const ero = (Date.parse(p.julkaisu) - Date.parse(tanaan)) / 864e5;
  return ero >= 0 && ero <= TULOSSA_PAIVAA;
}
