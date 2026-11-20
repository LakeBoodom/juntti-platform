// KUMPI? 2.0 — datakerros (brief 20.11.2026, A1). Lukee fact_entities-, fact_attributes-, fact_attribute_defs- ja
// fact_relationships-taulut sekä entity_facts (legendat) ja duel_pair_blocks (hylätyt parit; taulun nimi on yhä vanha).
// VAIN PALVELIMELLA: esikatselussa (VERCEL_ENV ≠ production) luetaan service role -avaimella myös luonnospelaajat ja
// kytkemättömät määrittelyt, jotta peliä voi kokeilla ennen vaihetta C. Tuotannossa anon-avain: vain julkaistut
// entiteetit ja enabled = true -määrittelyt. Mitään ei palauteta selaimeen: sivut lähettävät vain arvotut kysymykset.
// Haku muistetaan prosessissa tunnin (data on ~2 Mt, liian iso Vercelin datavälimuistiin).

import { createClient } from "@supabase/supabase-js";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { helsinginPaiva } from "@/lib/aika";
import type { KDef, KEnt, KumpiData } from "./tyypit";

const KINDIT = ["player", "person", "team", "city", "region", "lake", "river", "park", "lighthouse", "fell", "country", "mountain", "event"];
const SIVU = 1000;
const TTL_MS = 60 * 60 * 1000;

/** Esikatselu = kaikki paitsi tuotanto (Vercel preview ja paikallinen kehitys). */
export const kumpiEsikatselu = () => process.env.VERCEL_ENV !== "production";

function asiakas() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const palvelu = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon) return null;
  const avain = kumpiEsikatselu() && palvelu ? palvelu : anon;
  return { sb: createClient(url, avain, { auth: { persistSession: false } }), laaja: avain === palvelu };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function kaikki(kysely: (alku: number, loppu: number) => PromiseLike<{ data: any[] | null; error: any }>): Promise<any[]> {
  const out: any[] = [];
  for (let alku = 0; ; alku += SIVU) {
    const { data, error } = await kysely(alku, alku + SIVU - 1);
    if (error) throw new Error(error.message ?? String(error));
    out.push(...(data ?? []));
    if (!data || data.length < SIVU) break;
  }
  return out;
}

/** Kantarivit → KumpiData. Puhdas funktio: myös laatuportti (scripts/kumpi-laatu.ts) käyttää tätä. */
export function rakennaKumpiData(r: {
  entities: any[];
  defs: any[];
  blocks: any[];
  relaatiot: any[];
  legendat: string[];
  suomalaiset: string[];
  tanaan: string;
}): KumpiData {
  const legendat = new Set(r.legendat);
  const suomalaiset = new Set(r.suomalaiset);
  const nimiIdlla = new Map<string, string>(r.entities.map((e) => [e.id, e.name]));
  const kindIdlla = new Map<string, string>(r.entities.map((e) => [e.id, e.kind]));
  const kuvaIdlla = new Map<string, string | null>(r.entities.map((e) => [e.id, henkiloKuva(e.image_url)]));

  // same_as: pelaaja → henkilö. Molemmat saavat saman ihmistunnisteen (henkilön id), pelaaja henkilön kuvan.
  const henkiloksi = new Map<string, string>();
  const seurat = new Map<string, string[]>();
  for (const rel of r.relaatiot) {
    if (rel.rel_type === "same_as") {
      const [p, h] = kindIdlla.get(rel.from_entity) === "player" ? [rel.from_entity, rel.to_entity] : [rel.to_entity, rel.from_entity];
      henkiloksi.set(p, h);
    } else if (rel.rel_type === "played_for" && kindIdlla.get(rel.to_entity) === "team") {
      const nimi = nimiIdlla.get(rel.to_entity);
      if (!nimi) continue;
      const xs = seurat.get(rel.from_entity) ?? [];
      if (!xs.includes(nimi)) xs.push(nimi);
      seurat.set(rel.from_entity, xs);
    }
  }

  const inessiivit: Record<string, string> = {};
  const entities: KEnt[] = [];
  for (const x of r.entities) {
    const v: Record<string, number> = {};
    const d: Record<string, string> = {};
    const t: Record<string, string> = {};
    const s: Record<string, Record<string, number>> = {};
    const m: Record<string, string> = {};
    let paikka: KEnt["paikka"] = null;
    for (const a of x.fact_attributes ?? []) {
      // Kausiluonteinen arvo, jonka tarkistuspäivä on mennyt, ei kelpaa (A2 erityisrajat).
      if (a.volatility === "seasonal" && a.next_review_at && a.next_review_at < r.tanaan) continue;
      if (a.attr_key === "position") {
        const p = String(a.text_value ?? a.display_value ?? "");
        paikka = p === "maalivahti" ? "mv" : p ? "kp" : null;
        continue;
      }
      if (a.attr_key === "inessive" && x.kind === "team") {
        inessiivit[x.name] = a.display_value ?? a.text_value;
        continue;
      }
      if (a.scope) {
        if (a.num_value !== null && a.num_value !== undefined) (s[a.scope] ??= {})[a.attr_key] = Number(a.num_value);
        continue;
      }
      if (a.text_value) t[a.attr_key] = a.text_value;
      if (a.display_value) d[a.attr_key] = a.display_value;
      if (a.metric) m[a.attr_key] = a.metric;
      if (a.num_value !== null && a.num_value !== undefined) v[a.attr_key] = Number(a.num_value);
    }
    if (x.kind === "team") continue;
    // Pelaajien ikä: tarkka syntymäaika (birth, epoch-sekunnit) tai pelkkä vuosi (birth_year → 1.7.). Ero on aina
    // vähintään vuoden (min_gap), joten puolen vuoden epätarkkuus ei voi kääntää järjestystä.
    if (v.birth === undefined && v.birth_year !== undefined) v.birth = Date.UTC(v.birth_year, 6, 1) / 1000;
    const ihminen = henkiloksi.get(x.id) ?? x.id;
    const kuva = x.kind === "person" ? kuvaIdlla.get(x.id) ?? null : x.kind === "player" && henkiloksi.has(x.id) ? kuvaIdlla.get(ihminen) ?? null : null;
    const legenda = legendat.has(x.id);
    const paino =
      x.kind === "player"
        ? 1 + Math.min(4, (v.liiga_games ?? 0) / 250) + (v.nhl_games ? 1 : 0) + (legenda ? 2 : 0)
        : 1;
    entities.push({
      id: x.id, nimi: x.name, kind: x.kind, kuva, v, d, t, s, m,
      seurat: seurat.get(x.id) ?? [], paikka, ihminen, legenda,
      suomalainen: !!x.celebrity_id && suomalaiset.has(x.celebrity_id),
      paino,
      lat: x.lat == null ? null : Number(x.lat), lon: x.lon == null ? null : Number(x.lon),
      partitiivi: x.name_partitive ?? null,
    });
  }

  const defs: Record<string, KDef> = {};
  for (const x of r.defs) {
    if (!x.kumpi_kysymys) continue;
    defs[x.attr_key] = {
      key: x.attr_key,
      mode: x.compare_mode ?? "numeric",
      winner: x.winner === "low" ? "low" : "high",
      easyGap: x.easy_gap == null ? null : Number(x.easy_gap),
      midGap: x.mid_gap == null ? null : Number(x.mid_gap),
      minGap: x.min_gap == null ? null : Number(x.min_gap),
      maxGap: x.max_gap == null ? null : Number(x.max_gap),
      gapMode: x.gap_mode === "absolute" ? "absolute" : "relative",
      gapDivisor: x.gap_divisor == null ? 1 : Number(x.gap_divisor),
      kysymys: x.kumpi_kysymys,
      factTemplate: x.fact_template ?? null,
      enabled: !!x.enabled,
    };
  }

  const blocks = r.blocks.map((b) => `${b.attr_key}|${[b.entity_a, b.entity_b].sort().join("|")}`);
  return { entities, defs, blocks, inessiivit };
}

