// KUMPI? 2.0 — laatuportti (brief A5). Puhdas: data → raportti. Ajetaan skriptillä scripts/kumpi-laatu.ts ja
// esikatselun rajapinnassa /api/kumpi/laatu (palvelimella service role -datalla; tuotannossa 404).

import { FLAG_VUODET, KIERROS_KAAVA, VISA_MAX, teeJakso, teemanPooli, uusiKierrosTila } from "./generate";
import { KAIKKI_TEEMAT, KP_ATTR, MV_ATTR, RYHMAN_MAKSIMI, mikaTahansaTeema, type Teema } from "./teemat";
import type { KEnt, KumpiData, KumpiKysymys } from "./tyypit";

/** Kysymyksen enimmäispituus (merkkiä) ja nimen pisimmän sanan enimmäispituus korttisäännön rajoissa:
 *  kysymys mahtuu 26 px:iin neljälle riville @320. Nimen pisin sana (Kristiinankaupunki 18) mahtuu kuvattomaan korttiin
 *  @320 noin 18 px:llä; sovitus pienentää tarvittaessa alle 20 px:n (KumpiKierros), joten nimi ei koskaan leikkaudu. */
export const MAX_KYSYMYS = 66;
export const MAX_SANA = 18;

export type TeemaRaportti = {
  slug: string;
  nimi: string;
  pooli: number;
  attribuutit: string[];
  kysymyksia: number;
  vaikeudet: Record<string, number>;
  virheet: string[];
};

function arvo(e: KEnt, avain: string, teema: Teema): number | undefined {
  const [key, mod] = avain.split("@");
  if (mod === "seura" && teema.pooli.tapa === "seura") return e.s[teema.pooli.seura]?.[key];
  return e.v[key];
}

/** Visakysymyksen tarkistukset: lause, avainsana, nimien ja faktojen pituus, ei vastausvuotoa. */
function tarkistaVisa(q: KumpiKysymys): string[] {
  const v: string[] = [];
  const [a, b] = q.vaihtoehdot;
  const nimi = `visa: ${q.lause}`;
  if (!q.osat.avain) v.push(`avainsana puuttuu (${nimi})`);
  if (q.lause.length > MAX_KYSYMYS) v.push(`kysymys liian pitkä ${q.lause.length} (${nimi})`);
  if (!/^Kum/.test(q.lause)) v.push(`ei ala kumpi-sanalla (${nimi})`);
  if (a.nimi === b.nimi) v.push(`sama nimi kahdesti (${nimi})`);
  for (const x of q.vaihtoehdot) {
    if (x.nimi.length > 30) v.push(`nimi liian pitkä: ${x.nimi}`);
    if (x.arvo.length > 28) v.push(`fakta liian pitkä: ${x.arvo}`);
    const pisin = Math.max(...x.nimi.split(/[\s\-–]+/).map((w) => w.length));
    if (pisin > MAX_SANA) v.push(`nimen sana liian pitkä: ${x.nimi}`);
  }
  const oikea = q.vaihtoehdot[q.oikea].nimi.toLowerCase();
  if (oikea.length > 3 && q.lause.toLowerCase().includes(oikea)) v.push(`vastaus vuotaa kysymyksestä (${nimi})`);
  return v;
}

