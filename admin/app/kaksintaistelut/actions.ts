"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

/** Attribuutit joiden num_value on epoch-sekunteina (lomake näyttää päivämäärän) */
export const DATE_ATTRS = ["birth"];

export type AttrValue = {
  attr_key: string;
  num_value: number | null;
  display_value: string | null;
  source: string | null;
  verified_at: string | null;
};

export type EntityInput = {
  name: string;
  kind: string;
  role_label: string | null;
  show_role: boolean;
  image_url: string | null;
  image_credit: string | null;
  wiki_url: string | null;
  status: "draft" | "published" | "hidden";
  attributes: AttrValue[];
};

function validate(i: EntityInput): string | null {
  if (!i.name.trim()) return "Nimi puuttuu";
  if (!i.kind.trim()) return "Laji puuttuu";
  const filled = i.attributes.filter((a) => a.num_value !== null && !Number.isNaN(a.num_value));
  if (!filled.length) return "Anna vähintään yksi attribuutti — muuten entiteetti ei tuota yhtään kysymystä";
  if (i.image_url && !i.image_url.includes("upload.wikimedia.org"))
    return "Kuvan pitää olla suora tiedostolinkki (upload.wikimedia.org), ei artikkelilinkki";
  return null;
}

async function writeAttributes(entityId: string, attributes: AttrValue[]) {
  const sb = getSupabaseAdmin();
  const keep = attributes.filter((a) => a.num_value !== null && !Number.isNaN(a.num_value));
  const drop = attributes.filter((a) => a.num_value === null || Number.isNaN(a.num_value));
  if (drop.length) {
    await sb
      .from("duel_attributes")
      .delete()
      .eq("entity_id", entityId)
      .in("attr_key", drop.map((a) => a.attr_key));
  }
  if (keep.length) {
    await sb.from("duel_attributes").upsert(
      keep.map((a) => ({
        entity_id: entityId,
        attr_key: a.attr_key,
        num_value: a.num_value as number,
        display_value: a.display_value,
        source: a.source,
        verified_at: a.verified_at,
      })),
      { onConflict: "entity_id,attr_key" },
    );
  }
}

export async function createEntity(input: EntityInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("duel_entities")
    .insert({
      name: input.name.trim(),
      kind: input.kind,
      role_label: input.role_label?.trim() || null,
      show_role: input.show_role,
      image_url: input.image_url?.trim() || null,
      image_credit: input.image_credit?.trim() || null,
      wiki_url: input.wiki_url?.trim() || null,
      status: input.status,
    })
    .select("id")
    .single();
  if (error) return { ok: false as const, error: error.message };
  await writeAttributes(data.id, input.attributes);
  revalidatePath("/kaksintaistelut");
  return { ok: true as const };
}

export async function updateEntity(id: string, input: EntityInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("duel_entities")
    .update({
      name: input.name.trim(),
      kind: input.kind,
      role_label: input.role_label?.trim() || null,
      show_role: input.show_role,
      image_url: input.image_url?.trim() || null,
      image_credit: input.image_credit?.trim() || null,
      wiki_url: input.wiki_url?.trim() || null,
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  await writeAttributes(id, input.attributes);
  revalidatePath("/kaksintaistelut");
  return { ok: true as const };
}

export async function deleteEntity(id: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("duel_entities").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/kaksintaistelut");
  return { ok: true as const };
}

export type DefInput = {
  attr_key: string;
  kind: string;
  theme: string;
  subject_label: string;
  question_text: string;
  winner: "low" | "high";
  easy_gap: number;
  mid_gap: number;
  unit_label: string | null;
  enabled: boolean;
};

export async function saveDef(input: DefInput, isNew: boolean) {
  if (!input.attr_key.trim()) return { ok: false as const, error: "Avain puuttuu" };
  if (!input.question_text.trim()) return { ok: false as const, error: "Kysymysteksti puuttuu" };
  if (/^kumpi/i.test(input.question_text.trim()))
    return { ok: false as const, error: 'Älä aloita sanalla "kumpi" — se tulee automaattisesti otsikosta' };
  if (!(input.easy_gap > input.mid_gap))
    return { ok: false as const, error: "Helpon kynnyksen pitää olla suurempi kuin keskitason" };
  const sb = getSupabaseAdmin();
  const row = { ...input, attr_key: input.attr_key.trim() };
  const { error } = isNew
    ? await sb.from("duel_attribute_defs").insert(row)
    : await sb.from("duel_attribute_defs").update(row).eq("attr_key", row.attr_key);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/kaksintaistelut");
  return { ok: true as const };
}
