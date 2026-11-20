// KUMPI? 2.0 — laatuportti (brief A5). Puhdas: data → raportti. Ajetaan skriptillä scripts/kumpi-laatu.ts ja
// esikatselun rajapinnassa /api/kumpi/laatu (palvelimella service role -datalla; tuotannossa 404).

import { FLAG_VUODET, KIERROS_KAAVA, teeKysymys, teemanPooli, uusiJakso, uusiKonteksti, teemanSpecit } from "./generate";
import { KAIKKI_TEEMAT, KP_ATTR, MV_ATTR, type Teema } from "./teemat";
import type { KEnt, KumpiData, KumpiKysymys } from "./tyypit";

/** Kysymyksen enimmäispituus (merkkiä) ja nimen pisimmän sanan enimmäispituus korttisäännön rajoissa:
 *  kysymys mahtuu 26 px:iin neljälle riville @320. Nimen pisin sana (Kristiinankaupunki 18) mahtuu kuvattomaan korttiin
 *  @320 noin 18 px:llä; sovitus pienentää tarvittaessa alle 20 px:n (KumpiKierros), joten nimi ei koskaan leikkaudu. */
export const MAX_KYSYMYS = 64;
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

export function tarkistaKysymys(q: KumpiKysymys, data: KumpiData, teema: Teema, ent: Map<string, KEnt>): string[] {
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
      if ((aVoittaa ? 0 : 1) !== q.oikea) v.push(`väärä oikea vastaus (${nimi})`);
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
export function tarkistaTeema(data: KumpiData, teema: Teema, n = 500, siemen = "laatu"): { raportti: TeemaRaportti; kysymykset: KumpiKysymys[] } {
  const ctx = uusiKonteksti(data, teema, `${siemen}-${teema.slug}`);
  const specit = teemanSpecit(ctx);
  const ent = new Map(data.entities.map((e) => [e.id, e]));
  const kysymykset: KumpiKysymys[] = [];
  let tyhjat = 0;
  while (kysymykset.length < n && tyhjat < 10) {
    const jakso = uusiJakso();
    let tassa = 0;
    for (const t of KIERROS_KAAVA) {
      const q = teeKysymys(ctx, t, jakso, specit);
      if (q) { kysymykset.push(q); tassa++; }
    }
    if (tassa < KIERROS_KAAVA.length) tyhjat++;
  }
  const virheet = kysymykset.flatMap((q) => tarkistaKysymys(q, data, teema, ent));
  const vaikeudet: Record<string, number> = {};
  for (const q of kysymykset) vaikeudet[q.vaikeus] = (vaikeudet[q.vaikeus] ?? 0) + 1;
  return {
    raportti: {
      slug: teema.slug, nimi: teema.nimi, pooli: teemanPooli(data, teema).length,
      attribuutit: specit.map((s) => s.avain), kysymyksia: kysymykset.length, vaikeudet,
      virheet: [...new Set(virheet)].slice(0, 30),
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
  const kaikki = teemat.flatMap((t, k) => t.kysymykset.map((q, j) => ({ q, jarj: j * 100 + ((k * 7) % 100) })));
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
