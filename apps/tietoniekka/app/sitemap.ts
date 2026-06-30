import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { SANKARIT } from "@/lib/sankarit";
import { getPublishedQuizSlugs } from "@/lib/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tietosuoja`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/kategoria/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sankariPages: MetadataRoute.Sitemap = SANKARIT.map((s) => ({
    url: `${SITE_URL}/sankari/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Yksittäiset visat — /visa/<slug> (löytyy myös jakolinkeistä)
  const quizzes = await getPublishedQuizSlugs();
  const quizPages: MetadataRoute.Sitemap = quizzes
    .filter((q) => q.slug)
    .map((q) => ({
      url: `${SITE_URL}/visa/${q.slug}`,
      lastModified: q.updated_at ? new Date(q.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticPages, ...categoryPages, ...sankariPages, ...quizPages];
}
