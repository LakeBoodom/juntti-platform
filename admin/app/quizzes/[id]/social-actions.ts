"use server";

import { getSupabaseAdmin } from "@juntti/db";
import { generateSocialCopy } from "@juntti/ai";
import type { Answer } from "@juntti/ai";
import { findTemplateImage, buildOgUrl } from "@/lib/social-og";

// Below this many recorded plays, a completion-rate stat is too noisy to be
// an honest hook (a single lucky/unlucky play can swing it 5-10 points).
const MIN_PLAYS_FOR_STAT = 20;

/** Ad-hoc koukkugeneraattori mille tahansa julkaistulle visalle, riippumatta
 *  siitä onko se juuri tänään kalenterin nosto. Käyttää samaa generaattoria
 *  ja samoja OG-kuvapohjia kuin /kalenteri. */
export async function generateSocialHooks(quizId: string) {
  const sb = getSupabaseAdmin();

  const { data: quiz, error: quizError } = await sb
    .from("quizzes")
    .select("id, title, category, platform, site_id")
    .eq("id", quizId)
    .maybeSingle();
  if (quizError || !quiz) {
    return { ok: false as const, error: quizError?.message ?? "Visaa ei löytynyt" };
  }

  const { data: questions, error: qError } = await sb
    .from("questions")
    .select("question_text, answers")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });
  if (qError || !questions || questions.length === 0) {
    return {
      ok: false as const,
      error: qError?.message ?? "Visalla ei ole kysymyksiä",
    };
  }

  const { data: plays } = await sb
    .from("quiz_plays")
    .select("score, total")
    .eq("quiz_id", quizId);

  let stat: { totalPlays: number; allCorrectPct: number } | undefined;
  if (plays && plays.length >= MIN_PLAYS_FOR_STAT) {
    const allCorrect = plays.filter(
      (p) => p.score !== null && p.total !== null && p.score === p.total,
    ).length;
    stat = {
      totalPlays: plays.length,
      allCorrectPct: Math.round((allCorrect / plays.length) * 100),
    };
  }

  let generated;
  try {
    generated = await generateSocialCopy({
      sourceType: "quiz",
      title: quiz.title,
      category: quiz.category,
      questions: questions.map((q) => ({
        question_text: q.question_text,
        answers: (q.answers as unknown as Answer[]) ?? [],
      })),
      stat,
    });
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message ?? "Copyn generointi epäonnistui",
    };
  }

  // Resolve site_id: quiz's own site_id if set, else look up by platform slug
  // (quizzes with platform "both" default to tietoniekka — no dedicated site).
  let siteId = quiz.site_id as string | null;
  if (!siteId) {
    const slug = quiz.platform === "juntti" ? "juntti" : "tietoniekka";
    const { data: site } = await sb
      .from("sites")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    siteId = site?.id ?? null;
  }
  if (!siteId) {
    return { ok: false as const, error: "Sivustoa ei löytynyt (site_id puuttuu)" };
  }

  const templateImage = await findTemplateImage(sb, siteId, "quiz");
  const imageUrl = buildOgUrl("/api/social-og/quiz", {
    title: quiz.title,
    category: quiz.category,
    question: questions[0]?.question_text,
    size: "square",
    templateImage,
  });

  const today = new Date().toISOString().slice(0, 10);
  const rows = generated.variants.map((v) => ({
    site_id: siteId as string,
    platform: "facebook",
    source_type: "quiz",
    source_id: quizId,
    target_date: today,
    copy_text: v.text,
    image_url: imageUrl,
    status: "draft",
  }));

  const { data: inserted, error: insertError } = await sb
    .from("social_posts")
    .insert(rows)
    .select("id");
  if (insertError) {
    return { ok: false as const, error: insertError.message };
  }

  return {
    ok: true as const,
    variants: generated.variants,
    savedCount: inserted?.length ?? 0,
  };
}
