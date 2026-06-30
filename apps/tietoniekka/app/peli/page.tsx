import { Suspense } from "react";
import type { Metadata } from "next";
import { CATEGORIES } from "../../lib/categories";
import { getQuizById, getKuvavisat, getRandomQuizByCategory, getTodaysQuiz } from "../../lib/queries";
import { PeliClient } from "./peli-client";
import { buildQuizConfig } from "../../lib/buildQuizConfig";
import type { QuizConfig, Question } from "./questions";

/**
 * /peli — server-component joka:
 * 1. Lukee searchParamsista quiz_id
 * 2. Jos annettu, hakee visan ja sen kysymykset Supabasesta → muuntaa QuizConfig-rakenteeseen
 * 3. Jos ei, jättää preloadedQuiz nullhi → client-puoli käyttää hardcoded resolveQuiz:ia
 *    (vanhaa fallback-rataa kunnes admin-data on valmis kaikille tyypeille)
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

const KUVAVISA_META: Record<string, string> = {
  liput: "LIPPUVISA",
  vaakuna: "VAAKUNAVISA",
  vaakunat: "VAAKUNAVISA",
  linnut: "LINTUVISA",
  kasvit: "KASVIVISA",
  elaimet: "ELÄINVISA",
};

/**
 * Per-visa metadata: uniikki title, description, canonical ja dynaaminen OG-kuva.
 * Tämä korjaa sen, että jaettu linkki näytti aiemmin geneerisen etusivun esikatselun.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const quizId = typeof params.quiz_id === "string" ? params.quiz_id : null;

  let title: string | null = null;
  let description =
    "Pelaa ilmainen suomalainen tietovisa — 10 kysymystä. Montako saat oikein?";
  let kat = typeof params.kat === "string" ? params.kat : "";
  let canonicalId: string | null = quizId;
  let canonicalSlug: string | null = null;

  if (quizId) {
    const full = await getQuizById(quizId);
    if (full) {
      title = full.title;
      description = full.description ?? description;
      kat = full.category ?? kat;
      canonicalSlug = full.slug ?? null;
    }
  } else if (params.paivan_visa === "1") {
    const today = await getTodaysQuiz();
    if (today) {
      const full = await getQuizById(today.id);
      if (full) {
        title = full.title;
        description = full.description ?? description;
        kat = full.category ?? kat;
        canonicalSlug = full.slug ?? null;
      }
      canonicalId = today.id;
    }
  } else if (typeof params.kuvavisa === "string") {
    title = KUVAVISA_META[params.kuvavisa] ?? "KUVAVISA";
    description = "Tunnista kuvasta — yksi kuva, neljä vaihtoehtoa.";
  }

  const pageTitle = title ?? "Tietovisa";
  const ogUrl = `${SITE_URL}/peli/og?title=${encodeURIComponent(
    title ?? "TIETOVISA",
  )}&kat=${encodeURIComponent(kat)}`;
  const canonical = canonicalSlug
    ? `${SITE_URL}/visa/${canonicalSlug}`
    : canonicalId
      ? `${SITE_URL}/peli?quiz_id=${canonicalId}`
      : null;

  return {
    title: pageTitle,
    description,
    // Satunnais- ja parametriset variaatiot ilman vakaata osoitetta: ei indeksoida
    robots: canonical ? undefined : { index: false, follow: true },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      locale: "fi_FI",
      siteName: "Tietoniekka",
      title: pageTitle,
      description,
      url: canonical ?? `${SITE_URL}/peli`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogUrl],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function PeliPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const quizId = typeof params.quiz_id === "string" ? params.quiz_id : null;

  let preloadedQuiz: QuizConfig | null = null;

  // 1. Explicit quiz_id annettu URL:ssä → suora haku
  if (quizId) {
    const full = await getQuizById(quizId);
    if (full && full.questions.length > 0) {
      preloadedQuiz = buildQuizConfig(
        { id: full.id, slug: full.slug, title: full.title, description: full.description, category: full.category },
        full.questions,
        {
          paivan_visa: params.paivan_visa === "1",
          paivan_sankari: params.paivan_sankari === "1",
          kat: typeof params.kat === "string" ? params.kat : undefined,
          event: typeof params.event === "string" ? params.event : undefined,
          kuvavisa: typeof params.kuvavisa === "string" ? params.kuvavisa : undefined,
        },
      );
    }
  }

  // 2. Päivän visa (ei quiz_id:tä) → tämän päivän visa DB:stä
  if (!preloadedQuiz && params.paivan_visa === "1") {
    const today = await getTodaysQuiz();
    if (today) {
      const full = await getQuizById(today.id);
      if (full && full.questions.length > 0) {
        preloadedQuiz = buildQuizConfig(
          { id: full.id, slug: full.slug, title: full.title, description: full.description, category: full.category },
          full.questions,
          { paivan_visa: true },
        );
      }
    }
  }

  // 3. Kategoria (ei quiz_id:tä) → satunnainen julkaistu visa kategoriasta — käytetään "Uusi X-visa" -napissa
  if (!preloadedQuiz && typeof params.kat === "string") {
    const random = await getRandomQuizByCategory(params.kat);
    if (random) {
      const full = await getQuizById(random.id);
      if (full && full.questions.length > 0) {
        preloadedQuiz = buildQuizConfig(
          { id: full.id, slug: full.slug, title: full.title, description: full.description, category: full.category },
          full.questions,
          { kat: params.kat },
        );
      }
    }
  }

  // 5. Täysin satunnainen visa (?random=1) — "Anna mennä nyt vaan" -nappi
  if (!preloadedQuiz && params.random === "1") {
    const slugs = CATEGORIES.map((c) => c.slug);
    const randomSlug = slugs[Math.floor(Math.random() * slugs.length)];
    const random = await getRandomQuizByCategory(randomSlug);
    if (random) {
      const full = await getQuizById(random.id);
      if (full && full.questions.length > 0) {
        preloadedQuiz = buildQuizConfig(
          { id: full.id, slug: full.slug, title: full.title, description: full.description, category: full.category },
          full.questions,
          { kat: randomSlug },
        );
      }
    }
  }

  // 4. Kuvavisa-flow (alkuperäinen)
  if (!preloadedQuiz && typeof params.kuvavisa === "string") {
    // Kuvavisat: hae random N riviä DB:stä Heikin admin-toolista
    const kvSlug = params.kuvavisa;
    const rows = await getKuvavisat(kvSlug, 10);
    if (rows.length > 0) {
      const KUVAVISA_TITLES: Record<string, { title: string; intro: string }> = {
        liput:    { title: "LIPPUVISA",    intro: "Tunnista lippu — yksi kuva, neljä vaihtoehtoa." },
        vaakuna:  { title: "VAAKUNAVISA",  intro: "Tunnista suomalainen kunnanvaakuna." },
        vaakunat: { title: "VAAKUNAVISA",  intro: "Tunnista suomalainen kunnanvaakuna." },
        linnut:   { title: "LINTUVISA",    intro: "Tunnista lintu kuvasta — eihän tämä ole varis." },
        kasvit:   { title: "KASVIVISA",    intro: "Tunnista kasvi kuvasta." },
        elaimet:  { title: "ELÄINVISA",    intro: "Tunnista eläin kuvasta." },
      };
      const meta = KUVAVISA_TITLES[kvSlug] ?? { title: "KUVAVISA", intro: "Tunnista kuvasta." };
      const mappedQuestions: Question[] = rows.map((r) => {
        const opts = (r.options ?? []).slice(0, 4);
        while (opts.length < 4) opts.push("—");
        return {
          question: r.question,
          options: [opts[0], opts[1], opts[2], opts[3]] as [string, string, string, string],
          correct: r.correct_option,
          fact: r.fact ?? "",
          image: r.image_url,
        };
      });
      preloadedQuiz = {
        id: `kuvavisa:${kvSlug}`,
        title: meta.title,
        intro: meta.intro,
        questions: mappedQuestions,
        isImageQuiz: true,
      };
    }
  }

  return (
    <Suspense fallback={<main className="peli"><div className="peli-app"><div className="peli-loading">Ladataan…</div></div></main>}>
      <PeliClient preloadedQuiz={preloadedQuiz} />
    </Suspense>
  );
}
