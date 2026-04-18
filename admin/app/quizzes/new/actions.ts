"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateQuiz, type GenerateQuizInput } from "@juntti/ai";
import { getSupabaseAdmin } from "@juntti/db";
import { fetchWikipediaArticle } from "@/app/celebrities/wikipedia-actions";

export type GenerateAndSaveInput = GenerateQuizInput & {
  wikipediaUrl?: string;
};

export async function generateAndSaveDraft(input: GenerateAndSaveInput) {
  // If a Wikipedia URL is given, pull the article text and ground the
  // AI call on it — same pattern as celebrity quizzes.
  let sourceContext = input.sourceContext;
  let sourceLabel = input.sourceLabel;
  if (!sourceContext && input.wikipediaUrl) {
    const article = await fetchWikipediaArticle(input.wikipediaUrl);
    if (article) {
      sourceContext = article;
      sourceLabel = `Wikipedia: ${input.topic}`;
    } else {
      return {
        ok: false as const,
        error:
          "Wikipedia-artikkelia ei saatu haettua. Tarkista URL tai jätä kenttä tyhjäksi.",
      };
    }
  }

  let quiz;
  try {
    quiz = await generateQuiz({ ...input, sourceContext, sourceLabel });
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
