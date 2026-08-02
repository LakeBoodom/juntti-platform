// TIETONIEKKA 2.0 — pelikuori 1c "Täysi lava" (server-loader)
// Lataa visan + kysymykset + ristiinnostot ja antaa pelin clientille.
// Mekaniikka on identtinen tuotannon Klassisen kanssa (pisteet, putki,
// Oljenkorsi, quiz_plays) — vain kuori on uusi.

import { getSupabase } from "@/lib/supabase";
import { motifPathFor } from "@/components/tn20/motif-paths";
import { LearnArticle, type Learn } from "@/components/tn20/LearnArticle";
import GameClient, { type GameQuiz } from "./GameClient";

export const dynamic = "force-dynamic";

const COLLECTION_ACCENT: Record<string, string> = {
  tv: "#FF3D9E",
  urheilu: "#B6FF3C",
  elokuvat: "#FF5C3D",
  musiikki: "#A855F7",
  matkakohteet: "#E8A320",
  yleistieto: "#E8A320",
  "tunnetut-henkilot": "#C9A96A",
};
const COLLECTION_HUB: Record<string, string> = {
  tv: "/2-0/kokoelma/tv",
  urheilu: "/2-0/kokoelma/urheilu",
  elokuvat: "/2-0/kokoelma/elokuvat",
  musiikki: "/2-0/kokoelma/musiikki",
  matkakohteet: "/2-0/kokoelma/matkakohteet",
  yleistieto: "/2-0/kokoelma/yleistieto",
  "tunnetut-henkilot": "/2-0/kokoelma/tunnetut-henkilot",
};
const COLLECTION_BG: Record<string, string> = {
  tv: "/20/hero-tv-laura.webp",
  urheilu: "/20/hero-urheilu-mikko.webp",
  elokuvat: "/20/teema-elokuvat.webp",
  musiikki: "/20/teema-musiikki.webp",
  matkakohteet: "/20/teema-maantieto.webp",
  yleistieto: "/20/teema-ruoka-juoma.webp",
  "tunnetut-henkilot": "/20/teema-tunnetut-henkilot.webp",
};
const COLLECTION_LABEL: Record<string, string> = {
  tv: "TV & Suoratoisto",
  urheilu: "Urheilu",
  elokuvat: "Elokuvat",
  musiikki: "Musiikki",
  matkakohteet: "Matkakohteet",
  yleistieto: "Yleistieto",
  "tunnetut-henkilot": "Tunnetut henkilöt",
};

/* Urheilussa peli perii joukkueen värin (CD: "urheilu joukkueväri") */
const TEAM_COLORS: Array<[RegExp, string]> = [
  [/arsenal/i, "#EF0107"], [/liverpool/i, "#C8102E"], [/belgian/i, "#E30613"],
  [/brasilia/i, "#FFDC02"], [/englannin/i, "#8FAEE0"], [/espanjan/i, "#C60B1E"],
  [/argentiinan/i, "#75AADB"], [/norjan/i, "#BA0C2F"], [/portugali/i, "#DA291C"],
  [/ranskan/i, "#4D7FD1"], [/suomen|huuhkaja/i, "#5B8FF0"], [/formula|f1/i, "#FF1E00"],
  [/ralli/i, "#4D9FFF"], [/tennik|federer|us open/i, "#DFFF4F"], [/golf|the open/i, "#4ADE80"],
  [/italia/i, "#4A85E0"],
];

type QuizRow = {
  id: string; slug: string | null; title: string; display_title: string | null;
  teaser: string | null; category: string; collection: string | null; genre: string | null;
  learn: Learn | null;
};

