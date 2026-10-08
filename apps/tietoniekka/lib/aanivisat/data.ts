// ÄÄNIVISAT — palvelimen datahaku (brief §2.2, §4). Viikkosetti tulee kannan funktiosta
// aanivisa_viikon_aanet() (supabase/migrations/20261103_aanivisat.sql): 10 ääntä, 3+5+2, sama kaikille,
// vaihtuu maanantaina Suomen aikaa.
//
// Julkaisu: tuotanto näyttää vain active=true -äänet. Vercelin preview (VERCEL_ENV != production) ja
// paikallinen kehitys näyttävät myös active=false-äänet, jotta Heikki voi hyväksyä äänivisan ennen
// aktivointia; esikatselun setti lasketaan samalla arvonnalla mutta sitä ei tallenneta.
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import {
  AANI_RYHMAT, AANIVISA_MIN, type AaniKysymys, type AaniRyhma, type AaniViikko, type RyhmaMeta, type SonoTick,
} from "@/lib/aanivisat";

export const esikatselu = () => process.env.VERCEL_ENV !== "production";

type Rivi = {
  id: string; ryhma: string; laji: string; tieteellinen: string | null; aanityyppi: string | null; vaikeus: string;
  similarity_group: string | null; distractor_pool: unknown; fakta: string | null;
  audio_url: string; jakso_s: number | string; tauko_s: number | string; sono_url: string; sono_ticks: unknown;
  aani_tekija: string; aani_lisenssi: string; aani_lahde_url: string; aani_havainto_url: string | null; aani_maa: string | null;
  kuva_url: string | null; kuva_tekija: string | null; kuva_lisenssi: string | null; kuva_lahde_url: string | null;
  active: boolean;
};

const SARAKKEET =
  "id, ryhma, laji, tieteellinen, aanityyppi, vaikeus, similarity_group, distractor_pool, fakta, audio_url, jakso_s, tauko_s, sono_url, sono_ticks, aani_tekija, aani_lisenssi, aani_lahde_url, aani_havainto_url, aani_maa, kuva_url, kuva_tekija, kuva_lisenssi, kuva_lahde_url, active";

/* Deterministinen sekoitus (siemen = ääni + viikko): sama vaihtoehtojärjestys kaikille ja ISR:n
   uudelleenrenderöinneissä, ei Math.randomia renderissä (hydraatio). */
function siemen(s: string): () => number {
  let h = 2166136261 ^ s.length;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function sekoita<T>(a: T[], rnd: () => number): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Vaihtoehdot: oikea + 3 harhautinta. 1) distractor_pool, 2) sama similarity_group, 3) muu ryhmän pooli.
 *  Harhautin voi olla laji, jolla ei ole ääntä kannassa (pelkkä nimi). */
function vaihtoehdot(r: Rivi, pooli: Rivi[], rnd: () => number): string[] {
  const valitut: string[] = [];
  const lisaa = (nimet: string[]) => {
    for (const n of nimet) if (valitut.length < 3 && n && n !== r.laji && !valitut.includes(n)) valitut.push(n);
  };
  const dp = Array.isArray(r.distractor_pool) ? (r.distractor_pool as unknown[]).filter((x): x is string => typeof x === "string") : [];
  lisaa(sekoita(dp, rnd));
  if (r.similarity_group) lisaa(sekoita(pooli.filter((p) => p.similarity_group === r.similarity_group).map((p) => p.laji), rnd));
  lisaa(sekoita(pooli.map((p) => p.laji), rnd));
  return sekoita([r.laji, ...valitut], rnd);
}

const ticks = (x: unknown): SonoTick[] =>
  Array.isArray(x) ? x.filter((t): t is SonoTick => !!t && typeof t.hz === "number" && typeof t.y === "number") : [];

function kysymys(r: Rivi, pooli: Rivi[], rnd: () => number): AaniKysymys {
  return {
    id: r.id,
    laji: r.laji,
    tieteellinen: r.tieteellinen,
    aanityyppi: r.aanityyppi,
    vaihtoehdot: vaihtoehdot(r, pooli, rnd),
    fakta: r.fakta,
    audio: r.audio_url,
    jakso: Number(r.jakso_s),
    tauko: Number(r.tauko_s),
    sono: r.sono_url,
    ticks: ticks(r.sono_ticks),
    aani: { tekija: r.aani_tekija, lisenssi: r.aani_lisenssi, lahde: r.aani_havainto_url || r.aani_lahde_url, maa: r.aani_maa },
    kuva: r.kuva_url ? { url: r.kuva_url, tekija: r.kuva_tekija, lisenssi: r.kuva_lisenssi, lahde: r.kuva_lahde_url } : null,
  };
}

