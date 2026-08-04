"use server";

// MEGA-HALLINTA (Heikki hyväksyi ehdotuksen 3.8.2026, MEGA_SPEC §2 + §7)
// Mega on viittauskooste: mega_questions linkittää olemassa olevia
// kysymyksiä — mitään ei kopioida. Automaatti ehdottaa, Heikki lukitsee.
// HUOM: mega_questions/game_mode puuttuvat generoiduista tyypeistä →
// "as never" -castit samaan tapaan kuin tietoniekka-appissa.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@juntti/db";
import { getCurrentSite } from "@/lib/sites";

const MAIN_COLLECTIONS = [
  "tv", "urheilu", "elokuvat", "musiikki", "matkakohteet", "yleistieto", "tunnetut-henkilot",
];
// HUOM: "use server" -tiedostosta saa exportata VAIN async-funktioita —
// tämän vakion export kaatoi kaikki actionit ajossa (Heikin bugiraportti 4.8.2026)
const ALLOWED_SIZES = [20, 50, 100];
const MAX_PER_SOURCE = 2;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PoolQ = { id: string; quiz_id: string; collection: string };

/** Julkaistujen visojen kysymyspooli (id-tasolla, kevyt). */
async function loadPool(scope: string): Promise<PoolQ[]> {
  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();
  const collections = scope === "kaikki" ? MAIN_COLLECTIONS : [scope];
  const { data: quizzes } = await sb
    .from("quizzes")
    .select("id, collection" as never)
    .eq("status", "published")
    .eq("site_id", site.id)
    .in("collection" as never, collections as never[]);
  const rows = (quizzes ?? []) as unknown as Array<{ id: string; collection: string | null }>;
  if (rows.length === 0) return [];
  const collOf = new Map(rows.map((r) => [r.id, r.collection ?? ""]));
  const ids = rows.map((r) => r.id);
  const pool: PoolQ[] = [];
  // Haetaan erissä (in-listan pituusraja)
  for (let i = 0; i < ids.length; i += 100) {
    const { data: qs } = await sb
      .from("questions")
      .select("id, quiz_id")
      .in("quiz_id", ids.slice(i, i + 100));
    for (const q of (qs ?? []) as Array<{ id: string; quiz_id: string }>) {
      pool.push({ id: q.id, quiz_id: q.quiz_id, collection: collOf.get(q.quiz_id) ?? "" });
    }
  }
  return pool;
}

/** Guardrail-valinta: max 2/lähdevisa, kokoelmat vuorotellen. */
function pickWithGuardrails(pool: PoolQ[], size: number, exclude: Set<string> = new Set()): PoolQ[] {
  const perQuiz = new Map<string, number>();
  const byColl = new Map<string, PoolQ[]>();
  for (const q of shuffle(pool)) {
    if (exclude.has(q.id)) continue;
    const n = perQuiz.get(q.quiz_id) ?? 0;
    if (n >= MAX_PER_SOURCE) continue;
    perQuiz.set(q.quiz_id, n + 1);
    (byColl.get(q.collection) ?? byColl.set(q.collection, []).get(q.collection)!).push(q);
  }
  const colls = shuffle([...byColl.keys()]);
  const picked: PoolQ[] = [];
  let added = true;
  while (picked.length < size && added) {
    added = false;
    for (const c of colls) {
      if (picked.length >= size) break;
      const list = byColl.get(c)!;
      const next = list.shift();
      if (next) { picked.push(next); added = true; }
    }
  }
  return picked;
}

