// KUMPI? 2.0 — kysymysgeneraattori (brief 20.11.2026, A2). Puhdas funktio: data + teema + siemen → kysymykset.
// Pohjana lib/duel.ts (vanha Kumpi?), mutta kysymyslause tulee kentästä kumpi_kysymys ja vaikeus, monipuolisuus,
// pelipaikka- ja kuvasäännöt ovat uusia. Sama siemen = samat kysymykset (Päivän Kumpi?, haastelinkki ?sarja=).

import { siemen as siemenRng } from "@/lib/jarjesta/siemen";
import { mittaritSopivat } from "@/lib/vertailu";
import {
  KIEKKO_JAKAUMA, KIEKKO_LUOKKA, KP_ATTR, MV_ATTR, RYHMAN_MAKSIMI, RYHMAN_OLETUSMAKSIMI, mikaTahansaTeema, onKiekko,
  type KiekkoLuokka, type Teema,
} from "./teemat";
import type { KDef, KEnt, KVisa, KumpiData, KumpiKysymys, Vaikeus, Vaihtoehto } from "./tyypit";

const VUOSI_S = 365.25 * 86400;

/* ─── Muotoilu ─────────────────────────────────────────────────────── */

/** Luku suomalaisittain: tuhaterotin sitova välilyönti ("1 457"), desimaalipilkku. Vuosilukuihin ei erotinta. */
export function fiLuku(n: number): string {
  const pyor = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  const [koko, des] = String(Math.abs(pyor)).split(".");
  const ryhm = koko.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${n < 0 ? "−" : ""}${ryhm}${des ? `,${des}` : ""}`;
}

/** Attribuutit, joiden arvo on vuosiluku (ei tuhaterotinta). */
const VUOSI_ATTR = new Set([
  "founded_year", "lh_built", "park_founded", "mp_first_year", "year", "liiga_debut", "nhl_debut", "start_year", "party_founded",
  // Presidentin aloitusvuosi (display_value "1925", Cowork 20.11.2026) ja seurojen vuodet.
  "pres_start", "liiga_since", "first_title_year", "latest_title_year", "founded_hockey",
  // SM-sarjojen viimeisin mestaruus (Heikki 23.11.2026).
  "koripallo_latest_title_m", "lentopallo_latest_title_m", "pesapallo_latest_title_m", "jalkapallo_latest_title_m",
  "band_founded",
  // EU- ja Nato-jäsenyyden alkuvuosi (Heikki 26.11.2026).
  "eu_join_year", "nato_join_year",
]);

/** "Kumpi heistä on pelannut enemmän [Liiga-otteluita]?" → osat. Paikkamerkit täytetään ennen jakoa. */
export function jaaKysymys(lause: string): { ennen: string; avain: string; jalkeen: string } {
  const m = lause.match(/^(.*?)\[(.+?)\](.*)$/);
  if (!m) return { ennen: lause, avain: "", jalkeen: "" };
  return { ennen: m[1], avain: m[2], jalkeen: m[3] };
}

const kokoLause = (o: { ennen: string; avain: string; jalkeen: string }) => `${o.ennen}${o.avain}${o.jalkeen}`;

/** Vastauslistan lause nimien kanssa. Vain "Kumpi …?" -alkuiset taipuvat luontevasti; muut sellaisinaan. */
export function listalause(lause: string, a: string, b: string): string {
  if (!lause.endsWith("?")) return lause;
  // "Kummassa kaupungissa …?" ei taivu nimien kanssa ("Nokiassa"): nimet kaksoispisteen jälkeen.
  if (!/^Kumpi /.test(lause)) return lause.replace(/\?$/, `: ${a} vai ${b}?`);
  const runko = lause.replace(/^Kumpi heistä /, "Kumpi ").replace(/^Kumpi näistä \S+ /, "Kumpi ");
  return runko.replace(/\?$/, `, ${a} vai ${b}?`);
}

const HENKILO_KINDIT = new Set(["person", "player"]);

function lyhytNimet(a: KEnt, b: KEnt): [string, string] {
  if (!HENKILO_KINDIT.has(a.kind) || !HENKILO_KINDIT.has(b.kind)) return [a.nimi, b.nimi];
  const s = (n: string) => n.trim().split(/\s+/).pop() ?? n;
  const sa = s(a.nimi);
  const sb = s(b.nimi);
  return sa === sb ? [a.nimi, b.nimi] : [sa, sb];
}

/* ─── Attribuuttimääritys teemassa ─────────────────────────────────── */

/** "liiga_games@seura" = seurakohtainen arvo (scope = teeman seura). */
type Spec = { avain: string; key: string; seura: string | null };

function spec(avain: string, teema: Teema): Spec {
  const [key, mod] = avain.split("@");
  const seura = mod === "seura" && teema.pooli.tapa === "seura" ? teema.pooli.seura : null;
  return { avain, key, seura };
}

function arvo(e: KEnt, s: Spec): number | undefined {
  return s.seura ? e.s[s.seura]?.[s.key] : e.v[s.key];
}

/* ─── Pooli ────────────────────────────────────────────────────────── */

/**
 * Suomikiekon legenda (testipalaute 20.11.2026: pelkät entity_facts-rivit päästivät mukaan nykypelaajia kuten
 * Haapala ja Metsola). Pelkkä yksi MM- tai olympiakulta ei riitä (vuoden 2022 joukkueet). Legenda = Stanley Cup,
 * vähintään 500 NHL-ottelua, 150 maaottelua tai 900 Liiga-ottelua. Raja-arvot ovat Heikin vahvistettavia.
 */
export function onLegenda(e: KEnt): boolean {
  return (
    e.v.has_stanley_cup === 1 || (e.v.stanley_cups ?? 0) > 0 ||
    (e.v.nhl_games ?? 0) >= 500 || (e.v.nt_games ?? 0) >= 150 || (e.v.liiga_games ?? 0) >= 900
  );
}

export function teemanPooli(data: KumpiData, teema: Teema): KEnt[] {
  const p = teema.pooli;
  return data.entities.filter((e) => {
    switch (p.tapa) {
      case "kind": return p.kinds.includes(e.kind) && (!p.rajaus || p.rajaus(e));
      case "legendat": return e.kind === "player" && onLegenda(e);
      case "liiga": return e.kind === "player" && e.v.liiga_games !== undefined;
      case "seura": return e.kind === "player" && e.seurat.includes(p.seura);
      case "suomalaiset": return e.kind === "person" && e.suomalainen;
    }
  });
}

/** Flag-kysymyksen voittajan vuosiattribuutti ("Voitti 2022"). */
export const FLAG_VUODET: Record<string, string> = {
  has_stanley_cup: "stanley_cup_years",
  has_wc_gold: "wc_gold_years",
  oly_gold: "oly_gold_years",
};

/** Flag-arvorivit (brief A2): voittaja / ei-voittaja. Muut flagit eivät ole Kumpi?:ssa ennen kuin pari kirjoitetaan.
 *  Funktio = rivi entiteetin omista tiedoista (seuroilla mestaruusmäärä ja ensimmäinen liigakausi). */
type FlagRivi = string | null | ((e: KEnt) => string | null);
const FLAG_RIVIT: Record<string, { kylla: FlagRivi; ei: FlagRivi }> = {
  has_stanley_cup: { kylla: null, ei: "Ei ole voittanut" },
  has_wc_gold: { kylla: null, ei: "Ei ole voittanut" },
  oly_gold: { kylla: null, ei: "Ei ole voittanut" },
  has_nhl: { kylla: "Pelasi NHL:ssä", ei: "Ei ole pelannut NHL:ssä" },
  has_title: { kylla: (e) => e.d.titles ? siistiArvo(e.d.titles, "titles") : "On voittanut", ei: "Ei ole voittanut" },
  is_founding_member: { kylla: "Mukana 1975", ei: (e) => e.v.liiga_since ? `Liigaan ${e.v.liiga_since}` : "Ei ollut mukana" },
};

/** Kelpaako entiteetti attribuutin pooliin (arvo olemassa, flagilla nimenomainen 0/1 ja voittajalla vuodet). */
function kelpaa(e: KEnt, s: Spec, def: KDef): boolean {
  if (s.key === SYNTYMA) return !!e.syntyma?.kaupunki;
  if (def.mode === "category") return e.seurat.length > 0;
  const v = arvo(e, s);
  if (v === undefined || !Number.isFinite(v)) return false;
  if (def.mode === "flag") {
    if (v !== 0 && v !== 1) return false;
    if (v === 1 && FLAG_VUODET[s.key] && !e.d[FLAG_VUODET[s.key]]) return false;
  }
  if (MV_ATTR.has(s.key) && e.paikka !== "mv") return false;
  if (KP_ATTR.has(s.key) && e.paikka !== "kp") return false;
  return true;
}

/* ─── Ero ja vaikeus ───────────────────────────────────────────────── */

const relGap = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1);

function ero(def: KDef, va: number, vb: number): number {
  if (def.gapMode === "absolute") return Math.abs(va - vb) / def.gapDivisor;
  return relGap(va, vb);
}

function eroKelpaa(key: string, def: KDef, g: number): boolean {
  if (key === "liiga_clubs") return g >= 2; // vähintään 2 seuran ero (A2 erityisrajat)
  if (def.maxGap !== null && g > def.maxGap) return false;
  if (def.minGap !== null && g < def.minGap) return false;
  return true;
}

function vaikeusErosta(key: string, def: KDef, g: number): Vaikeus {
  if (key === "liiga_clubs") return "vaikea"; // aina vaikea
  if (def.easyGap !== null && g >= def.easyGap) return "helppo";
  if (def.midGap !== null && g >= def.midGap) return "keski";
  return "vaikea";
}

/* ─── Arvot ja faktalause ──────────────────────────────────────────── */

/** Kannan näyttöarvo kortin arvoriville: sulkulisäykset pois ("210 112 (31.12.2025)" → "210 112"), yli
 *  nelinumeroisiin lukuihin tuhaterotin ("3766 km" → "3 766 km"). Vuosilukuihin ei erotinta. */
export function siistiArvo(nayttö: string, key: string): string {
  // " as." pois: kannassa osa asukasluvuista on "5 600 000 as.", osa ilman, ja kysymys kertoo jo yksikön.
  let t = nayttö.replace(/\s*\([^)]*\)\s*$/, "").replace(/\s+as\.$/, "").trim();
  if (!VUOSI_ATTR.has(key)) t = t.replace(/(^|[^\d,.\u00a0 ])(\d{4,})(?![\d,])/g, (_, a: string, n: string) => `${a}${fiLuku(Number(n))}`);
  return t.replace(/(\d) (\d{3})/g, "$1\u00a0$2");
}

function nayttoarvo(e: KEnt, s: Spec): string {
  if (s.key === "birth") {
    const v = e.v.birth;
    return `s. ${new Date(v * 1000).getUTCFullYear()}`;
  }
  const v = arvo(e, s)!;
  // Maan korkein kohta: kannan näyttöarvossa on huipun nimi ("Qullai Ismoili Somonī, 7 495 m"), joka ei mahdu korttiin.
  // Kortille korkeus, huipun nimi faktalauseeseen ({apvm} = text_value).
  if (s.key === "country_highpoint") return siistiArvo(`${Math.round(v)} m`, s.key);
  if (!s.seura && e.d[s.key]) return siistiArvo(e.d[s.key], s.key);
  if (VUOSI_ATTR.has(s.key)) return String(Math.round(v));
  return fiLuku(v);
}

function flagArvo(e: KEnt, key: string, voittaja: boolean): string {
  const r = FLAG_RIVIT[key] ?? { kylla: "Kyllä", ei: "Ei" };
  const rivi = (x: FlagRivi) => (typeof x === "function" ? x(e) : x);
  if (!voittaja) return rivi(r.ei) ?? "Ei";
  if (FLAG_VUODET[key]) return e.d[FLAG_VUODET[key]] ?? "Voitti";
  return rivi(r.kylla) ?? "Kyllä";
}

function fakta(def: KDef, s: Spec, w: KEnt, l: KEnt, wArvo: string, lArvo: string, x: string): string {
  let eroTxt = "";
  if (s.key === "birth") {
    const y = (l.v.birth - w.v.birth) / VUOSI_S;
    eroTxt = `${Math.round(y)} vuotta`;
  } else if (def.mode === "numeric") {
    eroTxt = fiLuku(Math.abs((arvo(w, s) ?? 0) - (arvo(l, s) ?? 0)));
  }
  const tpl = def.factTemplate ?? (def.mode === "numeric" ? "{a} {aarvo}, {b} {barvo}." : "{a}: {aarvo}. {b}: {barvo}.");
  return tpl
    .replaceAll("{a}", w.nimi).replaceAll("{b}", l.nimi)
    .replaceAll("{aarvo}", wArvo).replaceAll("{barvo}", lArvo)
    .replaceAll("{av}", wArvo).replaceAll("{bv}", lArvo)
    // {apvm}: tarkka päivämäärä tekstiarvosta, jos se on (presidentit "2.3.1925"; kortissa vain vuosi).
    .replaceAll("{apvm}", w.t[s.key] ?? wArvo.replace(/^s\. /, "")).replaceAll("{bpvm}", l.t[s.key] ?? lArvo.replace(/^s\. /, ""))
    .replaceAll("{ero}", eroTxt).replaceAll("{x}", x);
}

/* ─── Arvonta ──────────────────────────────────────────────────────── */

type Rng = () => number;

/** Painotettu sekoitus (Efraimidis–Spirakis): avain = u^(1/w). */
function painotettuJarjestys<T extends { paino: number }>(xs: T[], rng: Rng): T[] {
  return xs
    .map((x) => ({ x, k: Math.pow(rng(), 1 / Math.max(0.05, x.paino)) }))
    .sort((a, b) => b.k - a.k)
    .map((o) => o.x);
}

const pariAvain = (key: string, a: KEnt, b: KEnt) => `${key}|${[a.id, b.id].sort().join("|")}`;

/** Jakson (10 kysymystä) monipuolisuustila. */
export type Jakso = {
  /** Edellisen kysymyksen attribuutti ja montako kertaa se on tullut peräkkäin: enintään kaksi samaa peräkkäin. */
  edellinen: string | null;
  perakkain: number;
  /** Montako samaa attribuuttia saa tulla peräkkäin: 2 perusteemoissa, 1 yhdistelmissä (Yleistieto). */
  maxPerakkain: number;
  attrMaara: Map<string, number>;
  henkiloMaara: Map<string, number>;
  luokkaMaara: Map<KiekkoLuokka, number>;
};
export const uusiJakso = (maxPerakkain = 2): Jakso => ({ edellinen: null, perakkain: 0, maxPerakkain, attrMaara: new Map(), henkiloMaara: new Map(), luokkaMaara: new Map() });

export type Konteksti = {
  data: KumpiData;
  teema: Teema;
  rng: Rng;
  /** Istunnon käytetyt parit (ei toistu koskaan). */
  kaytetyt: Set<string>;
  blocks: Set<string>;
  /** Pooli attribuuteittain (välimuisti). */
  poolit: Map<string, KEnt[]>;
  pohja: KEnt[];
};

export function uusiKonteksti(data: KumpiData, teema: Teema, siemen: string): Konteksti {
  return {
    data, teema, rng: siemenRng(siemen), kaytetyt: new Set(), blocks: new Set(data.blocks),
    poolit: new Map(), pohja: teemanPooli(data, teema),
  };
}

function pooli(ctx: Konteksti, s: Spec, def: KDef): KEnt[] {
  let p = ctx.poolit.get(s.avain);
  if (!p) {
    p = ctx.pohja.filter((e) => kelpaa(e, s, def));
    ctx.poolit.set(s.avain, p);
  }
  return p;
}

/** Teeman käyttökelpoiset attribuuttimääritykset (määrittely olemassa ja pooli ≥ 2). */
export function teemanSpecit(ctx: Konteksti): Spec[] {
  return ctx.teema.attrs
    .map((a) => spec(a, ctx.teema))
    .filter((s) => {
      const def = ctx.data.defs[s.key];
      return !!def && (def.mode === "numeric" || def.mode === "flag" || def.mode === "category") && pooli(ctx, s, def).length >= 2;
    });
}

const MAX_SAMA_ATTR = 2;
const MAX_SAMA_HENKILO = 2;

function henkiloVapaa(j: Jakso, e: KEnt) {
  return (j.henkiloMaara.get(e.ihminen) ?? 0) < MAX_SAMA_HENKILO;
}

/** Yrittää muodostaa yhden kysymyksen annetulla attribuutilla ja vaikeudella. */
function yritaPari(ctx: Konteksti, s: Spec, def: KDef, tavoite: Vaikeus | null, jakso: Jakso): KumpiKysymys | null {
  const { rng } = ctx;
  const p = pooli(ctx, s, def).filter((e) => henkiloVapaa(jakso, e));
  if (p.length < 2) return null;

  if (s.key === SYNTYMA) return yritaSyntyma(ctx, s, def, tavoite, p);
  if (def.mode === "category") return yritaSeura(ctx, s, def, tavoite, jakso, p);

  const ehdokkaat = painotettuJarjestys(p, rng);
  for (let i = 0; i < Math.min(12, ehdokkaat.length); i++) {
    const a = ehdokkaat[i];
    const va = arvo(a, s)!;
    const vastapuolet = painotettuJarjestys(p, rng);
    for (const b of vastapuolet) {
      if (b.id === a.id || b.ihminen === a.ihminen) continue;
      const vb = arvo(b, s)!;
      if (va === vb) continue; // ei tasapelejä
      if (!mittaritSopivat(a.m[s.key], b.m[s.key])) continue;
      let vaikeus: Vaikeus;
      if (def.mode === "flag") {
        vaikeus = "keski";
      } else {
        const g = ero(def, va, vb);
        if (!eroKelpaa(s.key, def, g)) continue;
        vaikeus = vaikeusErosta(s.key, def, g);
      }
      if (tavoite && vaikeus !== tavoite) continue;
      const pk = pariAvain(s.avain, a, b);
      if (ctx.kaytetyt.has(pk) || ctx.blocks.has(pariAvain(s.key, a, b))) continue;
      return rakenna(ctx, s, def, a, b, vaikeus, pk, "");
    }
  }
  return null;
}

/** played_for_club: oikealla played_for-suhde seuraan x, väärällä muita seuroja mutta ei x:ää. */
function yritaSeura(ctx: Konteksti, s: Spec, def: KDef, tavoite: Vaikeus | null, jakso: Jakso, p: KEnt[]): KumpiKysymys | null {
  if (tavoite === "helppo") return null; // seurakysymys on aina keskivaikea
  const seurat = Object.keys(ctx.data.inessiivit);
  for (let yritys = 0; yritys < 20; yritys++) {
    const x = seurat[Math.floor(ctx.rng() * seurat.length)];
    const kylla = painotettuJarjestys(p.filter((e) => e.seurat.includes(x)), ctx.rng);
    const ei = painotettuJarjestys(p.filter((e) => !e.seurat.includes(x)), ctx.rng);
    if (!kylla.length || !ei.length) continue;
    const vaikeus: Vaikeus = "keski";
    if (tavoite && tavoite !== vaikeus) return null;
    for (const w of kylla.slice(0, 6)) {
      for (const l of ei.slice(0, 20)) {
        if (w.ihminen === l.ihminen) continue;
        const pk = `${pariAvain(s.avain, w, l)}|${x}`;
        if (ctx.kaytetyt.has(pk) || ctx.blocks.has(pariAvain(s.key, w, l))) continue;
        const [a, b] = ctx.rng() < 0.5 ? [w, l] : [l, w];
        return rakenna(ctx, s, def, a, b, vaikeus, pk, x);
      }
    }
  }
  return null;
}

/** born_in (Heikki 24.11.2026): "Kumpi heistä on syntynyt Tampereella?" Oikealla tarkka born_in kaupunkiin x, väärällä
 *  tunnettu syntymäpaikka muualla. Vanhassa, kaupunkiin liitetyssä kunnassa syntynyt ei ole kummallakaan puolella.
 *  Kysytään vain kaupunkeja, joilla on inessiivi (taulu kaupungit). Aina keskivaikea, kuten seurakysymys. */
const SYNTYMA = "born_in_city";

function yritaSyntyma(ctx: Konteksti, s: Spec, def: KDef, tavoite: Vaikeus | null, p: KEnt[]): KumpiKysymys | null {
  if (tavoite && tavoite !== "keski") return null;
  const kaupungit = [...new Set(p.filter((e) => e.syntyma!.tarkka && ctx.data.kaupunkiInessiivit[e.syntyma!.kaupunki]).map((e) => e.syntyma!.kaupunki))];
  for (let yritys = 0; yritys < 20 && kaupungit.length; yritys++) {
    const x = kaupungit[Math.floor(ctx.rng() * kaupungit.length)];
    const kylla = painotettuJarjestys(p.filter((e) => e.syntyma!.tarkka && e.syntyma!.kaupunki === x), ctx.rng);
    const ei = painotettuJarjestys(p.filter((e) => e.syntyma!.kaupunki !== x), ctx.rng);
    for (const w of kylla.slice(0, 6)) {
      for (const l of ei.slice(0, 20)) {
        if (w.ihminen === l.ihminen) continue;
        const pk = `${pariAvain(s.avain, w, l)}|${x}`;
        if (ctx.kaytetyt.has(pk) || ctx.blocks.has(pariAvain(s.key, w, l))) continue;
        const [a, b] = ctx.rng() < 0.5 ? [w, l] : [l, w];
        return rakenna(ctx, s, def, a, b, "keski", pk, x);
      }
    }
  }
  return null;
}

/** Kortin arvorivi syntymäpaikkakysymyksessä: "Syntynyt Kuopiossa", tai "Syntynyt muualla", jos kaupungin inessiiviä ei ole
 *  tai syntymäkunta on myöhemmin liitetty kaupunkiin. */
function syntymaRivi(ctx: Konteksti, e: KEnt): string {
  const ines = e.syntyma?.tarkka ? ctx.data.kaupunkiInessiivit[e.syntyma.kaupunki] : undefined;
  return ines ? `Syntynyt ${ines}` : "Syntynyt muualla";
}

function rakenna(ctx: Konteksti, s: Spec, def: KDef, a: KEnt, b: KEnt, vaikeus: Vaikeus, pk: string, x: string): KumpiKysymys {
  const ines = s.key === SYNTYMA
    ? ctx.data.kaupunkiInessiivit[x] ?? x
    : x ? ctx.data.inessiivit[x] ?? x : s.seura ? ctx.data.inessiivit[s.seura] ?? s.seura : "";

  let aVoittaa: boolean;
  let aArvo: string;
  let bArvo: string;
  if (s.key === SYNTYMA) {
    aVoittaa = a.syntyma?.kaupunki === x;
    aArvo = syntymaRivi(ctx, a);
    bArvo = syntymaRivi(ctx, b);
  } else if (def.mode === "category") {
    aVoittaa = a.seurat.includes(x);
    aArvo = aVoittaa ? `Pelasi ${ines}` : `Ei ole pelannut ${ines}`;
    bArvo = aVoittaa ? `Ei ole pelannut ${ines}` : `Pelasi ${ines}`;
  } else if (def.mode === "flag") {
    aVoittaa = arvo(a, s) === 1;
    aArvo = flagArvo(a, s.key, aVoittaa);
    bArvo = flagArvo(b, s.key, !aVoittaa);
  } else {
    const va = arvo(a, s)!;
    const vb = arvo(b, s)!;
    aVoittaa = def.winner === "low" ? va < vb : va > vb;
    aArvo = nayttoarvo(a, s);
    bArvo = nayttoarvo(b, s);
  }

  // Vastakkainen suunta puolessa kysymyksistä (Heikki 20.11.2026): "Kumpi on pienempi?" → oikea on pienempi.
  // Faktalause pysyy luonnollisessa suunnassa (w = määrittelyn voittaja), koska pohjat on kirjoitettu niin.
  const kaanteinen = def.mode === "numeric" && !!def.kaanteinen && ctx.rng() < 0.5;
  const oikeaA = kaanteinen ? !aVoittaa : aVoittaa;

  // Kysymyslause: paikkamerkit ensin, sitten seurakohtaisille seuran inessiivi ("… Tapparassa?").
  let lause = (kaanteinen ? def.kaanteinen! : def.kysymys).replaceAll("{x_inessive}", ines).replaceAll("{x}", x);
  if (s.seura) {
    // Seura kertoo jo sarjan: "[Liiga-otteluita]" → "[otteluita] Tapparassa" (lyhyempi, mahtuu korttisääntöön).
    lause = lause.replace(/\[Liiga-/, "[");
    lause = / Liigassa(?=[?\s\]])/.test(lause) ? lause.replace(/ Liigassa(?=[?\s\]])/, ` ${ines}`) : lause.replace(/\?$/, ` ${ines}?`);
  }
  const osat = jaaKysymys(lause);

  // Kuvasääntö: kuvat vain teemoissa, joissa jokaisessa kysymyksessä on kuva (Teema.kuvat), ja silloinkin vain jos
  // molemmilla on kuva.
  const kuvat = !!ctx.teema.kuvat && !!a.kuva && !!b.kuva;
  const [la, lb] = lyhytNimet(a, b);
  const vaihtoehto = (e: KEnt, lyhyt: string, arvoTxt: string): Vaihtoehto => ({
    id: e.id, nimi: e.nimi, lyhyt, kuva: kuvat ? e.kuva : null, arvo: arvoTxt,
  });

  const w = aVoittaa ? a : b;
  const l = aVoittaa ? b : a;
  return {
    pari: pk,
    attr: s.key,
    teema: ctx.teema.slug,
    osat,
    lause: kokoLause(osat),
    listalause: listalause(kokoLause(osat), la, lb),
    vaihtoehdot: [vaihtoehto(a, la, aArvo), vaihtoehto(b, lb, bArvo)],
    oikea: oikeaA ? 0 : 1,
    kaanteinen,
    vaikeus,
    arvoTyyppi: def.mode === "numeric" ? "luku" : "lause",
    fakta: fakta(def, s, w, l, aVoittaa ? aArvo : bArvo, aVoittaa ? bArvo : aArvo, ines || x),
  };
}

function kirjaa(ctx: Konteksti, jakso: Jakso, q: KumpiKysymys, a: KEnt, b: KEnt) {
  ctx.kaytetyt.add(q.pari);
  jakso.perakkain = jakso.edellinen === q.attr ? jakso.perakkain + 1 : 1;
  jakso.edellinen = q.attr;
  jakso.attrMaara.set(q.attr, (jakso.attrMaara.get(q.attr) ?? 0) + 1);
  for (const e of [a, b]) jakso.henkiloMaara.set(e.ihminen, (jakso.henkiloMaara.get(e.ihminen) ?? 0) + 1);
  const luokka = KIEKKO_LUOKKA[q.attr];
  if (luokka) jakso.luokkaMaara.set(luokka, (jakso.luokkaMaara.get(luokka) ?? 0) + 1);
}

/**
 * Yksi kysymys tavoitevaikeudella. Monipuolisuus: sama attribuutti ≤ 2 ja sama henkilö ≤ 2 jaksossa, ikä ≤ 1,
 * jääkiekossa jakauma 3 tilasto + 3 ura + 2 saavutus + 2 tausta (pehmeä: jos luokasta ei synny kysymystä, otetaan muu).
 */
export function teeKysymys(ctx: Konteksti, tavoite: Vaikeus, jakso: Jakso, specit = teemanSpecit(ctx)): KumpiKysymys | null {
  const kiekko = onKiekko(ctx.teema);
  // Sama attribuutti ≤ 2 jaksossa ja ikä ≤ 1 koskevat monen attribuutin teemoja. Teemassa, jossa on vain 1–4
  // attribuuttia (Järvet: pinta-ala), raja venyy niin, että kymmenen kysymyksen kierros on mahdollinen.
  const maxAttr = Math.max(MAX_SAMA_ATTR, Math.ceil(KIERROS_KAAVA.length / Math.max(1, specit.length)));
  const sallittu = (s: Spec) => {
    const n = jakso.attrMaara.get(s.key) ?? 0;
    if (n >= maxAttr) return false;
    if (s.key === "birth" && specit.length > 4 && n >= 1) return false; // ikä enintään kerran
    return true;
  };
  const luokkaVapaa = (s: Spec) => {
    const l = KIEKKO_LUOKKA[s.key];
    return !l || (jakso.luokkaMaara.get(l) ?? 0) < KIEKKO_JAKAUMA[l];
  };
  const ehdokkaat = specit.filter(sallittu);
  // Testipalaute 20.11.: "ei koskaan peräkkäin" teki kahden attribuutin teemoista tasaisen vuorottelun → enintään 2 peräkkäin.
  const eriKuinEdellinen = (s: Spec) => s.key !== jakso.edellinen || jakso.perakkain < jakso.maxPerakkain;
  const vaihtelevat = ehdokkaat.some(eriKuinEdellinen) ? ehdokkaat.filter(eriKuinEdellinen) : ehdokkaat;
  const ensisijaiset = kiekko ? vaihtelevat.filter(luokkaVapaa) : vaihtelevat;

  // Jääkiekossa luokka arvotaan ensin, jotta luokat painottuvat tasaisesti eivätkä attribuuttien määrän mukaan.
  const jarjesta = (xs: Spec[]): Spec[] => {
    if (!kiekko) return painotettuJarjestys(xs.map((s) => ({ s, paino: 1 })), ctx.rng).map((o) => o.s);
    const luokat = [...new Set(xs.map((s) => KIEKKO_LUOKKA[s.key] ?? "tilasto"))];
    const lj = painotettuJarjestys(luokat.map((l) => ({ l, paino: 1 })), ctx.rng).map((o) => o.l);
    return lj.flatMap((l) =>
      painotettuJarjestys(xs.filter((s) => (KIEKKO_LUOKKA[s.key] ?? "tilasto") === l).map((s) => ({ s, paino: 1 })), ctx.rng).map((o) => o.s),
    );
  };

  const vaiheet: Array<{ xs: Spec[]; t: Vaikeus | null }> = [
    { xs: ensisijaiset, t: tavoite },
    { xs: vaihtelevat, t: tavoite },
    { xs: ehdokkaat, t: tavoite },
    { xs: ehdokkaat, t: tavoite === "vaikea" ? "keski" : tavoite === "helppo" ? "keski" : "helppo" },
    { xs: ehdokkaat, t: null },
  ];
  for (const v of vaiheet) {
    for (const s of jarjesta(v.xs)) {
      const def = ctx.data.defs[s.key];
      const q = yritaPari(ctx, s, def, v.t, jakso);
      if (q) {
        const ent = new Map(ctx.pohja.map((e) => [e.id, e]));
        kirjaa(ctx, jakso, q, ent.get(q.vaihtoehdot[0].id)!, ent.get(q.vaihtoehdot[1].id)!);
        return q;
      }
    }
  }
  return null;
}

/** Kierros ja Päivän Kumpi?: 4 helppoa → 4 keskivaikeaa → 2 vaikeaa. */
export const KIERROS_KAAVA: Vaikeus[] = ["helppo", "helppo", "helppo", "helppo", "keski", "keski", "keski", "keski", "vaikea", "vaikea"];

export function teeKierros(data: KumpiData, teema: Teema, siemen: string): KumpiKysymys[] {
  return teeJakso(uusiKierrosTila(data, teema, siemen));
}

/* ─── Kierroksen tila: perus- tai yhdistelmäteema + visakysymykset ─── */

export type KierrosTila = {
  teema: Teema;
  perus: { ctx: Konteksti; specit: Spec[] } | null;
  sek: Sekoitus | null;
  visat: KVisa[];
  visaRng: Rng;
  visaKaytetyt: Set<string>;
};

export function uusiKierrosTila(data: KumpiData, teema: Teema, siemen: string): KierrosTila {
  let perus: KierrosTila["perus"] = null;
  if (!teema.osat) {
    const ctx = uusiKonteksti(data, teema, siemen);
    perus = { ctx, specit: teemanSpecit(ctx) };
  }
  return {
    teema, perus, sek: teema.osat ? uusiSekoitus(data, teema, siemen) : null,
    visat: teemanVisat(data, teema), visaRng: siemenRng(`${siemen}-visa`), visaKaytetyt: new Set(),
  };
}

/** Yksi kymmenen kysymyksen jakso (kierros). Visakysymyksiä enintään 3 (Heikki 20.11.2026) ennalta arvotuissa
 *  paikoissa; ensimmäinen kysymys on aina vertailu. Jos visakysymystä ei löydy, paikalle tulee vertailu. */
export function teeJakso(tila: KierrosTila, kaava: Vaikeus[] = KIERROS_KAAVA): KumpiKysymys[] {
  const jakso = uusiJakso(tila.sek ? 1 : 2);
  tila.sek?.ryhmaMaara.clear();
  const vapaat = tila.visat.filter((v) => !tila.visaKaytetyt.has(v.id)).length;
  const paikat = visaPaikat(vapaat, tila.visaRng);
  const out: KumpiKysymys[] = [];
  kaava.forEach((t, i) => {
    if (paikat.has(i)) {
      const v = teeVisaKysymys(tila, t);
      if (v) { out.push(v); return; }
    }
    const q = tila.sek ? teeSekoitusKysymys(tila.sek, t, jakso) : tila.perus ? teeKysymys(tila.perus.ctx, t, jakso, tila.perus.specit) : null;
    if (q) out.push(q);
  });
  return out;
}

/* ─── Visakysymykset (kumpi_visakysymykset) ────────────────────────── */

export const VISA_MAX = 3;

/** Teeman visakysymykset. Yleistieto: kaikki paitsi pelkästään seurakohtaiset; muut: oma slug teemat-listassa. */
export function teemanVisat(data: KumpiData, teema: Teema): KVisa[] {
  if (teema.slug === "yleistieto") return data.visat.filter((v) => v.teemat.some((t) => !t.startsWith("seura-")));
  return data.visat.filter((v) => v.teemat.includes(teema.slug));
}

/** Visakysymysten paikat (0-pohjainen): 3 kappaletta, kun niitä on runsaasti, muuten vähemmän; tasaisesti kierrokselle. */
function visaPaikat(vapaat: number, rng: Rng): Set<number> {
  const k = Math.min(VISA_MAX, vapaat >= 15 ? 3 : vapaat >= 6 ? 2 : vapaat >= 2 ? 1 : 0);
  const alueet = k === 3 ? [[1, 3], [4, 6], [7, 9]] : k === 2 ? [[2, 4], [6, 8]] : k === 1 ? [[3, 7]] : [];
  return new Set(alueet.map(([a, b]) => a + Math.floor(rng() * (b - a + 1))));
}

function teeVisaKysymys(tila: KierrosTila, tavoite: Vaikeus): KumpiKysymys | null {
  const vapaat = tila.visat.filter((v) => !tila.visaKaytetyt.has(v.id));
  if (!vapaat.length) return null;
  const sopivat = vapaat.filter((v) => v.vaikeus === tavoite);
  const lista = sopivat.length ? sopivat : vapaat;
  const v = lista[Math.floor(tila.visaRng() * lista.length)];
  tila.visaKaytetyt.add(v.id);
  const oikeaEnsin = tila.visaRng() < 0.5;
  const o: Vaihtoehto = { id: `${v.id}-o`, nimi: v.oikea, lyhyt: v.oikea, kuva: null, arvo: v.oikeaFakta ?? "" };
  const w: Vaihtoehto = { id: `${v.id}-v`, nimi: v.vaara, lyhyt: v.vaara, kuva: null, arvo: v.vaaraFakta ?? "" };
  const osat = jaaKysymys(v.kysymys);
  const lause = kokoLause(osat);
  return {
    pari: `visa|${v.id}`,
    attr: "visa",
    teema: tila.teema.slug,
    osat,
    lause,
    listalause: listalause(lause, oikeaEnsin ? v.oikea : v.vaara, oikeaEnsin ? v.vaara : v.oikea),
    vaihtoehdot: oikeaEnsin ? [o, w] : [w, o],
    oikea: oikeaEnsin ? 0 : 1,
    kaanteinen: false,
    vaikeus: v.vaikeus,
    arvoTyyppi: "lause",
    fakta: v.oikeaFakta ? `${v.oikea}: ${v.oikeaFakta}.` : `Oikea vastaus on ${v.oikea}.`,
  };
}

/** Putken vaikeus kysymysnumerolla (1-pohjainen): 1–5 helppo, 6–15 helppo/keski, 16–25 keski, 26– keski/vaikea. */
export function putkenVaikeus(n: number, rng: Rng): Vaikeus {
  if (n <= 5) return "helppo";
  if (n <= 15) return rng() < 0.5 ? "helppo" : "keski";
  if (n <= 25) return "keski";
  return rng() < 0.5 ? "keski" : "vaikea";
}

/**
 * Putki (Heikki 17.11.2026): loputon jono, jossa vaikeus nousee kysymysnumeron mukaan (putkenVaikeus). Kysymykset
 * syntyvät kymmenen kysymyksen jaksoina samasta kierrostilasta, joten monipuolisuussäännöt pätevät jokaiseen
 * kymmenikköön, eikä sama pari toistu koskaan (konteksti muistaa käytetyt). Sama siemen antaa saman jonon, joten
 * palvelin voi antaa jatkoa (alku, määrä) laskemalla jonon uudelleen.
 */
export function teePutki(data: KumpiData, teema: Teema, siemen: string, maara: number): KumpiKysymys[] {
  const tila = uusiKierrosTila(data, teema, siemen);
  const rng = siemenRng(`${siemen}-putki`);
  const out: KumpiKysymys[] = [];
  while (out.length < maara) {
    const kaava = KIERROS_KAAVA.map((_, j) => putkenVaikeus(out.length + j + 1, rng));
    const jakso = teeJakso(tila, kaava);
    if (!jakso.length) break; // pooli loppui
    out.push(...jakso);
  }
  return out.slice(0, maara);
}

/* ─── Yhdistelmäteemat (Yleistieto, Ihmiset, Urheilu) ──────────────── */

export type Sekoitus = {
  osat: Array<{ ctx: Konteksti; specit: Spec[]; paino: number }>;
  rng: Rng;
  /** Montako kysymystä kustakin ryhmästä tässä jaksossa. */
  ryhmaMaara: Map<string, number>;
};

export function uusiSekoitus(data: KumpiData, teema: Teema, siemen: string): Sekoitus {
  const osat = (teema.osat ?? [])
    .map((slug) => mikaTahansaTeema(slug))
    .filter((t): t is Teema => !!t && !t.osat)
    .map((t) => {
      const ctx = uusiKonteksti(data, t, `${siemen}-${t.slug}`);
      const specit = teemanSpecit(ctx);
      // Tasapaino osien välillä (Ihmiset: tunnetut suomalaiset ja politiikka puoliksi), ei attribuuttien määrän mukaan.
      // Teeman oma paino (Liiga-seurat 0,4: 17 seuraa vs. satoja pelaajia) pienentää osan osuutta.
      return { ctx, specit, paino: t.paino ?? 1 };
    })
    .filter((o) => o.specit.length > 0);
  return { osat, rng: siemenRng(`${siemen}-sekoitus`), ryhmaMaara: new Map() };
}

/**
 * Yksi kysymys yhdistelmästä. Monta ryhmää (Yleistieto): ensin arvotaan ryhmä tasaisesti niistä, joiden kiintiö ei ole
 * täynnä (jääkiekko ≤ 2, muut ≤ 3 jaksossa), sitten ryhmän teema tasaisesti. Yksi ryhmä (Ihmiset, Urheilu): osat
 * tasaisesti. Jakso on yhteinen, joten attribuutti- ja henkilörajat pätevät koko kierrokseen, eikä sama
 * kysymystyyppi tule peräkkäin.
 */
export function teeSekoitusKysymys(sek: Sekoitus, tavoite: Vaikeus, jakso: Jakso): KumpiKysymys | null {
  const ryhmat = [...new Set(sek.osat.map((o) => o.ctx.teema.ryhma))];
  const monta = ryhmat.length > 1;
  const vapaa = (r: string) => !monta || (sek.ryhmaMaara.get(r) ?? 0) < (RYHMAN_MAKSIMI[r as Teema["ryhma"]] ?? RYHMAN_OLETUSMAKSIMI);
  const ryhmaJarj = painotettuJarjestys(ryhmat.filter(vapaa).map((r) => ({ r, paino: 1 })), sek.rng).map((x) => x.r);
  for (const r of ryhmaJarj) {
    const osat = painotettuJarjestys(sek.osat.filter((o) => o.ctx.teema.ryhma === r), sek.rng);
    for (const o of osat) {
      const q = teeKysymys(o.ctx, tavoite, jakso, o.specit);
      if (q) {
        sek.ryhmaMaara.set(r, (sek.ryhmaMaara.get(r) ?? 0) + 1);
        return q;
      }
    }
  }
  return null;
}