export function tarkistaKysymys(q: KumpiKysymys, data: KumpiData, teema: Teema, ent: Map<string, KEnt>): string[] {
  if (q.attr === "visa") return tarkistaVisa(q);
  const v: string[] = [];
  const [a, b] = q.vaihtoehdot.map((x) => ent.get(x.id)!);
  const avain = q.pari.split("|")[0];
  const def = data.defs[q.attr];
  const nimi = `${q.attr}: ${a.nimi} – ${b.nimi}`;
  if (a.ihminen === b.ihminen) v.push(`same_as samassa kysymyksessä (${nimi})`);
  if (MV_ATTR.has(q.attr) && (a.paikka !== "mv" || b.paikka !== "mv")) v.push(`maalivahtisääntö (${nimi})`);
  if (KP_ATTR.has(q.attr) && (a.paikka !== "kp" || b.paikka !== "kp")) v.push(`kenttäpelaajasääntö (${nimi})`);
  if (def.mode === "numeric") {
    const va = arvo(a, avain, teema);
    const vb = arvo(b, avain, teema);
    if (va === undefined || vb === undefined) v.push(`arvo puuttuu (${nimi})`);
    else if (va === vb) v.push(`tasapeli (${nimi})`);
    else {
      const aVoittaa = def.winner === "low" ? va < vb : va > vb;
      const aOikea = q.kaanteinen ? !aVoittaa : aVoittaa;
      if ((aOikea ? 0 : 1) !== q.oikea) v.push(`väärä oikea vastaus (${nimi}${q.kaanteinen ? ", käänteinen" : ""})`);
      if (q.kaanteinen && !def.kaanteinen) v.push(`käänteinen ilman käänteistä lausetta (${nimi})`);
    }
  }
  if (def.mode === "flag") {
    const va = arvo(a, avain, teema);
    const vb = arvo(b, avain, teema);
    if (!((va === 1 && vb === 0) || (va === 0 && vb === 1))) v.push(`kyllä/ei-pari ei ole 1/0 (${nimi})`);
    const w = q.oikea === 0 ? a : b;
    if (FLAG_VUODET[q.attr] && !w.d[FLAG_VUODET[q.attr]]) v.push(`voittajalta puuttuu vuosiattribuutti (${nimi})`);
    const l = q.vaihtoehdot[1 - q.oikea];
    if (/^Ei voittanut|^Kyllä$|^Ei$/.test(l.arvo) || /^Kyllä$|^Ei$/.test(q.vaihtoehdot[q.oikea].arvo)) v.push(`kielletty arvorivi (${nimi})`);
  }
  // Arvo ja faktalause täsmäävät: kortin arvorivi esiintyy faktassa (numeeriset ja seurat).
  if (def.mode === "numeric") {
    const norm = (t: string) => t.replace(/[\s\u00a0]/g, "");
    for (const x of q.vaihtoehdot) if (!norm(q.fakta).includes(norm(x.arvo.replace(/^s\. /, "")))) v.push(`arvo "${x.arvo}" puuttuu faktasta (${nimi}): ${q.fakta}`);
  }
  // Kuvasääntö.
  if (!!q.vaihtoehdot[0].kuva !== !!q.vaihtoehdot[1].kuva) v.push(`kuvasääntö (${nimi})`);
  // Korttisäännön rajat.
  if (q.lause.length > MAX_KYSYMYS) v.push(`kysymys liian pitkä ${q.lause.length} (${q.lause})`);
  for (const x of q.vaihtoehdot) {
    const pisin = Math.max(...x.nimi.split(/[\s\-–]+/).map((s) => s.length));
    if (pisin > MAX_SANA) v.push(`nimen sana liian pitkä: ${x.nimi}`);
  }
  // Vuosiluvussa ei tuhaterotinta.
  for (const x of q.vaihtoehdot) if (/^(1[0-9]|20) \d{2}$/.test(x.arvo)) v.push(`vuosiluku erottimella "${x.arvo}"`);
  if (!q.osat.avain) v.push(`avainsana puuttuu (${q.lause})`);
  return v;
}

/** Generoi teemasta enintään `n` kysymystä (kymmenen jaksoina, ei toistuvia pareja) ja tarkistaa ne. */
/** Generoi teemasta enintään `n` kysymystä (kymmenen jaksoina, ei toistuvia pareja) ja tarkistaa ne.
 *  Yhdistelmäteemassa (osat) kukin kysymys tarkistetaan oman perusteemansa säännöillä, ja jääkiekon kiintiö
 *  (≤ 2/10 Yleistiedossa) tarkistetaan jaksoittain. */
