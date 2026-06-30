import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizBySlug } from "../../../lib/queries";
import { buildQuizConfig } from "../../../lib/buildQuizConfig";
import { PeliClient } from "../../peli/peli-client";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);
  if (!quiz) return { title: "Visa ei löydy — Tietoniekka" };

  const description =
    quiz.description ??
    "Pelaa ilmainen suomalainen tietovisa — 10 kysymystä. Montako saat oikein?";
  const ogUrl = `${SITE_URL}/peli/og?title=${encodeURIComponent(
    quiz.title,
  )}&kat=${encodeURIComponent(quiz.category ?? "")}`;
  const canonical = `${SITE_URL}/visa/${slug}`;

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

export default async function VisaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);
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
