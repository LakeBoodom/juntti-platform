// PÄIVÄN VISA -KORTIN DATA (palvelin). Yhteinen etusivulle ja adminin
// esikatselusivulle (/esikatselu/paivan-visa), jotta esikatselu on täsmälleen
// sama kortti kuin etusivulla (toteutusohje 19.9.2026, luku 8).

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveCollection } from "@/lib/visanKokoelma";
import { pvmOsat } from "@/lib/aika";
import type { PaivanVisaData } from "@/lib/paivanVisa";

type PaivanVisaQuiz = {
  id: string; slug: string | null; title: string; display_title: string | null;
  teaser: string | null; description: string | null;
  collection: string | null; category: string | null; genre: string | null;
  hero_image: string | null; hero_focal_x: number | string | null;
  hero_focal_y: number | string | null; hero_alt: string | null;
};

/* Wikimedian thumb-osoitteessa leveys on polussa; 1280 on suurin toimiva porras. */
const wikiThumb = (url: string, width: number) =>
  /\/thumb\//.test(url) ? url.replace(/\/(\d+)px-/, `/${width}px-`) : url;

const pos = (x: number | string | null, y: number | string | null, dx: number, dy: number) => {
  const n = (v: number | string | null, d: number) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));
  return `${Math.round(n(x, dx) * 100)}% ${Math.round(n(y, dy) * 100)}%`;
};

export async function rakennaPaivanVisa(
  sb: SupabaseClient,
  opts: {
    quizId: string;
    /** YYYY-MM-DD (Suomen aika) → päiväleima "Tänään 7.10." */
    paiva: string;
    intro: { headline: string | null; text: string | null } | null;
    /** Etusivulla jo haettu kysymysmäärä; muuten haetaan. */
    questionCount?: number | null;
  },
): Promise<PaivanVisaData | null> {
  const { data: q } = await sb
    .from("quizzes")
    .select("id, slug, title, display_title, teaser, description, collection, category, genre, hero_image, hero_focal_x, hero_focal_y, hero_alt")
    .eq("id", opts.quizId)
    .maybeSingle();
  const quiz = q as PaivanVisaQuiz | null;
  if (!quiz) return null;

  const kokoelma = resolveCollection({ collection: quiz.collection, category: quiz.category, genre: quiz.genre });
  const isPerson = quiz.collection === "tunnetut-henkilot";
  /* Kuva kannasta: quizzes.hero_image. Henkilövisan kuva on sankarin
     celebrities.image_url (henkilövisoille ei tallenneta hero_imagea). */
  let imageUrl = quiz.hero_image;
  if (!imageUrl && isPerson) {
    const { data: c } = await sb.from("celebrities").select("image_url").eq("trivia_quiz_id", quiz.id).maybeSingle();
    const u = (c as { image_url: string | null } | null)?.image_url;
    imageUrl = u ? wikiThumb(u, 1280) : null;
  }
  let n = opts.questionCount ?? null;
  if (n == null) {
    const { count } = await sb.from("questions").select("id", { count: "exact", head: true }).eq("quiz_id", quiz.id);
    n = count ?? null;
  }
  const p = pvmOsat(opts.paiva);
  const intro = opts.intro && (opts.intro.headline?.trim() || opts.intro.text?.trim())
    ? { headline: opts.intro.headline?.trim() || null, text: opts.intro.text?.trim() || null }
    : null;

  return {
    quizId: quiz.id,
    kategoria: kokoelma.key ?? quiz.collection ?? quiz.category,
    badge: { label: kokoelma.label, href: kokoelma.hub },
    title: quiz.display_title ?? quiz.title,
    meta: n ? `${n} kysymystä` : null,
    lede: quiz.teaser?.trim() || quiz.description?.trim() || null,
    intro,
    stamp: `Tänään ${p.pv}.${p.kk}.`,
    imageUrl,
    imagePos: pos(quiz.hero_focal_x, quiz.hero_focal_y, 0.5, isPerson ? 0.15 : 0.4),
    imageAlt: quiz.hero_alt ?? "",
    playHref: `/peli?quiz_id=${quiz.id}&paivan_visa=1`,
    playedHref: kokoelma.hub,
  };
}
