"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateQuiz, type GenerateQuizInput } from "@juntti/ai";
import { getSupabaseAdmin } from "@juntti/db";

export type GenerateAndSaveInput = GenerateQuizInput;

export async function generateAndSaveDraft(input: GenerateAndSaveInput) {
  let quiz;
  try {
    quiz = await generateQuiz(input);
  } catch (err: any) {
    return { ok: false as const, error: err?.message ?? "AI-kutsu epäonnistui" };
  }

  const sb = getSupabaseAdmin();

  // Make slug unique by suffixing if needed.
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
      category: input.category,
      difficulty: input.difficulty,
      tone: input.tone,
      platform: input.platform,
      target_age: input.targetAge ?? "kaikki",
      status: "draft",
      created_by: "ai",
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

  revalidatePath("/quizzes");
  redirect(`/quizzes/${inserted.id}`);
}