export function tarkistaTeema(data: KumpiData, teema: Teema, n = 500, siemen = "laatu"): { raportti: TeemaRaportti; kysymykset: KumpiKysymys[] } {
  const ent = new Map(data.entities.map((e) => [e.id, e]));
  const kysymykset: KumpiKysymys[] = [];
  const virheet: string[] = [];
  let tyhjat = 0;
  const tila = uusiKierrosTila(data, teema, `${siemen}-${teema.slug}`);
  const attribuutit = tila.sek
    ? tila.sek.osat.flatMap((o) => o.specit.map((s) => `${o.ctx.teema.slug}:${s.avain}`))
    : tila.perus?.specit.map((s) => s.avain) ?? [];
  const pooli = tila.sek ? tila.sek.osat.reduce((x, o) => x + o.ctx.pohja.length, 0) : teemanPooli(data, teema).length;
  while (kysymykset.length < n && tyhjat < 10) {
    const tassa = teeJakso(tila);
    if (tassa.length < KIERROS_KAAVA.length) tyhjat++;
    const visoja = tassa.filter((q) => q.attr === "visa").length;
    if (visoja > VISA_MAX) virheet.push(`visakysymyksiä ${visoja}/10 jaksossa`);
    if (tila.sek) {
      const ryhmia = new Set(tassa.filter((q) => q.attr !== "visa").map((q) => mikaTahansaTeema(q.teema)?.ryhma));
      const kiekko = tassa.filter((q) => q.attr !== "visa" && mikaTahansaTeema(q.teema)?.ryhma === "jaakiekko").length;
      if (ryhmia.size > 1 && kiekko > (RYHMAN_MAKSIMI.jaakiekko ?? 99)) virheet.push(`jääkiekkoa ${kiekko}/10 jaksossa`);
    }
    kysymykset.push(...tassa);
  }
  for (const q of kysymykset) virheet.push(...tarkistaKysymys(q, data, mikaTahansaTeema(q.teema) ?? teema, ent));
  const vaikeudet: Record<string, number> = {};
  for (const q of kysymykset) vaikeudet[q.vaikeus] = (vaikeudet[q.vaikeus] ?? 0) + 1;
  const kaanteisia = kysymykset.filter((q) => q.kaanteinen).length;
  const visoja = kysymykset.filter((q) => q.attr === "visa").length;
  return {
    raportti: {
      slug: teema.slug, nimi: teema.nimi, pooli, attribuutit, kysymyksia: kysymykset.length,
      vaikeudet: { ...vaikeudet, kaanteisia, visoja }, virheet: [...new Set(virheet)].slice(0, 30),
    },
    kysymykset,
  };
}

export function laatuportti(data: KumpiData, n = 500) {
  const teemat = KAIKKI_TEEMAT().map((t) => tarkistaTeema(data, t, n));
  // 30 kysymyksen otos raporttiin: ensin yksi kysymys jokaisesta attribuutista (teemat vuorotellen, eri vaikeudet),
  // sitten täytetään. Näin otoksessa näkyvät myös harvinaiset tyypit (kyllä/ei, seurakysymys).
  const otos: KumpiKysymys[] = [];
  const nahty = new Set<string>();
  // Järjestys: teemat vuorotellen ja jakson paikka kiertäen (teema k aloittaa paikasta 3k mod 10) → eri vaikeuksia.
  const kaikki = teemat.flatMap((t, k) => t.kysymykset.map((q, j) => ({ q, jarj: (((j % 10) + 10 - ((k * 3) % 10)) % 10) * 100_000 + Math.floor(j / 10) * 100 + k })));
  kaikki.sort((a, b) => a.jarj - b.jarj);
  for (const { q } of kaikki) {
    if (otos.length >= 30) break;
    if (nahty.has(q.attr)) continue;
    nahty.add(q.attr);
    otos.push(q);
  }
  for (const { q } of kaikki) {
    if (otos.length >= 30) break;
    if (!otos.includes(q) && q.vaikeus !== "helppo") otos.push(q);
  }
  return { teemat: teemat.map((t) => t.raportti), otos };
}
