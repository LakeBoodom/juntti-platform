// MEGA-EDITORI — sekamuotoinen: rivit ovat visakysymyksiä TAI kuvakortteja.
// Kaikki rivit ovat viittauksia lähteisiin, eivät kopioita.
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
    .select("id, title, slug, status, teaser" as never)
    .eq("id", id)
    .eq("game_mode" as never, "mega" as never)
    .maybeSingle();
  if (!quiz) return notFound();
  const mega = quiz as unknown as { id: string; title: string; slug: string | null; status: string; teaser: string | null };

  const { data: linkRows } = await admin
    .from("mega_questions" as never)
    .select("question_id, kuvavisa_id, sort_order" as never)
    .eq("mega_quiz_id", id);
  const links = ((linkRows ?? []) as unknown as Array<{ question_id: string | null; kuvavisa_id: string | null; sort_order: number }>)
    .sort((a, b) => a.sort_order - b.sort_order);

  /* Visakysymykset */
  const qids = links.filter((l) => l.question_id).map((l) => l.question_id!);
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
  const { data: sources } = sourceIds.length > 0
    ? await admin.from("quizzes").select("id, title, collection" as never).in("id", sourceIds)
    : { data: [] };
  const sMap = new Map(
    ((sources ?? []) as unknown as Array<{ id: string; title: string; collection: string | null }>).map((s) => [s.id, s]),
  );

  /* Kuvakortit */
  const kvIds = links.filter((l) => l.kuvavisa_id).map((l) => l.kuvavisa_id!);
  const kvMap = new Map<string, { question: string; image_url: string; options: string[]; correct_option: string; fact: string | null; type: string }>();
  if (kvIds.length > 0) {
    const { data: kvs } = await admin
      .from("kuvavisas")
      .select("id, question, image_url, options, correct_option, fact, type" as never)
      .in("id", kvIds);
    for (const k of ((kvs ?? []) as unknown as Array<{ id: string; question: string; image_url: string; options: string[] | null; correct_option: string; fact: string | null; type: string }>)) {
      kvMap.set(k.id, { question: k.question, image_url: k.image_url, options: k.options ?? [], correct_option: k.correct_option, fact: k.fact, type: k.type });
    }
  }

  const rows: MegaRow[] = [];
  for (const l of links) {
    if (l.question_id) {
      const q = qMap.get(l.question_id);
      if (!q) continue;
      const src = sMap.get(q.quiz_id);
      rows.push({
        key: `q:${l.question_id}`,
        sortOrder: l.sort_order,
        question: q.question_text,
        explanation: q.explanation,
        answers: q.answers,
        image: null,
        sourceKey: q.quiz_id,
        sourceTitle: src?.title ?? "?",
        bucket: src?.collection ?? "",
      });
    } else if (l.kuvavisa_id) {
      const k = kvMap.get(l.kuvavisa_id);
      if (!k) continue;
      rows.push({
        key: `kv:${l.kuvavisa_id}`,
        sortOrder: l.sort_order,
        question: k.question,
        explanation: k.fact,
        answers: k.options.map((o) => ({ text: o, is_correct: o === k.correct_option })),
        image: k.image_url,
        sourceKey: `kv:${k.type}`,
        sourceTitle: `Kuvakortisto: ${k.type}`,
        bucket: `kv:${k.type}`,
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
