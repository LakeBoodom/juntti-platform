// TIETONIEKKA — sitemap 2.0-rakenteesta (julkaisu 31.8.2026).
// 1.0:n /kategoria/* ja /sankari/* poistuivat julkaisussa (301-ohjaukset
// next.config.mjs:ssä) eivätkä kuulu enää sitemapiin. Visasivujen kanoninen
// osoite on /visa/<slug> (SEO_STRATEGIA §3.1).
import type { MetadataRoute } from "next";
import { getPublishedQuizSlugs } from "@/lib/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const revalidate = 3600;

/* Kokoelmahubit = app/(tn20)/kokoelma/* -sivut. Pidetään listana tässä, koska
   reitit ovat staattisia sivuja (11 omaa hakemistoa + kuvavisat ja
   tunnetut-henkilot [collection]-reitin HUBS-taulusta). Uusi hub → lisää rivi. */
const COLLECTION_HUBS = [
  "elokuvat",
  "historia",
  "jaakiekko",
  "jalkapallo",
  "kaupungit",
  "kulttuuri",
  "kuvavisat",
  "luonto",
  "matkakohteet",
  "musiikki",
  "tunnetut-henkilot",
  "tv",
  "urheilu",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/kokoelmat`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/megavisat`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tietosuoja`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const collectionPages: MetadataRoute.Sitemap = COLLECTION_HUBS.map((slug) => ({
    url: `${SITE_URL}/kokoelma/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const quizzes = await getPublishedQuizSlugs();
  const quizPages: MetadataRoute.Sitemap = quizzes
    .filter((q) => q.slug)
    .map((q) => ({
      url: `${SITE_URL}/visa/${q.slug}`,
      lastModified: q.updated_at ? new Date(q.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticPages, ...collectionPages, ...quizPages];
}
