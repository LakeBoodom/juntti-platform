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
};

function validate(input: CountdownInput): string | null {
  if (!input.name.trim()) return "Nimi puuttuu";
  if (!input.slug.trim()) return "Slug puuttuu";
  if (!/^[a-z0-9-]+$/.test(input.slug))
    return "Slug saa sisältää vain pieniä kirjaimia, numeroita ja viivoja";
  if (input.day < 1 || input.day > 31) return "Päivä pitää olla 1–31";
  if (input.month < 1 || input.month > 12) return "Kuukausi pitää olla 1–12";
  if (!input.object_type.trim()) return "Tyyppi puuttuu";
  if (input.platform && !["juntti", "tietovisa"].includes(input.platform))
    return "Alusta pitää olla juntti, tietovisa tai tyhjä";
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
