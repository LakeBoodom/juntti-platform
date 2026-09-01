// TIETONIEKKA 2.0 — pelinäkymän server-loader (pelikuori 2026 prod, 28.–29.8.2026)
// Lataa visan + kysymykset + ristiinnostot ja antaa pelin clientille (GameClient).
// Mekaniikka on identtinen tuotannon Klassisen kanssa (pisteet, putki,
// Oljenkorsi, quiz_plays). Haastelinkki (Heikki 3a, 28.8.2026) = visan oma
// polku; kuvavisoissa pelattu kuvasarja kulkee ?ids=-parametrissa, jotta
// kaveri saa täsmälleen saman sarjan.

import { getSupabase } from "@/lib/supabase";
import { getKuvavisat, getKuvavisatByIds } from "@/lib/queries";
import { kulttuuriImg } from "@/lib/kulttuuri";
import { luontoImg } from "@/lib/luonto";
import { urheiluImg } from "@/lib/urheilu";
import { maantietoImg } from "@/lib/maantieto";
import { KAUPUNGIT, KAUPUNGIT_HERO_IMG } from "@/lib/kaupungit";
import { JK_HERO, JK_ACCENT } from "@/lib/jaakiekko";
import { JP_HERO } from "@/lib/jalkapallo";
import { LearnArticle, type Learn } from "@/components/tn20/LearnArticle";
import GameClient, { type GameQuiz } from "./GameClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

/* ── Sivukohtainen title/description (QA-006, 29.8.2026): aiemmin kaikki
   371 pelisivua perivät layoutin "esikatselu"-otsikon. ── */
export async function generateMetadata(
  { searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }
): Promise<Metadata> {
  const p = await searchParams;
  const sb = getSupabase();
  const str = (k: string) => (typeof p[k] === "string" ? (p[k] as string) : null);
  const kuvavisa = str("kuvavisa"), mega = str("mega"), slug = str("visa"), quizId = str("quiz_id");
  const suffix = " | Tietoniekka";
  if (kuvavisa) {
    const t = KUVAVISA_TITLES[kuvavisa] ?? "Kuvavisa";
    return { title: `${t} – tunnista kuvasta${suffix}`, description: "Yksi kuva, neljä vaihtoehtoa. Pelaa ilmainen kuvavisa Tietoniekassa." };
  }
  if (!sb) return {};
  if (mega) {
    const { data } = await sb.from("quizzes").select("title, display_title, teaser").eq("slug", mega).maybeSingle<{ title: string; display_title: string | null; teaser: string | null }>();
    if (!data) return { title: `Visaa ei löytynyt${suffix}` };
    return { title: `${data.display_title ?? data.title}${suffix}`, description: data.teaser ?? "Megavisa: yksi istunto ilman taukoja. Pelaa ilmaiseksi Tietoniekassa." };
  }
  if (slug || quizId) {
    let q = sb.from("quizzes").select("title, display_title, teaser, description, slug").eq("status", "published");
    q = quizId ? q.eq("id", quizId) : q.eq("slug", slug!);
    const { data } = await q.maybeSingle<{ title: string; display_title: string | null; teaser: string | null; description: string | null; slug: string | null }>();
    if (!data) return { title: `Visaa ei löytynyt${suffix}` };
    const name = data.display_title ?? data.title;
    /* Kanoninen osoite on /visa/<slug> (julkaisu 31.8.2026) — myös silloin kun
       sivulle tultiin ?quiz_id=-parametrilla. metadataBase tulee juurilayoutista. */
    const canonical = data.slug ? { alternates: { canonical: `/visa/${data.slug}` } } : {};
    return { title: `${name}${suffix}`, description: data.teaser ?? data.description ?? `${name} – ilmainen tietovisa Tietoniekassa.`, ...canonical };
  }
  return { title: `Visaa ei löytynyt${suffix}` };
}

const KUVAVISA_TITLES: Record<string, string> = {
  liput: "Lippuvisa", vaakunat: "Vaakunavisa", vaakuna: "Vaakunavisa", linnut: "Lintuvisa",
  elaimet: "Eläinvisa", kasvit: "Kasvivisa", maalaukset: "Maalausvisa",
};

