import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { listSites } from "@/lib/sites";
import { Nav } from "@/components/nav";
import { MetaEditor } from "./meta-editor";
import { HeroEditor } from "./hero-editor";
import { TIETONIEKKA_URL } from "@/lib/paivan-visa-yhteiset";
import { QuestionCard } from "./question-card";
import { QuizActionsBar } from "./quiz-actions-bar";
import { LapsetMeta } from "./lapset-meta";
import { LastenKysymys, type LastenKysymysData } from "./lasten-kysymys";
import { IKA_MERKKI, onLastenVisa } from "@/lib/lapset";

/* Lasten visojen äänet ja kuvat ovat sivuston public-kansiossa. Previewssä ne haetaan saman haaran
   tietoniekka-previewistä (uudet tiedostot eivät ole vielä tuotannossa), muuten tietoniekka.fi:stä. */
function mediaPohja(): string {
  const haara = process.env.VERCEL_GIT_COMMIT_REF;
  if (process.env.VERCEL_ENV === "preview" && haara) {
    return `https://tietoniekka-git-${haara.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-lakeboodoms-projects.vercel.app`;
  }
  return TIETONIEKKA_URL;
}

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
    .select("id, sort_order, question_text, answers, explanation, question_type, vihje_laura, vihje_mikko, image_url, image_credit, image_license_note, image_position, audio, animal_sound")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true });

  const lasten = onLastenVisa(quiz.target_age);
  const pohja = mediaPohja();

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
            {lasten && (
              <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                Lasten visa {IKA_MERKKI[quiz.target_age as "4-7" | "8-12"]}
              </span>
            )}
            {quiz.emoji_hint && (
              <span className="inline-flex items-center rounded-full border px-2 py-0.5">
                {quiz.emoji_hint}
              </span>
            )}
          </div>
          <QuizActionsBar id={quiz.id} status={quiz.status} />
          <LapsetMeta
            id={quiz.id}
            initial={{ target_age: quiz.target_age, lukija: quiz.lukija, lasten_aihe: quiz.lasten_aihe }}
          />
        </div>

        <HeroEditor
          id={quiz.id}
          tietoniekkaUrl={TIETONIEKKA_URL}
          initial={{
            hero_image: (quiz as { hero_image?: string | null }).hero_image ?? null,
            hero_alt: (quiz as { hero_alt?: string | null }).hero_alt ?? null,
            hero_focal_x: (quiz as { hero_focal_x?: number | null }).hero_focal_x ?? null,
            hero_focal_y: (quiz as { hero_focal_y?: number | null }).hero_focal_y ?? null,
          }}
        />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Kysymykset ({questions?.length ?? 0})
          </h2>
          {lasten && questions?.map((q: any, i: number) => (
            <LastenKysymys
              key={q.id}
              id={q.id}
              quizId={quiz.id}
              sortOrder={q.sort_order}
              isFirst={i === 0}
              isLast={i === (questions?.length ?? 0) - 1}
              mediaPohja={pohja}
              initial={q as LastenKysymysData}
            />
          ))}
          {!lasten && questions?.map((q: any, i: number) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              quizId={quiz.id}
              sortOrder={q.sort_order}
              isFirst={i === 0}
              isLast={i === (questions?.length ?? 0) - 1}
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
