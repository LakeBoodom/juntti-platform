// SEO-erä A3 (2.10.2026): ristiinnostojen algoritmi. Aiemmin relQ.order("published_at").limit(6)
// antoi jokaiselle kokoelman visalle samat kuusi uusinta → sisäinen linkitys keskittyi muutamaan
// visaan. Nyt portaittainen haku, satunnaistettu joka portaalla, täydennys seuraavalta portaalta:
//   henkilövisat: sama laji → sama ryhmä → sama syntymävuosikymmen → Tunnetut henkilöt
//   muut:         sama genre → sama kokoelma (resolveCollection) → kokoelman naapurit
// Sama funktio käytetään henkilösivulla (erä B4).
import type { SupabaseClient } from "@supabase/supabase-js";
import { COLLECTION_NEIGHBORS, type Resolved } from "@/lib/visanKokoelma";

export type RelatedRow = {
  id: string; slug: string | null; custom_slug: string | null;
  display_title: string | null; title: string; teaser: string | null;
  collection: string | null; genre: string | null; question_count: number;
  /** Lasten visoilla 4-7 / 8-12 → ikämerkki ristinostoissa (vaihe 5) */
  target_age?: string | null;
};

const SEL = "id, slug, custom_slug, display_title, title, teaser, collection, genre, question_count, category, target_age";
const ERA = 60;

function sekoita<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sb = SupabaseClient<any, any, any>;
type Kysely = any;

class Keraaja {
  valitut: RelatedRow[] = [];
  nahty: Set<string>;
  constructor(private n: number, ohita: string[]) {
    this.nahty = new Set(ohita);
  }
  get taynna() {
    return this.valitut.length >= this.n;
  }
  lisaa(rows: RelatedRow[] | null | undefined) {
    for (const r of sekoita(rows ?? [])) {
      if (this.taynna) break;
      if (this.nahty.has(r.id)) continue;
      this.nahty.add(r.id);
      this.valitut.push(r);
    }
  }
}

function pohja(sb: Sb, ohita: string[]): Kysely {
  let q = sb.from("quiz_cards" as never).select(SEL).neq("game_mode" as never, "mega").limit(ERA);
  if (ohita.length) q = q.not("id", "in", `(${ohita.join(",")})`);
  return q;
}

/** Kokoelman oma joukko (sama logiikka kuin aiemmin pelisivulla). */
export function kokoelmanJoukko(q: Kysely, r: Pick<Resolved, "key">, collection: string | null): Kysely {
  return r.key === "kaupungit" ? q.eq("category", "kaupungit")
    : r.key === "tiede" ? q.eq("category", "tiede-teknologia")
    : r.key === "jaakiekko" ? q.or("category.eq.jaakiekko,genre.eq.jaakiekko")
    : r.key === "jalkapallo" ? q.eq("genre", "jalkapallo")
    : r.key === "vaalit" ? q.eq("category", "politiikka")
    : r.key === "yleistieto" ? q.eq("collection", "yleistieto").neq("category", "kaupungit").neq("category", "ruoka-juoma")
    : q.eq("collection", collection ?? r.key);
}

/** Naapurikokoelman suodatin (avain voi olla myös kaupungit/tiede/jääkiekko/jalkapallo). */
function naapuri(q: Kysely, avain: string): Kysely {
  return kokoelmanJoukko(q, { key: avain }, ["kaupungit", "tiede", "jaakiekko", "jalkapallo", "yleistieto"].includes(avain) ? null : avain);
}

export type HenkiloAvain = { laji: string | null; ryhma: string | null; birth_date: string | null };

/** Henkilöportaat: celebrities-suodatin → visojen id:t → quiz_cards. */
async function henkiloPortaat(sb: Sb, k: Keraaja, h: HenkiloAvain, ohita: string[]) {
  const portaat: Array<(q: Kysely) => Kysely> = [];
  if (h.laji) portaat.push((q) => q.eq("laji", h.laji));
  if (h.ryhma) portaat.push((q) => q.eq("ryhma", h.ryhma));
  const v = h.birth_date ? Number(h.birth_date.slice(0, 4)) : NaN;
  if (Number.isFinite(v)) {
    const d = Math.floor(v / 10) * 10;
    portaat.push((q) => q.gte("birth_date", `${d}-01-01`).lte("birth_date", `${d + 9}-12-31`));
  }
  for (const porras of portaat) {
    if (k.taynna) return;
    const { data } = await porras(sb.from("celebrities").select("trivia_quiz_id").not("trivia_quiz_id", "is", null).limit(400));
    const idt = sekoita(((data ?? []) as Array<{ trivia_quiz_id: string }>).map((c) => c.trivia_quiz_id))
      .filter((id) => !k.nahty.has(id))
      .slice(0, ERA);
    if (!idt.length) continue;
    const { data: rows } = await sb.from("quiz_cards" as never).select(SEL).in("id", idt).neq("game_mode" as never, "mega");
    k.lisaa(rows as unknown as RelatedRow[]);
  }
  if (!k.taynna) {
    const { data } = await pohja(sb, ohita).eq("collection", "tunnetut-henkilot");
    k.lisaa(data as RelatedRow[]);
  }
}

/** Visasivun ristiinnostot (6 kpl). */
export async function haeRistiinnostot(
  sb: Sb,
  quiz: { id: string; collection: string | null; category: string | null; genre: string | null },
  resolved: Pick<Resolved, "key">,
  n = 6,
): Promise<RelatedRow[]> {
  const ohita = [quiz.id];
  const k = new Keraaja(n, ohita);

  if (quiz.collection === "tunnetut-henkilot") {
    const { data } = await sb.from("celebrities").select("laji, ryhma, birth_date").eq("trivia_quiz_id", quiz.id).maybeSingle();
    const h = (data ?? { laji: null, ryhma: null, birth_date: null }) as HenkiloAvain;
    await henkiloPortaat(sb, k, h, ohita);
    return k.valitut;
  }

  const eiJuhlia = (q: Kysely) => (quiz.collection === "juhlat" ? q : q.neq("collection", "juhlat"));
  if (quiz.genre) {
    const { data } = await eiJuhlia(pohja(sb, ohita).eq("genre", quiz.genre));
    k.lisaa(data as RelatedRow[]);
  }
  if (!k.taynna) {
    const { data } = await kokoelmanJoukko(pohja(sb, ohita), resolved, quiz.collection);
    k.lisaa(data as RelatedRow[]);
  }
  for (const avain of COLLECTION_NEIGHBORS[resolved.key] ?? []) {
    if (k.taynna) break;
    const { data } = await eiJuhlia(naapuri(pohja(sb, ohita), avain));
    k.lisaa(data as RelatedRow[]);
  }
  return k.valitut;
}

/** Henkilösivun "Muista kokoelmista" / pelihylly (erä B4): henkilöportaat ilman visaa itseään. */
export async function haeHenkilonRistiinnostot(sb: Sb, h: HenkiloAvain, ohitaVisa: string | null, n = 3) {
  const ohita = ohitaVisa ? [ohitaVisa] : [];
  const k = new Keraaja(n, ohita);
  await henkiloPortaat(sb, k, h, ohita);
  return k.valitut;
}
