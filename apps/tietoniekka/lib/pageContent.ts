// Kokoelmahubien ja pelimuotosivujen oma sisältö (page_content-taulu).
// Sama learn-rakenne kuin quizzes.learn — ks. SEO_STRATEGIA.md §5.2.
import { getSupabase } from "./supabase";
import type { Learn } from "@/components/tn20/LearnArticle";

export type PageContent = {
  slug: string;
  kind: "collection" | "mode";
  name: string;
  seo_title: string | null;
  seo_description: string | null;
  learn: Learn | null;
};

export async function getPageContent(slug: string): Promise<PageContent | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("page_content" as never)
    .select("slug, kind, name, seo_title, seo_description, learn")
    .eq("slug", slug)
    .maybeSingle<PageContent>();
  return data ?? null;
}
