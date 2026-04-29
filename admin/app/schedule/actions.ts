"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

function* eachDate(startIso: string, endIso: string): Generator<string> {
  const start = new Date(startIso + "T00:00:00Z");
  const end = new Date(endIso + "T00:00:00Z");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
  if (end < start) return;
  // Hard cap: never schedule more than 365 days at once (prevents accidents).
  let safety = 0;
  const cur = new Date(start);
  while (cur <= end && safety < 365) {
    yield cur.toISOString().slice(0, 10);
    cur.setUTCDate(cur.getUTCDate() + 1);
    safety++;
  }
}

export type ScheduleRangeInput = {
  platform: "juntti" | "tietoniekka";
  startDate: string; // yyyy-mm-dd
  endDate: string; // inclusive
  quizId: string;
};

export async function scheduleRange(input: ScheduleRangeInput) {
  if (!input.quizId) return { ok: false as const, error: "Valitse visa" };
  if (!input.startDate || !input.endDate)
    return { ok: false as const, error: "Valitse alku- ja loppupäivä" };
  const dates = Array.from(eachDate(input.startDate, input.endDate));
  if (dates.length === 0)
    return {
      ok: false as const,
      error: "Tyhjä tai virheellinen ajanjakso",
    };
  if (dates.length > 365)
    return {
      ok: false as const,
      error: "Maksimi 365 päivää kerralla",
    };

  const rows = dates.map((date) => ({
    platform: input.platform,
    date,
    quiz_id: input.quizId,
  }));

  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("daily_schedule")
    .upsert(rows, { onConflict: "platform,date" });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/schedule");
  return { ok: true as const, count: dates.length };
}

export async function deleteScheduleRow(id: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("daily_schedule").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/schedule");
  return { ok: true as const };
}

export async function clearScheduleRange(input: {
  platform: "juntti" | "tietoniekka";
  startDate: string;
  endDate: string;
}) {
  if (!input.startDate || !input.endDate)
    return { ok: false as const, error: "Valitse alku- ja loppupäivä" };
  const sb = getSupabaseAdmin();
  const { error, count } = await sb
    .from("daily_schedule")
    .delete({ count: "exact" })
    .eq("platform", input.platform)
    .gte("date", input.startDate)
    .lte("date", input.endDate);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/schedule");
  return { ok: true as const, deleted: count ?? 0 };
}