const COLLECTION_ACCENT: Record<string, string> = {
  tv: "#FF3D9E",
  urheilu: "#B6FF3C",
  elokuvat: "#FF5C3D",
  musiikki: "#A855F7",
  matkakohteet: "#46D6C8",
  yleistieto: "#E8A320",
  kulttuuri: "#E8A320",
  historia: "#E8A320",
  luonto: "#3FBF7F",
  "tunnetut-henkilot": "#C9A96A",
};
const COLLECTION_HUB: Record<string, string> = {
  tv: "/kokoelma/tv",
  urheilu: "/kokoelma/urheilu",
  elokuvat: "/kokoelma/elokuvat",
  musiikki: "/kokoelma/musiikki",
  matkakohteet: "/kokoelma/matkakohteet",
  kulttuuri: "/kokoelma/kulttuuri",
  historia: "/kokoelma/historia",
  luonto: "/kokoelma/luonto",
  "tunnetut-henkilot": "/kokoelma/tunnetut-henkilot",
};
/* ── Kokoelman tunnistus (QA-003/013 + Heikki 1, 2, 5 — 29.8.2026):
   kaupunkivisat ovat kannassa collection=yleistieto/category=kaupungit,
   jääkiekko ja jalkapallo collection=urheilu → tunnistetaan category/genre-
   kentästä ja ohjataan omille teemasivuilleen. Yleistieto ei ole 2.0:ssa
   omana kokoelmana (Heikki 3) → hub /kokoelmat. ── */
type Resolved = { key: string; label: string; hub: string; bg: string; accent: string };
function resolveCollection(q: { collection: string | null; category: string | null; genre: string | null }): Resolved {
  const collection = q.collection ?? "yleistieto";
  const cat = q.category ?? "", genre = q.genre ?? "";
  if (cat === "kaupungit") return { key: "kaupungit", label: "Suomen kaupungit", hub: "/kokoelma/kaupungit", bg: KAUPUNGIT_HERO_IMG, accent: "#E8A320" };
  if (cat === "jaakiekko" || genre === "jaakiekko") return { key: "jaakiekko", label: "Jääkiekko", hub: "/kokoelma/jaakiekko", bg: JK_HERO.img, accent: JK_ACCENT };
  if (genre === "jalkapallo") return { key: "jalkapallo", label: "Jalkapallo", hub: "/kokoelma/jalkapallo", bg: JP_HERO.img, accent: "#B6FF3C" };
  if (collection === "yleistieto") return { key: "yleistieto", label: "Yleistieto", hub: "/kokoelmat", bg: "/20/hero-mikko-laura.webp", accent: "#E8A320" };
  return {
    key: collection,
    label: COLLECTION_LABEL[collection] ?? "Visa",
    hub: COLLECTION_HUB[collection] ?? "/kokoelmat",
    bg: COLLECTION_BG[collection] ?? "/20/hero-mikko-laura.webp",
    accent: COLLECTION_ACCENT[collection] ?? "#E8A320",
  };
}

