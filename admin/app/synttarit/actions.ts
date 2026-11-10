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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await sb
    .from("celebrities")
    .update({ priority, is_hero: isHero } as any)
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
  // Synttärit beta (migraatio 20261108). bio_intro ja facts ovat jaettuja Tietoniekan henkilösivun kanssa.
  bio_intro: string | null;
  facts: { label: string; value: string }[];
  tiesitko: string | null;
  image_credit: string | null;
  image_license: string | null;
};

function extraFields(input: SynttaritCelebrityInput) {
  const facts = input.facts
    .map((f) => ({ label: f.label.trim(), value: f.value.trim() }))
    .filter((f) => f.label && f.value);
  return {
    bio_intro: input.bio_intro?.trim() || null,
    facts: facts.length ? facts : null,
    tiesitko: input.tiesitko?.trim() || null,
    image_credit: input.image_credit?.trim() || null,
    image_license: input.image_license?.trim() || null,
  };
}

function validate(input: SynttaritCelebrityInput): string | null {
  if (!input.name.trim()) return "Nimi puuttuu";
  if (!input.birth_date) return "Syntymäpäivä puuttuu";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birth_date))
    return "Syntymäpäivä muodossa YYYY-MM-DD";
  if (input.death_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.death_date))
    return "Kuolinpäivä muodossa YYYY-MM-DD tai tyhjä";
  if (!input.role.trim()) return "Rooli puuttuu";
  if (input.facts.some((f) => !!f.label.trim() !== !!f.value.trim()))
    return "Tietolaatikon rivillä pitää olla sekä otsikko että arvo";
  return null;
}

export async function createSynttaritCelebrity(
  input: SynttaritCelebrityInput
): Promise<{ ok: boolean; error?: string }> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const sb = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await sb.from("celebrities").insert({
    name: input.name.trim(),
    birth_date: input.birth_date,
    death_date: input.death_date || null,
    role: input.role.trim(),
    bio_short: input.bio_short?.trim() || null,
    image_url: input.image_url?.trim() || null,
    wikipedia_url: input.wikipedia_url?.trim() || null,
    platform: input.platform,
    ...extraFields(input),
    priority: 10,
    is_hero: false,
  } as any);

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      ...extraFields(input),
    } as any)
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/synttarit");
  return { ok: true };
}
