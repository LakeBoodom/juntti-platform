// Laadulliset järjestyspakat henkilösivulle (TOTEUTUSBRIEF_LAADULLINEN_JARJESTYS_2026_10_04.md).
// Henkilösivun pelihyllyn nosto on "Laita järjestykseen: eniten F1-voittoja" -tyyppinen pakka, kun
// henkilöllä on laadullista dataa; Ikäjärjestys jää varalle.
//
// Data: fact_entities (kind 'person', celebrity_id) → fact_attributes; mittarit ovat
// fact_attribute_defs-rivejä (kind 'person', rank_label asetettu, ei 'birth'), enabled-lipusta
// riippumatta (se koskee vain Kumpi?-peliä). Otsikko johdetaan defin fact_templatesta
// ("F1-voittoja: {a} …" → "eniten F1-voittoja"), joten koodissa ei ole mittarikohtaisia tekstejä.
import type { SupabaseClient } from "@supabase/supabase-js";
import { nimiVuotaa, type Vuotolista } from "./vuotolista";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sb = SupabaseClient<any, any, any>;

export type LaatuDef = {
  attr_key: string;
  unit_label: string;
  winner: "high" | "low";
  /** "F1-voittoja", "Rallin MM-tittelejä" */
  mittari: string;
  /** Pakan otsikko: fact_attribute_defs.jarjesta_title ("Eniten F1-voittoja", "Pääministerit
   *  aikajärjestyksessä"); varalla johdettu "eniten F1-voittoja". */
  otsikko: string;
  /** rank_label: "eniten voittoja ottaneesta vähimpään", "ensimmäisestä viimeisimpään". */
  jarjestys: string;
  /** Akselin päät: määrämittarilla "Eniten"/"Vähiten", aikajärjestyksessä "Ensin"/"Viimeisenä". */
  akseli: [string, string];
};

export type LaatuArvo = { celebId: string; value: number; display: string; asOf: string | null };

const pieniAlku = (s: string) => (s.length > 1 && s[1] === s[1].toLowerCase() && /[a-zåäö]/.test(s[1]) ? s[0].toLowerCase() + s.slice(1) : s);

export async function haeLaatuDefit(sb: Sb): Promise<Map<string, LaatuDef>> {
  const { data } = await sb
    .from("fact_attribute_defs")
    .select("attr_key, unit_label, winner, fact_template, rank_label, jarjesta_title")
    .eq("kind", "person")
    .not("rank_label", "is", null)
    .neq("attr_key", "birth");
  const m = new Map<string, LaatuDef>();
  for (const d of (data ?? []) as Array<{ attr_key: string; unit_label: string | null; winner: string | null; fact_template: string | null; rank_label: string | null; jarjesta_title: string | null }>) {
    // 8.10.2026: kaikki templatet eivät ole muotoa "Mittari: {a} …" (pm_start: "{a} aloitti pääministerinä
    // {apvm}, …") → otsikko tulee jarjesta_titlesta, ei templaten alusta. Ilman kumpaakaan mittari ohitetaan.
    const alku = (d.fact_template ?? "").split(":")[0].trim();
    const jt = d.jarjesta_title?.trim() || null;
    const mittari = alku && !alku.includes("{") ? alku : jt;
    if (!mittari) continue;
    const winner = d.winner === "low" ? "low" : "high";
    const maara = !jt || /^(eniten|vähiten|pisimpään|lyhimpään)\b/i.test(jt);
    m.set(d.attr_key, {
      attr_key: d.attr_key,
      unit_label: d.unit_label ?? "",
      winner,
      mittari,
      otsikko: jt ?? `${winner === "high" ? "eniten" : "vähiten"} ${pieniAlku(mittari)}`,
      jarjestys: d.rank_label?.trim() || `${winner === "high" ? "eniten" : "vähiten"} ylimmäksi`,
      akseli: maara ? (winner === "high" ? ["Eniten", "Vähiten"] : ["Vähiten", "Eniten"]) : ["Ensin", "Viimeisenä"],
    });
  }
  return m;
}

/** Mittarin arvot henkilöittäin (vain celebrities-riviin linkitetyt person-entiteetit). */
export async function haeLaatuArvot(sb: Sb, keys: string[], celebIdt?: string[]): Promise<Map<string, LaatuArvo[]>> {
  const out = new Map<string, LaatuArvo[]>();
  if (!keys.length) return out;
  let q = sb
    .from("fact_attributes")
    .select("attr_key, num_value, display_value, as_of, fact_entities!inner(celebrity_id, kind)")
    .in("attr_key", keys)
    .eq("scope", "")
    .eq("fact_entities.kind", "person")
    .not("fact_entities.celebrity_id", "is", null)
    .not("num_value", "is", null);
  if (celebIdt) q = q.in("fact_entities.celebrity_id", celebIdt);
  const { data } = await q;
  for (const r of (data ?? []) as unknown as Array<{ attr_key: string; num_value: number | string; display_value: string | null; as_of: string | null; fact_entities: { celebrity_id: string } }>) {
    const v = Number(r.num_value);
    if (!Number.isFinite(v)) continue;
    out.set(r.attr_key, [
      ...(out.get(r.attr_key) ?? []),
      { celebId: r.fact_entities.celebrity_id, value: v, display: (r.display_value ?? String(v)).trim(), asOf: r.as_of },
    ]);
  }
  return out;
}

