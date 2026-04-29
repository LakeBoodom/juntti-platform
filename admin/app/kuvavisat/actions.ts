"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

export type KuvavisaType = "liput" | "paikkakunnat" | "logot" | "vaakunat";

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
  if (!["liput", "paikkakunnat", "logot", "vaakunat"].includes(input.type))
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
  const { error } = await sb.from("kuvavisas").insert({
    ...input,
    fact: input.fact?.trim() || null,
  });
  if (error) return { ok: false as const, error: error.message };
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
