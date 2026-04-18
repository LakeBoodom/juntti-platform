import { getPublicSupabase } from "./supabase";

export type CelebrityToday = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  bio_short: string | null;
  birth_date: string;
  death_date: string | null;
  trivia_quiz_id: string | null;
  age_years: number;
};

export type CountdownLite = {
  id: string;
  name: string;
  slug: string;
  day: number;
  month: number;
  object_type: string;
  days_until: number;
  trivia_quiz_id: string | null;
};

export type QuizSummary = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  category: string;
  difficulty: string;
  emoji_hint: string | null;
  platform: string;
  question_count: number;
};

export type QuizPreview = QuizSummary & {
  first_question: {
    id: string;
    question_text: string;
    answers: { text: string; is_correct: boolean }[];
  } | null;
};

const platformFilter = (platform: string) =>
  platform === "juntti" ? ["juntti", "both"] : ["tietovisa", "both"];

function todayUtcIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getBirthdaysToday(
  platform = "juntti",
): Promise<CelebrityToday[]> {
  const sb = getPublicSupabase();
  const today = new Date();
  const mm = today.getUTCMonth() + 1;
  const dd = today.getUTCDate();

  const { data, error } = await sb
    .from("celebrities")
    .select(
      "id, name, role, image_url, bio_short, birth_date, death_date, trivia_quiz_id, platform",
    )
    .in("platform", platformFilter(platform));
  if (error || !data) return [];

  const matches = data.filter((c) => {
    const d = new Date(c.birth_date);
    return d.getUTCMonth() + 1 === mm && d.getUTCDate() === dd;
  });

  return matches.map((c) => {
    const birth = new Date(c.birth_date);
    const ref = c.death_date ? new Date(c.death_date) : today;
    const age =
      ref.getUTCFullYear() -
      birth.getUTCFullYear() -
      (ref.getUTCMonth() < birth.getUTCMonth() ||
      (ref.getUTCMonth() === birth.getUTCMonth() &&
        ref.getUTCDate() < birth.getUTCDate())
        ? 1
        : 0);
    return {
      id: c.id,
      name: c.name,
      role: c.role,
      image_url: c.image_url,
      bio_short: c.bio_short,
      birth_date: c.birth_date,
      death_date: c.death_date,
      trivia_quiz_id: c.trivia_quiz_id,
      age_years: age,
    };
  });
}

export async function getUpcomingCountdowns(
  platform = "juntti",
  limit = 5,
): Promise<CountdownLite[]> {
  const sb = getPublicSupabase();
  const { data } = await sb
    .from("countdowns")
    .select(
      "id, name, slug, day, month, object_type, platform, trivia_quiz_id",
    )
    .in("platform", platformFilter(platform));
  if (!data) return [];

  const now = new Date();
  const todayM = now.getUTCMonth() + 1;
  const todayD = now.getUTCDate();

  function daysUntil(month: number, day: number): number {
    const y = now.getUTCFullYear();
    let target = Date.UTC(y, month - 1, day);
    const ref = Date.UTC(y, todayM - 1, todayD);
    if (target < ref) target = Date.UTC(y + 1, month - 1, day);
    return Math.round((target - ref) / (24 * 60 * 60 * 1000));
  }

  const enriched = data
    .map((c) => ({ ...c, days_until: daysUntil(c.month, c.day) }))
    .sort((a, b) => a.days_until - b.days_until)
    .slice(0, limit);

  // Fuzzy-match countdowns → published quizzes by name/slug for rows that
  // don't have an explicit trivia_quiz_id. One query, in-memory match.
  const unlinked = enriched.filter((c) => !c.trivia_quiz_id);
  if (unlinked.length > 0) {
    const { data: published } = await sb
      .from("quizzes")
      .select("id, title, slug, platform, status")
      .eq("status", "published")
      .in("platform", platformFilter(platform));
    if (published?.length) {
      for (const c of enriched) {
        if (c.trivia_quiz_id) continue;
        const nameLc = c.name.toLowerCase();
        const slugLc = c.slug.toLowerCase();
        const match = published.find(
          (q) =>
            q.title.toLowerCase().includes(nameLc) ||
            q.slug.toLowerCase().includes(slugLc),
        );
        if (match) c.trivia_quiz_id = match.id;
      }
    }
  }

  return enriched;
}

