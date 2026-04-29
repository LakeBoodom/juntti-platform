// Site-context server-puolella. Lukee `admin_site_slug`-cookien ja
// resolvoi sites-taulusta. Fallback: ensimmäinen aktiivinen site.

import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@juntti/db";

export type SiteRow = {
  id: string;
  slug: string;
  name: string;
};

export const SITE_COOKIE = "admin_site_slug";
export const DEFAULT_SITE_SLUG = "tietoniekka";

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
  const store = await cookies();
  const slug = store.get(SITE_COOKIE)?.value || DEFAULT_SITE_SLUG;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("sites")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();

  if (data) return data;

  // Fallback: ensimmäinen aktiivinen
  const sites = await listSites();
  if (sites.length === 0) {
    throw new Error("Ei aktiivisia siteja — luo vähintään yksi sites-taulun rivi");
  }
  return sites[0];
}
