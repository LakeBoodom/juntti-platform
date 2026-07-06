"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { generateSocialCopy } from "@juntti/ai";

export type SocialPlatform = "facebook" | "instagram" | "linkedin";
export type SocialPostStatus = "draft" | "ready" | "scheduled" | "posted" | "failed";

const OG_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_BASE_URL ?? "http://localhost:3001";

function buildGenericOgUrl(headline: string) {
  const url = new URL("/api/social-og/generic", OG_BASE_URL);
  url.searchParams.set("label", "TIETONIEKKA");
  url.searchParams.set("headline", headline);
  url.searchParams.set("size", "square");
  return `${url.pathname}${url.search}`;
}

/** Päivittää postauksen copy-tekstin (inline-editointi some-listalla). */
export async function updatePostCopy(id: string, copyText: string) {
  if (!copyText.trim()) return { ok: false as const, error: "Teksti ei voi olla tyhjä" };
  const sb = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any)
    .from("social_posts")
    .update({ copy_text: copyText.trim() })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/somepostaukset");
  return { ok: true as const };
}

/** Päivittää ajastusajan (scheduled_at). */
export async function updatePostScheduledAt(id: string, scheduledAt: string) {
  if (!scheduledAt) return { ok: false as const, error: "Ajankohta puuttuu" };
  const sb = getSupabaseAdmin();
  const iso = new Date(scheduledAt).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any)
    .from("social_posts")
    .update({ scheduled_at: iso })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/somepostaukset");
  return { ok: true as const };
}

/**
 * Hyväksy postaus: siirtää statuksen 'scheduled':ksi. Vaatii että scheduled_at on asetettu
 * ja copy_text ei ole tyhjä. Tämä EI julkaise mitään oikeasti — vain merkitsee valmiiksi jonoon.
 */
export async function approvePost(id: string, scheduledAt: string | null, copyText: string) {
  if (!copyText.trim()) return { ok: false as const, error: "Teksti ei voi olla tyhjä" };
  if (!scheduledAt) return { ok: false as const, error: "Aseta ajastusaika ennen hyväksyntää" };

  const sb = getSupabaseAdmin();
  const iso = new Date(scheduledAt).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any)
    .from("social_posts")
    .update({
      status: "scheduled",
      scheduled_at: iso,
      copy_text: copyText.trim(),
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/somepostaukset");
  return { ok: true as const };
}

export async function deletePost(id: string) {
  const sb = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any).from("social_posts").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/somepostaukset");
  return { ok: true as const };
}

/**
 * Luo uusi yleinen ("general") postaus Heikin raakamuistiinpanosta.
 * Yksi social_posts-rivi per valittu alusta, source_type='general', source_id=null.
 */
export async function createGeneralPost(input: {
  siteId: string;
  brief: string;
  targetDate: string;
  platforms: SocialPlatform[];
}): Promise<{ ok: true; created: number } | { ok: false; error: string }> {
  const { siteId, brief, targetDate, platforms } = input;
  if (!siteId) return { ok: false, error: "Site puuttuu" };
  if (!brief.trim()) return { ok: false, error: "Kirjoita ensin muistiinpano" };
  if (!targetDate) return { ok: false, error: "Valitse päivämäärä" };
  if (!platforms.length) return { ok: false, error: "Valitse vähintään yksi alusta" };

  try {
    const { copyText } = await generateSocialCopy({
      sourceType: "general",
      brief: brief.trim(),
    });

    const sb = getSupabaseAdmin();
    const imageUrl = buildGenericOgUrl(copyText.slice(0, 100));

    let created = 0;
    const errors: string[] = [];
    for (const platform of platforms) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (sb as any).from("social_posts").insert({
        site_id: siteId,
        platform,
        source_type: "general",
        source_id: null,
        target_date: targetDate,
        copy_text: copyText,
        image_url: imageUrl,
        status: "draft",
      });
      if (error) errors.push(`${platform}: ${error.message}`);
      else created++;
    }

    revalidatePath("/somepostaukset");
    if (created === 0) {
      return { ok: false, error: errors.join("; ") || "Postausta ei luotu" };
    }
    return { ok: true, created };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ── Pohjakuvat (social_templates) — pieni CRUD tälle sivulle ──

export type TemplateContentScope =
  | "quiz"
  | "celebrity"
  | "countdown"
  | "general"
  | "all";
export type TemplateAspectRatio = "square" | "portrait" | "landscape";

export type TemplateInput = {
  site_id: string;
  name: string;
  theme_key: string;
  content_scope: TemplateContentScope;
  image_url: string;
  aspect_ratio: TemplateAspectRatio;
  active: boolean;
  sort_order: number;
};

function validateTemplate(input: TemplateInput): string | null {
  if (!input.site_id) return "Site puuttuu";
  if (!input.name.trim()) return "Nimi puuttuu";
  if (!input.image_url.trim()) return "Kuva puuttuu";
  return null;
}

/**
 * Lataa pohjakuvan Supabase Storageen ("social-templates" bucket, public)
 * ja palauttaa julkisen URLin. Sama malli kuin admin/app/kuvavisat/actions.ts.
 */
export async function uploadSocialTemplateImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  const siteSlug = (formData.get("site_slug") as string) || "tietoniekka";

  if (!file || !file.size) return { ok: false as const, error: "Tiedosto puuttuu" };
  if (file.size > 8 * 1024 * 1024)
    return { ok: false as const, error: "Tiedosto liian iso (max 8 MB)" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${siteSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const sb = getSupabaseAdmin();
  const arrayBuf = await file.arrayBuffer();
  const { error } = await sb.storage
    .from("social-templates")
    .upload(fileName, arrayBuf, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (error) return { ok: false as const, error: error.message };

  const { data } = sb.storage.from("social-templates").getPublicUrl(fileName);
  return { ok: true as const, publicUrl: data.publicUrl, path: fileName };
}

export async function createTemplate(input: TemplateInput) {
  const err = validateTemplate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any).from("social_templates").insert({
    site_id: input.site_id,
    name: input.name.trim(),
    theme_key: input.theme_key.trim(),
    content_scope: input.content_scope,
    image_url: input.image_url.trim(),
    aspect_ratio: input.aspect_ratio,
    active: input.active,
    sort_order: input.sort_order,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/somepostaukset");
  return { ok: true as const };
}

export async function updateTemplate(id: string, input: TemplateInput) {
  const err = validateTemplate(input);
  if (err) return { ok: false as const, error: err };
  const sb = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any)
    .from("social_templates")
    .update({
      name: input.name.trim(),
      theme_key: input.theme_key.trim(),
      content_scope: input.content_scope,
      image_url: input.image_url.trim(),
      aspect_ratio: input.aspect_ratio,
      active: input.active,
      sort_order: input.sort_order,
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/somepostaukset");
  return { ok: true as const };
}

export async function deleteTemplate(id: string) {
  const sb = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any).from("social_templates").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/somepostaukset");
  return { ok: true as const };
}

export async function toggleTemplateActive(id: string, active: boolean) {
  const sb = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any)
    .from("social_templates")
    .update({ active })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/somepostaukset");
  return { ok: true as const };
}