export async function getFeaturedQuiz(
  platform = "juntti",
  excludeQuizIds: string[] = [],
): Promise<QuizSummary | null> {
  const sb = getPublicSupabase();
  const today = todayUtcIso();

  // 1. daily_schedule override (honored even if in excludeQuizIds; explicit
  //    scheduling wins over any dedup rule)
  const { data: scheduled } = await sb
    .from("daily_schedule")
    .select("quiz_id")
    .eq("platform", platform)
    .eq("date", today)
    .maybeSingle();
  if (scheduled?.quiz_id) {
    const quiz = await loadQuiz(scheduled.quiz_id);
    if (quiz) return quiz;
  }

  // 2. random published, excluding birthday quizzes (shown elsewhere) and
  //    any other excluded ids. The bday quiz gets its own section, so
  //    Päivän visa should always be a different quiz.
  const { data: candidates } = await sb
    .from("quizzes")
    .select(
      "id, title, description, slug, category, difficulty, emoji_hint, platform",
    )
    .eq("status", "published")
    .in("platform", platformFilter(platform))
    .limit(100);
  const filtered =
    candidates?.filter((c) => !excludeQuizIds.includes(c.id)) ?? [];
  if (!filtered.length) return null;
  const pick = filtered[Math.floor(Math.random() * filtered.length)];
  const count = await countQuestions(pick.id);
  return { ...pick, question_count: count };
}

// Pool of random published quizzes for the 'Haluatko pelata vielä lisää?'
// section. Excludes anything already shown on the homepage.
export async function getRandomQuizPool(
  platform = "juntti",
  excludeIds: string[] = [],
  size = 10,
): Promise<QuizSummary[]> {
  const sb = getPublicSupabase();
  const { data } = await sb
    .from("quizzes")
    .select(
      "id, title, description, slug, category, difficulty, emoji_hint, platform",
    )
    .eq("status", "published")
    .in("platform", platformFilter(platform))
    .limit(100);
  if (!data?.length) return [];
  const filtered = data.filter((q) => !excludeIds.includes(q.id));
  // Fisher-Yates shuffle
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }
  const picked = filtered.slice(0, size);
  // Fill question_count for each
  const results: QuizSummary[] = [];
  for (const q of picked) {
    const count = await countQuestions(q.id);
    results.push({ ...q, question_count: count });
  }
  return results;
}

async function loadQuiz(id: string): Promise<QuizSummary | null> {
  const sb = getPublicSupabase();
  const { data: q } = await sb
    .from("quizzes")
    .select(
      "id, title, description, slug, category, difficulty, emoji_hint, platform, status",
    )
    .eq("id", id)
    .maybeSingle();
  if (!q || q.status !== "published") return null;
  const count = await countQuestions(id);
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    slug: q.slug,
    category: q.category,
    difficulty: q.difficulty,
    emoji_hint: q.emoji_hint,
    platform: q.platform,
    question_count: count,
  };
}

async function countQuestions(quizId: string): Promise<number> {
  const sb = getPublicSupabase();
  const { count } = await sb
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId);
  return count ?? 0;
}

export async function loadQuizWithFirstQuestion(
  id: string,
): Promise<QuizPreview | null> {
  const summary = await loadQuiz(id);
  if (!summary) return null;
  const sb = getPublicSupabase();
  const { data } = await sb
    .from("questions")
    .select("id, question_text, answers")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true })
    .limit(1);
  const first = data?.[0];
  return {
    ...summary,
    first_question: first
      ? {
          id: first.id,
          question_text: first.question_text,
          answers: first.answers as { text: string; is_correct: boolean }[],
        }
      : null,
  };
}

export async function getQuizBySlug(slug: string) {
  const sb = getPublicSupabase();
  const { data: quiz } = await sb
    .from("quizzes")
    .select(
      "id, title, description, slug, category, difficulty, emoji_hint, tone, platform, status",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!quiz) return null;

  const { data: questions } = await sb
    .from("questions")
    .select("id, sort_order, question_text, answers, explanation")
    .eq("quiz_id", quiz.id)
    .order("sort_order", { ascending: true });

  return { quiz, questions: questions ?? [] };
}

export async function getStats(platform = "juntti"): Promise<{
  total_plays: number;
  latest_quiz: { title: string; slug: string } | null;
}> {
  const sb = getPublicSupabase();
  const { count: plays } = await sb
    .from("quiz_plays")
    .select("id", { count: "exact", head: true })
    .eq("platform", platform);
  const { data: latest } = await sb
    .from("quizzes")
    .select("title, slug")
    .eq("status", "published")
    .in("platform", platformFilter(platform))
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    total_plays: plays ?? 0,
    latest_quiz: latest ?? null,
  };
}
