"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

export type Priority = 1 | 2 | 3 | 4 | 99;

export async function setCelebrityPriority(
  id: string,
  priority: Priority,
  isHero: boolean
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("celebrities")
    .update({ priority, is_hero: isHero })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/synttarit");
  return { ok: true };
}

export type SynttaritCelebrityInput = {
  name: string;
  birth_date: string; // yyyy-mm-dd
  death_date: string | null;
  role: string;
  bio_short: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  platform: "synttarit" | "both";
};

function validate(input: SynttaritCelebrityInput): string | null {
  if (!input.name.trim()) return "Nimi puuttuu";
  if (!input.birth_date) return "Syntymäpäivä puuttuu";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birth_date))
    return "Syntymäpäivä muodossa YYYY-MM-DD";
  if (input.death_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.death_date))
    return "Kuolinpäivä muodossa YYYY-MM-DD tai tyhjä";
  if (!input.role.trim()) return "Rooli puuttuu";
  return null;
}

export async function createSynttaritCelebrity(
  input: SynttaritCelebrityInput
): Promise<{ ok: boolean; error?: string }> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("celebrities").insert({
    name: input.name.trim(),
    birth_date: input.birth_date,
    death_date: input.death_date || null,
    role: input.role.trim(),
    bio_short: input.bio_short?.trim() || null,
    image_url: input.image_url?.trim() || null,
    wikipedia_url: input.wikipedia_url?.trim() || null,
    platform: input.platform,
    priority: 10,
    is_hero: false,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/synttarit");
  return { ok: true };
}

export async function updateSynttaritCelebrity(
  id: string,
  input: SynttaritCelebrityInput
): Promise<{ ok: boolean; error?: string }> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

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
      wikipedia_url: input.wikipedia_url?.trim() || null,
      platform: input.platform,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/synttarit");
  return { ok: true };
}
