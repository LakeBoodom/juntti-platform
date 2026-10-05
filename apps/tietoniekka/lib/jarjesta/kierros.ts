"use server";
// LAITA JÄRJESTYKSEEN — kierroksen arvonta (Server Action, kuten lib/ikajarjestys.ts).
// Saa eksportoida vain async-funktioita; tyypit ja pakat asuvat lib/jarjesta/pakat.ts:ssä.
//
// Arvonta: `pick` kohdetta siten, että minkä tahansa kahden arvon ero on vähintään pakan
// `vali.min` (suhteellinen kuten Kumpi?-pelissä tai absoluuttinen). Jos täyttä kierrosta ei
// synny (esim. vain 8 eri arvoa 13:sta), sallitaan tasapelit — pisteytys hyväksyy silloin kumman
// tahansa järjestyksen (lib/jarjesta/pisteytys.ts).

import { getSupabase } from "../supabase";
import { puolueNimi } from "../vaalit/puolue";
import { haePakka, type JarjestysKohde, type Pakka } from "./pakat";

type Rivi = {
  num_value: number | string | null;
  display_value: string | null;
  source: string | null;
  fact_entities: {
    id: string;
    name: string;
    role_label: string | null;
    image_url: string | null;
    prominence: number | null;
    celebrity_id: string | null;
  } | null;
};

type Ehdokas = JarjestysKohde & { tunnettu: boolean };

const relVali = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1);

function riittavaVali(vali: Pakka["vali"], a: number, b: number): boolean {
  const ero = vali.tapa === "suhteellinen" ? relVali(a, b) : Math.abs(a - b);
  return ero >= vali.min;
}

function sekoita<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Ahne poiminta satunnaisjärjestyksestä; muutama yritys, paras talteen. Tunnettuja-vaatimus:
 *  ehdokasjonon alkuun `maara` satunnaista tunnettua, jolloin ne pääsevät kierrokseen ensin. */
function poimi(p: Pakka, pool: Ehdokas[], vali: Pakka["vali"]): Ehdokas[] {
  const tarve = p.pool?.tunnettuja?.maara ?? 0;
  const tunnettuja = (k: Ehdokas[]) => k.filter((x) => x.tunnettu).length;
  let paras: Ehdokas[] = [];
  for (let yritys = 0; yritys < 24; yritys++) {
    const sekaisin = sekoita(pool);
    const jono = tarve ? [...sekaisin.filter((k) => k.tunnettu).slice(0, tarve), ...sekaisin] : sekaisin;
    const valitut: Ehdokas[] = [];
    for (const k of jono) {
      if (valitut.length >= p.pick) break;
      if (valitut.some((v) => v.id === k.id)) continue;
      if (valitut.every((v) => riittavaVali(vali, v.value, k.value))) valitut.push(k);
    }
    const parempi =
      valitut.length > paras.length ||
      (valitut.length === paras.length && tunnettuja(valitut) > tunnettuja(paras));
    if (parempi) paras = valitut;
    if (paras.length >= p.pick && tunnettuja(paras) >= tarve) break;
  }
  return paras;
}

