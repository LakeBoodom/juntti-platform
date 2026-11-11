// FAKTAPOOLI: aikajana (entity_timeline) ja faktat (entity_facts) tuleville pelimuodoille.
// Tietomallin vaihe B (11.11.2026). Ei vielä käyttöä UI:ssa.
//
// Vaikeus ei tule pelkästä kysymyksestä vaan siitä, kuinka tunnettu fakta on (notability):
//   3 = ikoninen (kaikki tietävät), 2 = tuore tai erityinen, 1 = arkisto (vain harrastajat).
// allowedNotability kertoo, mitkä luokat kelpaavat poolin laajuuden ja tason mukaan
// (TIETOMALLI_VAIKEUSTASOT §2). Mitä laajempi pooli, sitä tunnetumpaa faktaa vaaditaan:
// sekoituksessa pelaaja ei tiedä etukäteen, mistä kysytään.
//
// RLS: anon-avaimella näkyvät vain julkaistujen entiteettien rivit ja faktoista vain status='approved'.

import { getSupabase } from "./supabase";

/** entity = yhden entiteetin oma pooli, group = ryhmän yhteinen (festivaalit), mixed = koko sekoitus. */
export type PoolScope = "entity" | "group" | "mixed";
export type Level = "helppo" | "keski" | "vaikea";
/** recall = suora muistikysymys, deduction = päättelypeli (kartta, järjestys). */
export type FactMode = "recall" | "deduction";

const TAULUKKO: Record<PoolScope, Record<Level, number[]>> = {
  entity: { helppo: [3], keski: [3, 2], vaikea: [3, 2] },
  group: { helppo: [3], keski: [3], vaikea: [3, 2] },
  mixed: { helppo: [3], keski: [3], vaikea: [3] },
};

/**
 * Sallitut notability-luokat (TIETOMALLI_VAIKEUSTASOT §2).
 * Arkistoluokka 1 on sallittu vain entiteetin omassa poolissa vaikealla tasolla ja vain
 * päättelypeleissä: kartalla tai järjestyksessä arkistotiedon voi päätellä, suoraan muistaa harva.
 */
export function allowedNotability(scope: PoolScope, level: Level, mode: FactMode): number[] {
  const perus = TAULUKKO[scope][level];
  if (scope === "entity" && level === "vaikea" && mode === "deduction") return [...perus, 1];
  return [...perus];
}

export type TimelineRow = {
  id: string;
  entity_id: string;
  year: number;
  season: string | null;
  entry_type: string;
  value_text: string | null;
  num_value: number | null;
  metric: string | null;
  linked_entity: string | null;
  detail: string | null;
  notability: number;
  source: string;
};

export type FactRow = {
  id: string;
  entity_id: string;
  fact_type: "story" | "clue";
  text: string;
  /** Vain vihjeillä: 1 = vaikein … 5 = helpoin. */
  clue_level: number | null;
  notability: number;
  source: string;
};

/** Entiteettien aikajana vanhimmasta uusimpaan. Tyhjä lista, jos tunnisteita tai luokkia ei ole. */
export async function getTimeline(
  entityIds: string[],
  opts: { entryTypes?: string[]; notability: number[] },
): Promise<TimelineRow[]> {
  const sb = getSupabase();
  if (!sb || !entityIds.length || !opts.notability.length) return [];
  let q = sb
    .from("entity_timeline")
    .select("id, entity_id, year, season, entry_type, value_text, num_value, metric, linked_entity, detail, notability, source")
    .in("entity_id", entityIds)
    .in("notability", opts.notability);
  if (opts.entryTypes?.length) q = q.in("entry_type", opts.entryTypes);
  const { data, error } = await q.order("year", { ascending: true }).order("entity_id");
  if (error) {
    console.error("getTimeline:", error);
    return [];
  }
  return (data ?? []).map((r) => ({ ...r, num_value: r.num_value === null ? null : Number(r.num_value) }));
}

/**
 * Hyväksytyt faktat. Vihjeet järjestetään vaikeimmasta helpoimpaan (clue_level 1 → 5),
 * eli siinä järjestyksessä kuin vihjepeli ne näyttää. Tarinat entiteeteittäin.
 */
export async function getFacts(
  entityIds: string[],
  opts: { factType: "story" | "clue"; notability: number[] },
): Promise<FactRow[]> {
  const sb = getSupabase();
  if (!sb || !entityIds.length || !opts.notability.length) return [];
  const { data, error } = await sb
    .from("entity_facts")
    .select("id, entity_id, fact_type, text, clue_level, notability, source")
    .in("entity_id", entityIds)
    .eq("fact_type", opts.factType)
    .eq("status", "approved")
    .in("notability", opts.notability)
    .order("entity_id")
    .order("clue_level", { ascending: true, nullsFirst: false })
    .order("id");
  if (error) {
    console.error("getFacts:", error);
    return [];
  }
  return (data ?? []) as FactRow[];
}