export default async function Peli20({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const quizId = typeof params.quiz_id === "string" ? params.quiz_id : null;
  const slug = typeof params.visa === "string" ? params.visa : null;
  const isSankari = params.paivan_sankari === "1";

  const sb = getSupabase();
  if (!sb || (!quizId && !slug)) {
    return <main style={{ padding: 32 }}>Visaa ei löytynyt. <a href="/2-0">Takaisin etusivulle</a></main>;
  }

  let q = sb
    .from("quizzes")
    .select("id, slug, title, display_title, teaser, category, collection, genre, learn")
    .eq("status", "published");
  q = quizId ? q.eq("id", quizId) : q.eq("slug", slug!);
  const { data: quiz } = await q.maybeSingle<QuizRow>();
  if (!quiz) {
    return <main style={{ padding: 32 }}>Visaa ei löytynyt. <a href="/2-0">Takaisin etusivulle</a></main>;
  }

  const [{ data: qs }, genreRes, relatedRes] = await Promise.all([
    sb
      .from("questions")
      .select("sort_order, question_text, explanation, answers")
      .eq("quiz_id", quiz.id)
      .order("sort_order", { ascending: true }),
    quiz.genre
      ? sb.from("genres" as never).select("label").eq("collection", quiz.collection ?? "").eq("genre_key", quiz.genre).maybeSingle()
      : Promise.resolve({ data: null }),
    sb
      .from("quiz_cards" as never)
      .select("id, display_title, title, teaser, collection, genre, question_count")
      .eq("collection", quiz.collection ?? "yleistieto")
      .neq("id", quiz.id)
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const collection = quiz.collection ?? "yleistieto";
  let accent = COLLECTION_ACCENT[collection] ?? "#E8A320";
  if (collection === "urheilu") {
    for (const [re, c] of TEAM_COLORS) if (re.test(quiz.title)) { accent = c; break; }
  }

  const genreLabel = (genreRes.data as { label: string } | null)?.label ?? null;

  const learn = quiz.learn ?? null;

  const game: GameQuiz = {
    id: quiz.id,
    title: quiz.display_title ?? quiz.title,
    teaser: learn?.intro ?? quiz.teaser,
    learnHeading: learn?.heading ?? null,
    keyFacts: learn?.key_facts ?? [],
    learn,
    collectionLabel: COLLECTION_LABEL[collection] ?? "Visa",
    genreLabel,
    hubHref: COLLECTION_HUB[collection] ?? "/2-0",
    bgImg: COLLECTION_BG[collection] ?? "/20/teema-ruoka-juoma.webp",
    accent,
    isSankari,
    questions: (qs ?? []).map((row) => {
      const answers = (row.answers as Array<{ text: string; is_correct: boolean }>) ?? [];
      const correct = answers.find((a) => a.is_correct)?.text ?? answers[0]?.text ?? "";
      return {
        question: row.question_text,
        options: answers.slice(0, 4).map((a) => a.text),
        correct,
        fact: row.explanation,
      };
    }),
    related: (
      (relatedRes.data ?? []) as Array<{
        id: string; display_title: string | null; title: string; teaser: string | null;
        collection: string | null; genre: string | null; question_count: number;
      }>
    ).map((r) => ({
      id: r.id,
      title: r.display_title ?? r.title,
      teaser: r.teaser,
      color: COLLECTION_ACCENT[r.collection ?? ""] ?? "#E8A320",
      motifPath: motifPathFor(r.collection, r.genre, r.title),
      meta: `${r.question_count} kysymystä`,
    })),
  };

  if (game.questions.length === 0) {
    return <main style={{ padding: 32 }}>Visassa ei ole vielä kysymyksiä. <a href="/2-0">Takaisin</a></main>;
  }

  return (
    <>
      <GameClient quiz={game} />
      {/* TIETOMEDIA kerros 4: SEO-kopio aiheoppaasta renderöidään
          PALVELIMELTA — Google ei pelaa visaa, joten opas on HTML:ssä
          alusta asti. Selaimessa tämä kopio piilotetaan (tn-learn-ssr)
          ja pelaaja näkee saman sisällön loppunäkymän kohdassa 5.
          (Indeksointi aukeaa 2.0-julkaisussa slug-URLeilla; /2-0 on noindex.) */}
      {learn && <LearnArticle learn={learn} fallbackTitle={quiz.title} accent={accent} ssr />}
    </>
  );
}
