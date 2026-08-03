// MEGA-EDITORI — katselmoi, vaihda, poista, lisää yksittäisiä kysymyksiä.
// Kysymykset ovat linkkejä lähdevisoihin (mega_questions), eivät kopioita.
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { MegaEditor, type MegaRow } from "./mega-editor";

export const dynamic = "force-dynamic";

export default async function MegaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseFromCookies();
  const { data: { user } } = await sb.auth.getUser();
  const admin = getSupabaseAdmin();

  const { data: quiz } = await admin
    .from("quizzes")
    .select("id, title, slug, status" as never)
    .eq("id", id)
    .eq("game_mode" as never, "mega" as never)
    .maybeSingle();
  if (!quiz) return notFound();
  const mega = quiz as unknown as { id: string; title: string; slug: string | null; status: string };

  const { data: linkRows } = await admin
    .from("mega_questions" as never)
    .select("question_id, sort_order" as never)
    .eq("mega_quiz_id", id);
  const links = ((linkRows ?? []) as unknown as Array<{ question_id: string; sort_order: number }>)
    .sort((a, b) => a.sort_order - b.sort_order);

  const rows: MegaRow[] = [];
  if (links.length > 0) {
    const qids = links.map((l) => l.question_id);
    const qMap = new Map<string, { question_text: string; explanation: string | null; answers: Array<{ text: string; is_correct: boolean }>; quiz_id: string }>();
    for (let i = 0; i < qids.length; i += 100) {
      const { data: qs } = await admin
        .from("questions")
        .select("id, question_text, explanation, answers, quiz_id")
        .in("id", qids.slice(i, i + 100));
      for (const q of (qs ?? []) as Array<{ id: string; question_text: string; explanation: string | null; answers: unknown; quiz_id: string }>) {
        qMap.set(q.id, {
          question_text: q.question_text,
          explanation: q.explanation,
          answers: (q.answers as Array<{ text: string; is_correct: boolean }>) ?? [],
          quiz_id: q.quiz_id,
        });
      }
    }
    const sourceIds = [...new Set([...qMap.values()].map((q) => q.quiz_id))];
    const { data: sources } = await admin
      .from("quizzes")
      .select("id, title, collection" as never)
      .in("id", sourceIds);
    const sMap = new Map(
      ((sources ?? []) as unknown as Array<{ id: string; title: string; collection: string | null }>)
        .map((s) => [s.id, s]),
    );
    for (const l of links) {
      const q = qMap.get(l.question_id);
      if (!q) continue;
      const src = sMap.get(q.quiz_id);
      rows.push({
        questionId: l.question_id,
        sortOrder: l.sort_order,
        question: q.question_text,
        explanation: q.explanation,
        answers: q.answers,
        sourceQuizId: q.quiz_id,
        sourceTitle: src?.title ?? "?",
        collection: src?.collection ?? "",
      });
    }
  }

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <Link href="/megat" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kaikki Megat
        </Link>
        <MegaEditor mega={mega} rows={rows} />
      </main>
    </>
  );
}
