"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

export type CountdownInput = {
  name: string;
  slug: string;
  day: number;
  month: number;
  object_type: string;
  platform: string | null;
  tag: string | null;
  site_id: string;
  /* Pinnalla nyt -kausitapahtuma: päivämääräväli yliajaa month/day-vuosipäivän */
  starts_on: string | null;
  ends_on: string | null;
  emoji: string | null;
  image_url: string | null;
};

function validate(input: CountdownInput): string | null {
  if (!input.name.trim()) return "Nimi puuttuu";
  if (!input.slug.trim()) return "Slug puuttuu";
  if (!/^[a-z0-9-]+$/.test(input.slug))
    return "Slug saa sisältää vain pieniä kirjaimia, numeroita ja viivoja";
  if (input.day < 1 || input.day > 31) return "Päivä pitää olla 1–31";
  if (input.month < 1 || input.month > 12) return "Kuukausi pitää olla 1–12";
  if (!input.object_type.trim()) return "Tyyppi puuttuu";
  if (input.platform && !["juntti", "tietoniekka"].includes(input.platform))
    return "Alusta pitää olla juntti, tietoniekka tai tyhjä";
  if (!input.site_id) return "Site ID puuttuu";
  if (input.tag && !/^[a-z0-9_-]+$/.test(input.tag))
    return "Tag saa sisältää vain pieniä kirjaimia, numeroita, alaviivoja ja viivoja";
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (input.starts_on && !dateRe.test(input.starts_on)) return "Alkupäivä pitää olla muodossa VVVV-KK-PP";
  if (input.ends_on && !dateRe.test(input.ends_on)) return "Loppupäivä pitää olla muodossa VVVV-KK-PP";
  if (input.ends_on && !input.starts_on) return "Loppupäivä vaatii alkupäivän";
  if (input.starts_on && input.ends_on && input.ends_on < input.starts_on)
    return "Loppupäivä ei voi olla ennen alkupäivää";
  return null;
}

export async function createCountdown(input: CountdownInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("countdowns").insert(input);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/countdowns");
  return { ok: true as const };
}

export async function updateCountdown(id: string, input: CountdownInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("countdowns").update(input).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/countdowns");
  return { ok: true as const };
}

export async function deleteCountdown(id: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("countdowns").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/countdowns");
  return { ok: true as const };
}

/** Korvaa tapahtumaan tägätyt visat (rotaatiojärjestys = valintajärjestys). */
export async function setCountdownQuizzes(countdownId: string, quizIds: string[]) {
  const sb = getSupabaseAdmin();
  const { error: delErr } = await sb
    .from("countdown_quizzes")
    .delete()
    .eq("countdown_id", countdownId);
  if (delErr) return { ok: false as const, error: delErr.message };
  if (quizIds.length > 0) {
    const rows = quizIds.map((quiz_id, i) => ({
      countdown_id: countdownId,
      quiz_id,
      sort_order: i,
    }));
    const { error } = await sb.from("countdown_quizzes").insert(rows);
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath("/countdowns");
  return { ok: true as const };
}
