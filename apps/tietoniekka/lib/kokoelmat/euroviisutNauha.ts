// SIJOITUSNAUHAN DATA kannasta (CC-brief 28.11.2026 §3): Suomen euroviisuedustajat tietomallista
// (fact_entities kind = 'eurovision_entry', group_key = 'euroviisut', tagi suomi; attribuutit esc_year, esc_final_place,
// esc_semi_place, esc_song). Korvaa 19.10. kovakoodatun listan (euroviisut-sijoitukset.ts, poistettu).
// Jokainen vuosi 1961–viimeisin näkyy: finaalisija, semifinaaliin jääminen, poissaolo tai peruttu kilpailu (2020).
import { unstable_cache } from "next/cache";
import { getSupabase } from "@/lib/supabase";

export type NauhaVuosi =
  | { vuosi: number; tila: "finaali"; sija: number; esittaja: string; kappale: string }
  | { vuosi: number; tila: "semi"; sija: number | null; esittaja: string; kappale: string }
  | { vuosi: number; tila: "poissa" }
  | { vuosi: number; tila: "peruttu" };

export const ENSIMMAINEN_VUOSI = 1961;
/** Kilpailu peruttiin (koronapandemia) — ei Suomen poissaolo. */
const PERUTUT = new Set([2020]);

type Rivi = { name: string; fact_attributes: Array<{ attr_key: string; num_value: number | null; text_value: string | null }> };

export const haeNauha = unstable_cache(
  async (): Promise<NauhaVuosi[]> => {
    const sb = getSupabase();
    if (!sb) return [];
    const { data } = await sb
      .from("fact_entities")
      .select("name, fact_attributes(attr_key, num_value, text_value)")
      .eq("kind", "eurovision_entry")
      .eq("group_key", "euroviisut")
      .eq("status", "published")
      .contains("tags", ["suomi"]);
    const vuodet = new Map<number, NauhaVuosi>();
    for (const r of (data ?? []) as unknown as Rivi[]) {
      const a = (k: string) => r.fact_attributes.find((x) => x.attr_key === k);
      const vuosi = Number(a("esc_year")?.num_value);
      if (!vuosi) continue; // UMK-voittaja ilman Euroviisuja (2020)
      const kappale = a("esc_song")?.text_value ?? "";
      /* Entiteetin nimi on "Esittäjä: Kappale" → esittäjä ilman kappaleen nimeä. */
      const esittaja = kappale && r.name.endsWith(`: ${kappale}`) ? r.name.slice(0, -kappale.length - 2) : r.name.split(": ")[0];
      const fin = a("esc_final_place")?.num_value;
      const semi = a("esc_semi_place")?.num_value;
      vuodet.set(vuosi, fin != null
        ? { vuosi, tila: "finaali", sija: Number(fin), esittaja, kappale }
        : { vuosi, tila: "semi", sija: semi != null ? Number(semi) : null, esittaja, kappale });
    }
    if (!vuodet.size) return [];
    const viimeinen = Math.max(...vuodet.keys());
    const out: NauhaVuosi[] = [];
    for (let v = ENSIMMAINEN_VUOSI; v <= viimeinen; v++) {
      out.push(vuodet.get(v) ?? (PERUTUT.has(v) ? { vuosi: v, tila: "peruttu" } : { vuosi: v, tila: "poissa" }));
    }
    return out;
  },
  ["euroviisut-nauha-v1"],
  { revalidate: 3600 },
);
