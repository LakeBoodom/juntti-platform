// LAITA JÄRJESTYKSEEN — pakan pelattava joukko kannasta (julkaistut kohteet, pakan rajaukset).
// Erotettu kierros.ts:stä, jotta testiskripti voi hakea poolin ilman Server Actionia (vaihe B2).
// Vain palvelimella: käyttää anon-avaimen Supabase-asiakasta.

import { getSupabase } from "../supabase";
import { vaakunaKuva } from "./vaakunat";
import { puolueNimi } from "../vaalit/puolue";
import type { Pakka } from "./pakat";
import type { Ehdokas } from "./arvonta";
import { maarittelynKindit } from "../vertailu";

type Rivi = {
  num_value: number | string | null;
  display_value: string | null;
  source: string | null;
  metric: string | null;
  fact_entities: {
    id: string;
    name: string;
    role_label: string | null;
    image_url: string | null;
    prominence: number | null;
    celebrity_id: string | null;
  } | null;
};

/** "2 858 km²" sellaisenaan; pelkkä luku saa yksikön; tarkenne suluissa pois (pakka kertoo sen jo). */
function arvoTeksti(p: Pakka, r: Rivi, n: number): string {
  let t = (r.display_value ?? "").trim();
  if (p.scope) t = t.replace(new RegExp(`\\s*\\(${p.scope}\\)\\s*$`), "");
  if (!t) t = n.toLocaleString("fi-FI");
  t = t.replace(/\s*\([^)]*\)\s*$/, ""); // "13 798 km² (maa-ala)" → pakan lause kertoo perusteen
  if (/^[\d\s .,]+$/.test(t) && p.yksikko) t = `${t} ${p.yksikko}`;
  return t;
}

/** Lähteen verkkotunnus: URL:n host, tai lähdetekstin alussa oleva verkkotunnus
 *  ("avoindata.eduskunta.fi MemberOfParliament …"), tai "Wikipedia". Muuten ei näytetä. */
function lahdeDomain(source: string | null): string | null {
  if (!source) return null;
  const url = source.match(/https?:\/\/([^/\s]+)/);
  if (url) return url[1].replace(/^www\./, "");
  const host = source.match(/\b((?:[a-z0-9-]+\.)+[a-z]{2,})\b/i);
  if (host) return host[1].toLowerCase();
  return /wikipedia/i.test(source) ? "Wikipedia" : null;
}

/** Pakan kindit: `kinds` (monen kindin pakka) tai pelkkä `kind`. */
const pakanKindit = (p: Pakka) => maarittelynKindit(p.kind, p.kinds);

/** Pakan kindien toisen attribuutin arvot entiteeteittäin. */
async function attrKartta(sb: NonNullable<ReturnType<typeof getSupabase>>, kinds: string[], attrKey: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (sb as any)
    .from("fact_attributes")
    .select("entity_id, num_value, text_value, display_value, fact_entities!inner(kind)")
    .eq("attr_key", attrKey)
    .eq("scope", "")
    .in("fact_entities.kind", kinds);
  const m = new Map<string, { num: number; text: string | null }>();
  for (const r of (data ?? []) as { entity_id: string; num_value: number | string | null; text_value: string | null; display_value: string | null }[])
    m.set(r.entity_id, { num: Number(r.num_value), text: r.text_value ?? r.display_value });
  return m;
}

/** Pakan koko pelattava joukko (julkaistut kohteet, pakan rajaukset). */
export async function haePool(p: Pakka): Promise<Ehdokas[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const kinds = pakanKindit(p);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (sb as any)
    .from("fact_attributes")
    .select("num_value, display_value, source, metric, fact_entities!inner(id, name, role_label, image_url, prominence, celebrity_id, kind, status, group_key)")
    .eq("attr_key", p.attrKey)
    .eq("scope", p.scope)
    .eq("fact_entities.status", "published")
    .not("num_value", "is", null);
  // Yksi kind → eq kuten ennen: sama kyselysuunnitelma ja sama rivijärjestys rajapäivään asti
  // (VAKAA_JARJESTYS_ALKAEN). Sen jälkeen päivän rivi ei riipu järjestyksestä (arvonta.ts järjestää).
  q = kinds.length === 1 ? q.eq("fact_entities.kind", kinds[0]) : q.in("fact_entities.kind", kinds);
  if (p.groupKey) q = q.eq("fact_entities.group_key", p.groupKey);
  const { data, error } = await q;
  if (error || !data) {
    console.error("haePool:", error);
    return [];
  }

  const [syntyneet, ehto, rooli] = await Promise.all([
    p.pool?.syntynytVahintaan ? attrKartta(sb, kinds, "birth") : null,
    p.pool?.ehto ? attrKartta(sb, kinds, p.pool.ehto.attrKey) : null,
    p.rooliAttr ? attrKartta(sb, kinds, p.rooliAttr) : null,
  ]);
  const minVuosi = p.pool?.syntynytVahintaan;
  const vuosiOk = (id: string) => {
    if (!minVuosi || !syntyneet) return true;
    const b = syntyneet.get(id);
    return !b || new Date(b.num * 1000).getUTCFullYear() >= minVuosi;
  };
  const ehtoOk = (id: string) => !p.pool?.ehto || ehto?.get(id)?.num === p.pool.ehto.num;
  const vain = p.pool?.vainNimet ? new Set(p.pool.vainNimet) : null;
  const pois = new Set(p.pool?.poisNimet ?? []);
  const nimiOk = (nimi: string) => (!vain || vain.has(nimi)) && !pois.has(nimi);

  const maxProm = p.pool?.maxProminence;
  const tunn = p.pool?.tunnettuja;
  return (data as Rivi[])
    .filter((r) => r.fact_entities && (!maxProm || (r.fact_entities.prominence ?? 1) <= maxProm))
    .filter((r) => vuosiOk(r.fact_entities!.id) && ehtoOk(r.fact_entities!.id) && nimiOk(r.fact_entities!.name))
    .map((r) => {
      const e = r.fact_entities!;
      const value = Number(r.num_value);
      const nimi = p.nimiKentta === "role_label" ? e.role_label ?? e.name : p.kind === "party" ? puolueNimi(e.name) ?? e.name : e.name;
      const roolinArvo = rooli?.get(e.id)?.text ?? null;
      return {
        id: e.id,
        name: nimi,
        role: p.rooliAttr ? puolueNimi(roolinArvo) ?? "" : p.naytaRooli ? (e.role_label ?? "").replace(/^[^·]*·\s*/, "") : "",
        /* Tunnus (maakunnat): vaakunan oma kopio nimen mukaan, kannan image_url on täysikokoinen alkuperäinen. */
        image_url: p.piilotaKuva ? null : p.tunnus ? vaakunaKuva(e.name) : e.image_url,
        hideThumb: p.piilotaKuva || undefined,
        tunnus: p.tunnus || undefined,
        value,
        valueLabel: arvoTeksti(p, r, value),
        lahde: lahdeDomain(r.source),
        tunnettu: !!tunn && (!!e.celebrity_id || value >= tunn.arvoVahintaan),
        mittari: r.metric ?? null,
      };
    })
    .filter((k) => Number.isFinite(k.value));
}
