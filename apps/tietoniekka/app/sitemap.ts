import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getPublishedQuizSlugs } from "@/lib/queries";
import { getSupabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const revalidate = 3600;

/* Henkilöt luetaan KANNASTA, ei enää staattisesta lib/sankarit.ts-tiedostosta
   (jossa oli 3 placeholder-riviä, vaikka kannassa on satoja henkilöitä).
   Ks. SEO_STRATEGIA.md §5.4. */
async function getCelebritySlugs(): Promise<Array<{ slug: string; updated: string | null }>> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("celebrities")
    .select("slug, created_at")
    .not("slug", "is", null);
  return ((data ?? []) as Array<{ slug: string | null; created_at: string | null }>)
    .filter((c): c is { slug: string; created_at: string | null } => !!c.slug)
    .map((c) => ({ slug: c.slug, updated: c.created_at }));
}

async function getPageContentSlugs(): Promise<Array<{ slug: string; kind: string }>> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.from("page_content" as never).select("slug, kind");
  return (data ?? []) as Array<{ slug: string; kind: string }>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/tietosuoja`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [quizzes, celebs, pages] = await Promise.all([
    getPublishedQuizSlugs(),
    getCelebritySlugs(),
    getPageContentSlugs(),
  ]);

  /* Kokoelmahubit ja pelimuotosivut page_content-taulusta — nämä puuttuivat
     sitemapista kokonaan, vaikka ovat sivuston tärkeimpiä laskeutumissivuja. */
  const collectionPages: MetadataRoute.Sitemap = pages
    .filter((p) => p.kind === "collection")
    .map((p) => ({
      url: `${SITE_URL}/2-0/kokoelma/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  const modePages: MetadataRoute.Sitemap = pages
    .filter((p) => p.kind === "mode")
    .map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  // Vanha kategoriarakenne — säilyy kunnes 2.0 korvaa juuren (§3.1)
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/kategoria/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const sankariPages: MetadataRoute.Sitemap = celebs.map((c) => ({
    url: `${SITE_URL}/sankari/${c.slug}`,
    lastModified: c.updated ? new Date(c.updated) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const quizPages: MetadataRoute.Sitemap = quizzes
    .filter((q) => q.slug)
    .map((q) => ({
      url: `${SITE_URL}/visa/${q.slug}`,
      lastModified: q.updated_at ? new Date(q.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...collectionPages,
    ...modePages,
    ...categoryPages,
    ...sankariPages,
    ...quizPages,
  ];
}
