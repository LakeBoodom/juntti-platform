// Kokoelmahubien ja pelimuotosivujen oma sisältö (page_content-taulu): SEO-otsikko ja -kuvaus.
// learn-sarakkeen aiheopasta ei enää näytetä (Heikki 19.10.2026: ei erillisiä hakukonetekstejä).
import { getSupabase } from "./supabase";

export type PageContent = {
  slug: string;
  kind: "collection" | "mode";
  name: string;
  seo_title: string | null;
  seo_description: string | null;
};

export async function getPageContent(slug: string): Promise<PageContent | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("page_content" as never)
    .select("slug, kind, name, seo_title, seo_description")
    .eq("slug", slug)
    .maybeSingle<PageContent>();
  return data ?? null;
}
