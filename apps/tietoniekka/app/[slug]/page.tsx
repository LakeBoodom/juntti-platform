import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizBySlugOrCustom } from "../../lib/queries";
import { buildQuizConfig } from "../../lib/buildQuizConfig";
import { PeliClient } from "../peli/peli-client";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

// Note: Next.js already prefers a literal route (app/peli, app/kategoria/[slug],
// ...) over this catch-all dynamic segment at the same level, so reserved words
// like "peli" or "visa" never actually reach this file. The admin custom-URL
// field validates against the same reserved list (see admin quizzes/[id]/actions.ts)
// so Heikki gets a warning before saving a slug that would be silently shadowed.

/** Parsii "8-10"-muotoisen tulosparametrin jakolinkeistä. */
function parseTulos(raw: string | string[] | undefined): { score: number; total: number } | null {
  if (typeof raw !== "string") return null;
  const m = /^(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (!m) return null;
  const score = Number(m[1]);
  const total = Number(m[2]);
  if (total < 1 || total > 30 || score < 0 || score > total) return null;
  return { score, total };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizBySlugOrCustom(slug);
  if (!quiz) return { title: "Visa ei löydy — Tietoniekka" };

  const sp = await searchParams;
  const tulos = parseTulos(sp.tulos) ?? parseTulos(sp.t);
  const description = tulos
    ? `Sain ${tulos.score}/${tulos.total} oikein visassa "${quiz.title}" — pystytkö parempaan? Pelaa ilmaiseksi!`
    : quiz.description ??
      "Pelaa ilmainen suomalainen tietovisa — 10 kysymystä. Montako saat oikein?";
  const ogUrl = `${SITE_URL}/peli/og?title=${encodeURIComponent(
    quiz.title,
  )}&kat=${encodeURIComponent(quiz.category ?? "")}${
    tulos ? `&tulos=${tulos.score}-${tulos.total}` : ""
  }`;
  // Kanoninen osoite on aina lyhin: custom_slug jos asetettu, muuten sisältöslug.
  // /visa/[slug] osoittaa saman kanonisen URL:n tänne, jotta hakukoneet eivät
  // näe kahta kilpailevaa osoitetta samasta sisällöstä.
  const canonicalSlug = quiz.custom_slug ?? quiz.slug;
  const canonical = `${SITE_URL}/${canonicalSlug}`;

  return {
    title: quiz.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "fi_FI",
      siteName: "Tietoniekka",
      title: quiz.title,
      description,
      url: canonical,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: quiz.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: quiz.title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function VanityQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await getQuizBySlugOrCustom(slug);
  if (!quiz) notFound();

  const config = buildQuizConfig(
    {
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
    },
    quiz.questions,
    { kat: quiz.category },
  );

  return <PeliClient preloadedQuiz={config} />;
}