/** Koosta uusi Mega: luo draft-rivin ja täyttää sen guardraileilla. */
export async function composeMega(input: { title: string; size: number; scope: string }) {
  const title = input.title.trim();
  if (!title) return { ok: false as const, error: "Nimi puuttuu" };
  if (!ALLOWED_SIZES.includes(input.size)) return { ok: false as const, error: "Koko: 20, 50 tai 100" };
  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();

  const pool = await loadPool(input.scope);
  const picked = pickWithGuardrails(pool, input.size);
  if (picked.length < input.size) {
    return { ok: false as const, error: `Poolissa vain ${picked.length} kelvollista kysymystä (tavoite ${input.size})` };
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9åäö]+/g, "-").replace(/^-|-$/g, "")
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o");
  const { data: created, error } = await sb
    .from("quizzes")
    .insert({
      slug, title,
      display_title: title,
      teaser: null,
      category: "mega",
      collection: input.scope === "kaikki" ? "yleistieto" : input.scope,
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

  const links = picked.map((q, i) => ({ mega_quiz_id: megaId, question_id: q.id, sort_order: i }));
  const { error: e2 } = await sb.from("mega_questions" as never).insert(links as never);
  if (e2) return { ok: false as const, error: e2.message };

  revalidatePath("/megat");
  redirect(`/megat/${megaId}`);
}

/** Vaihda: arpoo tilalle uuden saman kokoelman kysymyksen poolista. */
export async function swapMegaQuestion(megaId: string, questionId: string) {
  const sb = getSupabaseAdmin();
  const links = await getLinks(megaId);
  const target = links.find((l) => l.question_id === questionId);
  if (!target) return { ok: false as const, error: "Kysymys ei ole Megassa" };

  const pool = await loadPool("kaikki");
  const collection = pool.find((p) => p.id === questionId)?.collection
    ?? pool.find((p) => links.some((l) => l.question_id === p.id))?.collection ?? "";
  const inMega = new Set(links.map((l) => l.question_id));
  const perQuiz = new Map<string, number>();
  for (const p of pool) if (inMega.has(p.id) && p.id !== questionId) {
    perQuiz.set(p.quiz_id, (perQuiz.get(p.quiz_id) ?? 0) + 1);
  }
  const candidates = shuffle(pool.filter((p) =>
    p.collection === collection && !inMega.has(p.id) && (perQuiz.get(p.quiz_id) ?? 0) < MAX_PER_SOURCE
  ));
  const next = candidates[0];
  if (!next) return { ok: false as const, error: "Poolissa ei ole vaihtoehtoa samasta kokoelmasta" };

  const { error: eDel } = await sb.from("mega_questions" as never).delete()
    .eq("mega_quiz_id", megaId).eq("question_id", questionId);
  if (eDel) return { ok: false as const, error: eDel.message };
  const { error: eIns } = await sb.from("mega_questions" as never)
    .insert({ mega_quiz_id: megaId, question_id: next.id, sort_order: target.sort_order } as never);
  if (eIns) return { ok: false as const, error: eIns.message };
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

/** Manuaalinen vaihto (Heikki 4.8.2026): käyttäjä valitsee korvaajan
    kysymysselaimesta — vanha rivi pois, uusi samaan kohtaan. */
export async function replaceMegaQuestion(megaId: string, oldQuestionId: string, newQuestionId: string) {
  const sb = getSupabaseAdmin();
  const links = await getLinks(megaId);
  const target = links.find((l) => l.question_id === oldQuestionId);
  if (!target) return { ok: false as const, error: "Vaihdettava kysymys ei ole Megassa" };
  if (links.some((l) => l.question_id === newQuestionId)) {
    return { ok: false as const, error: "Valittu kysymys on jo Megassa" };
  }
  const { error: eDel } = await sb.from("mega_questions" as never).delete()
    .eq("mega_quiz_id", megaId).eq("question_id", oldQuestionId);
  if (eDel) return { ok: false as const, error: eDel.message };
  const { error: eIns } = await sb.from("mega_questions" as never)
    .insert({ mega_quiz_id: megaId, question_id: newQuestionId, sort_order: target.sort_order } as never);
  if (eIns) return { ok: false as const, error: eIns.message };
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

export async function removeMegaQuestion(megaId: string, questionId: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("mega_questions" as never).delete()
    .eq("mega_quiz_id", megaId).eq("question_id", questionId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

/** Lisää yksittäisiä kysymyksiä (kysymysselaimesta poimitut). */
export async function addMegaQuestions(megaId: string, questionIds: string[]) {
  if (questionIds.length === 0) return { ok: true as const };
  const sb = getSupabaseAdmin();
  const links = await getLinks(megaId);
  const existing = new Set(links.map((l) => l.question_id));
  let next = links.reduce((m, l) => Math.max(m, l.sort_order), -1) + 1;
  const rows = questionIds.filter((id) => !existing.has(id)).map((id) => ({
    mega_quiz_id: megaId, question_id: id, sort_order: next++,
  }));
  if (rows.length === 0) return { ok: true as const };
  const { error } = await sb.from("mega_questions" as never).insert(rows as never);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

export async function moveMegaQuestion(megaId: string, questionId: string, dir: "up" | "down") {
  const sb = getSupabaseAdmin();
  const links = (await getLinks(megaId)).sort((a, b) => a.sort_order - b.sort_order);
  const idx = links.findIndex((l) => l.question_id === questionId);
  if (idx === -1) return { ok: false as const, error: "Kysymystä ei löytynyt" };
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= links.length) return { ok: true as const };
  const a = links[idx], b = links[swapWith];
  for (const [qid, so] of [[a.question_id, b.sort_order], [b.question_id, a.sort_order]] as const) {
    const { error } = await sb.from("mega_questions" as never)
      .update({ sort_order: so } as never)
      .eq("mega_quiz_id", megaId).eq("question_id", qid);
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath(`/megat/${megaId}`);
  return { ok: true as const };
}

/** Julkaisu: validoi koon. HUOM: julkaistu Mega näkyy nykyisen
    tuotantosivun listauksissa — pidä draftina 2.0-launchiin asti. */
export async function toggleMegaPublish(megaId: string, publish: boolean) {
  const sb = getSupabaseAdmin();
  if (publish) {
    const links = await getLinks(megaId);
    if (!ALLOWED_SIZES.includes(links.length)) {
      return { ok: false as const, error: `Kysymyksiä on ${links.length} — julkaisu vaatii tasan 20, 50 tai 100` };
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

/* ── Kysymysselain ── */

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

export async function loadQuizQuestions(quizId: string) {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("questions")
    .select("id, sort_order, question_text, answers")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as Array<{ id: string; sort_order: number; question_text: string; answers: unknown }>).map((q) => ({
    id: q.id,
    question_text: q.question_text,
    correct: ((q.answers as Array<{ text: string; is_correct: boolean }>) ?? []).find((a) => a.is_correct)?.text ?? "",
  }));
}

async function getLinks(megaId: string): Promise<Array<{ question_id: string; sort_order: number }>> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("mega_questions" as never)
    .select("question_id, sort_order" as never)
    .eq("mega_quiz_id", megaId);
  return (data ?? []) as unknown as Array<{ question_id: string; sort_order: number }>;
}