export async function lataaKumpiData(): Promise<KumpiData | null> {
  const a = asiakas();
  if (!a) return null;
  const { sb, laaja } = a;
  const tilat = laaja ? ["published", "draft"] : ["published"];
  const [entities, defs, blocks, relaatiot, faktat, julkkikset] = await Promise.all([
    kaikki((alku, loppu) =>
      sb.from("fact_entities")
        .select("id, name, kind, image_url, celebrity_id, lat, lon, name_partitive, fact_attributes(attr_key, scope, num_value, display_value, text_value, metric, volatility, next_review_at)")
        .in("kind", KINDIT).in("status", tilat).order("id").range(alku, loppu)),
    (async () => {
      let q = sb.from("fact_attribute_defs").select("*").not("kumpi_kysymys", "is", null);
      if (!laaja) q = q.eq("enabled", true);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data ?? [];
    })(),
    kaikki((alku, loppu) => sb.from("duel_pair_blocks").select("attr_key, entity_a, entity_b").range(alku, loppu)),
    kaikki((alku, loppu) => sb.from("fact_relationships").select("from_entity, to_entity, rel_type").in("rel_type", ["same_as", "played_for"]).order("id").range(alku, loppu)),
    kaikki((alku, loppu) => sb.from("entity_facts").select("entity_id").order("id").range(alku, loppu)),
    kaikki((alku, loppu) => sb.from("celebrities").select("id").eq("suomalainen", true).order("id").range(alku, loppu)),
  ]);
  return rakennaKumpiData({
    entities, defs, blocks, relaatiot,
    legendat: [...new Set(faktat.map((f: any) => f.entity_id as string))],
    suomalaiset: julkkikset.map((c: any) => c.id as string),
    tanaan: helsinginPaiva().iso,
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

let muisti: { aika: number; lupaus: Promise<KumpiData | null> } | null = null;

/** Kumpi?-data, muistettu prosessissa tunnin. Virhe ei jää muistiin. */
export function haeKumpiData(): Promise<KumpiData | null> {
  if (muisti && Date.now() - muisti.aika < TTL_MS) return muisti.lupaus;
  const lupaus = lataaKumpiData().catch((e) => {
    console.error("haeKumpiData:", e);
    muisti = null;
    return null;
  });
  muisti = { aika: Date.now(), lupaus };
  return lupaus;
}
