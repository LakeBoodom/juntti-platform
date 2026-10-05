// VAALIPIIRIKETJU — data ja päivän kierroksen arvonta palvelimella (toteutusbrief 5.10.2026 §3).
//
// Graafi: vaalipiirit (13) + vaalipiirien_rajat WHERE accepted (22 maarajaa + Ahvenanmaan lautta).
// Edustajat: fact_entities kind=person, mp_sitting = 1, mp_district = vaalipiirit.name.
// Huhtikuussa 2027 Cowork päivittää mp_sitting-arvot → koodiin ei tarvita muutoksia.
//
// Päivän kierros (siemen YYYY-MM-DD, Helsingin aika):
//   - Satunnainen yksinkertainen polku, 8 vaalipiiriä; Ahvenanmaa vain polun päässä.
//   - Jokaiseen pysäkkiin yksi istuva kansanedustaja, painotus: henkilösivu (celebrity_id) 4,
//     mp_years ≥ 15 paino 2, muut 1.
//   - Sama edustaja ei toistu 14 päivän sisällä: historia lasketaan julkaisupäivästä alkaen samalla
//     arvonnalla, joten jokainen päivä on deterministinen.

import { unstable_cache } from "next/cache";
import { getSupabase } from "../supabase";
import { visaHref } from "../visaHref";
import { puolueNimi } from "../vaalit/puolue";
import { VAALIPIIRI_GEOM } from "../vaalit/geometria";
import {
  VPK_JULKAISU,
  VPK_KORTTEJA,
  lisaaPaivia,
  pariAvain,
  paivaysTeksti,
  vpkNumero,
  type VpkEdustaja,
  type VpkKierros,
  type VpkLinkki,
  type VpkVaalipiiri,
} from "../vaalipiiriketju";

const TOISTOVALI = 14;

type Ehdokas = VpkEdustaja & { paino: number };
export type VpkData = { vaalipiirit: VpkVaalipiiri[]; linkit: Record<string, VpkLinkki>; edustajat: Ehdokas[] };

async function attr(sb: NonNullable<ReturnType<typeof getSupabase>>, key: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (sb as any)
    .from("fact_attributes")
    .select("num_value, text_value, fact_entities!inner(id, name, celebrity_id, kind, status)")
    .eq("attr_key", key)
    .eq("scope", "")
    .eq("fact_entities.kind", "person")
    .eq("fact_entities.status", "published");
  return (data ?? []) as Array<{
    num_value: number | string | null;
    text_value: string | null;
    fact_entities: { id: string; name: string; celebrity_id: string | null };
  }>;
}

