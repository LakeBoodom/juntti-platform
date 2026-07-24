"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { KUVAVISA_TYPE_SLUGS } from "./types";

export type { KuvavisaType } from "./types";
import type { KuvavisaType } from "./types";

export type KuvavisaInput = {
  site_id: string;
  type: KuvavisaType;
  question: string;
  image_url: string;
  options: [string, string, string, string];
  correct_option: string;
  fact: string | null;
  difficulty: "helppo" | "keski" | "vaikea";
  active: boolean;
  weight: number;
  tag: string | null;
};

function validate(input: KuvavisaInput): string | null {
  if (!input.site_id) return "Site puuttuu";
  if (!KUVAVISA_TYPE_SLUGS.includes(input.type))
    return "Virheellinen kuvavisa-tyyppi";
  if (!input.question.trim()) return "Kysymys puuttuu";
  if (!input.image_url) return "Kuva puuttuu — lataa kuva ensin";
  if (input.options.length !== 4 || input.options.some((o) => !o.trim()))
    return "Kaikki 4 vastausvaihtoehtoa vaaditaan";
  if (!input.options.includes(input.correct_option))
    return "Oikean vastauksen pitää olla yksi vastausvaihtoehdoista";
  if (input.weight < 1) return "Weight vähintään 1";
  if (input.tag && !/^[a-z0-9_-]+$/.test(input.tag))
    return "Tag saa sisältää vain pieniä kirjaimia, numeroita, alaviivoja ja viivoja";
  return null;
}

export async function createKuvavisa(input: KuvavisaInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  // Uusi kuvavisa menee oman tyyppinsä listan loppuun.
  const { data: last } = await sb
    .from("kuvavisas")
    .select("sort_order")
    .eq("site_id", input.site_id)
    .eq("type", input.type)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (last?.sort_order ?? -1) + 1;
  const { error } = await sb.from("kuvavisas").insert({
    ...input,
    fact: input.fact?.trim() || null,
    sort_order: nextOrder,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/kuvavisat");
  return { ok: true as const };
}

/**
 * Siirtää kuvavisaa yhden pykälän ylös/alas oman tyyppinsä järjestyksessä.
 * Vaihtaa sort_orderin naapurin kanssa. Reunassa (ei naapuria) ei tee mitään.
 */
export async function moveKuvavisa(id: string, direction: "up" | "down") {
  const sb = getSupabaseAdmin();
  const { data: cur, error: curErr } = await sb
    .from("kuvavisas")
    .select("id, site_id, type, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (curErr) return { ok: false as const, error: curErr.message };
  if (!cur) return { ok: false as const, error: "Kuvavisaa ei löytynyt" };

  const base = sb
    .from("kuvavisas")
    .select("id, sort_order")
    .eq("site_id", cur.site_id)
    .eq("type", cur.type);

  const { data: neighbors, error: nErr } =
    direction === "up"
      ? await base
          .lt("sort_order", cur.sort_order)
          .order("sort_order", { ascending: false })
          .limit(1)
      : await base
          .gt("sort_order", cur.sort_order)
          .order("sort_order", { ascending: true })
          .limit(1);
  if (nErr) return { ok: false as const, error: nErr.message };

  const neighbor = neighbors?.[0];
  if (!neighbor) return { ok: true as const }; // jo listan reunassa

  // Vaihda sort_orderit keskenään (ei unique-constraintia → transientti tilanne ok).
  const { error: e1 } = await sb
    .from("kuvavisas")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", cur.id);
  if (e1) return { ok: false as const, error: e1.message };
  const { error: e2 } = await sb
    .from("kuvavisas")
    .update({ sort_order: cur.sort_order })
    .eq("id", neighbor.id);
  if (e2) return { ok: false as const, error: e2.message };

  revalidatePath("/kuvavisat");
  return { ok: true as const };
}

export async function updateKuvavisa(id: string, input: KuvavisaInput) {
  const err = validate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("kuvavisas")
    .update({
      ...input,
      fact: input.fact?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/kuvavisat");
  return { ok: true as const };
}

export async function deleteKuvavisa(id: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("kuvavisas").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/kuvavisat");
  return { ok: true as const };
}

/**
 * Upload-action: ottaa FormDatasta tiedoston, tallentaa Supabase Storageen,
 * palauttaa public URLin.
 */
export async function uploadKuvavisaImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  const siteSlug = (formData.get("site_slug") as string) || "tietoniekka";
  const type = (formData.get("type") as KuvavisaType) || "liput";

  if (!file || !file.size) return { ok: false as const, error: "Tiedosto puuttuu" };
  if (file.size > 5 * 1024 * 1024)
    return { ok: false as const, error: "Tiedosto liian iso (max 5 MB)" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${siteSlug}/${type}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const sb = getSupabaseAdmin();
  const arrayBuf = await file.arrayBuffer();
  const { error } = await sb.storage
    .from("kuvavisa-images")
    .upload(fileName, arrayBuf, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (error) return { ok: false as const, error: error.message };

  const { data } = sb.storage.from("kuvavisa-images").getPublicUrl(fileName);
  return { ok: true as const, publicUrl: data.publicUrl, path: fileName };
}
