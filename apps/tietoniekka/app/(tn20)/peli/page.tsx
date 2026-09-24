// TIETONIEKKA 2.0 — pelinäkymän server-loader (pelikuori 2026 prod, 28.–29.8.2026)
// Lataa visan + kysymykset + ristiinnostot ja antaa pelin clientille (GameClient).
// Mekaniikka on identtinen tuotannon Klassisen kanssa (pisteet, putki,
// Oljenkorsi, quiz_plays). Haastelinkki (Heikki 3a, 28.8.2026) = visan oma
// polku; kuvavisoissa pelattu kuvasarja kulkee ?ids=-parametrissa, jotta
// kaveri saa täsmälleen saman sarjan.

import { getSupabase } from "@/lib/supabase";
import { getKuvavisat, getKuvavisatByIds } from "@/lib/queries";
import { TASOT, MAANOSAT, KATEGORIAT, variaationNimi, getViikkovisa, getViikkoKollaasi, levynSavy, VIIKKOVISA_KUVIA } from "@/lib/kuvavisat2026";
import { viikkoInfo, viikkoNimi, viikkoAvaimesta, VIIKKO_AKSENTTI } from "@/lib/viikkovisa";
import { haeHaaste } from "@/lib/haaste";
import { kulttuuriImg } from "@/lib/kulttuuri";
import { luontoImg } from "@/lib/luonto";
import { urheiluImg } from "@/lib/urheilu";
import { maantietoImg } from "@/lib/maantieto";
import { KAUPUNGIT } from "@/lib/kaupungit";
import { resolveCollection, COLLECTION_LABEL } from "@/lib/visanKokoelma";
import { type Learn } from "@/components/tn20/LearnArticle";
import GameClient, { type GameQuiz } from "./GameClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

/** Fisher–Yates. Palauttaa uuden taulukon — kutsutaan vain palvelimella (ks. K2). */
function sekoita<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Sivukohtainen title/description (QA-006, 29.8.2026): aiemmin kaikki
   371 pelisivua perivät layoutin "esikatselu"-otsikon. ── */