/* Yksikkö on kannassa partitiivina ("voittoa"), joka on oikein luvuilla 0 ja 2+. Luvulla 1 tarvitaan
   nominatiivi ("1 voitto") — kielioppia, ei mittaridataa, joten pieni taulukko koodissa riittää.
   Tuntematon yksikkö jää partitiiviin mieluummin kuin keksitty muoto. */
const YKSIKKO: Record<string, string> = {
  voittoa: "voitto", maalia: "maali", pistettä: "piste", ottelua: "ottelu", maaottelua: "maaottelu",
  lähtöä: "lähtö", paalupaikkaa: "paalupaikka", mestaruutta: "mestaruus", syöttöä: "syöttö", mitalia: "mitali",
};

export const arvoTeksti = (d: LaatuDef, a: LaatuArvo) => {
  if (!/^[\d\s\u00a0.,]+$/.test(a.display) || !d.unit_label) return a.display;
  const yks = a.value === 1 ? YKSIKKO[d.unit_label] ?? d.unit_label : d.unit_label;
  return `${a.display} ${yks}`;
};

const LUKU = ["nolla", "yksi", "kaksi", "kolme", "neljä", "viisi", "kuusi", "seitsemän", "kahdeksan", "yhdeksän"];
export const lukuSana = (n: number) => LUKU[n] ?? String(n);

export type PoolHenkilo = { id: string; name: string; laji: string | null; ryhma: string; image_url: string | null };

export type LaatuPakka = {
  def: LaatuDef;
  /** Henkilö ensin, sitten muut (siemenellä sekoitettuina, samalla järjestyksellä koko päivän). */
  jasenet: PoolHenkilo[];
};

/**
 * Pakan valinta (brief §2): henkilön mittareista se, jolla on eniten muita samassa lajissa
 * (tasatilanteessa siemen päivä + slug); pooli 8 = henkilö + 7 (sama laji → sama ryhmä → muut);
 * alle 5 henkilön mittari pudotetaan; vastustajaksi ei visan vastausta; jos henkilön oma arvo on
 * visan vastaus (luku), mittari pudotetaan.
 */
export function valitseLaatuPakka(opts: {
  henkilo: PoolHenkilo;
  kaikki: PoolHenkilo[];
  defit: Map<string, LaatuDef>;
  arvot: Map<string, LaatuArvo[]>;
  lista: Vuotolista;
  vastausLuvut: Set<number>;
  rnd: () => number;
  sekoita: <T>(a: T[], rnd: () => number) => T[];
}): LaatuPakka | null {
  const { henkilo, kaikki, defit, arvot, lista, vastausLuvut, rnd, sekoita } = opts;
  const henkilot = new Map(kaikki.map((h) => [h.id, h]));
  const ehdokkaat: Array<{ def: LaatuDef; muut: PoolHenkilo[]; samaLaji: number }> = [];
  for (const [key, rivit] of arvot) {
    const def = defit.get(key);
    const oma = rivit.find((r) => r.celebId === henkilo.id);
    if (!def || !oma) continue;
    if (vastausLuvut.has(oma.value)) continue; // oma arvo on visan vastaus → ei tätä pakkaa
    const muut = rivit
      .filter((r) => r.celebId !== henkilo.id)
      .map((r) => henkilot.get(r.celebId))
      .filter((h): h is PoolHenkilo => !!h && !nimiVuotaa(h.name, lista));
    if (muut.length + 1 < 5) continue;
    ehdokkaat.push({ def, muut, samaLaji: muut.filter((h) => henkilo.laji && h.laji === henkilo.laji).length });
  }
  if (!ehdokkaat.length) return null;
  const paras = Math.max(...ehdokkaat.map((e) => e.samaLaji));
  const valittavat = ehdokkaat.filter((e) => e.samaLaji === paras).sort((a, b) => a.def.attr_key.localeCompare(b.def.attr_key));
  const valittu = valittavat[Math.floor(rnd() * valittavat.length)];
  const taso = (h: PoolHenkilo) => (henkilo.laji && h.laji === henkilo.laji ? 0 : h.ryhma === henkilo.ryhma ? 1 : 2);
  const muut = [0, 1, 2].flatMap((t) => sekoita(valittu.muut.filter((h) => taso(h) === t), rnd)).slice(0, 7);
  return { def: valittu.def, jasenet: [henkilo, ...muut] };
}
