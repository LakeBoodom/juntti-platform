// Tietoniekka-frontin DB-haut. Server-side, anon-client → respektoi RLS.
// V1.0: ei kakkuksen, kaikki request-time. Voidaan lisätä Next-cache myöhemmin.

import { getSupabase, SITE_SLUG } from "./supabase";

let _siteId: string | null = null;
async function getSiteId(): Promise<string | null> {
  if (_siteId) return _siteId;
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("sites").select("id").eq("slug", SITE_SLUG).maybeSingle();
  if (!data) return null;
  _siteId = data.id;
  return _siteId;
}

/* ─── Päivän sankari ─────────────────────────────────────────────── */
export type SankariData = {
  id: string;
  slug: string | null;
  name: string;
  role: string;
  birth_date: string;
  bio_short: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  trivia_quiz_id: string | null;
};

export async function getTodaysCelebrity(): Promise<SankariData | null> {
  const siteId = await getSiteId();
  if (!siteId) return null;
  const sb = getSupabase();
  if (!sb) return null;
  // RPC todays_celebrities — date-vertailu PG-puolella koska PostgREST .like()
  // ei toimi date-tyyppi-sarakkeelle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any).rpc("todays_celebrities", { p_site_id: siteId });
  if (error) {
    console.error("getTodaysCelebrity RPC:", error);
    return null;
  }
  return (data as SankariData[] | null)?.[0] ?? null;
}

export async function getCelebrityBySlug(slug: string): Promise<SankariData | null> {
  const siteId = await getSiteId();
  if (!siteId) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, trivia_quiz_id")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function listCelebrities(): Promise<SankariData[]> {
  const siteId = await getSiteId();
  if (!siteId) return [];
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, birth_date, bio_short, image_url, wikipedia_url, trivia_quiz_id")
    .eq("site_id", siteId)
    .order("birth_date", { ascending: true });
  return data ?? [];
}

/* ─── Visat ──────────────────────────────────────────────────────── */
export type QuizMeta = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  status: string;
  emoji_hint: string | null;
};

export type QuizQuestion = {
  id: string;
  sort_order: number;
  question_text: string;
  explanation: string | null;
  answers: Array<{ text: string; is_correct: boolean }>;
};

export type FullQuiz = QuizMeta & { questions: QuizQuestion[] };

/** Hae visa kaikkine kysymyksineen */
export async function getQuizById(id: string): Promise<FullQuiz | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: quiz } = await sb
    .from("quizzes")
    .select("id, slug, title, description, category, difficulty, status, emoji_hint")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (!quiz) return null;
  const { data: qs } = await sb
    .from("questions")
    .select("id, sort_order, question_text, explanation, answers")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true });
  return {
    ...quiz,
    questions: (qs ?? []).map((q) => ({
      ...q,
      answers: q.answers as never,
    })),
  };
}

/** Hae random julkaistu visa kategoriasta. */
export async function getRandomQuizByCategory(category: string): Promise<QuizMeta | null> {
  const siteId = await getSiteId();
  if (!siteId) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("quizzes")
    .select("id, slug, title, description, category, difficulty, status, emoji_hint")
    .eq("site_id", siteId)
    .eq("status", "published")
    .eq("category", category);
  if (!data || data.length === 0) return null;
  return data[Math.floor(Math.random() * data.length)];
}

/** Hae julkaistut visat per kategoria-mappi (etusivua varten 1 random per kategoria) */
export async function getRandomQuizzesPerCategory(
  categories: string[],
): Promise<Record<string, QuizMeta | null>> {
  const result: Record<string, QuizMeta | null> = {};
  // Yksinkertainen: useita queryja. Voidaan optimoida myöhemmin.
  await Promise.all(
    categories.map(async (cat) => {
      result[cat] = await getRandomQuizByCategory(cat);
    }),
  );
  return result;
}

/* ─── Päivän visa (schedule_rules-resolver) ──────────────────────── */

export async function getTodaysQuiz(): Promise<QuizMeta | null> {
  const siteId = await getSiteId();
  if (!siteId) return null;
  const today = new Date().toISOString().slice(0, 10);
  const sb = getSupabase();
  if (!sb) return null;

  // 1. Tarkka date-strategy: schedule_rule joka osuu tähän päivään
  const { data: dateRule } = await sb
    .from("schedule_rules")
    .select("content_id")
    .eq("site_id", siteId)
    .eq("content_type", "quiz")
    .eq("strategy", "date")
    .eq("scheduled_date", today)
    .eq("active", true)
    .maybeSingle();
  if (dateRule?.content_id) {
    const { data: q } = await sb
      .from("quizzes")
      .select("id, slug, title, description, category, difficulty, status, emoji_hint")
      .eq("id", dateRule.content_id)
      .eq("status", "published")
      .maybeSingle();
    if (q) return q;
  }

  // 2. Tag-strategy: tagi voi olla esim. tämän päivän pvm "20260429" tai event "vappu"
  // V1.0: yksinkertainen tag-haku - käytetään countdowns-taulun samaan päivään tagattuja eventtejä
  const todayMonth = new Date().getMonth() + 1;
  const todayDay = new Date().getDate();
  const { data: events } = await sb
    .from("countdowns")
    .select("tag")
    .eq("site_id", siteId)
    .eq("month", todayMonth)
    .eq("day", todayDay)
    .not("tag", "is", null);
  if (events && events.length > 0) {
    const tags = events.map((e) => e.tag).filter(Boolean) as string[];
    const { data: tagRule } = await sb
      .from("schedule_rules")
      .select("content_id")
      .eq("site_id", siteId)
      .eq("content_type", "quiz")
      .eq("strategy", "tag")
      .in("tag", tags)
      .eq("active", true)
      .limit(1)
      .maybeSingle();
    if (tagRule?.content_id) {
      const { data: q } = await sb
        .from("quizzes")
        .select("id, slug, title, description, category, difficulty, status, emoji_hint")
        .eq("id", tagRule.content_id)
        .eq("status", "published")
        .maybeSingle();
      if (q) return q;
    }
  }

  // 3. Fallback: random kategoriavisa
  // Fallback random query — sama client
  const { data: any } = await sb
    .from("quizzes")
    .select("id, slug, title, description, category, difficulty, status, emoji_hint")
    .eq("site_id", siteId)
    .eq("status", "published");
  if (!any || any.length === 0) return null;
  return any[Math.floor(Math.random() * any.length)];
}

/* ─── Pinnalla nyt — countdownit ─────────────────────────────────── */
export type EventData = {
  id: string;
  name: string;
  slug: string;
  month: number;
  day: number;
  object_type: string;
  tag: string | null;
  trivia_quiz_id: string | null;
};

/** Hae 3 tulevaa countdownia (tämän vuoden seuraavat) */
export async function getUpcomingEvents(limit = 3): Promise<EventData[]> {
  const siteId = await getSiteId();
  if (!siteId) return [];
  const today = new Date();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("countdowns")
    .select("id, name, slug, month, day, object_type, tag, trivia_quiz_id")
    .eq("site_id", siteId);
  if (!data) return [];
  // Lasketaan päivät tähän päivään → seuraavaan tapahtumaan
  const sorted = [...data].sort((a, b) => {
    const am = (a.month - 1) * 31 + a.day;
    const bm = (b.month - 1) * 31 + b.day;
    const tm = (m - 1) * 31 + d;
    const ad = am >= tm ? am - tm : am - tm + 372;
    const bd = bm >= tm ? bm - tm : bm - tm + 372;
    return ad - bd;
  });
  return sorted.slice(0, limit);
}
