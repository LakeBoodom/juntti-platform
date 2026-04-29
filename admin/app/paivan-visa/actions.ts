"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

/**
 * Aseta visa tietylle päivälle. Jos samalle päivälle on jo schedule_rule
 * (strategy=date, content_type=quiz), se päivitetään. Muuten luodaan uusi.
 */
export async function setQuizForDate(
  siteId: string,
  scheduledDate: string,  // YYYY-MM-DD
  quizId: string,
) {
  if (!siteId || !scheduledDate || !quizId)
    return { ok: false as const, error: "Site, päivämäärä tai visa puuttuu" };

  const sb = getSupabaseAdmin();

  // Etsi olemassa oleva date-rule tälle päivälle ja sitelle
  const { data: existing } = await sb
    .from("schedule_rules")
    .select("id")
    .eq("site_id", siteId)
    .eq("content_type", "quiz")
    .eq("strategy", "date")
    .eq("scheduled_date", scheduledDate)
    .maybeSingle();

  if (existing) {
    const { error } = await sb
      .from("schedule_rules")
      .update({ content_id: quizId, active: true })
      .eq("id", existing.id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await sb.from("schedule_rules").insert({
      site_id: siteId,
      content_type: "quiz",
      content_id: quizId,
      strategy: "date",
      scheduled_date: scheduledDate,
      active: true,
    });
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath("/paivan-visa");
  revalidatePath("/schedule-rules");
  return { ok: true as const };
}

/** Poista visa tietyltä päivältä */
export async function clearQuizForDate(siteId: string, scheduledDate: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("schedule_rules")
    .delete()
    .eq("site_id", siteId)
    .eq("content_type", "quiz")
    .eq("strategy", "date")
    .eq("scheduled_date", scheduledDate);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/paivan-visa");
  return { ok: true as const };
}