export async function lataa(): Promise<VpkData | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const [vp, rajat, istuu, piiri, puolue, vuodet] = await Promise.all([
    sb.from("vaalipiirit" as never).select("id, name, short_name"),
    sb.from("vaalipiirien_rajat" as never).select("vaalipiiri_a, vaalipiiri_b, border_type").eq("accepted" as never, true as never),
    attr(sb, "mp_sitting"),
    attr(sb, "mp_district"),
    attr(sb, "mp_party"),
    attr(sb, "mp_years"),
  ]);
  const geomK = new Map(VAALIPIIRI_GEOM.map((g) => [g.nimi, g.k]));
  const vpRivit = (vp.data ?? []) as Array<{ id: string; name: string; short_name: string }>;
  const vaalipiirit: VpkVaalipiiri[] = vpRivit
    .filter((r) => geomK.has(r.short_name))
    .map((r) => ({ id: r.id, nimi: r.short_name, k: geomK.get(r.short_name)! }));
  if (vaalipiirit.length < VPK_KORTTEJA) return null;
  const nimesta = new Map(vpRivit.map((r) => [r.name, r.id]));

  const linkit: Record<string, VpkLinkki> = {};
  for (const r of (rajat.data ?? []) as Array<{ vaalipiiri_a: string; vaalipiiri_b: string; border_type: string }>)
    linkit[pariAvain(r.vaalipiiri_a, r.vaalipiiri_b)] = r.border_type === "ferry" ? "lautta" : "maa";

  const istuvat = new Set(istuu.filter((r) => Number(r.num_value) === 1).map((r) => r.fact_entities.id));
  const piiriOf = new Map(piiri.map((r) => [r.fact_entities.id, nimesta.get(r.text_value ?? "") ?? null]));
  const puolueOf = new Map(puolue.map((r) => [r.fact_entities.id, r.text_value]));
  const vuodetOf = new Map(vuodet.map((r) => [r.fact_entities.id, Number(r.num_value)]));

  // Henkilövisa-linkki vain julkaistulle visalle (katselmus §4): celebrity → trivia_quiz_id → published.
  const celebIdt = [...new Set(istuu.map((r) => r.fact_entities.celebrity_id).filter((x): x is string => !!x))];
  const visat = new Map<string, string>();
  if (celebIdt.length) {
    const { data: celebs } = await sb.from("celebrities").select("id, trivia_quiz_id").in("id", celebIdt);
    const quizIdt = ((celebs ?? []) as Array<{ id: string; trivia_quiz_id: string | null }>).filter((c) => c.trivia_quiz_id);
    if (quizIdt.length) {
      const { data: quizzes } = await sb
        .from("quizzes")
        .select("id, slug, custom_slug")
        .eq("status", "published")
        .in("id", quizIdt.map((c) => c.trivia_quiz_id!));
      const href = new Map(((quizzes ?? []) as Array<{ id: string; slug: string | null; custom_slug: string | null }>).map((q) => [q.id, visaHref(q)]));
      for (const c of quizIdt) if (href.has(c.trivia_quiz_id!)) visat.set(c.id, href.get(c.trivia_quiz_id!)!);
    }
  }

  const edustajat: Ehdokas[] = [];
  for (const r of istuu) {
    const e = r.fact_entities;
    const vpId = piiriOf.get(e.id);
    if (!istuvat.has(e.id) || !vpId) continue;
    const v = vuodetOf.get(e.id) ?? 0;
    edustajat.push({
      id: e.id,
      nimi: e.name,
      puolue: puolueNimi(puolueOf.get(e.id)) ?? "",
      vp: vpId,
      visa: e.celebrity_id ? visat.get(e.celebrity_id) ?? null : null,
      paino: e.celebrity_id ? 4 : v >= 15 ? 2 : 1,
    });
  }
  // Vakaa järjestys → arvonta ei riipu kannan palautusjärjestyksestä.
  edustajat.sort((a, b) => a.id.localeCompare(b.id));
  vaalipiirit.sort((a, b) => a.k.localeCompare(b.k));
  return { vaalipiirit, linkit, edustajat };
}

const haeData = unstable_cache(lataa, ["vaalipiiriketju-data-v1"], { revalidate: 3600 });