/** "2 858 km²" sellaisenaan; pelkkä luku saa yksikön; seuran nimi suluissa pois (pakka kertoo sen jo). */
function arvoTeksti(p: Pakka, r: Rivi, n: number): string {
  let t = (r.display_value ?? "").trim();
  if (p.scope) t = t.replace(new RegExp(`\\s*\\(${p.scope}\\)\\s*$`), "");
  if (!t) t = n.toLocaleString("fi-FI");
  if (/^[\d\s .,]+$/.test(t) && p.yksikko) t = `${t} ${p.yksikko}`;
  if (p.etuliite) t = `${p.etuliite} ${t}`;
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

/** Saman kindin toisen attribuutin arvot entiteeteittäin. */
async function attrKartta(sb: NonNullable<ReturnType<typeof getSupabase>>, kind: string, attrKey: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (sb as any)
    .from("fact_attributes")
    .select("entity_id, num_value, text_value, display_value, fact_entities!inner(kind)")
    .eq("attr_key", attrKey)
    .eq("scope", "")
    .eq("fact_entities.kind", kind);
  const m = new Map<string, { num: number; text: string | null }>();
  for (const r of (data ?? []) as { entity_id: string; num_value: number | string | null; text_value: string | null; display_value: string | null }[])
    m.set(r.entity_id, { num: Number(r.num_value), text: r.text_value ?? r.display_value });
  return m;
}

export async function haeJarjestysKierros(slug: string, excludeIds: string[] = []): Promise<JarjestysKohde[]> {
  const p = haePakka(slug);
  const sb = getSupabase();
  if (!p || !sb) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any)
    .from("fact_attributes")
    .select("num_value, display_value, source, fact_entities!inner(id, name, role_label, image_url, prominence, celebrity_id, kind, status)")
    .eq("attr_key", p.attrKey)
    .eq("scope", p.scope)
    .eq("fact_entities.kind", p.kind)
    .eq("fact_entities.status", "published")
    .not("num_value", "is", null);
  if (error || !data) {
    console.error("haeJarjestysKierros:", error);
    return [];
  }

  const [syntyneet, ehto, rooli] = await Promise.all([
    p.pool?.syntynytVahintaan ? attrKartta(sb, p.kind, "birth") : null,
    p.pool?.ehto ? attrKartta(sb, p.kind, p.pool.ehto.attrKey) : null,
    p.rooliAttr ? attrKartta(sb, p.kind, p.rooliAttr) : null,
  ]);
  const minVuosi = p.pool?.syntynytVahintaan;
  const vuosiOk = (id: string) => {
    if (!minVuosi || !syntyneet) return true;
    const b = syntyneet.get(id);
    return !b || new Date(b.num * 1000).getUTCFullYear() >= minVuosi;
  };
  const ehtoOk = (id: string) => !p.pool?.ehto || ehto?.get(id)?.num === p.pool.ehto.num;

  const maxProm = p.pool?.maxProminence;
  const tunn = p.pool?.tunnettuja;
  const pool: Ehdokas[] = (data as Rivi[])
    .filter((r) => r.fact_entities && (!maxProm || (r.fact_entities.prominence ?? 1) <= maxProm))
    .filter((r) => vuosiOk(r.fact_entities!.id) && ehtoOk(r.fact_entities!.id))
    .map((r) => {
      const e = r.fact_entities!;
      const value = Number(r.num_value);
      const nimi = p.nimiKentta === "role_label" ? e.role_label ?? e.name : p.kind === "party" ? puolueNimi(e.name) ?? e.name : e.name;
      const roolinArvo = rooli?.get(e.id)?.text ?? null;
      return {
        id: e.id,
        name: nimi,
        role: p.rooliAttr ? puolueNimi(roolinArvo) ?? "" : p.naytaRooli ? (e.role_label ?? "").replace(/^[^·]*·\s*/, "") : "",
        image_url: p.piilotaKuva ? null : e.image_url,
        hideThumb: p.piilotaKuva || undefined,
        value,
        valueLabel: arvoTeksti(p, r, value),
        lahde: lahdeDomain(r.source),
        tunnettu: !!tunn && (!!e.celebrity_id || value >= tunn.arvoVahintaan),
      };
    })
    .filter((k) => Number.isFinite(k.value));

  const arvo = (lahde: Ehdokas[]) => {
    const tiukka = poimi(p, lahde, p.vali);
    return tiukka.length >= p.pick ? tiukka : poimi(p, lahde, { tapa: "absoluuttinen", min: 0 });
  };
  // Edellisen kierroksen kohteet pois, jos täysi kierros syntyy silti; muuten ilman rajausta.
  let valitut = excludeIds.length ? arvo(pool.filter((k) => !excludeIds.includes(k.id))) : [];
  if (valitut.length < p.pick) valitut = arvo(pool);

  // Kuvat kaikille tai ei kenellekään (brief §2): yksikin puuttuva → tekstikortit.
  const kuvat = valitut.every((k) => k.image_url);
  return sekoita(valitut).map(({ tunnettu: _t, ...k }) => (kuvat ? k : { ...k, image_url: null, hideThumb: true }));
}