export async function generateMetadata(
  { searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }
): Promise<Metadata> {
  const p = await searchParams;
  const sb = getSupabase();
  const str = (k: string) => (typeof p[k] === "string" ? (p[k] as string) : null);
  const kuvavisa = str("kuvavisa"), mega = str("mega"), slug = str("visa"), quizId = str("quiz_id");
  const viikkovisa = str("viikkovisa") === "1";
  const suffix = " | Tietoniekka";
  /* Heikin havainto 17.9.2026: juurilayoutin openGraph.title on kaikilla
     sivuilla "Tietoniekka — testaa tietosi", ja koska tämä generateMetadata
     asetti vain titlen ja descriptionin, JOKAINEN jaettu visalinkki näytti
     WhatsAppissa ja Facebookissa saman otsikon. Jakaminen on kasvun pääkanava,
     joten og ja twitter asetetaan nyt jokaisessa haarassa erikseen. */
  const og = (title: string, description: string): Metadata => ({
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", title, description },
    twitter: { card: "summary_large_image", title, description },
  });
  if (viikkovisa) {
    const vv = await getViikkovisa();
    /* Kierros 4: "Viikkovisa 38 · Kuvat" — sama nimi kuin sivulla ja jaossa. */
    const t = vv ? viikkoNimi(vv.viikko) : "Viikkovisa";
    const d = `${VIIKKOVISA_KUVIA} kuvaa, yksi yritys. Liput, vaakunat, linnut, eläimet, maalaukset, rakennukset, henkilöt sekä kasvit ja puut. Sama visa kaikille koko viikon.`;
    return {
      title: `${t} – tunnista kuvasta${suffix}`,
      description: d,
      ...og(t, d),
      /* Sarja vaihtuu maanantaisin, joten kanoninen osoite on parametriton. */
      alternates: { canonical: "/peli?viikkovisa=1" },
    };
  }
  if (kuvavisa) {
    /* T4: variaatio näkyy otsikossa samalla nimellä kuin kokoelmasivun linkissä. */
    const taso = str("taso");
    const maanosa = str("maanosa");
    /* Viikkovisan haaste: taso = viikkoavain → "Viikkovisa 38 · Kuvat" */
    const vari = variaationNimi(kuvavisa, taso, maanosa);
    const t = vari ?? KUVAVISA_TITLES[kuvavisa] ?? "Kuvavisa";
    const kuvaDesc = KUVAVISA_DESC[kuvavisa] ?? "Yksi kuva, neljä vaihtoehtoa. Pelaa ilmainen kuvavisa Tietoniekassa.";
    return {
      title: `${t} – tunnista kuvasta${suffix}`,
      description: kuvaDesc,
      ...og(`${t} – tunnista kuvasta`, kuvaDesc),
      /* T6: kanoninen osoite on kortiston perusvisa — variaatiot eivät kilpaile
         samasta hakutuloksesta keskenään. */
      alternates: { canonical: `/peli?kuvavisa=${encodeURIComponent(kuvavisa)}` },
    };
  }
  if (!sb) return {};
  if (mega) {
    const { data } = await sb.from("quizzes").select("title, display_title, teaser").eq("slug", mega).maybeSingle<{ title: string; display_title: string | null; teaser: string | null }>();
    if (!data) return { title: `Visaa ei löytynyt${suffix}` };
    const megaNimi = data.display_title ?? data.title;
    const megaDesc = data.teaser ?? "Megavisa: yksi istunto ilman taukoja. Pelaa ilmaiseksi Tietoniekassa.";
    return { title: `${megaNimi}${suffix}`, description: megaDesc, ...og(megaNimi, megaDesc) };
  }
  if (slug || quizId) {
    let q = sb.from("quizzes").select("title, display_title, teaser, description, slug, seo_title, seo_description, collection").eq("status", "published");
    q = quizId ? q.eq("id", quizId) : q.eq("slug", slug!);
    const { data } = await q.maybeSingle<{ title: string; display_title: string | null; teaser: string | null; description: string | null; slug: string | null; seo_title: string | null; seo_description: string | null; collection: string | null }>();
    if (!data) return { title: `Visaa ei löytynyt${suffix}` };
    const name = data.display_title ?? data.title;
    /* Kanoninen osoite on /visa/<slug> (julkaisu 31.8.2026) — myös silloin kun
       sivulle tultiin ?quiz_id=-parametrilla. metadataBase tulee juurilayoutista. */
    const canonical = data.slug ? { alternates: { canonical: `/visa/${data.slug}` } } : {};
    /* SEO-pikakorjaus (1.9.2026): teaser on täytetty vain 29 %:lle visoista,
       description sen sijaan 97 %:lle (ks. claude/SEO_PIKATARKISTUS_2026_09_01.md
       kohta 2) — käytetään description-kenttää fallbackina ennen geneeristä
       lausetta, jotta hakutuloksen kuvaus on oikea lähes kaikilla visoilla. */
    const visaDesc = data.seo_description ?? data.teaser ?? data.description ?? `${name} – ilmainen tietovisa Tietoniekassa.`;
    /* Hakuotsikko (Trends-/Search Console -analyysi 23.9.2026, claude/TRENDS_KYSYNTAKARTTA.md):
       henkilöhaut tuovat paljon näyttökertoja mutta tuskin klikkauksia, koska
       pelkkä "Nimi – näyttelijä" ei kerro hakijalle, että kyseessä on visa.
       Klikkaukset tulevat "aihe + visa" -hauista. Siksi:
       1) quizzes.seo_title voittaa aina (suffiksi lisätään, jos se puuttuu),
       2) henkilövisoille sääntöpohjainen "Nimi – tietovisa: kuinka hyvin tunnet?".
       Sivun näkyvä otsikko ja jakokortin og-otsikko pysyvät ennallaan. */
    let hakuOtsikko = `${name}${suffix}`;
    if (data.seo_title) {
      hakuOtsikko = /tietoniekka/i.test(data.seo_title) ? data.seo_title : `${data.seo_title}${suffix}`;
    } else if (data.collection === "tunnetut-henkilot") {
      const henkilo = name.split(/\s[–—-]\s/)[0].trim();
      hakuOtsikko = `${henkilo} – tietovisa: kuinka hyvin tunnet?${suffix}`;
    }
    return { title: hakuOtsikko, description: visaDesc, ...og(name, visaDesc), ...canonical };
  }
  return { title: `Visaa ei löytynyt${suffix}` };
}

/* T6 (UX-korjaus 17.9.2026): henkilot ja rakennukset puuttuivat → metadata näytti
   niille geneerisen "Kuvavisa – tunnista kuvasta". Kaupungit lisätty samalla. */
const KUVAVISA_TITLES: Record<string, string> = {
  liput: "Lippuvisa", vaakunat: "Vaakunavisa", vaakuna: "Vaakunavisa", linnut: "Lintuvisa",
  elaimet: "Eläinvisa", kasvit: "Kasvivisa", maalaukset: "Maalausvisa",
  henkilot: "Henkilövisa", rakennukset: "Rakennusvisa", kaupungit: "Kaupunkivisa",
  viikko: "Viikkovisa",
};

