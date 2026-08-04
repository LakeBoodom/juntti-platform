"use server";

// MEGA-HALLINTA — sekamuotoinen Mega (Heikki 4.8.2026):
// rivi voi olla visakysymys ("q:<id>") tai kuvakortin kuva ("kv:<id>").
// Koostajassa valitaan mukaan otettavat teemat: visakokoelmat + kuvakortistot.
// Kaikki rivit ovat viittauksia — mitään ei kopioida.
// HUOM: mega_questions/game_mode puuttuvat generoiduista tyypeistä → "as never".
// HUOM2: tästä tiedostosta saa exportata VAIN async-funktioita.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@juntti/db";
import { getCurrentSite } from "@/lib/sites";

const ALLOWED_SIZES = [20, 50, 100];
const MAX_PER_SOURCE = 2;

/* rowKey: "q:<question_id>" | "kv:<kuvavisa_id>" */
function parseKey(key: string): { col: "question_id" | "kuvavisa_id"; id: string } {
  return key.startsWith("kv:")
    ? { col: "kuvavisa_id", id: key.slice(3) }
    : { col: "question_id", id: key.slice(2) };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Link = { key: string; sort_order: number };
async function getLinks(megaId: string): Promise<Link[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("mega_questions" as never)
    .select("question_id, kuvavisa_id, sort_order" as never)
    .eq("mega_quiz_id", megaId);
  return ((data ?? []) as unknown as Array<{ question_id: string | null; kuvavisa_id: string | null; sort_order: number }>)
    .map((l) => ({ key: l.question_id ? `q:${l.question_id}` : `kv:${l.kuvavisa_id}`, sort_order: l.sort_order }));
}

/* Pooli: kind-bucket = kokoelma tai kv:<kortisto>; source = lähdevisa tai kortisto */
type PoolItem = { key: string; source: string; bucket: string };

async function loadPool(collections: string[], decks: string[]): Promise<PoolItem[]> {
  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();
  const pool: PoolItem[] = [];

  if (collections.length > 0) {
    const { data: quizzes } = await sb
      .from("quizzes")
      .select("id, collection" as never)
      .eq("status", "published")
      .eq("site_id", site.id)
      .neq("game_mode" as never, "mega" as never)
      .in("collection" as never, collections as never[]);
    const rows = (quizzes ?? []) as unknown as Array<{ id: string; collection: string | null }>;
    const collOf = new Map(rows.map((r) => [r.id, r.collection ?? ""]));
    const ids = rows.map((r) => r.id);
    for (let i = 0; i < ids.length; i += 100) {
      const { data: qs } = await sb
        .from("questions")
        .select("id, quiz_id")
        .in("quiz_id", ids.slice(i, i + 100));
      for (const q of (qs ?? []) as Array<{ id: string; quiz_id: string }>) {
        pool.push({ key: `q:${q.id}`, source: q.quiz_id, bucket: collOf.get(q.quiz_id) ?? "" });
      }
    }
  }

  if (decks.length > 0) {
    const { data: kvs } = await sb
      .from("kuvavisas")
      .select("id, type" as never)
      .eq("site_id" as never, site.id as never)
      .eq("active" as never, true as never)
      .in("type" as never, decks as never[]);
    for (const k of ((kvs ?? []) as unknown as Array<{ id: string; type: string }>)) {
      pool.push({ key: `kv:${k.id}`, source: `kv:${k.type}`, bucket: `kv:${k.type}` });
    }
  }
  return pool;
}

/* Guardrail-valinta: max 2/lähde, teemat (bucketit) vuorotellen */
function pickWithGuardrails(pool: PoolItem[], size: number, exclude: Set<string> = new Set()): PoolItem[] {
  const perSource = new Map<string, number>();
  const byBucket = new Map<string, PoolItem[]>();
  for (const item of shuffle(pool)) {
    if (exclude.has(item.key)) continue;
    const n = perSource.get(item.source) ?? 0;
    if (n >= MAX_PER_SOURCE) continue;
    perSource.set(item.source, n + 1);
    if (!byBucket.has(item.bucket)) byBucket.set(item.bucket, []);
    byBucket.get(item.bucket)!.push(item);
  }
  const buckets = shuffle([...byBucket.keys()]);
  const picked: PoolItem[] = [];
  let added = true;
  while (picked.length < size && added) {
    added = false;
    for (const b of buckets) {
      if (picked.length >= size) break;
      const next = byBucket.get(b)!.shift();
      if (next) { picked.push(next); added = true; }
    }
  }
  return picked;
}

function keyToInsert(megaId: string, key: string, sortOrder: number) {
  const { col, id } = parseKey(key);
  return col === "question_id"
    ? { mega_quiz_id: megaId, question_id: id, sort_order: sortOrder }
    : { mega_quiz_id: megaId, kuvavisa_id: id, sort_order: sortOrder };
}

/** Koosta uusi Mega valituista teemoista (visakokoelmat + kuvakortistot). */
export async function composeMega(input: { title: string; size: number; collections: string[]; decks: string[] }) {
  const title = input.title.trim();
  if (!title) return { ok: false as const, error: "Nimi puuttuu" };
  if (!ALLOWED_SIZES.includes(input.size)) return { ok: false as const, error: "Koko: 20, 50 tai 100" };
  if (input.collections.length + input.decks.length === 0) {
    return { ok: false as const, error: "Valitse vähintään yksi teema" };
  }
  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();

  const pool = await loadPool(input.collections, input.decks);
  const picked = pickWithGuardrails(pool, input.size);
  if (picked.length < input.size) {
    return { ok: false as const, error: `Valituissa teemoissa vain ${picked.length} kelvollista kysymystä (tavoite ${input.size})` };
  }

  const slug = title.toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { data: created, error } = await sb
    .from("quizzes")
    .insert({
      slug, title,
      display_title: title,
      teaser: null,
      category: "mega",
      collection: input.collections[0] ?? "yleistieto",
      game_mode: "mega",
      status: "draft",
      site_id: site.id,
      platform: "tietoniekka",
      difficulty: "keski",
      tone: "rento",
      description: null,
    } as never)
    .select("id")
    .single();
  if (error || !created) return { ok: false as const, error: error?.message ?? "Luonti epäonnistui" };
  const megaId = (created as { id: string }).id;

  const links = picked.map((item, i) => keyToInsert(megaId, item.key, i));
  const { error: e2 } = await sb.from("mega_questions" as never).insert(links as never);
  if (e2) return { ok: false as const, error: e2.message };

  revalidatePath("/megat");
  redirect(`/megat/${megaId}`);
}

/** Nimen ja kuvauksen muokkaus (Heikki 4.8.2026). Kuvaus = teaser,
    joka näkyy pelaajalle pelisivun aloitusnäkymässä otsikon alla.
    Slug ei muutu, joten linkit eivät hajoa. */
export async function updateMegaMeta(megaId: string, input: { title: string; teaser: string }) {
  const title = input.title.trim();
  if (!title) return { ok: false as const, error: "Nimi ei voi olla tyhjä" };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("quizzes")
    .update({ title, display_title: title, teaser: input.teaser.trim() || null } as never)
    .eq("id", megaId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/megat/${megaId}`);
  revalidatePath("/megat");
  return { ok: true as const };
}

/** Arvo tilalle satunnainen samasta teemasta (bucketista). */
export async function swapMegaRow(megaId: string, rowKey: string) {
  const sb = getSupabaseAdmin();
  const links = await getLinks(megaId);
  const target = links.find((l) => l.key === rowKey);
  if (!target) return { ok: false as const, error: "Rivi ei ole Megassa" };

  // Koko pooli (kaikki kokoelmat + kaikki kortistot), jotta bucket löytyy
  const pool = await loadPool(
    ["tv", "urheilu", "elokuvat", "musiikki", "matkakohteet", "yleistieto", "tunnetut-henkilot"],
    ["liput", "vaakunat", "linnut", "elaimet", "kasvit", "henkilot", "rakennukset", "kaupungit", "maalaukset"],
  );
  const self = pool.find((p) => p.key === rowKey);
  if (!self) return { ok: false as const, error: "Rivin lähdettä ei löytynyt poolista" };
  const inMega = new Set(links.map((l) => l.key));
  const perSource = new Map<string, number>();
  for (const p of pool) if (inMega.has(p.key) && p.key !== rowKey) {
    perSource.set(p.source, (perSource.get(p.source) ?? 0) + 1);
  }
  const candidates = shuffle(pool.filter((p) =>
    p.bucket === self.bucket && !inMega.has(p.key) && (perSource.get(p.source) ?? 0) < MAX_PER_SOURCE
  ));
  const next = candidates[0];
  if (!next) return { ok: false as const, error: "Teemassa ei ole vapaata vaihtoehtoa" };
  return replaceMegaRow(megaId, rowKey, next.key);
}

/** Manuaalinen vaihto: käyttäjän valitsema korvaaja samaan kohtaan. */
export async function replaceMegaRow(megaId: string, oldKey: string, newKey: string) {
  const sb = getSupabaseAdmin();
  const links = await getLinks(megaId);
  const target = links.find((l) => l.key === oldKey);
  if (!target) return { ok: false as const, error: "Vaihdettava rivi ei ole Megassa" };
  if (links.some((l) => l.key === newKey)) return { ok: false as const, error: "Valittu on jo Megassa" };

  const old = parseKey(oldKey);
  const { error: eDel } = await sb.from("mega_questions" as never).delete()
    .eq("mega_quiz_id", megaId).eq(old.col, old.id);
  if (eDel) return { ok: false as const, error: eDel.message };
  const { error: eIns } = await sb.from("mega_questions" as never)
    .insert(keyToInsert(megaId, newKey, target.sort_order) as never);
  if (eIns) return { ok: false as const, error: eIns.message };
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

export async function removeMegaRow(megaId: string, rowKey: string) {
  const sb = getSupabaseAdmin();
  const { col, id } = parseKey(rowKey);
  const { error } = await sb.from("mega_questions" as never).delete()
    .eq("mega_quiz_id", megaId).eq(col, id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

/** Lisää poimitut rivit (kysymyksiä ja/tai kuvia). */
export async function addMegaRows(megaId: string, rowKeys: string[]) {
  if (rowKeys.length === 0) return { ok: true as const };
  const sb = getSupabaseAdmin();
  const links = await getLinks(megaId);
  const existing = new Set(links.map((l) => l.key));
  let next = links.reduce((m, l) => Math.max(m, l.sort_order), -1) + 1;
  const rows = rowKeys.filter((k) => !existing.has(k)).map((k) => keyToInsert(megaId, k, next++));
  if (rows.length === 0) return { ok: true as const };
  const { error } = await sb.from("mega_questions" as never).insert(rows as never);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

export async function moveMegaRow(megaId: string, rowKey: string, dir: "up" | "down") {
  const sb = getSupabaseAdmin();
  const links = (await getLinks(megaId)).sort((a, b) => a.sort_order - b.sort_order);
  const idx = links.findIndex((l) => l.key === rowKey);
  if (idx === -1) return { ok: false as const, error: "Riviä ei löytynyt" };
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= links.length) return { ok: true as const };
  const a = links[idx], b = links[swapWith];
  for (const [key, so] of [[a.key, b.sort_order], [b.key, a.sort_order]] as const) {
    const { col, id } = parseKey(key);
    const { error } = await sb.from("mega_questions" as never)
      .update({ sort_order: so } as never)
      .eq("mega_quiz_id", megaId).eq(col, id);
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

/** Julkaisu: validoi koon. Julkaistu Mega näkyisi tuotantosivun listoissa
    — pidä draftina 2.0-launchiin asti. */
export async function toggleMegaPublish(megaId: string, publish: boolean) {
  const sb = getSupabaseAdmin();
  if (publish) {
    const links = await getLinks(megaId);
    if (!ALLOWED_SIZES.includes(links.length)) {
      return { ok: false as const, error: `Rivejä on ${links.length} — julkaisu vaatii tasan 20, 50 tai 100` };
    }
  }
  const { error } = await sb.from("quizzes")
    .update({ status: publish ? "published" : "draft", published_at: publish ? new Date().toISOString() : null } as never)
    .eq("id", megaId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/megat/${megaId}`);
  revalidatePath("/megat");
  return { ok: true as const };
}

export async function deleteMega(megaId: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("quizzes").delete().eq("id", megaId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/megat");
  redirect("/megat");
}

/* ── Selain: lähdevisat + kuvakortistot ── */

export async function searchSourceQuizzes(term: string) {
  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();
  let q = sb.from("quizzes")
    .select("id, title, collection" as never)
    .eq("status", "published")
    .eq("site_id", site.id)
    .neq("game_mode" as never, "mega" as never)
    .order("title")
    .limit(25);
  if (term.trim()) q = q.ilike("title", `%${term.trim()}%`);
  const { data } = await q;
  return (data ?? []) as unknown as Array<{ id: string; title: string; collection: string | null }>;
}

/** Aktiiviset kuvakortistot määrineen selaimen listaan. */
export async function listDecks() {
  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();
  const { data } = await sb.from("kuvavisas")
    .select("type" as never)
    .eq("site_id" as never, site.id as never)
    .eq("active" as never, true as never);
  const counts = new Map<string, number>();
  for (const r of ((data ?? []) as unknown as Array<{ type: string }>)) {
    counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
  }
  return [...counts.entries()].map(([type, n]) => ({ type, n }));
}

export async function loadQuizQuestions(quizId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("questions")
    .select("id, sort_order, question_text, answers")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as Array<{ id: string; question_text: string; answers: unknown }>).map((q) => ({
    key: `q:${q.id}`,
    question_text: q.question_text,
    correct: ((q.answers as Array<{ text: string; is_correct: boolean }>) ?? []).find((a) => a.is_correct)?.text ?? "",
    image_url: null as string | null,
  }));
}

export async function loadDeckImages(type: string) {
  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();
  const { data } = await sb.from("kuvavisas")
    .select("id, question, image_url, correct_option, sort_order" as never)
    .eq("site_id" as never, site.id as never)
    .eq("type" as never, type as never)
    .eq("active" as never, true as never)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as unknown as Array<{ id: string; question: string; image_url: string; correct_option: string }>).map((k) => ({
    key: `kv:${k.id}`,
    question_text: k.question,
    correct: k.correct_option,
    image_url: k.image_url,
  }));
}
