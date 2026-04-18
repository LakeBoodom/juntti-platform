"use server";

import { revalidatePath } from "next/cache";
import { generateQuiz } from "@juntti/ai";
import { getSupabaseAdmin } from "@juntti/db";

// Generates a trivia quiz tailored to this specific celebrity — ties the
// quiz back to celebrities.trivia_quiz_id so the public page can surface
// it on the birthday.
export async function generateQuizForCelebrity(celebrityId: string) {
  const sb = getSupabaseAdmin();
  const { data: person, error: pErr } = await sb
    .from("celebrities")
    .select("id, name, birth_date, death_date, role, bio_short, platform, trivia_quiz_id")
    .eq("id", celebrityId)
    .maybeSingle();

  if (pErr || !person) {
    return { ok: false as const, error: "Julkkis ei löytynyt" };
  }
  if (person.trivia_quiz_id) {
    return {
      ok: false as const,
      error: "Tälle julkkiselle on jo generoitu visa — muokkaa tai poista se ensin.",
    };
  }

  const year = person.birth_date.slice(0, 4);
  const status = person.death_date
    ? `k. ${person.death_date.slice(0, 4)}`
    : "elossa 2026";
  const topic = `${person.name} — ${person.role}, s. ${year} (${status}). ${
    person.bio_short ?? ""
  }`.trim();

  let quiz;
  try {
    quiz = await generateQuiz({
      topic,
      category: "henkilö",
      difficulty: "keski",
      questionCount: 5,
      tone: "rento",
      platform: person.platform === "both" ? "juntti" : (person.platform as any),
    });
  } catch (err: any) {
    return { ok: false as const, error: err?.message ?? "AI-kutsu epäonnistui" };
  }

  // Ensure unique slug
  let slug = quiz.slug;
  const { data: existing } = await sb
    .from("quizzes")
    .select("slug")
    .like("slug", `${quiz.slug}%`);
  if (existing?.some((r) => r.slug === slug)) {
    slug = `${quiz.slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const { data: inserted, error: qErr } = await sb
    .from("quizzes")
    .insert({
      title: quiz.title,
      description: quiz.description,
      slug,
      emoji_hint: quiz.emoji_hint,
      category: "henkilö",
      difficulty: "keski",
      tone: "rento",
      platform: person.platform === "both" ? "juntti" : (person.platform as any),
      target_age: "kaikki",
      status: "draft",
      created_by: "ai-celebrity",
    })
    .select("id")
    .single();

  if (qErr || !inserted) {
    return {
      ok: false as const,
      error: qErr?.message ?? "Visan tallennus epäonnistui",
    };
  }

  const rows = quiz.questions.map((q, i) => ({
    quiz_id: inserted.id,
    sort_order: i,
    question_text: q.question_text,
    answers: q.answers,
    explanation: q.explanation,
  }));

  const { error: quErr } = await sb.from("questions").insert(rows);
  if (quErr) {
    return {
      ok: false as const,
      error: `Kysymysten tallennus epäonnistui: ${quErr.message}`,
    };
  }

  // Link quiz back to celebrity.
  await sb
    .from("celebrities")
    .update({ trivia_quiz_id: inserted.id })
    .eq("id", celebrityId);

  revalidatePath("/celebrities");
  revalidatePath("/quizzes");
  return { ok: true as const, quizId: inserted.id };
}
