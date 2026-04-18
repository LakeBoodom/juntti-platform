import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getQuizBySlug } from "@/lib/queries";
import { QuizPlayer } from "./quiz-player";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getQuizBySlug(slug);
  if (!data || !data.questions.length) return notFound();

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Etusivulle
      </Link>

      <QuizPlayer
        quiz={{
          id: data.quiz.id,
          title: data.quiz.title,
          slug: data.quiz.slug,
          description: data.quiz.description ?? null,
          category: data.quiz.category,
          difficulty: data.quiz.difficulty,
          emoji_hint: data.quiz.emoji_hint ?? null,
          platform: data.quiz.platform,
        }}
        questions={data.questions.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          answers: q.answers as { text: string; is_correct: boolean }[],
          explanation: q.explanation ?? null,
        }))}
      />
    </main>
  );
}
