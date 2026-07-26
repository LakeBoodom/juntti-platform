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
  /** Sijainti. Vaaditaan etäisyyskysymyksiin ("kumpi on lähempänä Vaasaa"). */
  lat: number | null;
  lon: number | null;
  /** Partitiivi ("Vaasaa") — käytetään kun tämä on kysymyksen vertailupisteenä. */
  name_partitive: string | null;
  attributes: AttrValue[];
};

function validate(i: EntityInput): string | null {
  if (!i.name.trim()) return "Nimi puuttuu";
  if (!i.kind.trim()) return "Laji puuttuu";
  const filled = i.attributes.filter((a) => a.num_value !== null && !Number.isNaN(a.num_value));
  if (!filled.length) return "Anna vähintään yksi attribuutti — muuten entiteetti ei tuota yhtään kysymystä";
  if (i.image_url && !i.image_url.includes("upload.wikimedia.org"))
    return "Kuvan pitää olla suora tiedostolinkki (upload.wikimedia.org), ei artikkelilinkki";
  // Sijainti on joko kokonaan annettu tai kokonaan pois — puolikas ei kelpaa
  // mihinkään ja jättäisi entiteetin hiljaa pois etäisyyskysymyksistä.
  if ((i.lat === null) !== (i.lon === null))
    return "Anna sekä leveys- että pituusaste, tai jätä molemmat tyhjiksi";
  if (i.lat !== null && (i.lat < -90 || i.lat > 90)) return "Leveysasteen pitää olla -90…90";
  if (i.lon !== null && (i.lon < -180 || i.lon > 180)) return "Pituusasteen pitää olla -180…180";
  if (i.lat !== null && !i.name_partitive?.trim())
    return 'Anna partitiivi (esim. "Vaasaa") — sitä tarvitaan kysymystekstissä "on lähempänä …"';
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
      lat: input.lat,
      lon: input.lon,
      name_partitive: input.name_partitive?.trim() || null,
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
      lat: input.lat,
      lon: input.lon,
      name_partitive: input.name_partitive?.trim() || null,
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
  easy_gap: number | null;
  mid_gap: number | null;
  max_gap: number | null;
  min_gap: number | null;
  max_domain_distance: number;
  unit_label: string | null;
  enabled: boolean;
};

export async function saveDef(input: DefInput, isNew: boolean) {
  if (!input.attr_key.trim()) return { ok: false as const, error: "Avain puuttuu" };
  if (!input.question_text.trim()) return { ok: false as const, error: "Kysymysteksti puuttuu" };
  if (/^kumpi/i.test(input.question_text.trim()))
    return { ok: false as const, error: 'Älä aloita sanalla "kumpi" — se tulee automaattisesti otsikosta' };
  if (input.easy_gap !== null && input.mid_gap !== null && !(input.easy_gap > input.mid_gap))
    return { ok: false as const, error: "Helpon kynnyksen pitää olla suurempi kuin keskitason" };
  if (input.max_gap !== null && input.easy_gap !== null && input.max_gap <= input.easy_gap)
    return {
      ok: false as const,
      error: "Suurin sallittu ero pitää olla suurempi kuin helpon kynnys — muuten yksikään pari ei ole helppo",
    };
  if (input.min_gap !== null && input.max_gap !== null && input.min_gap >= input.max_gap)
    return {
      ok: false as const,
      error: "Pienin sallittu ero pitää olla pienempi kuin suurin — muuten yksikään pari ei kelpaa",
    };
  const sb = getSupabaseAdmin();
  const row = { ...input, attr_key: input.attr_key.trim() };
  const { error } = isNew
    ? await sb.from("duel_attribute_defs").insert(row)
    : await sb.from("duel_attribute_defs").update(row).eq("attr_key", row.attr_key);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/kaksintaistelut");
  return { ok: true as const };
}