/* T6: kortistokohtainen meta description — aiemmin kaikilla kuvavisoilla oli sama
   lause, joten hakutuloksissa kymmenen visaa näytti identtisiltä. */
const KUVAVISA_DESC: Record<string, string> = {
  liput: "Tunnista maailman valtioiden liput. Ilmainen kuvavisa Tietoniekassa — ei kirjautumista.",
  vaakunat: "Tunnista maakuntien, kaupunkien ja kuntien vaakunat. Ilmainen kuvavisa Tietoniekassa.",
  linnut: "Tunnista Suomen linnut kuvasta. Ilmainen kuvavisa Tietoniekassa — ei kirjautumista.",
  elaimet: "Tunnista eläinlajit lähikuvasta. Ilmainen kuvavisa Tietoniekassa — ei kirjautumista.",
  kasvit: "Tunnista Suomen kasvit ja puut kuvasta. Ilmainen kuvavisa Tietoniekassa.",
  maalaukset: "Tunnista klassikkomaalaukset ja niiden tekijät. Ilmainen kuvavisa Tietoniekassa.",
  henkilot: "Tunnista tunnetut henkilöt kuvasta. Ilmainen kuvavisa Tietoniekassa.",
  rakennukset: "Tunnista maailman rakennukset kuvasta. Ilmainen kuvavisa Tietoniekassa.",
  kaupungit: "Tunnista kaupungit yhdestä näkymästä. Ilmainen kuvavisa Tietoniekassa.",
  viikko: "Kuvasarja kaikista kortistoista: liput, vaakunat, linnut, eläimet ja muut. Ilmainen kuvavisa Tietoniekassa — ei kirjautumista.",
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
  teaser: string | null; description: string | null; category: string; collection: string | null; genre: string | null;
  learn: Learn | null;
  /* Hero-kuvan data (migraatio 20260914_quiz_hero_fields) — visan OMA kuva ja
     sen rajaus; aiemmin kuva tuli kokoelman oletuksesta, jolloin esim.
     golfvisassa näkyi tennisvisan kuva. */
  hero_image: string | null; hero_focal_x: number | null; hero_focal_y: number | null;
  hero_side: string | null; hero_alt: string | null;
  /* Aihekohtaiset tulostasot (migraatio 20260928, Instagram-kierros 4) */
  fanitasot?: unknown;
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
  const viikkovisa = params.viikkovisa === "1";
  const mega = typeof params.mega === "string" ? params.mega : null;
  // Etusivun Päivän visa -kortin "pelattu"-tila: vain ?paivan_visa=1.
  // 19.9.2026 alkaen Päivän sankari (?paivan_sankari=1) on oma rivinsä, eikä
  // sen pelaaminen saa merkitä Päivän visaa pelatuksi.
  const isSankari = params.paivan_visa === "1";

  const sb = getSupabase();
  /* Virhetilat → tyylitelty 404 (QA-007, 29.8.2026) */
  if (!sb || (!quizId && !slug && !kuvavisa && !mega && !viikkovisa)) notFound();

  /* ── VIIKKOVISA (17.9.2026) ──
     15 kuvaa kaikista kahdeksasta kortistosta, sama visa kaikille koko viikon.
     Sarja on lukittu kantaan (kuvavisa_viikot), joten tässä EI arvota mitään:
     id:t haetaan sellaisenaan ja järjestys on kannan järjestys. Vaihtoehtojen
     järjestys sekoitetaan kuten muissakin kuvavisoissa, koska se on
     kysymyskohtainen eikä vaikuta siihen että visa on sama kaikille. */
  if (viikkovisa) {
    const vv = await getViikkovisa();
    if (!vv) notFound();
    /* Kierros 4 (18.9.2026): viikkotiedot lasketaan TÄSSÄ, palvelimella —
       viikkonumero ja lukituksen avain tulevat kannan funktiosta (Suomen aika),
       päivämääräväli ja "N pv jäljellä" palvelimen kellosta. Selain vain
       vertaa tallennettua avainta tähän, joten lukitus purkautuu maanantaina
       ilman että selaimen kelloon nojataan. */
    const info = viikkoInfo(vv.vuosi, vv.viikko);
    const [rows, kollaasi] = await Promise.all([
      getKuvavisatByIds(vv.kuvaIdt),
      getViikkoKollaasi(vv.kuvaIdt, info.avain),
    ]);
    if (rows.length === 0) notFound();
    const nimi = viikkoNimi(info.viikko, info.kategoria);

    const game: GameQuiz = {
      id: "", // ei quizzes-riviä → pelikertaa ei tallenneta
      title: nimi,
      teaser:
        "Liput, vaakunat, linnut, eläimet, maalaukset, rakennukset, henkilöt sekä " +
        "kasvit ja puut. Sama visa kaikille koko viikon.",
      collectionLabel: "Kuvavisat",
      genreLabel: null,
      hubHref: "/kokoelma/kuvavisat",
      bgImg: "", // K1: kuvavisoissa ei taustakuvaa
      /* Formaatin oma aksentti (10A Sinetti), ei putken ja pääpainikkeiden limeä. */
      accent: VIIKKO_AKSENTTI,
      isSankari: false,
      kind: "kuva",
      /* Kuvat tulevat kaikista kortistoista, joten levyn sävy ratkaistaan
         kysymys kerrallaan eikä visan tasolla (ks. GameQuestion.plate). */
      plate: "tumma",
      challengePath: `/peli?kuvavisa=viikko&taso=${info.avain}&ids=${rows.map((r) => r.id).join(",")}`,
      /* Yksi yritys viikossa: GameClient ei näytä "Pelaa uudelleen" -nappia
         viikkovisalle lainkaan. */
      reloadOnRestart: false,
      autoStart: false,
      kuvaIdt: rows.map((r) => r.id),
      /* "viikko" eikä rows[0].type: haastelinkki tallentaa tämän arvon, ja
         rows[0].type nimesi viikkovisasta jaetun haasteen sen ensimmäisen kuvan
         kortiston mukaan ("Vaakunavisa", 15 kuvaa). Kuvat tulevat silti id:istä. */
      kuvavisaSlug: "viikko",
      /* Haasterivin taso = viikkoavain, jotta /h/<koodi> nimeää haasteen
         "Viikkovisa 38 · Kuvat" vielä viikon vaihduttuakin. */
      taso: info.avain,
      maanosa: null,
      viikko: { ...info, kollaasi },
      jakoNimi: nimi,
      spare: [],
      questions: rows.map((r) => ({
        question: r.question,
        options: sekoita((r.options ?? []).slice(0, 4)),
        correct: r.correct_option,
        fact: r.fact ?? null,
        image: r.image_url,
        credit: r.source_credit ?? null,
        plate: levynSavy(r.type),
      })),
      related: [],
    };
    return <GameClient quiz={game} />;
  }

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
    /* T3 (17.9.2026): teaser = pelisivun aloitusnäkymän intro, Heikin hyväksymät
       tekstit. Kategoriakortin lyhyt kuvaus (max 60 merkkiä) on eri teksti ja
       asuu KATEGORIAT[].kuvaus:issa — näitä kahta ei saa yhdistää. */
    const DECKS: Record<string, { title: string; teaser: string; motif: string; color: string }> = {
      liput: { title: "Lippuvisa", teaser: "Maailman valtioiden liput. Tunnistatko maan pelkän lipun perusteella — tutuimmista harvinaisempiin?", motif: "lippu", color: "#4C9AFF" },
      vaakuna: { title: "Vaakunavisa", teaser: "Suomalaiset vaakunat: maakuntien, kaupunkien ja kuntien tunnukset. Harva tunnistaa edes oman kotiseutunsa — entä sinä?", motif: "vaakuna", color: "#8FC0FF" },
      vaakunat: { title: "Vaakunavisa", teaser: "Suomalaiset vaakunat: maakuntien, kaupunkien ja kuntien tunnukset. Harva tunnistaa edes oman kotiseutunsa — entä sinä?", motif: "vaakuna", color: "#8FC0FF" },
      linnut: { title: "Lintuvisa", teaser: "Nokasta, siivistä ja väreistä: tunnista lintu yhdestä kuvasta ennen kuin se lentää pois.", motif: "lintu", color: "#7CEBC8" },
      elaimet: { title: "Eläinvisa", teaser: "Tunnista eläin yhdestä kuvasta. Tutut ja yllättävämmät lajit panevat lajintuntemuksen koetukselle.", motif: "elain", color: "#2FD9A5" },
      kasvit: { title: "Kasvivisa", teaser: "Kukkia, puita ja muita kasveja lähikuvassa. Tunnistatko kasvin sen tuntomerkeistä ja löydätkö oikean nimen neljästä vaihtoehdosta?", motif: "kasvi", color: "#4ADE80" },
      henkilot: { title: "Henkilövisa", teaser: "Tutut kasvot historiasta ja nykypäivästä. Riittääkö yksi kuva, että tunnistat henkilön?", motif: "kasvot", color: "#F0A24B" },
      rakennukset: { title: "Rakennusvisa", teaser: "Torneista temppeleihin ja pyramideihin: tunnista rakennuksia ja rakennelmia yhdestä kuvasta. Kuinka monta kohdetta tunnistat?", motif: "torni", color: "#F2C230" },
      kaupungit: { title: "Kaupunkivisa", teaser: "Tunnista kaupunki yhdestä näkymästä.", motif: "kaupunki", color: "#F5C462" },
      maalaukset: { title: "Maalausvisa", teaser: "Taiteen klassikot yhdestä kuvasta. Tunnistatko tunnetut teokset — ja niiden tekijät?", motif: "naamio", color: "#E85D9E" },
      /* Viikkovisasta jaettu haaste tulee tähän (?kuvavisa=viikko&ids=...).
         Ei kokoelmasivun kortisto — kuvat tulevat aina id-listasta. */
      /* Haastesivulla ei puhuta "tämän viikon visasta" eikä näytetä
         viikkosinettiä (kierros 4, kohta 6.7): haaste on pelattavissa myös
         viikon vaihduttua, jolloin viikkoviittaus olisi harhaanjohtava. */
      viikko: { title: "Viikkovisa · Kuvat", teaser: "Kuvasarja kaikista kortistoista: liput, vaakunat, linnut, eläimet, maalaukset, rakennukset, henkilöt sekä kasvit ja puut.", motif: "kysymys", color: "#B6FF3C" },
    };
    const deck = DECKS[kuvavisa] ?? { title: "Kuvavisa", teaser: "Tunnista kuvasta.", motif: "kysymys", color: "#4C9AFF" };

    /* Haastelinkin kuvasarja: ?ids=a,b,c → täsmälleen samat kortit samassa
       järjestyksessä. Muuten kortiston oletussarja + 2 varakorttia teknistä
       ohitusta varten (README: rikkinäinen kysymys korvataan ensin). */
    const idsParam = typeof params.ids === "string" ? params.ids : null;
    const wantedIds = idsParam ? idsParam.split(",").map((x) => x.trim()).filter((x) => /^[0-9a-f-]{20,}$/i.test(x)).slice(0, 20) : [];

    /* KUVAVISAT 2.0 (2026-09-17): kokoelmasivun visavariaatiot tulevat tänne
       parametreina — ?taso=helppo|keski|vaikea rajaa vaikeustasolla, ?maanosa=
       rajaa lipun maanosalla. Tuntematon arvo ohitetaan (ei 404), jolloin
       pelaaja saa koko kortiston eikä rikkinäistä linkkiä. Haastelinkki (?ids)
       voittaa aina: siinä kortit on jo lukittu. */
    /* K3 (17.9.2026): ?h=<koodi> tulee /h/<koodi>-reitiltä. Haastajan tulos
       näytetään aloitusnäkymässä ja tulosvertailussa. Tuntematon tai vanhentunut
       koodi ohitetaan hiljaa — peli toimii silti, se on vain tavallinen kierros. */
    const hParam = typeof params.h === "string" ? params.h : null;
    const haaste = hParam ? await haeHaaste(hParam) : null;

    const tasoParam = typeof params.taso === "string" ? params.taso : null;
    /* Viikkovisan haasteessa taso on viikkoavain ("2026-38"), ei vaikeustaso. */
    const taso =
      kuvavisa === "viikko" ? (viikkoAvaimesta(tasoParam) ? tasoParam : null)
      : TASOT.some((t) => t.key === tasoParam) ? tasoParam : null;
    const maanosaParam = typeof params.maanosa === "string" ? params.maanosa : null;
    const maanosa = MAANOSAT.find((m) => m.key === maanosaParam) ?? null;

    /* K2 (UX-korjaus 17.9.2026, päätös 3): jokainen peli arpoo 10 kuvaa kortistosta.
       Aiemmin haku otti 12 ensimmäistä sort_order-järjestyksessä, joten Liput antoi
       aina saman sarjan samassa järjestyksessä (Australia, Albania, Alankomaat…) niin
       sivun latauksella kuin "Pelaa uudelleen" -napilla. Nyt koko (mahdollisesti
       suodatettu) kortisto haetaan ja siitä arvotaan palvelimella 10 + 2 varakorttia.
       Arvonta on palvelimella tarkoituksella: propseina tuleva valmis järjestys ei voi
       tuottaa hydraatioeroa, toisin kuin renderissä tehty Math.random. Haastelinkki
       (?ids=) ohittaa arvonnan kokonaan — siinä sarja on lukittu. */
    /* "viikko" ei ole kortisto: ilman id-listaa ei ole mitään pelattavaa. */
    if (kuvavisa === "viikko" && wantedIds.length === 0) notFound();
    const allRows =
      wantedIds.length > 0
        ? await getKuvavisatByIds(wantedIds)
        : await getKuvavisat(kuvavisa, 500, { taso, tagit: maanosa ? [...maanosa.tagit] : null });
    const arvottu = wantedIds.length > 0 ? allRows : sekoita(allRows);
    const rows = wantedIds.length > 0 ? arvottu : arvottu.slice(0, 10);
    const spareRows = wantedIds.length > 0 ? [] : arvottu.slice(10, 12);
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

    /* Vaihtoehtojen järjestys sekoitetaan per kysymys: aiemmin oikea vastaus oli
       joka pelissä samalla paikalla, koska options tuli kannasta vakiojärjestyksessä. */
    const toQ = (r: (typeof rows)[number]) => ({
      question: r.question,
      options: sekoita((r.options ?? []).slice(0, 4)),
      correct: r.correct_option,
      fact: r.fact ?? null,
      image: r.image_url,
      /* K6: lähdemerkintä kuvalevyn alle, kannasta. 94 riviä on ilman → rivi
         jää niillä pois kokonaan. Kovakoodattua "Wikimedia Commons" ei tule. */
      credit: r.source_credit ?? null,
      /* Levyn sävy kysymyskohtaisesti: haastelinkki voi kantaa sekakortistoisen
         sarjan (viikkovisan haaste), jolloin visan tason arvo olisi väärä
         osalle kuvista. Yhden kortiston visassa tulos on sama kuin ennen. */
      plate: levynSavy(r.type),
    });
    /* K6: vaalea kuvalevy grafiikalle (liput, vaakunat, maalaukset), tumma
       valokuville — sama laatikko ja sama object-fit: contain molemmissa.
       Tyyppi luetaan riviltä eikä URL-slugista, koska slug ja kannan `type`
       eroavat osassa kortistoja (esim. /peli?kuvavisa=vaakuna → "vaakunat"). */
    const levy = KATEGORIAT.find((k) => k.type === rows[0]?.type)?.sovitus === "contain" ? "vaalea" : "tumma";
    const variaatio = variaationNimi(kuvavisa, taso, maanosa?.key ?? null);
    const game: GameQuiz = {
      id: "", // ei quizzes-riviä → pelikertaa ei tallenneta
      /* T4: "Afrikan liput" / "Vaikeat liput" — sama nimi kuin kokoelmasivun linkissä. */
      title: variaatio ?? deck.title,
      teaser: deck.teaser,
      collectionLabel: "Kuvavisat",
      genreLabel: null,
      hubHref: "/kokoelma/kuvavisat",
      /* K1: ei taustakuvaa kuvavisoissa — tasainen brändipohja, ks. GameClient. */
      bgImg: "",
      /* Kuvavisat = designin sininen (kuvavisa-README) */
      accent: "#3B82F6",
      isSankari: false,
      kind: "kuva",
      plate: levy,
      challengePath: `/peli?kuvavisa=${encodeURIComponent(kuvavisa)}&ids=${rows.map((r) => r.id).join(",")}`,
      /* Haastelinkillä sarja on lukittu → ei uudelleenlatausta "Pelaa uudelleen" -napista. */
      reloadOnRestart: wantedIds.length === 0,
      autoStart: params.aloita === "1",
      /* K3: kuvasarja selaimeen, jotta tulosnäkymä voi luoda lyhyen
         haastetunnuksen (RPC) ilman että id:t ovat osoiteriville asti. */
      kuvaIdt: rows.map((r) => r.id),
      kuvavisaSlug: kuvavisa,
      taso: taso ?? null,
      maanosa: maanosa?.key ?? null,
      haaste: haaste
        ? { oikein: haaste.oikein, kysymyksia: haaste.kysymyksia, pisteet: haaste.pisteet }
        : undefined,
      /* Viikkovisan haaste: jakoteksti "Viikkovisa 38 · Kuvat 12/15" kuten
         alkuperäisessä viikkovisassa. */
      jakoNimi: kuvavisa === "viikko" && variaatio ? variaatio : undefined,
      spare: spareRows.map(toQ),
      questions: rows.map(toQ),
      related,
    };
    return <GameClient quiz={game} />;
  }

  let q = sb
    .from("quizzes")
    .select("id, slug, title, display_title, teaser, description, category, collection, genre, learn, hero_image, hero_focal_x, hero_focal_y, hero_side, hero_alt, fanitasot")
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
    resolved.key === "tiede" ? relQ.eq("category", "tiede-teknologia") :
    resolved.key === "jaakiekko" ? relQ.or("category.eq.jaakiekko,genre.eq.jaakiekko") :
    resolved.key === "jalkapallo" ? relQ.eq("genre", "jalkapallo") :
    resolved.key === "yleistieto" ? relQ.eq("collection", "yleistieto").neq("category", "kaupungit").neq("category", "ruoka-juoma") :
    relQ.eq("collection", quiz.collection ?? "yleistieto");

  const [{ data: qs }, genreRes, relatedRes, celebRes] = await Promise.all([
    sb
      .from("questions")
      .select("sort_order, question_text, explanation, answers")
      .eq("quiz_id", quiz.id)
      .order("sort_order", { ascending: true }),
    quiz.genre
      ? sb.from("genres" as never).select("label").eq("collection", quiz.collection ?? "").eq("genre_key", quiz.genre).maybeSingle()
      : Promise.resolve({ data: null }),
    relQ.order("published_at", { ascending: false }).limit(6),
    /* Henkilövisan kuva tulee celebrities-riviltä (Wikipedia/Wikimedia), ei
       kokoelmakartasta — henkilövisoja on 243 eikä niille ole omia kuvia. */
    quiz.collection === "tunnetut-henkilot"
      ? sb.from("celebrities").select("name, role, image_url").eq("trivia_quiz_id", quiz.id).maybeSingle()
      : Promise.resolve({ data: null }),
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

  /* ── HERO (CD kierros 4–5, Heikin spesifikaatio 13.9.2026) ──
     Uusi aloitusnäkymä otetaan käyttöön visakohtaisesti: kun visalla on oma
     hero-kuva, tai kun osoitteessa on ?hero=uusi (kuvattoman heron testaus).
     Näin 584 julkaistua visaa säilyy ennallaan testivaiheen ajan.
     Kuvan lähde: visan oma hero_image → kokoelman visakohtainen kuvakartta
     (topicImg) → ei kuvaa. Kokoelman geneeristä kuvaa EI käytetä herona —
     se on juuri se virhe, jossa golfvisa sai tennisvisan kuvan. */
  const heroParam = typeof params.hero === "string" ? params.hero : null;
  const isPerson = collection === "tunnetut-henkilot";
  const celeb = (celebRes.data ?? null) as { name: string; role: string | null; image_url: string | null } | null;
  /* Wikimedian thumb-osoitteessa leveys on polussa (".../330px-Tiedosto.jpg").
     Kannassa olevat kuvat ovat 330 px leveitä — liian pieniä 3:4-kortille — ja
     Wikimedia hyväksyy vain tietyt kokoportaat, joista 1280 on suurin toimiva.
     Alkuperäistä tiedostoa ei käytetä (voi olla useita megatavuja). */
  const wikiThumb = (url: string | null, width: number): string | null =>
    url && /\/thumb\//.test(url) ? url.replace(/\/(\d+)px-/, `/${width}px-`) : url;
  /* Visan oma kuva tulee kannasta (quizzes.hero_image; taustatäyttö
     19.9.2026, scripts/hero-image-backfill.ts). Henkilövisan kuva on sankarin
     celebrities.image_url. Koodissa ei enää johdeta polkua slugista. */
  const heroImage = quiz.hero_image ?? (isPerson ? wikiThumb(celeb?.image_url ?? null, 1280) : null);
  const heroSrcSet = !quiz.hero_image && isPerson && celeb?.image_url
    ? [wikiThumb(celeb.image_url, 330), wikiThumb(celeb.image_url, 1280)]
        .filter(Boolean)
        .map((u, i) => `${u} ${i === 0 ? 330 : 1280}w`)
        .join(", ")
    : null;
  /* Tunnetut henkilöt (246 julkaistua visaa) saa uuden heron ilman
     ?hero=uusi-parametria: jokaisella on celebrities-rivillä kuva, joten
     kokoelma on kokonaan valmis eikä jää puolitiehen. (Heikki 19.9.2026) */
  /* Heikin linjaus 19.9.2026: hero aktivoituu AINA kun visalla on oma kuva
     (hero_image, henkilön kuva tai kokoelman visakohtainen kuva). Kuvattomat
     visat säilyttävät vanhan aloitusnäkymän; ?hero=uusi näyttää niille
     kuvattoman heron testiksi. */
  const heroOn = heroImage != null || heroParam === "uusi";
  const heroFocalX = quiz.hero_focal_x != null ? Number(quiz.hero_focal_x) : 0.5;
  /* Kasvokuvissa kiinnostava kohta on ylhäällä (CD: 0.12–0.18) */
  const heroFocalY = quiz.hero_focal_y != null ? Number(quiz.hero_focal_y) : isPerson ? 0.15 : 0.4;
  /* hero_side on tallennettu kenttä: asetettu arvo voittaa laskennan aina.
     Henkilövisassa sääntöä ei ajeta lainkaan — kortti on aina oikealla. */
  const heroSide: "left" | "right" =
    isPerson ? "left"
    : quiz.hero_side === "left" || quiz.hero_side === "right" ? quiz.hero_side
    : heroFocalX > 0.5 ? "left" : "right";
  const hero = heroOn
    ? {
        image: heroImage,
        focalX: heroFocalX,
        focalY: heroFocalY,
        side: heroSide,
        alt: quiz.hero_alt ?? (isPerson && celeb ? `${celeb.name}. Kuva: Wikimedia Commons` : null),
        srcSet: heroSrcSet,
        /* Varaosoite: jos 1280 px:n thumbia ei ole (alkuperäinen kapeampi),
           selain jäisi ilman kuvaa. Silloin palataan kannan 330 px:n kuvaan. */
        srcSmall: !quiz.hero_image && isPerson ? celeb?.image_url ?? null : null,
        /* Henkilövisan yläotsikko: ammatti suoraan kannasta (TEEMAKARTTA:
           kortti näyttää tarkan ammatin, ei geneeristä "urheilija"). */
        roleLabel: isPerson ? celeb?.role ?? null : null,
        kind: (isPerson ? "henkilo" : heroImage ? "kuva" : "ei-kuvaa") as "henkilo" | "kuva" | "ei-kuvaa",
      }
    : null;

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
    /* SEO-pikakorjaus (1.9.2026): teaser täytetty vain 29 %:lle visoista,
       description 97 %:lle (claude/SEO_PIKATARKISTUS_2026_09_01.md kohta 2).
       description toimii nyt fallbackina, jotta hero-teksti ei jää tyhjäksi
       lähes millekään visalle. */
    teaser: learn?.intro ?? quiz.teaser ?? quiz.description,
    collectionLabel: resolved.label,
    genreLabel,
    hubHref: resolved.hub,
    bgImg: topicImg ?? resolved.bg,
    topicImg,
    hero,
    accent,
    isSankari,
    kind: "teksti",
    challengePath: quiz.slug ? `/visa/${encodeURIComponent(quiz.slug)}` : `/peli?quiz_id=${quiz.id}`,
    /* SUOMEN KAUPUNGIT -matkapassi (28.8.2026): kun visa on yksi 20:sta
       kaupunkivisasta, GameClient kirjoittaa leiman localStorageen pelin
       päättyessä (ks. lib/kaupungit.ts, KaupunkiPelilauta.tsx). */
    citySlug: KAUPUNGIT.find((c) => c.quizSlug === quiz.slug)?.id ?? null,
    fanitasot:
      Array.isArray(quiz.fanitasot) && quiz.fanitasot.length === 5 && quiz.fanitasot.every((t) => typeof t === "string" && t.trim())
        ? (quiz.fanitasot as string[]).map((t) => t.trim())
        : null,
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
      {/* AIHEOPAS POISTETTU ALOITUSNÄKYMÄSTÄ (Heikki 2026-09-16).
          Aiempi ssr-LearnArticle näytti koko aiheoppaan (Pikafaktat + UKK)
          visan aloitussivulla ja SSR-HTML:ssä. Se vuoti Suomen marjat -visassa
          kaikki 10/10 vastausta ja teki sivusta "SEO-kalastelijan" oloisen.
          Poistettu tietoisesti — SEO-hyöty menetetään ja ansaitaan takaisin
          muulla, laadukkaammalla tavalla. ÄLÄ palauta tätä renderöimään learnia
          aloitussivulle. (learn-data säilyy kannassa ja käytetään yhä metassa,
          rivi ~455.) Loppunäkymän oppimissisältö on GameClientin oma (päätös 4a).
          Murupolku + ristiinnostot (alla) jäävät: laillista sisäistä linkitystä,
          ei vastausvuotoa. */}

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
