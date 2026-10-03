"use server";
// LAITA JÄRJESTYKSEEN — kierroksen arvonta (Server Action, kuten lib/ikajarjestys.ts).
// Saa eksportoida vain async-funktioita; tyypit ja pakat asuvat lib/jarjesta/pakat.ts:ssä.
//
// Arvonta: `pick` kohdetta siten, että minkä tahansa kahden arvon ero on vähintään pakan
// `vali.min` (suhteellinen kuten Kumpi?-pelissä tai absoluuttinen). Muuten esim. Leijonat-
// pakassa tulisi 105/105-tasapelejä, joiden järjestys olisi arvaus.

import { getSupabase } from "../supabase";
import { haePakka, type JarjestysKohde, type Pakka } from "./pakat";

type Rivi = {
  num_value: number | string | null;
  display_value: string | null;
  source: string | null;
  fact_entities: {
    id: string;
    name: string;
    role_label: string | null;
    show_role: boolean | null;
    image_url: string | null;
    prominence: number | null;
  } | null;
};

const relVali = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1);

function riittavaVali(p: Pakka, a: number, b: number): boolean {
  const ero = p.vali.tapa === "suhteellinen" ? relVali(a, b) : Math.abs(a - b);
  return ero >= p.vali.min;
}

function sekoita<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Ahne poiminta satunnaisjärjestyksestä; muutama yritys, paras talteen. */
function poimi(p: Pakka, pool: JarjestysKohde[]): JarjestysKohde[] {
  let paras: JarjestysKohde[] = [];
  for (let yritys = 0; yritys < 12 && paras.length < p.pick; yritys++) {
    const valitut: JarjestysKohde[] = [];
    for (const k of sekoita(pool)) {
      if (valitut.length >= p.pick) break;
      if (valitut.every((v) => riittavaVali(p, v.value, k.value))) valitut.push(k);
    }
    if (valitut.length > paras.length) paras = valitut;
  }
  return paras;
}

/** "2 858 km²" sellaisenaan; pelkkä luku saa yksikön; seuran nimi suluissa pois (pakka kertoo sen jo). */
function arvoTeksti(p: Pakka, r: Rivi, n: number): string {
  let t = (r.display_value ?? "").trim();
  if (p.scope) t = t.replace(new RegExp(`\\s*\\(${p.scope}\\)\\s*$`), "");
  if (!t) t = n.toLocaleString("fi-FI");
  if (/^[\d\s .,]+$/.test(t) && p.yksikko) t = `${t} ${p.yksikko}`;
  return t;
}

function lahdeDomain(source: string | null): string | null {
  const m = source?.match(/https?:\/\/([^/\s]+)/);
  return m ? m[1].replace(/^www\./, "") : null;
}

export async function haeJarjestysKierros(slug: string, excludeIds: string[] = []): Promise<JarjestysKohde[]> {
  const p = haePakka(slug);
  const sb = getSupabase();
  if (!p || !sb) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any)
    .from("fact_attributes")
    .select(
      "num_value, display_value, source, fact_entities!inner(id, name, role_label, show_role, image_url, prominence, kind, status)",
    )
    .eq("attr_key", p.attrKey)
    .eq("scope", p.scope)
    .eq("fact_entities.kind", p.kind)
    .eq("fact_entities.status", "published")
    .not("num_value", "is", null);
  if (error || !data) {
    console.error("haeJarjestysKierros:", error);
    return [];
  }

  const maxProm = p.pool?.maxProminence;
  const pool: JarjestysKohde[] = (data as Rivi[])
    .filter((r) => r.fact_entities && (!maxProm || (r.fact_entities.prominence ?? 1) <= maxProm))
    .map((r) => {
      const e = r.fact_entities!;
      const value = Number(r.num_value);
      return {
        id: e.id,
        name: e.name,
        role: p.naytaRooli ? (e.role_label ?? "").replace(/^[^·]*·\s*/, "") : "",
        image_url: e.image_url,
        hideThumb: p.piilotaKuva || undefined,
        value,
        valueLabel: arvoTeksti(p, r, value),
        lahde: lahdeDomain(r.source),
      };
    })
    .filter((k) => Number.isFinite(k.value));
  // Ei yhtään kuvaa koko pakassa → ei kuvapaikkaa (pelkät siluetit vievät tilaa turhaan).
  if (!pool.some((k) => k.image_url)) for (const k of pool) k.hideThumb = true;

  // Edellisen kierroksen kohteet pois, jos täysi kierros syntyy silti; muuten ilman rajausta.
  if (excludeIds.length) {
    const ilman = poimi(p, pool.filter((k) => !excludeIds.includes(k.id)));
    if (ilman.length >= p.pick) return sekoita(ilman);
  }
  return sekoita(poimi(p, pool));
}
