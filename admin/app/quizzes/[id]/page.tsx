import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { listSites } from "@/lib/sites";
import { Nav } from "@/components/nav";
import { MetaEditor } from "./meta-editor";
import { QuestionCard } from "./question-card";
import { QuizActionsBar } from "./quiz-actions-bar";

export const dynamic = "force-dynamic";

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const admin = getSupabaseAdmin();
  const { data: quiz, error } = await admin
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !quiz) return notFound();

  const sites = await listSites();

  const { data: questions } = await admin
    .from("questions")
    .select("id, sort_order, question_text, answers, explanation")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true });

  const statusLabel =
    quiz.status === "published"
      ? "Julkaistu"
      : quiz.status === "draft"
        ? "Draft"
        : "Arkistoitu";

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Takaisin visoihin
        </Link>

        <div className="space-y-3">
          <MetaEditor
            id={quiz.id}
            sites={sites}
            isDraft={quiz.status === "draft"}
            initial={{
              title: quiz.title,
              description: quiz.description,
              category: quiz.category,
              difficulty: quiz.difficulty as "helppo" | "keski" | "vaikea",
              tone: (quiz.tone ?? "rento") as "rento" | "humoristinen" | "asiallinen" | "nostalginen",
              platform: quiz.platform as "juntti" | "tietoniekka" | "both",
              site_id: quiz.site_id,
            }}
          />
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">
              {statusLabel}
            </span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">
              {quiz.category}
            </span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">
              {quiz.difficulty}
            </span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">
              {quiz.tone}
            </span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">
              {quiz.platform}
            </span>
            {quiz.emoji_hint && (
              <span className="inline-flex items-center rounded-full border px-2 py-0.5">
                {quiz.emoji_hint}
              </span>
            )}
          </div>
          <QuizActionsBar id={quiz.id} status={quiz.status} />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Kysymykset ({questions?.length ?? 0})
          </h2>
          {questions?.map((q: any) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              sortOrder={q.sort_order}
              initial={{
                question_text: q.question_text,
                answers: q.answers,
                explanation: q.explanation,
              }}
            />
          ))}
        </div>
      </main>
    </>
  );
}
