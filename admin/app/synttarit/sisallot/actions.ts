"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { PAGE_TYPES, type Block, type PageType, type Status } from "@/lib/synttarit";

export type SynttaritPageInput = {
  type: PageType;
  slug: string;
  age: number | null;
  title: string;
  seo_title: string | null;
  meta_description: string | null;
  eyebrow: string | null;
  ingress: string | null;
  hero_image_url: string | null;
  hero_image_credit: string | null;
  meta_chips: string[];
  body: Block[];
  related_slugs: string[];
  status: Status;
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/;

function validate(input: SynttaritPageInput): string | null {
  if (!PAGE_TYPES.some((t) => t.value === input.type)) return "Tuntematon sivutyyppi";
  if (!input.title.trim()) return "Otsikko puuttuu";
  if (!SLUG_RE.test(input.slug))
    return "Osoitteessa saa olla vain pieniä kirjaimia a–z, numeroita, väliviivoja ja kauttaviivoja";
  if (input.age !== null && (!Number.isInteger(input.age) || input.age < 0 || input.age > 120))
    return "Ikä on kokonaisluku 0–120 tai tyhjä";
  for (const [i, b] of input.body.entries()) {
    if (b.type === "gift_idea" && !b.title.trim()) return `Lahjaidealta (lohko ${i + 1}) puuttuu otsikko`;
    if (b.type === "tietoniekka" && !b.url.trim()) return `Tietoniekka-nostolta (lohko ${i + 1}) puuttuu linkki`;
  }
  return null;
}

const clean = (s: string | null) => s?.trim() || null;
const cleanList = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean);

export async function saveSynttaritPage(
  id: string | null,
  input: SynttaritPageInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const sb = getSupabaseAdmin();

  // published_at asetetaan ensimmäisellä julkaisukerralla eikä muutu sen jälkeen.
  let publishedAt: string | null = null;
  if (id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prev } = await (sb as any).from("synttarit_pages").select("published_at").eq("id", id).single();
    publishedAt = prev?.published_at ?? null;
  }
  if (input.status === "published" && !publishedAt) publishedAt = new Date().toISOString();

  const row = {
    type: input.type,
    slug: input.slug,
    age: input.age,
    title: input.title.trim(),
    seo_title: clean(input.seo_title),
    meta_description: clean(input.meta_description),
    eyebrow: clean(input.eyebrow),
    ingress: clean(input.ingress),
    hero_image_url: clean(input.hero_image_url),
    hero_image_credit: clean(input.hero_image_credit),
    meta_chips: cleanList(input.meta_chips),
    // Muistilistan tyhjät rivit pois (editorissa yksi kohta per rivi).
    body: input.body.map((b) => (b.type === "checklist" ? { ...b, items: cleanList(b.items) } : b)),
    related_slugs: cleanList(input.related_slugs),
    status: input.status,
    published_at: publishedAt,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (sb as any).from("synttarit_pages");
  const { data, error } = id
    ? await q.update(row).eq("id", id).select("id").single()
    : await q.insert(row).select("id").single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: `Osoite /${input.slug} on jo käytössä toisella sivulla` };
    return { ok: false, error: error.message };
  }

  revalidatePath("/synttarit/sisallot");
  return { ok: true, id: data.id };
}