const COLLECTION_BG: Record<string, string> = {
  tv: "/20/hero-tv-laura.webp",
  urheilu: "/20/hero-urheilu-mikko.webp",
  elokuvat: "/20/teema-elokuvat.webp",
  musiikki: "/20/teema-musiikki.webp",
  matkakohteet: "/20/maantieto/hero-landing.webp",
  kulttuuri: "/20/kulttuuri/hero-kollaasi.webp",
  historia: "/20/historia/hero-aikajana.webp",
  luonto: "/20/luonto/hero-landing.webp",
  "tunnetut-henkilot": "/20/teema-tunnetut-henkilot.webp",
};
const COLLECTION_LABEL: Record<string, string> = {
  tv: "TV & Suoratoisto",
  urheilu: "Urheilu",
  elokuvat: "Elokuvat",
  musiikki: "Musiikki",
  matkakohteet: "Maantieto",
  yleistieto: "Yleistieto",
  kulttuuri: "Kulttuuri",
  historia: "Historia",
  luonto: "Luonto",
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
  const kuvavisa = typeof params.kuvavisa === "string" ? params.kuvavisa : null;
  const mega = typeof params.mega === "string" ? params.mega : null;
  // Putki kertyy päivän nostosta: paivan_visa=1 (manuaalinen Päivän visa,
  // Heikki 4.8.2026) tai paivan_sankari=1 (synttärisankari-fallback).
  const isSankari = params.paivan_sankari === "1" || params.paivan_visa === "1";

  const sb = getSupabase();
  /* Virhetilat → tyylitelty 404 (QA-007, 29.8.2026) */
  if (!sb || (!quizId && !slug && !kuvavisa && !mega)) notFound();

  /* ── MEGA (3.8.2026, MEGA_SPEC §1): viittauskooste mega_questions-taulusta.
     Mega-rivi voi olla draft (RLS "Mega preview readable") — tuotantosivun
     listaukset eivät näytä sitä ennen julkaisua. Ultimate = kulta. ── */
  if (mega) {
    const { data: mq } = await sb
      .from("quizzes")
      .select("id, slug, title, display_title, teaser, learn")
      .eq("slug", mega)
      // game_mode puuttuu generoiduista tyypeistä (lisätty Portti 1:ssä)
      .eq("game_mode" as unknown as "status", "mega")
      .maybeSingle<{ id: string; slug: string; title: string; display_title: string | null; teaser: string | null; learn: Learn | null }>();
    if (!mq) notFound();
    /* Konteksti mukaan (Heikki 4.8.2026): irrotettu kysymys tarvitsee
       lähdevisan nimen ("Mistä Tommi haaveilee?" → chip "Luottomies: All in").
       Kolme litteää kyselyä — syvä sisäkkäisjoin ei toimi PostgRESTissä. */
    const { data: linkRows } = await sb
      .from("mega_questions" as never)
      .select("question_id, kuvavisa_id, sort_order")
      .eq("mega_quiz_id", mq.id)
      .order("sort_order", { ascending: true });
    const links = (linkRows ?? []) as unknown as Array<{ question_id: string | null; kuvavisa_id: string | null; sort_order: number }>;

    type MegaQ = { id: string; question_text: string; explanation: string | null; answers: Array<{ text: string; is_correct: boolean }>; quiz_id: string };
    const qMap = new Map<string, MegaQ>();
    const qLinkIds = links.filter((l) => l.question_id).map((l) => l.question_id!);
    for (let i = 0; i < qLinkIds.length; i += 100) {
      const { data: qs } = await sb
        .from("questions")
        .select("id, question_text, explanation, answers, quiz_id")
        .in("id", qLinkIds.slice(i, i + 100));
      for (const q of (qs ?? []) as unknown as MegaQ[]) qMap.set(q.id, q);
    }

    /* Sekamuotoinen Mega (Heikki 4.8.2026): kuvarivit kuvavisas-taulusta */
    type MegaKv = { id: string; question: string; image_url: string; options: string[] | null; correct_option: string; fact: string | null; type: string };
    const kvMap = new Map<string, MegaKv>();
    const kvLinkIds = links.filter((l) => l.kuvavisa_id).map((l) => l.kuvavisa_id!);
    if (kvLinkIds.length > 0) {
      const { data: kvs } = await sb
        .from("kuvavisas")
        .select("id, question, image_url, options, correct_option, fact, type")
        .in("id", kvLinkIds);
      for (const k of (kvs ?? []) as unknown as MegaKv[]) kvMap.set(k.id, k);
    }
    const KV_CONTEXT: Record<string, string> = {
      liput: "Kuvavisat · Liput", vaakunat: "Kuvavisat · Vaakunat", linnut: "Kuvavisat · Linnut",
      elaimet: "Kuvavisat · Eläimet", kasvit: "Kuvavisat · Kasvit", henkilot: "Kuvavisat · Henkilöt",
      rakennukset: "Kuvavisat · Rakennukset", kaupungit: "Kuvavisat · Kaupungit", maalaukset: "Kuvavisat · Maalaukset",
    };
    const sourceIds = [...new Set([...qMap.values()].map((q) => q.quiz_id))];
    const { data: sources } = sourceIds.length > 0
      ? await sb.from("quizzes").select("id, title, display_title, collection").in("id", sourceIds)
      : { data: [] };
    /* Konteksti tarvitsee myös LAJIN (Heikki 4.8.2026): pelkkä "Erikoisjoukot"
       ei kerro että kyse on tv-sarjasta → "TV & Suoratoisto · Erikoisjoukot" */
    const srcName = new Map(
      ((sources ?? []) as unknown as Array<{ id: string; title: string; display_title: string | null; collection: string | null }>)
        .map((s) => {
          const name = s.display_title ?? s.title;
          const label = COLLECTION_LABEL[s.collection ?? ""];
          return [s.id, label ? `${label} · ${name}` : name];
        }),
    );

    const questions = links
      .map((l) => {
        if (l.question_id) {
          const q = qMap.get(l.question_id);
          if (!q) return null;
          const answers = q.answers ?? [];
          const correct = answers.find((a) => a.is_correct)?.text ?? answers[0]?.text ?? "";
          return {
            question: q.question_text,
            options: answers.slice(0, 4).map((a) => a.text),
            correct,
            fact: q.explanation,
            context: srcName.get(q.quiz_id),
          };
        }
        if (l.kuvavisa_id) {
          const k = kvMap.get(l.kuvavisa_id);
          if (!k) return null;
          return {
            question: k.question,
            options: (k.options ?? []).slice(0, 4),
            correct: k.correct_option,
            fact: k.fact,
            image: k.image_url,
            context: KV_CONTEXT[k.type] ?? "Kuvavisat",
          };
        }
        return null;
      })
      .filter((q): q is NonNullable<typeof q> => Boolean(q));

    if (questions.length === 0) notFound();

    /* "Lisää: Megavisat" = muut julkaistut megat oikeilla ?mega=-linkeillä ja
       oikealla kysymysmäärällä (QA-001, 29.8.2026 — aiemmin quiz_cards-
       listaus antoi megoille "0 kysymystä" ja rikkinäisen quiz_id-linkin). */
    const { data: otherMegas } = await sb
      .from("quizzes")
      .select("id, slug, title, display_title")
      .eq("game_mode" as unknown as "status", "mega")
      .eq("status", "published")
      .neq("id", mq.id)
      .order("created_at", { ascending: false })
      .limit(3);
    const megaIds = ((otherMegas ?? []) as unknown as Array<{ id: string }>).map((m) => m.id);
    const { data: megaLinks } = megaIds.length
      ? await sb.from("mega_questions" as never).select("mega_quiz_id").in("mega_quiz_id", megaIds)
      : { data: [] };
    const megaCount = new Map<string, number>();
    for (const l of (megaLinks ?? []) as unknown as Array<{ mega_quiz_id: string }>) {
      megaCount.set(l.mega_quiz_id, (megaCount.get(l.mega_quiz_id) ?? 0) + 1);
    }
    const rel = ((otherMegas ?? []) as unknown as Array<{ id: string; slug: string; title: string; display_title: string | null }>)
      .filter((m) => (megaCount.get(m.id) ?? 0) > 0)
      .map((m) => ({ id: m.id, display_title: m.display_title, title: m.title, teaser: null, collection: null, genre: null, question_count: megaCount.get(m.id) ?? 0, slug: m.slug }));

    const game: GameQuiz = {
      id: mq.id,
      title: mq.display_title ?? mq.title,
      teaser: mq.teaser,
      collectionLabel: "Megavisat",
      genreLabel: `${questions.length} kysymystä · kaikki kokoelmat`,
      hubHref: "/megavisat",
      bgImg: "/20/megavisa.webp",
      accent: "#E8A320",
      isSankari: false,
      kind: "teksti",
      challengePath: `/peli?mega=${encodeURIComponent(mega)}`,
      questions,
      related: rel.map((r) => ({
        id: r.id,
        title: r.display_title ?? r.title,
        meta: `${r.question_count} kysymystä`,
        href: `/peli?mega=${encodeURIComponent(r.slug)}`,
      })),
    };
    return <GameClient quiz={game} />;
  }

  /* ── Kuvavisat 2.0-kuoressa (Heikki 3.8.2026): vasen lava = kuva ──
     Data kuvavisas-taulusta adminin järjestyksessä; mekaniikka sama.
     Pelikertoja ei tallenneta (kuten tuotannossa — ei quizzes-riviä). */
  if (kuvavisa) {
    const DECKS: Record<string, { title: string; teaser: string; motif: string; color: string }> = {
      liput: { title: "Lippuvisa", teaser: "Yksi lippu, neljä maata — kuinka tarkka silmäsi on?", motif: "lippu", color: "#4C9AFF" },
      vaakuna: { title: "Vaakunavisa", teaser: "Tunnista suomalainen kunnanvaakuna kilvestä.", motif: "vaakuna", color: "#8FC0FF" },
      vaakunat: { title: "Vaakunavisa", teaser: "Tunnista suomalainen kunnanvaakuna kilvestä.", motif: "vaakuna", color: "#8FC0FF" },
      linnut: { title: "Lintuvisa", teaser: "Siivet, nokat ja höyhenpuvut — tunnista laji kuvasta.", motif: "lintu", color: "#7CEBC8" },
      elaimet: { title: "Eläinvisa", teaser: "Tunnista eläinlaji lähikuvasta.", motif: "elain", color: "#2FD9A5" },
      kasvit: { title: "Kasvivisa", teaser: "Lehti, kukka vai kaarna — tunnista kasvi.", motif: "kasvi", color: "#4ADE80" },
      henkilot: { title: "Henkilövisa", teaser: "Tunnista henkilö kuvasta.", motif: "kasvot", color: "#F0A24B" },
      rakennukset: { title: "Rakennusvisa", teaser: "Tunnista rakennus kuvasta.", motif: "torni", color: "#F2C230" },
      kaupungit: { title: "Kaupunkivisa", teaser: "Tunnista kaupunki yhdestä näkymästä.", motif: "kaupunki", color: "#F5C462" },
      maalaukset: { title: "Maalausvisa", teaser: "Tunnista taideteos tai tekijä.", motif: "naamio", color: "#E85D9E" },
    };
    const deck = DECKS[kuvavisa] ?? { title: "Kuvavisa", teaser: "Tunnista kuvasta.", motif: "kysymys", color: "#4C9AFF" };

    /* Haastelinkin kuvasarja: ?ids=a,b,c → täsmälleen samat kortit samassa
       järjestyksessä. Muuten kortiston oletussarja + 2 varakorttia teknistä
       ohitusta varten (README: rikkinäinen kysymys korvataan ensin). */
    const idsParam = typeof params.ids === "string" ? params.ids : null;
    const wantedIds = idsParam ? idsParam.split(",").map((x) => x.trim()).filter((x) => /^[0-9a-f-]{20,}$/i.test(x)).slice(0, 20) : [];
    const allRows = wantedIds.length > 0 ? await getKuvavisatByIds(wantedIds) : await getKuvavisat(kuvavisa, 12);
    const rows = wantedIds.length > 0 ? allRows : allRows.slice(0, 10);
    const spareRows = wantedIds.length > 0 ? [] : allRows.slice(10);
    if (rows.length === 0) notFound();

    /* Ristiinnostot: muut aktiiviset kortistot */
    const { data: deckRows } = await sb.from("kuvavisas").select("type, active");
    const counts = new Map<string, number>();
    for (const r of (deckRows ?? []) as Array<{ type: string; active: boolean }>) {
      if (r.active) counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    }
    const related = [...counts.entries()]
      .filter(([type, n]) => n >= 5 && type !== kuvavisa && DECKS[type])
      .slice(0, 3)
      .map(([type, n]) => ({
        id: `kv-${type}`,
        title: DECKS[type].title,
        meta: `${Math.min(n, 10)} kuvaa`,
        href: `/peli?kuvavisa=${type}`,
      }));

    const toQ = (r: (typeof rows)[number]) => ({
      question: r.question,
      options: (r.options ?? []).slice(0, 4),
      correct: r.correct_option,
      fact: r.fact ?? null,
      image: r.image_url,
    });
    const game: GameQuiz = {
      id: "", // ei quizzes-riviä → pelikertaa ei tallenneta
      title: deck.title,
      teaser: deck.teaser,
      collectionLabel: "Kuvavisat",
      genreLabel: null,
      hubHref: "/kokoelma/kuvavisat",
      bgImg: "/20/teema-liput.webp",
      /* Kuvavisat = designin sininen (kuvavisa-README) */
      accent: "#3B82F6",
      isSankari: false,
      kind: "kuva",
      challengePath: `/peli?kuvavisa=${encodeURIComponent(kuvavisa)}&ids=${rows.map((r) => r.id).join(",")}`,
      spare: spareRows.map(toQ),
      questions: rows.map(toQ),
      related,
    };
    return <GameClient quiz={game} />;
  }

  let q = sb
    .from("quizzes")
    .select("id, slug, title, display_title, teaser, category, collection, genre, learn")
    .eq("status", "published");
  q = quizId ? q.eq("id", quizId) : q.eq("slug", slug!);
  const { data: quiz } = await q.maybeSingle<QuizRow>();
  if (!quiz) notFound();

  const resolved = resolveCollection(quiz);
  /* Ristiinnostot samasta teemasta: kaupungit/jääkiekko/jalkapallo omista
     joukoistaan, muut kokoelmasta. Megat pois (question_count 0, oma landing). */
  let relQ = sb
    .from("quiz_cards" as never)
    .select("id, slug, custom_slug, display_title, title, teaser, collection, genre, question_count")
    .neq("id", quiz.id)
    .neq("game_mode" as never, "mega");
  relQ =
    resolved.key === "kaupungit" ? relQ.eq("category", "kaupungit") :
    resolved.key === "jaakiekko" ? relQ.or("category.eq.jaakiekko,genre.eq.jaakiekko") :
    resolved.key === "jalkapallo" ? relQ.eq("genre", "jalkapallo") :
    resolved.key === "yleistieto" ? relQ.eq("collection", "yleistieto").neq("category", "kaupungit").neq("category", "ruoka-juoma") :
    relQ.eq("collection", quiz.collection ?? "yleistieto");

  const [{ data: qs }, genreRes, relatedRes] = await Promise.all([
    sb
      .from("questions")
      .select("sort_order, question_text, explanation, answers")
      .eq("quiz_id", quiz.id)
      .order("sort_order", { ascending: true }),
    quiz.genre
      ? sb.from("genres" as never).select("label").eq("collection", quiz.collection ?? "").eq("genre_key", quiz.genre).maybeSingle()
      : Promise.resolve({ data: null }),
    relQ.order("published_at", { ascending: false }).limit(6),
  ]);

  const collection = quiz.collection ?? "yleistieto";
  let accent = resolved.accent;
  if (collection === "urheilu") {
    for (const [re, c] of TEAM_COLORS) if (re.test(quiz.title)) { accent = c; break; }
  }

  /* KULTTUURI/LUONTO/URHEILU (Heikki 6.8.-13.8.2026): visan oma kuva
     pelinakymaan - intro, desktop-lava, mobiilin kuvakaista ja tuloskortti.
     Fallback kokoelman herokuvaan jos uudelle visalle ei ole viela kuvaa. */
  const topicImg =
    collection === "kulttuuri" ? kulttuuriImg(quiz.slug) :
    collection === "luonto" ? luontoImg(quiz.slug) :
    collection === "urheilu" ? urheiluImg(quiz.slug) :
    collection === "matkakohteet" ? maantietoImg(quiz.slug) :
    null;

  const genreLabel = (genreRes.data as { label: string } | null)?.label ?? null;

  const learn = quiz.learn ?? null;

  type RelatedRow = {
    id: string; slug: string | null; custom_slug: string | null;
    display_title: string | null; title: string; teaser: string | null;
    collection: string | null; genre: string | null; question_count: number;
  };
  const relatedRows = (relatedRes.data ?? []) as RelatedRow[];
  const relHref = (r: RelatedRow) =>
    r.custom_slug || r.slug ? `/peli?visa=${r.custom_slug ?? r.slug}` : `/peli?quiz_id=${r.id}`;

  const game: GameQuiz = {
    id: quiz.id,
    title: quiz.display_title ?? quiz.title,
    teaser: learn?.intro ?? quiz.teaser ?? quiz.description,
    collectionLabel: resolved.label,
    genreLabel,
    hubHref: resolved.hub,
    bgImg: topicImg ?? resolved.bg,
    topicImg,
    accent,
    isSankari,
    kind: "teksti",
    challengePath: quiz.slug ? `/visa/${encodeURIComponent(quiz.slug)}` : `/peli?quiz_id=${quiz.id}`,
    /* SUOMEN KAUPUNGIT -matkapassi (28.8.2026): kun visa on yksi 20:sta
       kaupunkivisasta, GameClient kirjoittaa leiman localStorageen pelin
       päättyessä (ks. lib/kaupungit.ts, KaupunkiPelilauta.tsx). */
    citySlug: KAUPUNGIT.find((c) => c.quizSlug === quiz.slug)?.id ?? null,
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
    related: (relatedRows.slice(0, 3)).map((r) => ({
      id: r.id,
      title: r.display_title ?? r.title,
      meta: `${r.question_count} kysymystä`,
      href: relHref(r),
    })),
  };

  if (game.questions.length === 0) notFound();

  const collectionLabel = resolved.label;
  const hubHref = resolved.hub;

  return (
    <>
      <GameClient quiz={game} />
      {/* TIETOMEDIA kerros 4: SEO-kopio aiheoppaasta renderöidään
          PALVELIMELTA — Google ei pelaa visaa, joten opas on HTML:ssä
          alusta asti. Aloitusnäkymässä opas on myös kävijälle näkyvissä;
          se piilotetaan vain pelin ajaksi ja loppunäkymässä, jossa sama
          sisältö näkyy kohdassa 5. (SEO_STRATEGIA.md §13.2)
          (Indeksointi aukeaa 2.0-julkaisussa slug-URLeilla; / on noindex.) */}
      {learn && <LearnArticle learn={learn} fallbackTitle={quiz.title} accent={accent} ssr />}

      {/* Crawlattavat sisäiset linkit: murupolku + ristiinnostot. Ennen näitä
          sivulla oli vain kaksi sisäistä linkkiä mutta neljä ulkoista
          lähdelinkkiä. (SEO_STRATEGIA.md §13.6) */}
      <nav className="tn-seo-nav tn-learn-ssr" aria-label="Murupolku">
        <div className="tn-seo-in">
          <a href="/">Etusivu</a>
          <span aria-hidden="true"> / </span>
          <a href={hubHref}>{collectionLabel}</a>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{quiz.display_title ?? quiz.title}</span>
        </div>
      </nav>

      {relatedRows.length > 0 && (
        <section className="tn-seo-related tn-learn-ssr">
          <div className="tn-seo-in">
            <h2>Lisää {collectionLabel.toLowerCase()}-visoja</h2>
            <ul>
              {relatedRows.map((r) => (
                <li key={r.id}>
                  <a href={relHref(r)}>{r.display_title ?? r.title}</a>
                  <span> · {r.question_count} kysymystä</span>
                </li>
              ))}
            </ul>
            <a className="tn-seo-hub" href={hubHref}>
              Kaikki {collectionLabel.toLowerCase()}-visat →
            </a>
          </div>
        </section>
      )}
    </>
  );
}
