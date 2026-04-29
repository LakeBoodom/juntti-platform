"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

export type Strategy = "date" | "tag" | "recurring_daily" | "random";
export type ContentType = "quiz" | "celebrity" | "countdown" | "kuvavisa";

export type RuleInput = {
  site_id: string;
  content_type: ContentType;
  content_id: string;
  strategy: Strategy;
  scheduled_date: string | null;  // YYYY-MM-DD jos strategy=date
  tag: string | null;             // jos strategy=tag
  weight: number;                 // random-rotaation painotus
  active: boolean;
};

function validate(input: RuleInput): string | null {
  if (!input.site_id) return "Site puuttuu";
  if (!input.content_id) return "Sisältö puuttuu";
  if (!["quiz", "celebrity", "countdown", "kuvavisa"].includes(input.content_type))
    return "Virheellinen content_type";
  if (!["date", "tag", "recurring_daily", "random"].includes(input.strategy))
    return "Virheellinen strategy";

  if (input.strategy === "date" && !input.scheduled_date)
    return "Päivämäärä pakollinen kun strategia on 'date'";
  if (input.strategy === "tag" && !input.tag)
    return "Tag pakollinen kun strategia on 'tag'";
  if (input.scheduled_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.scheduled_date))
    return "Päivämäärä muodossa YYYY-MM-DD";
  if (input.tag && !/^[a-z0-9_-]+$/.test(input.tag))
    return "Tag saa sisältää vain pieniä kirjaimia, numeroita, alaviivoja ja viivoja";
  if (input.weight < 1) return "Weight vähintään 1";

  return null;
}

function normalize(input: RuleInput): RuleInput {
  // recurring_daily ja random eivät käytä date/tag-kenttiä
  if (input.strategy === "recurring_daily" || input.strategy === "random") {
    return { ...input, scheduled_date: null, tag: input.strategy === "random" ? input.tag : null };
  }
  if (input.strategy === "date") {
    return { ...input, tag: null };
  }
  if (input.strategy === "tag") {
    return { ...input, scheduled_date: null };
  }
  return input;
}

export async function createRule(input: RuleInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("schedule_rules").insert(normalize(input));
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/schedule-rules");
  return { ok: true as const };
}

export async function updateRule(id: string, input: RuleInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("schedule_rules").update(normalize(input)).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/schedule-rules");
  return { ok: true as const };
}

export async function deleteRule(id: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("schedule_rules").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/schedule-rules");
  return { ok: true as const };
}

export async function toggleRule(id: string, active: boolean) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("schedule_rules").update({ active }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/schedule-rules");
  return { ok: true as const };
}
