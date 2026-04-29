// Site-context server-puolella. V1.0 admin-tool on Tietoniekka-only.
// Sites-taulu säilyy DB:ssä multi-frontend-arkkitehtuurin tueksi (V3.0 kulmapotku jne),
// mutta admin näyttää aina Tietoniekka.fi-sisällön. Juntti.com-sisältö migroitu Tietoniekkaan.

import { getSupabaseAdmin } from "@juntti/db";

export type SiteRow = {
  id: string;
  slug: string;
  name: string;
};

const FORCED_SLUG = "tietoniekka";

export async function listSites(): Promise<SiteRow[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("sites")
    .select("id, slug, name")
    .eq("active", true)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getCurrentSite(): Promise<SiteRow> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("sites")
    .select("id, slug, name")
    .eq("slug", FORCED_SLUG)
    .maybeSingle();
  if (!data) throw new Error(`Site '${FORCED_SLUG}' ei löydy sites-taulusta`);
  return data;
}
