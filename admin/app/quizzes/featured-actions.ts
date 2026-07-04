"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-server";

/** Nosto: merkitse/poista visa kategorian etusivunostona (featured_in_category). */
export async function toggleQuizFeatured(quizId: string, featured: boolean) {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("quizzes")
    .update({ featured_in_category: featured })
    .eq("id", quizId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/quizzes");
  return { ok: true as const };
}
