import { Suspense } from "react";
import { getQuizById } from "../../lib/queries";
import { PeliClient } from "./peli-client";
import type { QuizConfig, Question } from "./questions";

/**
 * /peli — server-component joka:
 * 1. Lukee searchParamsista quiz_id
 * 2. Jos annettu, hakee visan ja sen kysymykset Supabasesta → muuntaa QuizConfig-rakenteeseen
 * 3. Jos ei, jättää preloadedQuiz nullhi → client-puoli käyttää hardcoded resolveQuiz:ia
 *    (vanhaa fallback-rataa kunnes admin-data on valmis kaikille tyypeille)
 */
export const dynamic = "force-dynamic";

type Answer = { text: string; is_correct: boolean };

function dbQuizToConfig(
  quiz: { id: string; title: string; description: string | null; category: string },
  questions: { question_text: string; explanation: string | null; answers: Answer[] }[],
  meta: { paivan_visa?: boolean; paivan_sankari?: boolean; kat?: string; event?: string; kuvavisa?: string; isImageQuiz?: boolean },
): QuizConfig {
  // Rakenna QuizConfig-rakenteen ottamalla otsikko visa-rivilta + kysymykset DB:stä
  const id = meta.paivan_visa
    ? "paivan_visa"
    : meta.paivan_sankari
      ? "paivan_sankari"
      : meta.event
        ? `event:${meta.event}`
        : meta.kat
          ? `kat:${meta.kat}`
          : meta.kuvavisa
            ? `kuvavisa:${meta.kuvavisa}`
            : "random";

  const mappedQuestions: Question[] = questions.map((q) => {
    const correct = q.answers.find((a) => a.is_correct);
    const opts = q.answers.slice(0, 4).map((a) => a.text);
    while (opts.length < 4) opts.push("—");
    return {
      question: q.question_text,
      options: [opts[0], opts[1], opts[2], opts[3]] as [string, string, string, string],
      correct: correct?.text ?? opts[0],
      fact: q.explanation ?? "",
    };
  });

  return {
    id,
    title: quiz.title.toUpperCase(),
    intro: quiz.description ?? "Pelataan!",
    questions: mappedQuestions,
    isImageQuiz: meta.isImageQuiz ?? false,
  };
}

export default async function PeliPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const quizId = typeof params.quiz_id === "string" ? params.quiz_id : null;

  let preloadedQuiz: QuizConfig | null = null;

  if (quizId) {
    const full = await getQuizById(quizId);
    if (full && full.questions.length > 0) {
      preloadedQuiz = dbQuizToConfig(
        { id: full.id, title: full.title, description: full.description, category: full.category },
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

  return (
    <Suspense fallback={<main className="peli"><div className="peli-app"><div className="peli-loading">Ladataan…</div></div></main>}>
      <PeliClient preloadedQuiz={preloadedQuiz} />
    </Suspense>
  );
}
