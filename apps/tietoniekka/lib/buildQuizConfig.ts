import type { QuizConfig, Question } from "../app/peli/questions";
import { CATEGORY_BY_SLUG } from "./categories";

type Answer = { text: string; is_correct: boolean };

export type BuildQuizMeta = {
  paivan_visa?: boolean;
  paivan_sankari?: boolean;
  kat?: string;
  event?: string;
  kuvavisa?: string;
  isImageQuiz?: boolean;
};

/**
 * Muuntaa DB-visan + kysymykset peli-näkymän QuizConfig-rakenteeseen.
 * Jaettu /peli- ja /visa/[slug] -reittien kesken.
 */
export function buildQuizConfig(
  quiz: { id: string; slug: string | null; title: string; description: string | null; category: string },
  questions: { question_text: string; explanation: string | null; answers: Answer[] }[],
  meta: BuildQuizMeta,
): QuizConfig {
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

  const catSlug = meta.kat;
  const categoryLabel = catSlug
    ? CATEGORY_BY_SLUG[catSlug]?.title ?? catSlug.toUpperCase()
    : undefined;

  return {
    id,
    title: quiz.title.toUpperCase(),
    titleRaw: quiz.title,
    slug: quiz.slug ?? undefined,
    dbId: quiz.id,
    categoryLabel,
    intro: quiz.description ?? "Pelataan!",
    questions: mappedQuestions,
    isImageQuiz: meta.isImageQuiz ?? false,
  };
}