// ── Arvonta ──────────────────────────────────────────────
function satunnainen(siemen: string): () => number {
  let h = 1779033703 ^ siemen.length;
  for (let i = 0; i < siemen.length; i++) {
    h = Math.imul(h ^ siemen.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
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

/** Satunnainen yksinkertainen polku (8 vaalipiiriä), Ahvenanmaa vain päässä. */
function polku(d: VpkData, r: () => number): string[] | null {
  const naapurit = new Map<string, string[]>(d.vaalipiirit.map((v) => [v.id, []]));
  for (const avain of Object.keys(d.linkit)) {
    const [a, b] = avain.split("-");
    naapurit.get(a)?.push(b);
    naapurit.get(b)?.push(a);
  }
  const ahv = d.vaalipiirit.find((v) => v.nimi === "Ahvenanmaa")?.id;
  const kelpaa = (p: string[]) => !ahv || !p.includes(ahv) || p[0] === ahv || p.at(-1) === ahv;
  const etsi = (p: string[]): string[] | null => {
    if (p.length === VPK_KORTTEJA) return kelpaa(p) ? p : null;
    for (const n of sekoita(naapurit.get(p.at(-1)!) ?? [], r)) {
      if (p.includes(n)) continue;
      const tulos = etsi([...p, n]);
      if (tulos) return tulos;
    }
    return null;
  };
  for (const alku of sekoita(d.vaalipiirit.map((v) => v.id), r)) {
    const p = etsi([alku]);
    if (p) return p;
  }
  return null;
}

function painotettu(ehdokkaat: Ehdokas[], r: () => number): Ehdokas {
  const summa = ehdokkaat.reduce((s, e) => s + e.paino, 0);
  let x = r() * summa;
  for (const e of ehdokkaat) {
    x -= e.paino;
    if (x < 0) return e;
  }
  return ehdokkaat[ehdokkaat.length - 1];
}

/** viimeksi: edustaja → päivän järjestysnumero, jolloin hän oli viimeksi kierroksessa. */
function paivanValinta(d: VpkData, iso: string, nyt: number, viimeksi: Map<string, number>) {
  const r = satunnainen(`vaalipiiriketju-${iso}`);
  const p = polku(d, r);
  if (!p) return null;
  const valitut = p.map((vp) => {
    const kaikki = d.edustajat.filter((e) => e.vp === vp);
    if (!kaikki.length) return null;
    const tuoreet = kaikki.filter((e) => nyt - (viimeksi.get(e.id) ?? -Infinity) > TOISTOVALI);
    if (tuoreet.length) return painotettu(tuoreet, r);
    // Pieni vaalipiiri (Ahvenanmaa 1, Lappi 6): kaikki nähty 14 päivän sisällä → pisimpään tauolla ollut.
    const vanhin = Math.min(...kaikki.map((e) => viimeksi.get(e.id) ?? -Infinity));
    return painotettu(kaikki.filter((e) => (viimeksi.get(e.id) ?? -Infinity) === vanhin), r);
  });
  return valitut.every(Boolean) ? (valitut as Ehdokas[]) : null;
}

/** Päivän kierros. Toistoesto: edelliset 14 päivää julkaisupäivästä alkaen samalla arvonnalla. */
export async function paivanKierros(iso: string): Promise<VpkKierros | null> {
  const d = await haeData();
  return d ? laskeKierros(d, iso) : null;
}

export function laskeKierros(d: VpkData, iso: string): VpkKierros | null {
  const viimeksi = new Map<string, number>();
  const alku = iso < VPK_JULKAISU ? iso : VPK_JULKAISU;
  let paiva = alku;
  let tanaan: Ehdokas[] | null = null;
  for (let i = 0; i < 5000 && paiva <= iso; i++) {
    const valinta = paivanValinta(d, paiva, i, viimeksi);
    for (const e of valinta ?? []) viimeksi.set(e.id, i);
    if (paiva === iso) tanaan = valinta;
    paiva = lisaaPaivia(paiva, 1);
  }
  if (!tanaan) return null;

  // Lähtöjärjestys: sekoitettu niin, ettei se ole reitti eikä käänteinen reitti.
  const r = satunnainen(`vaalipiiriketju-pino-${iso}`);
  const ids = tanaan.map((e) => e.id);
  let pino = sekoita(ids, r);
  for (let i = 0; i < 10 && (pino.join() === ids.join() || pino.join() === [...ids].reverse().join()); i++) pino = sekoita(ids, r);

  const huomenna = lisaaPaivia(iso, 1);
  return {
    iso,
    numero: vpkNumero(iso),
    paivays: paivaysTeksti(iso),
    huomenna: `#${vpkNumero(huomenna)} · ${paivaysTeksti(huomenna, true)}`,
    reitti: tanaan.map(({ paino: _p, ...e }) => e),
    pino,
    vaalipiirit: d.vaalipiirit,
    linkit: d.linkit,
  };
}
