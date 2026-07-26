// KUMPI? — kaksintaistelupelin data ja generaattori.
//
// Kysymyksiä ei kirjoiteta käsin: ne lasketaan entiteeteistä ja attribuuteista.
// Sama logiikka ajetaan sekä palvelimella (etusivun esikatselu) että selaimessa
// (peli), joten generaattori on puhdas funktio ilman DB-riippuvuutta.

import { getSupabase } from "./supabase";

export type DuelEntity = {
  id: string;
  name: string;
  kind: string;
  role: string | null;
  showRole: boolean;
  domain: string | null;
  image: string | null;
  v: Record<string, number>;
  d: Record<string, string>;
};

export type DuelDef = {
  key: string;
  kind: string;
  theme: string;
  subject: string;
  question: string;
  winner: "low" | "high";
  mode: "numeric" | "flag";
  easyGap: number | null;
  midGap: number | null;
  /** Yläraja erolle. Sitä suurempi ero = itsestään selvä kysymys, ei generoida. */
  maxGap: number | null;
  /** Lipuille: kuinka kaukaa harhautin saa tulla (alojen etäisyys 0–3). */
  maxDomainDistance: number;
  factTemplate: string | null;
};

export type DuelData = { entities: DuelEntity[]; defs: DuelDef[]; blocks: string[] };

export type Duel = {
  def: DuelDef;
  a: DuelEntity;
  b: DuelEntity;
  correct: 0 | 1;
  difficulty: "helppo" | "keski" | "vaikea";
  fact: string;
  pairKey: string;
};

/* ─── Alojen etäisyys ────────────────────────────────────────────────
   Numeerisessa kysymyksessä vaikeus tulee arvojen erosta. Lipussa
   ("kumpi heistä on poliitikko?") eroa ei ole, joten sen tilalla on
   alojen etäisyys: mitä lähempänä väärä vaihtoehto on oikeaa, sitä
   vaikeampi kysymys. Ilman tätä lähes jokainen lippukysymys olisi
   "poliitikko vai jääkiekkoilija", eli itsestään selvä.            */
const DOMAIN_NEAR: Record<string, string[]> = {
  musiikki: ["nayttelemine", "media", "kulttuuri"],
  nayttelemine: ["musiikki", "media", "kulttuuri"],
  media: ["musiikki", "nayttelemine", "kulttuuri", "politiikka", "talous"],
  kulttuuri: ["musiikki", "nayttelemine", "media"],
  politiikka: ["media", "talous"],
  talous: ["media", "politiikka"],
  urheilu: [],
};

export function domainDistance(a: string | null, b: string | null): number {
  if (!a || !b) return 2;
  if (a === b) return 0;
  if ((DOMAIN_NEAR[a] ?? []).includes(b)) return 1;
  if (a === "urheilu" || b === "urheilu") return 3;
  return 2;
}

const YEAR_S = 365.25 * 86400;

function gap(def: DuelDef, a: DuelEntity, b: DuelEntity): number {
  const va = a.v[def.key];
  const vb = b.v[def.key];
  if (def.key === "birth") return Math.abs(va - vb) / YEAR_S;
  if (def.key === "year") return Math.abs(va - vb);
  return Math.abs(va - vb) / Math.max(Math.abs(va), Math.abs(vb), 1);
}

function difficultyOf(def: DuelDef, a: DuelEntity, b: DuelEntity): Duel["difficulty"] {
  if (def.mode === "flag") {
    // Sama ala = vaikein mahdollinen, naapuriala = keski. Kauempaa ei generoida
    // lainkaan (ks. maxDomainDistance) koska ne ovat itsestään selviä.
    return domainDistance(a.domain, b.domain) === 0 ? "vaikea" : "keski";
  }
  const g = gap(def, a, b);
  if (def.easyGap !== null && g >= def.easyGap) return "helppo";
  if (def.midGap !== null && g >= def.midGap) return "keski";
  return "vaikea";
}

