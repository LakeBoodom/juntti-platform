"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

export type CelebrityInput = {
  name: string;
  birth_date: string; // yyyy-mm-dd
  death_date: string | null;
  role: string;
  bio_short: string | null;
  image_url: string | null;
  platform: "juntti" | "tietovisa" | "both";
};

function validate(input: CelebrityInput): string | null {
  if (!input.name.trim()) return "Nimi puuttuu";
  if (!input.birth_date) return "Syntymäpäivä puuttuu";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birth_date))
    return "Syntymäpäivä muodossa YYYY-MM-DD";
  if (input.death_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.death_date))
    return "Kuolinpäivä muodossa YYYY-MM-DD tai tyhjä";
  if (!input.role.trim()) return "Rooli puuttuu";
  return null;
}

export async function createCelebrity(input: CelebrityInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("celebrities").insert({
    name: input.name.trim(),
    birth_date: input.birth_date,
    death_date: input.death_date || null,
    role: input.role.trim(),
    bio_short: input.bio_short?.trim() || null,
    image_url: input.image_url?.trim() || null,
    platform: input.platform,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/celebrities");
  return { ok: true as const };
}

export async function updateCelebrity(id: string, input: CelebrityInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("celebrities")
    .update({
      name: input.name.trim(),
      birth_date: input.birth_date,
      death_date: input.death_date || null,
      role: input.role.trim(),
      bio_short: input.bio_short?.trim() || null,
      image_url: input.image_url?.trim() || null,
      platform: input.platform,
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/celebrities");
  return { ok: true as const };
}

export async function deleteCelebrity(id: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("celebrities").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/celebrities");
  return { ok: true as const };
}
