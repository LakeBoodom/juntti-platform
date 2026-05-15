"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateQuiz, type GenerateQuizInput } from "@juntti/ai";
import { getSupabaseAdmin } from "@juntti/db";
import { fetchArticles } from "@/app/quizzes/article-fetcher";
import { getCurrentSite } from "@/lib/sites";

export type GenerateAndSaveInput = GenerateQuizInput & {
  /** 1-5 source URLs (Wikipedia or other web articles). */
  sourceUrls?: string[];
  /** Legacy: single Wikipedia URL — converted to sourceUrls if given. */
  wikipediaUrl?: string;
};

export async function generateAndSaveDraft(input: GenerateAndSaveInput) {
  // Kerätään lähde-URL:t — uusi monilähde-kenttä tai legacy wikipediaUrl
  const urls: string[] = [];
  if (input.sourceUrls && input.sourceUrls.length > 0) {
    urls.push(...input.sourceUrls);
  } else if (input.wikipediaUrl) {
    urls.push(input.wikipediaUrl);
  }

  let sourceContext = input.sourceContext;
  let sourceLabel = input.sourceLabel;
  const fetchErrors: Array<{ url: string; error: string }> = [];

  if (!sourceContext && urls.length > 0) {
    const result = await fetchArticles(urls);
    if (!result.combinedText) {
      return {
        ok: false as const,
        error:
          "Yhtään lähdettä ei saatu haettua. " +
          result.errors.map((e) => `${e.url}: ${e.error}`).join("; "),
      };
    }
    sourceContext = result.combinedText;
    sourceLabel = result.combinedLabel;
    fetchErrors.push(...result.errors);
  }

  let quiz;
  try {
    quiz = await generateQuiz({ ...input, sourceContext, sourceLabel });
  } catch (err: any) {
    return { ok: false as const, error: err?.message ?? "AI-kutsu epäonnistui" };
  }

  const sb = getSupabaseAdmin();
  const site = await getCurrentSite();

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
      site_id: site.id,
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
