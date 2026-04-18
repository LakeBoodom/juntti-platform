"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@juntti/db";

export async function updateQuizMeta(
  id: string,
  input: { title: string; description: string },
) {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("quizzes")
    .update({ title: input.title, description: input.description })
    .eq("id", id);
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