function fiDate(epoch: number): string {
  const d = new Date(epoch * 1000);
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear()}`;
}

function buildFact(def: DuelDef, w: DuelEntity, l: DuelEntity): string {
  const wv = w.v[def.key];
  const lv = l.v[def.key];
  let ero = "";
  if (def.key === "birth") {
    const y = (lv - wv) / YEAR_S;
    ero = y >= 1.5 ? `${Math.round(y)} vuotta` : `${Math.max(1, Math.round(y * 12))} kuukautta`;
  } else {
    ero = String(Math.abs(Math.round(wv - lv)));
  }
  const tpl =
    def.factTemplate ??
    (def.mode === "flag" ? "{a} kyllä, {b} ei." : "{a} {aarvo}, {b} {barvo}.");
  return tpl
    .replaceAll("{a}", w.name)
    .replaceAll("{b}", l.name)
    .replaceAll("{aarvo}", w.d[def.key] ?? String(wv))
    .replaceAll("{barvo}", l.d[def.key] ?? String(lv))
    .replaceAll("{apvm}", def.key === "birth" ? fiDate(wv) : "")
    .replaceAll("{bpvm}", def.key === "birth" ? fiDate(lv) : "")
    .replaceAll("{brooli}", (l.role ?? "jotain muuta").toLowerCase())
    .replaceAll("{ero}", ero);
}

/** Lippukysymyksessä rooli EI saa näkyä kortilla — se paljastaisi vastauksen. */
export function showRoleOnCard(def: DuelDef, e: DuelEntity): boolean {
  return def.mode !== "flag" && e.showRole && !!e.role;
}

/** Paljastuksessa näytettävä arvo. Lipulla se on rooli, numeerisella luku. */
export function revealValue(def: DuelDef, e: DuelEntity): string {
  if (def.mode === "flag") return e.role ?? "—";
  return e.d[def.key] ?? String(e.v[def.key] ?? "");
}

const pick = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
const pairKeyOf = (key: string, a: DuelEntity, b: DuelEntity) =>
  `${key}|${[a.id, b.id].sort().join("|")}`;

/**
 * Arpoo yhden kaksintaistelun. `used` estää saman parin toistumisen istunnossa,
 * `blocks` sisältää adminissa hylätyt parit.
 */
export function makeDuel(
  data: DuelData,
  theme: string,
  used: Set<string>,
): Duel | null {
  const blocked = new Set(data.blocks);
  const usableDefs = data.defs.filter(
    (d) => theme === "sekoitus" || d.theme === theme,
  );
  if (!usableDefs.length) return null;

  for (let attempt = 0; attempt < 400; attempt++) {
    const def = pick(usableDefs);
    const pool = data.entities.filter(
      (e) => e.kind === def.kind && e.v[def.key] !== undefined,
    );
    if (pool.length < 2) continue;

    let a: DuelEntity, b: DuelEntity;

    if (def.mode === "flag") {
      const yes = pool.filter((e) => e.v[def.key] === 1);
      const no = pool.filter((e) => e.v[def.key] === 0);
      if (!yes.length || !no.length) continue;
      const w = pick(yes);
      // Harhautin saa tulla vain riittävän läheiseltä alalta. Ilman tätä
      // valtaosa kysymyksistä olisi "poliitikko vai jääkiekkoilija".
      const near = no.filter(
        (e) => domainDistance(w.domain, e.domain) <= def.maxDomainDistance,
      );
      if (!near.length) continue;
      const x = pick(near);
      if (!x || x.id === w.id) continue;
      [a, b] = Math.random() < 0.5 ? [w, x] : [x, w];
    } else {
      a = pick(pool);
      b = pick(pool);
    }

    if (a.id === b.id) continue;
    const va = a.v[def.key];
    const vb = b.v[def.key];
    if (va === vb) continue; // ei tasapelejä, koskaan

    // Liian suuri ero = itsestään selvä kysymys. "Kummassa on enemmän
    // asukkaita, Suomi vai Yhdysvallat" ei ole kysymys vaan toteamus.
    if (def.mode === "numeric" && def.maxGap !== null && gap(def, a, b) > def.maxGap) continue;

    const pairKey = pairKeyOf(def.key, a, b);
    if (used.has(pairKey) || blocked.has(pairKey)) continue;
    used.add(pairKey);

    const aWins = def.mode === "flag" ? va === 1 : def.winner === "low" ? va < vb : va > vb;
    const w = aWins ? a : b;
    const l = aWins ? b : a;

    return {
      def,
      a,
      b,
      correct: aWins ? 0 : 1,
      difficulty: difficultyOf(def, a, b),
      fact: buildFact(def, w, l),
      pairKey,
    };
  }
  return null;
}

/* ─── DB-haku ─────────────────────────────────────────────────────── */

export async function getDuelData(): Promise<DuelData | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const [entRes, defRes, blockRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sb as any)
      .from("duel_entities")
      .select(
        "id, name, kind, role_label, show_role, domain, image_url, duel_attributes(attr_key, num_value, display_value)",
      )
      .eq("status", "published")
      .limit(2000),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sb as any).from("duel_attribute_defs").select("*").eq("enabled", true),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sb as any).from("duel_pair_blocks").select("attr_key, entity_a, entity_b"),
  ]);

  if (entRes.error || defRes.error) {
    console.error("getDuelData:", entRes.error ?? defRes.error);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entities: DuelEntity[] = (entRes.data ?? []).map((x: any) => {
    const v: Record<string, number> = {};
    const d: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const a of x.duel_attributes ?? []) {
      v[a.attr_key] = Number(a.num_value);
      if (a.display_value) d[a.attr_key] = a.display_value;
    }
    return {
      id: x.id,
      name: x.name,
      kind: x.kind,
      role: x.role_label,
      showRole: x.show_role !== false,
      domain: x.domain,
      image: x.image_url,
      v,
      d,
    };
  }).filter((e: DuelEntity) => Object.keys(e.v).length > 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defs: DuelDef[] = (defRes.data ?? []).map((d: any) => ({
    key: d.attr_key,
    kind: d.kind,
    theme: d.theme,
    subject: d.subject_label ?? "KUMPI",
    question: d.question_text,
    winner: d.winner,
    mode: d.compare_mode ?? "numeric",
    easyGap: d.easy_gap === null ? null : Number(d.easy_gap),
    midGap: d.mid_gap === null ? null : Number(d.mid_gap),
    maxGap: d.max_gap === null || d.max_gap === undefined ? null : Number(d.max_gap),
    maxDomainDistance: d.max_domain_distance ?? 1,
    factTemplate: d.fact_template,
  }));

  const blocks: string[] = (blockRes.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (b: any) => `${b.attr_key}|${[b.entity_a, b.entity_b].sort().join("|")}`,
  );

  // Vain ne attribuutit joilla on tarpeeksi dataa
  const usable = defs.filter((def) => {
    const pool = entities.filter((e) => e.kind === def.kind && e.v[def.key] !== undefined);
    if (def.mode === "flag") {
      const yes = pool.filter((e) => e.v[def.key] === 1);
      const no = pool.filter((e) => e.v[def.key] === 0);
      return yes.some((w) =>
        no.some((x) => domainDistance(w.domain, x.domain) <= def.maxDomainDistance),
      );
    }
    if (def.maxGap === null) return pool.length >= 2;
    // Vähintään yksi pari ylärajan sisällä
    for (let i = 0; i < pool.length; i++)
      for (let j = i + 1; j < pool.length; j++)
        if (pool[i].v[def.key] !== pool[j].v[def.key] && gap(def, pool[i], pool[j]) <= def.maxGap)
          return true;
    return false;
  });

  return { entities, defs: usable, blocks };
}

export const DUEL_THEMES = [
  { id: "sekoitus", label: "Sekoitus" },
  { id: "ihmiset", label: "Ihmiset" },
  { id: "suomi", label: "Suomi" },
  { id: "maantieto", label: "Maantieto" },
  { id: "luonto", label: "Luonto" },
  { id: "historia", label: "Historia" },
];
