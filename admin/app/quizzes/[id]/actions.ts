"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@juntti/db";

export async function updateQuizMeta(
  id: string,
  input: {
    title: string;
    description: string;
    category?: string;
    difficulty?: "helppo" | "keski" | "vaikea";
    tone?: "rento" | "humoristinen" | "asiallinen" | "nostalginen";
    platform?: "juntti" | "tietoniekka" | "both";
    site_id?: string | null;
  },
) {
  if (!input.title.trim()) return { ok: false as const, error: "Otsikko puuttuu" };
  const sb = getSupabaseAdmin();
  // Älä päivitä saraketta jos sitä ei ole annettu — tukee partiaalia inputtia
  type QuizUpdate = {
    title: string;
    description: string | null;
    category?: string;
    difficulty?: string;
    tone?: string;
    platform?: string;
    site_id?: string | null;
  };
  const update: QuizUpdate = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
  };
  if (input.category !== undefined) update.category = input.category.trim();
  if (input.difficulty !== undefined) update.difficulty = input.difficulty;
  if (input.tone !== undefined) update.tone = input.tone;
  if (input.platform !== undefined) update.platform = input.platform;
  if (input.site_id !== undefined) update.site_id = input.site_id;

  const { error } = await sb.from("quizzes").update(update).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes/${id}`);
  revalidatePath(`/quizzes`);
  return { ok: true as const };
}

export async function updateQuestion(
  id: string,
  input: {
    question_text: string;
    answers: { text: string; is_correct: boolean }[];
    explanation: string;
  },
) {
  // Validate exactly one correct answer, four answers total.
  if (input.answers.length !== 4)
    return { ok: false as const, error: "Vastauksia pitää olla tasan 4" };
  const correct = input.answers.filter((a) => a.is_correct).length;
  if (correct !== 1)
    return {
      ok: false as const,
      error: "Oikeita vastauksia pitää olla tasan 1",
    };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("questions").update(input).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function togglePublish(id: string, publish: boolean) {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("quizzes")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes/${id}`);
  revalidatePath(`/quizzes`);
  return { ok: true as const };
}

export async function deleteQuiz(id: string) {
  const sb = getSupabaseAdmin();
  // FK cascade will delete questions.
  const { error } = await sb.from("quizzes").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/quizzes`);
  redirect("/quizzes");
}