/** Kuluvan viikon äänivisa ryhmälle. null = ryhmä ei julkaistu (tuotannossa < AANIVISA_MIN aktiivista). */
export async function haeAaniviikko(ryhma: RyhmaMeta): Promise<AaniViikko | null> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return null;
  const esi = esikatselu();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sbAny = sb as any;
  let q = sbAny.from("aanivisat").select(SARAKKEET).eq("site_id", siteId).eq("ryhma", ryhma.key);
  if (!esi) q = q.eq("active", true);
  const { data: pooliData } = await q;
  const pooli = (pooliData ?? []) as Rivi[];
  if (pooli.length < AANIVISA_MIN) return null;

  const { data, error } = await sbAny.rpc("aanivisa_viikon_aanet", { p_site_id: siteId, p_ryhma: ryhma.key, p_vain_aktiiviset: !esi });
  if (error) return null;
  const rivi = (Array.isArray(data) ? data[0] : data) as { vuosi: number; viikko: number; idt: string[] | null } | undefined;
  if (!rivi?.idt?.length) return null;
  const kartta = new Map(pooli.map((p) => [p.id, p]));
  const rnd = siemen(`${ryhma.key}:${rivi.vuosi}:${rivi.viikko}`);
  const kysymykset = rivi.idt.map((id) => kartta.get(id)).filter((r): r is Rivi => !!r).map((r) => kysymys(r, pooli, rnd));
  return { ryhma, vuosi: rivi.vuosi, viikko: rivi.viikko, kysymykset };
}

/** Julkaistut ryhmät (Luonnon kortti, suodatin ja etusivun banneri). Tuotannossa ≥ AANIVISA_MIN aktiivista
 *  ääntä; previewssä kaikki rivit lasketaan. Keskeneräisiä ryhmiä ei näytetä (brief §4). */
export async function julkaistutRyhmat(): Promise<RyhmaMeta[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const esi = esikatselu();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (sb as any).from("aanivisat").select("ryhma").eq("site_id", siteId);
  if (!esi) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) return [];
  const n = new Map<string, number>();
  for (const r of (data ?? []) as Array<{ ryhma: string }>) n.set(r.ryhma, (n.get(r.ryhma) ?? 0) + 1);
  return AANI_RYHMAT.filter((r) => (n.get(r.key) ?? 0) >= AANIVISA_MIN);
}

/** Kortin ja bannerin näyte: viikon 1. ääni (ei nimeä) + viikkonumero. */
export type AaniNayte = { ryhma: RyhmaMeta; vuosi: number; viikko: number; audio: string; sono: string; jakso: number; tauko: number };

export async function haeNayte(ryhma: RyhmaMeta): Promise<AaniNayte | null> {
  const v = await haeAaniviikko(ryhma);
  const k = v?.kysymykset[0];
  return v && k ? { ryhma, vuosi: v.vuosi, viikko: v.viikko, audio: k.audio, sono: k.sono, jakso: k.jakso, tauko: k.tauko } : null;
}

/** Etusivun banneri: pääryhmän näyte (null = ei julkaistua äänivisaa → banneria ei näytetä). */
export async function haeAaniBanneri() {
  const ryhmat = await julkaistutRyhmat();
  if (!ryhmat.length) return null;
  const ensin = await haeNayte(ryhmat[0]);
  if (!ensin) return null;
  const paa = viikonPaaryhma(ryhmat, ensin.viikko) ?? ryhmat[0];
  const n = paa.key === ensin.ryhma.key ? ensin : await haeNayte(paa);
  if (!n) return null;
  return { href: `/aanivisa/${n.ryhma.polku}`, viikko: n.viikko, audio: n.audio, sono: n.sono, jakso: n.jakso, tauko: n.tauko, kysymys: n.ryhma.banneri };
}

/** Kuluvan viikon pääryhmä, kun ryhmiä on useampi: kiertää ISO-viikon mukaan. */
export function viikonPaaryhma(ryhmat: RyhmaMeta[], viikko: number): RyhmaMeta | null {
  return ryhmat.length ? ryhmat[viikko % ryhmat.length] : null;
}

export type { AaniRyhma };
