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
  /** Sijainti. Vaaditaan distance-moodin kysymyksiin, muuten null. */
  lat: number | null;
  lon: number | null;
  /** Partitiivi ("Vaasaa"). Käytetään kun entiteetti on vertailupisteenä. */
  partitive: string | null;
};

export type DuelDef = {
  key: string;
  kind: string;
  theme: string;
  subject: string;
  question: string;
  winner: "low" | "high";
  /**
   * numeric  — verrataan tallennettua lukua.
   * flag     — kumpi täyttää ehdon (esim. "kumpi heistä on näyttelijä?").
   * distance — verrataan etäisyyttä arvottuun vertailupisteeseen. Kysymysteksti
   *            syntyy vasta arvonnassa, koska vertailupiste vaihtuu.
   */
  mode: "numeric" | "flag" | "distance";
  easyGap: number | null;
  midGap: number | null;
  /** Yläraja erolle. Sitä suurempi ero = itsestään selvä kysymys, ei generoida. */
  maxGap: number | null;
  /** Alaraja erolle. Sitä pienempi ero = arvauskysymys, ei generoida. */
  minGap: number | null;
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
  /**
   * Näytettävä kysymysteksti. Yleensä sama kuin def.question, mutta
   * distance-moodissa vertailupiste arvotaan, joten teksti syntyy vasta tässä.
   */
  question: string;
  /** Arvottu vertailupiste, vain distance-moodissa. */
  ref: DuelEntity | null;
  /** Etäisyydet vertailupisteeseen kilometreinä, vain distance-moodissa. */
  dist: { a: number; b: number } | null;
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

/* ─── Etäisyys ───────────────────────────────────────────────────────
   Linnuntietä, ei maantietä. Maantie-etäisyys olisi pelaajalle tutumpi,
   mutta se vaatisi reititysrajapinnan; linnuntie on laskettavissa
   sijainnista ja riittää järjestyksen määräämiseen. Ero näytetään
   paljastuksessa nimenomaan linnuntienä, jottei se ole harhaanjohtava. */
const MAAN_SADE_KM = 6371;

export function haversineKm(a: DuelEntity, b: DuelEntity): number {
  const rad = (x: number) => (x * Math.PI) / 180;
  const la1 = rad(a.lat as number);
  const la2 = rad(b.lat as number);
  const dLa = la2 - la1;
  const dLo = rad((b.lon as number) - (a.lon as number));
  const h =
    Math.sin(dLa / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLo / 2) ** 2;
  return 2 * MAAN_SADE_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

const hasCoords = (e: DuelEntity) => e.lat !== null && e.lon !== null;

/** Suhteellinen ero kahden luvun välillä, 0 = sama, 1 = ääripää. */
const relGap = (va: number, vb: number) =>
  Math.abs(va - vb) / Math.max(Math.abs(va), Math.abs(vb), 1);

function gap(def: DuelDef, a: DuelEntity, b: DuelEntity, ref?: DuelEntity | null): number {
  if (def.mode === "distance") {
    if (!ref) return 0;
    return relGap(haversineKm(ref, a), haversineKm(ref, b));
  }
  const va = a.v[def.key];
  const vb = b.v[def.key];
  if (def.key === "birth") return Math.abs(va - vb) / YEAR_S;
  if (def.key === "year") return Math.abs(va - vb);
  return relGap(va, vb);
}

/** Kelpaako pari kysymykseksi: ei liian selvä eikä pelkkä arvaus. */
function gapOk(def: DuelDef, g: number): boolean {
  if (def.maxGap !== null && g > def.maxGap) return false;
  if (def.minGap !== null && g < def.minGap) return false;
  return true;
}

function difficultyOf(
  def: DuelDef,
  a: DuelEntity,
  b: DuelEntity,
  ref?: DuelEntity | null,
): Duel["difficulty"] {
  if (def.mode === "flag") {
    // Sama ala = vaikein mahdollinen, naapuriala = keski. Kauempaa ei generoida
    // lainkaan (ks. maxDomainDistance) koska ne ovat itsestään selviä.
    return domainDistance(a.domain, b.domain) === 0 ? "vaikea" : "keski";
  }
  const g = gap(def, a, b, ref);
  if (def.easyGap !== null && g >= def.easyGap) return "helppo";
  if (def.midGap !== null && g >= def.midGap) return "keski";
  return "vaikea";
}

/**
 * Kysymykseen kelpaavat entiteetit. Distance-moodissa ehtona on sijainti,
 * muissa se että attribuutti on ylipäänsä tallennettu.
 */
function poolFor(entities: DuelEntity[], def: DuelDef): DuelEntity[] {
  if (def.mode === "distance")
    return entities.filter((e) => e.kind === def.kind && hasCoords(e));
  return entities.filter((e) => e.kind === def.kind && e.v[def.key] !== undefined);
}

function fiDate(epoch: number): string {
  const d = new Date(epoch * 1000);
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear()}`;
}

function buildFact(
  def: DuelDef,
  w: DuelEntity,
  l: DuelEntity,
  km?: { w: number; l: number },
): string {
  // Distance-moodissa arvoa ei ole tallennettu vaan se on laskettu arvonnassa.
  const wv = km ? km.w : w.v[def.key];
  const lv = km ? km.l : l.v[def.key];
  let ero = "";
  if (def.key === "birth") {
    const y = (lv - wv) / YEAR_S;
    ero = y >= 1.5 ? `${Math.round(y)} vuotta` : `${Math.max(1, Math.round(y * 12))} kuukautta`;
  } else {
    ero = String(Math.abs(Math.round(wv - lv)));
  }
  const arvo = (e: DuelEntity, v: number) =>
    km ? `${Math.round(v)} km` : e.d[def.key] ?? String(v);
  const tpl =
    def.factTemplate ??
    (def.mode === "flag" ? "{a} kyllä, {b} ei." : "{a} {aarvo}, {b} {barvo}.");
  return tpl
    .replaceAll("{a}", w.name)
    .replaceAll("{b}", l.name)
    .replaceAll("{aarvo}", arvo(w, wv))
    .replaceAll("{barvo}", arvo(l, lv))
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
export function revealValue(duel: Duel, e: DuelEntity): string {
  const { def } = duel;
  if (def.mode === "flag") return e.role ?? "—";
  if (def.mode === "distance") {
    // Etäisyyttä ei ole tallennettu vaan se riippuu arvotusta vertailupisteestä.
    if (!duel.dist) return "—";
    const km = e.id === duel.a.id ? duel.dist.a : duel.dist.b;
    return `${Math.round(km)} km`;
  }
  return e.d[def.key] ?? String(e.v[def.key] ?? "");
}

const pick = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
// Vertailupiste kuuluu avaimeen: sama kaupunkipari on eri kysymys eri
// vertailupisteestä katsottuna.
const pairKeyOf = (key: string, a: DuelEntity, b: DuelEntity, ref?: DuelEntity | null) =>
  `${key}|${ref ? `${ref.id}|` : ""}${[a.id, b.id].sort().join("|")}`;

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
    const pool = poolFor(data.entities, def);
    if (pool.length < 2) continue;

    let a: DuelEntity, b: DuelEntity;
    let ref: DuelEntity | null = null;

    if (def.mode === "distance") {
      // Vertailupiste arvotaan samasta joukosta: "kumpi on lähempänä Vaasaa".
      // Kolme tarvitaan, koska vertailupiste ei voi olla vaihtoehtona.
      if (pool.length < 3) continue;
      ref = pick(pool);
      const rest = pool.filter((e) => e.id !== ref!.id);
      a = pick(rest);
      b = pick(rest);
    } else if (def.mode === "flag") {
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

    // Distance-moodissa vertailtava arvo lasketaan, muissa se on tallennettu.
    const dist =
      def.mode === "distance" && ref
        ? { a: haversineKm(ref, a), b: haversineKm(ref, b) }
        : null;
    const va = dist ? dist.a : a.v[def.key];
    const vb = dist ? dist.b : b.v[def.key];
    if (va === vb) continue; // ei tasapelejä, koskaan

    // Liian suuri ero = itsestään selvä kysymys ("Suomi vai Yhdysvallat").
    // Liian pieni ero = pelkkä arvaus, jota kukaan ei voi tietää.
    if (def.mode !== "flag" && !gapOk(def, gap(def, a, b, ref))) continue;

    const pairKey = pairKeyOf(def.key, a, b, ref);
    if (used.has(pairKey) || blocked.has(pairKey)) continue;
    used.add(pairKey);

    const aWins = def.mode === "flag" ? va === 1 : def.winner === "low" ? va < vb : va > vb;
    const w = aWins ? a : b;
    const l = aWins ? b : a;

    // Vertailupiste taipuu partitiiviin ("Vaasaa"); taivutus on tallennettu
    // käsin, koska sitä ei voi johtaa nimestä säännöllä.
    const refName = ref ? ref.partitive ?? ref.name : "";
    const fact = buildFact(
      def,
      w,
      l,
      dist ? { w: aWins ? dist.a : dist.b, l: aWins ? dist.b : dist.a } : undefined,
    );

    return {
      def,
      a,
      b,
      correct: aWins ? 0 : 1,
      difficulty: difficultyOf(def, a, b, ref),
      fact: fact.replaceAll("{ref}", refName),
      pairKey,
      question: def.question.replaceAll("{ref}", refName),
      ref,
      dist,
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
        "id, name, kind, role_label, show_role, domain, image_url, lat, lon, name_partitive, duel_attributes(attr_key, num_value, display_value)",
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
      lat: x.lat === null || x.lat === undefined ? null : Number(x.lat),
      lon: x.lon === null || x.lon === undefined ? null : Number(x.lon),
      partitive: x.name_partitive ?? null,
    };
    // Sijainti yksinään riittää: etäisyyskysymys ei tarvitse tallennettua arvoa.
  }).filter((e: DuelEntity) => Object.keys(e.v).length > 0 || hasCoords(e));

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
    minGap: d.min_gap === null || d.min_gap === undefined ? null : Number(d.min_gap),
    maxDomainDistance: d.max_domain_distance ?? 1,
    factTemplate: d.fact_template,
  }));

  const blocks: string[] = (blockRes.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (b: any) => `${b.attr_key}|${[b.entity_a, b.entity_b].sort().join("|")}`,
  );

  // Vain ne attribuutit joilla on tarpeeksi dataa. Ilman tätä generaattori
  // arpoisi turhaan sellaisia kysymystyyppejä joista ei synny yhtään kelpaavaa
  // paria, ja peli näyttäisi jumittuvan.
  const usable = defs.filter((def) => {
    const pool = poolFor(entities, def);
    if (def.mode === "flag") {
      const yes = pool.filter((e) => e.v[def.key] === 1);
      const no = pool.filter((e) => e.v[def.key] === 0);
      return yes.some((w) =>
        no.some((x) => domainDistance(w.domain, x.domain) <= def.maxDomainDistance),
      );
    }
    if (def.mode === "distance") {
      // Vähintään yksi vertailupiste + pari, jonka ero osuu sallittuun kaistaan.
      if (pool.length < 3) return false;
      for (const ref of pool)
        for (let i = 0; i < pool.length; i++)
          for (let j = i + 1; j < pool.length; j++) {
            const a = pool[i];
            const b = pool[j];
            if (a.id === ref.id || b.id === ref.id) continue;
            const da = haversineKm(ref, a);
            const db = haversineKm(ref, b);
            if (da !== db && gapOk(def, relGap(da, db))) return true;
          }
      return false;
    }
    if (def.maxGap === null && def.minGap === null) return pool.length >= 2;
    // Vähintään yksi pari sallitun kaistan sisällä
    for (let i = 0; i < pool.length; i++)
      for (let j = i + 1; j < pool.length; j++)
        if (pool[i].v[def.key] !== pool[j].v[def.key] && gapOk(def, gap(def, pool[i], pool[j])))
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
