// TIETONIEKKA 2.0 — ETUSIVU (Vaihe 3, lukittu runko: TOTEUTUSSUUNNITELMA §2.3)
// HERO (ei arvontaa) → PÄIVÄ (sankari + Putki) → ALOITA NÄISTÄ → SELAA LISÄÄ
// → MEGA → 🔥 TÄNÄÄN SUOSITUINTA (vain kun dataa) → KAUSIHERO → ALANAVI + FOOTER.
// Kuori staattinen, luvut dynaamisia kannasta.

import { getSupabase, SITE_SLUG } from "@/lib/supabase";
import { QuizCard, type QuizCardData } from "@/components/tn20/cards";
import { kulttuuriImg } from "@/lib/kulttuuri";
import { luontoImg } from "@/lib/luonto";
import { urheiluImg } from "@/lib/urheilu";
import { maantietoImg } from "@/lib/maantieto";
import { DailyQuizCard, type DailyQuizCardData, type DailyQuizVariant } from "@/components/tn20/DailyQuizCard";
import PutkiCard from "./PutkiCard";

/* Kokoelman nimi DailyQuizCardin chippiin (image/plain-tila) — sama
   sanasto kuin pelin loaderissa (app/2-0/peli/page.tsx COLLECTION_LABEL). */
const COLLECTION_NAME: Record<string, string> = {
  tv: "TV & Suoratoisto", urheilu: "Urheilu", elokuvat: "Elokuvat", musiikki: "Musiikki",
  matkakohteet: "Maantieto", yleistieto: "Yleistieto", kulttuuri: "Kulttuuri",
  historia: "Historia", luonto: "Luonto", "tunnetut-henkilot": "Tunnetut henkilöt",
};

/** Visan oma kuva (flagship-kokoelmien topicImg) — sama putki kuin pelinäkymässä.
    Palauttaa null jos kokoelmalla ei ole visakohtaisia kuvia (→ SVG-motiivi). */
const topicImgFor = (collection: string | null | undefined, slug: string | null | undefined): string | null =>
  collection === "kulttuuri" ? kulttuuriImg(slug)
  : collection === "luonto" ? luontoImg(slug)
  : collection === "urheilu" ? urheiluImg(slug)
  : collection === "matkakohteet" ? maantietoImg(slug)
  : null;

/** Kokoelmien aksentit (sama paletti kuin hubeissa). */
const DAY_ACCENT: Record<string, string> = {
  tv: "#FF3D9E", urheilu: "#B6FF3C", elokuvat: "#FF5C3D", musiikki: "#A855F7",
  matkakohteet: "#E8A320", ruokajuoma: "#F2C230", luonto: "#3FBF7F",
  kuvavisat: "#4C9AFF", yleistieto: "#E8A320", "tunnetut-henkilot": "#C9A96A",
};

export const dynamic = "force-dynamic";

type Celeb = {
  id: string;
  slug: string | null;
  name: string;
  role: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  birth_date: string;
  trivia_quiz_id: string | null;
};

function fiDate(d: Date) {
  const days = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];
  return `${days[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
}

async function getData() {
  const sb = getSupabase();
  if (!sb) return null;

  const [cardsRes, celebsRes, playsRes] = await Promise.all([
    sb.from("quiz_cards" as never).select("*"),
    sb.from("celebrities").select("id, slug, name, role, image_url, wikipedia_url, birth_date, trivia_quiz_id"),
    sb
      .from("quiz_plays")
      .select("quiz_id, played_at")
      .gte("played_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
  ]);

  const cards = (cardsRes.data ?? []) as Array<{
    id: string; slug: string; custom_slug: string | null; title: string;
    display_title: string | null; collection: string | null; play_count: number;
    published_at: string | null;
  } & Record<string, unknown>>;
  const celebs = (celebsRes.data ?? []) as Celeb[];
  const plays = (playsRes.data ?? []) as Array<{ quiz_id: string }>;

  // Kokoelmien visamäärät
  const counts: Record<string, number> = {};
  for (const c of cards) if (c.collection) counts[c.collection] = (counts[c.collection] ?? 0) + 1;

  // Päivän sankari: tämän päivän synttärit, muuten seuraava tuleva
  const today = new Date();
  const key = (m: number, d: number) => m * 100 + d;
  const todayKey = key(today.getMonth() + 1, today.getDate());
  const sorted = celebs
    .map((c) => {
      const b = new Date(c.birth_date);
      const k = key(b.getMonth() + 1, b.getDate());
      return { c, dist: k >= todayKey ? k - todayKey : k + 1300 - todayKey };
    })
    .sort((a, b) => a.dist - b.dist);
  const hero = sorted[0] ?? null;

  // Päivän visa: manuaalinen valinta administa (schedule_rules — sama sääntö
  // ohjaa myös 1.0-etusivun Päivän visaa). Heikki 4.8.2026: mikä tahansa visa;
  // jos valintaa ei ole, fallback on automaattinen synttärisankari (yllä).
  type DayPick =
    | { kind: "celeb"; celeb: Celeb; isToday: boolean }
    | { kind: "quiz"; card: (typeof cards)[number] }
    | null;
  let dayPick: DayPick = null;
  const todayIso = new Date().toISOString().slice(0, 10);
  const { data: siteRow } = await sb.from("sites").select("id").eq("slug", SITE_SLUG).maybeSingle();
  if (siteRow) {
    const { data: rule } = await sb
      .from("schedule_rules")
      .select("content_id")
      .eq("site_id", siteRow.id)
      .eq("content_type", "quiz")
      .eq("strategy", "date")
      .eq("scheduled_date", todayIso)
      .eq("active", true)
      .maybeSingle();
    const pickedId = rule?.content_id ?? null;
    if (pickedId) {
      const celeb = celebs.find((c) => c.trivia_quiz_id === pickedId);
      if (celeb) {
        const b = new Date(celeb.birth_date);
        dayPick = { kind: "celeb", celeb, isToday: key(b.getMonth() + 1, b.getDate()) === todayKey };
      } else {
        const card = cards.find((c) => c.id === pickedId);
        if (card) dayPick = { kind: "quiz", card };
      }
    }
  }

  // DailyQuizCard (15.8.2026): ensimmäinen kysymys pitää olla mukana
  // ENSIMMÄISESSÄ latauksessa (SSR) — muuten kortti välkkyy skeletonina.
  // Haetaan sen visan sort_order=0 -kysymys jonka Tänään-slotti näyttää
  // (manuaalinen Päivän visa TAI fallback-sankarin visa).
  const dayQuizId =
    dayPick?.kind === "quiz"
      ? dayPick.card.id
      : dayPick?.kind === "celeb"
        ? dayPick.celeb.trivia_quiz_id
        : hero?.c.trivia_quiz_id ?? null;
  let firstQuestion: { text: string; options: string[]; correct: string } | null = null;
  if (dayQuizId) {
    const { data: q0 } = await sb
      .from("questions")
      .select("question_text, answers")
      .eq("quiz_id", dayQuizId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (q0) {
      const answers = (q0.answers as Array<{ text: string; is_correct: boolean }>) ?? [];
      firstQuestion = {
        text: q0.question_text as string,
        options: answers.slice(0, 4).map((a) => a.text),
        correct: answers.find((a) => a.is_correct)?.text ?? answers[0]?.text ?? "",
      };
    }
  }

  // Trending: pelatuimmat 24 h — näytetään vasta kun volyymiä on (kynnys)
  const playCounts: Record<string, number> = {};
  for (const p of plays) playCounts[p.quiz_id] = (playCounts[p.quiz_id] ?? 0) + 1;
  const trendingIds = Object.entries(playCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalPlays24h = plays.length;
  const trending =
    totalPlays24h >= 30
      ? trendingIds
          .map(([id, n]) => {
            const q = cards.find((c) => c.id === id);
            return q ? { ...q, plays: n } : null;
          })
          .filter(Boolean)
      : [];

  const newestByCollection = Object.values(
    cards
      /* Henkilövisat pois Uusimmista (Heikki 11.8.2026): niitä tehdään
         varastoon kuukausia etukäteen synttärinostoiksi — "uusin" julkaisu
         ei kerro mitään ajankohtaista. Ne elävät Tänään-slotissa ja
         Tunnetut henkilöt -hubissa. */
      .filter((c) => c.collection && c.collection !== "tunnetut-henkilot" && c.published_at)
      .sort((a, b) => (b.published_at! > a.published_at! ? 1 : -1))
      .reduce<Record<string, (typeof cards)[number]>>((acc, c) => {
        if (!acc[c.collection!]) acc[c.collection!] = c;
        return acc;
      }, {})
  ).sort((a, b) => (b.published_at! > a.published_at! ? 1 : -1));

  return { counts, total: cards.length, hero, sankariIsToday: hero?.dist === 0, dayPick, firstQuestion, trending, today, newestByCollection };
}

function age(birth: string, onNextBirthday: boolean) {
  const b = new Date(birth);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return onNextBirthday ? a : a + 1;
}

export default async function Etusivu20() {
  const data = await getData();
  if (!data) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  const { counts, total, hero, sankariIsToday, dayPick, firstQuestion, trending, today, newestByCollection } = data;

  const n = (k: string) => counts[k] ?? 0;
  const rankColors = ["var(--tn-magenta)", "var(--tn-lime)", "var(--tn-violet)", "var(--tn-teal)", "var(--tn-orange)", "var(--tn-gold)"];

  // Tänään-slotin sisältö: manuaalinen Päivän visa (dayPick) tai sankari-fallback.
  // Kaikki päivän nostot kerryttävät Putkea (paivan_visa=1 / paivan_sankari=1).
  const sankariCeleb = dayPick?.kind === "celeb" ? dayPick.celeb : !dayPick ? hero?.c ?? null : null;
  const sankariToday = dayPick?.kind === "celeb" ? dayPick.isToday : sankariIsToday;
  const dayParam = dayPick ? "paivan_visa" : "paivan_sankari";
  const dayHref =
    dayPick?.kind === "quiz"
      ? `/2-0/peli?quiz_id=${dayPick.card.id}&paivan_visa=1`
      : sankariCeleb?.trivia_quiz_id
        ? `/2-0/peli?quiz_id=${sankariCeleb.trivia_quiz_id}&${dayParam}=1`
        : "#paiva";

  // DailyQuizCard (15.8.2026, design_handoff_paivan_visa) — variantin
  // päättely YHDESSÄ paikassa: person → birthday, muutoin image jos visalla
  // on oma kuva, muutoin plain. Sankari joka ei juhli tänään (fallback,
  // "Seuraavaksi juhlii") ei saa birthday-nauhaa — se on plain (README:
  // reunatapaus "Portretti puuttuu" laajennettu kattamaan myös "ei tänään").
  let dailyVariant: DailyQuizVariant = "plain";
  let dailyData: DailyQuizCardData | null = null;

  if (firstQuestion) {
    if (sankariCeleb && sankariToday) {
      dailyVariant = "birthday";
      dailyData = {
        quizId: sankariCeleb.trivia_quiz_id ?? "",
        title: sankariCeleb.name,
        questionCount: 5,
        collectionName: "Tunnetut henkilöt",
        accent: "#C9A96A",
        playedToday: false,
        person: {
          name: sankariCeleb.name,
          age: age(sankariCeleb.birth_date, true),
          birthDateLabel: `${new Date(sankariCeleb.birth_date).getDate()}.${new Date(sankariCeleb.birth_date).getMonth() + 1}.${new Date(sankariCeleb.birth_date).getFullYear()}`,
          role: sankariCeleb.role ?? "",
          portraitUrl: sankariCeleb.image_url,
          creditUrl: sankariCeleb.wikipedia_url,
          isToday: true,
        },
        image: null,
        firstQuestion,
        browseHref: "/2-0/kokoelma/tunnetut-henkilot",
        browseLabel: "Lisää tunnettuja henkilöitä →",
        playHref: dayHref,
      };
    } else if (dayPick?.kind === "quiz") {
      const collection = dayPick.card.collection ?? "yleistieto";
      const img = topicImgFor(collection, dayPick.card.slug);
      dailyVariant = img ? "image" : "plain";
      dailyData = {
        quizId: dayPick.card.id,
        title: dayPick.card.display_title ?? dayPick.card.title,
        tagline: (dayPick.card.teaser as string | null) ?? null,
        questionCount: (dayPick.card.question_count as number | null) ?? 10,
        collectionName: COLLECTION_NAME[collection] ?? "Visa",
        accent: DAY_ACCENT[collection] ?? "#E8A320",
        playedToday: false,
        person: null,
        image: img ? { url: img, focalX: 0.5, focalY: 0.46 } : null,
        firstQuestion,
        browseHref: `/2-0/peli?quiz_id=${dayPick.card.id}`,
        browseLabel: "Katso koko visa ensin →",
        playHref: dayHref,
      };
    } else if (sankariCeleb && !sankariToday) {
      // Fallback-sankari, mutta ei tänään juhli — plain-nauha kokoelmavärillä.
      dailyVariant = "plain";
      dailyData = {
        quizId: sankariCeleb.trivia_quiz_id ?? "",
        title: sankariCeleb.name,
        tagline: `Seuraavaksi juhlii · ${sankariCeleb.role ?? ""}`,
        questionCount: 5,
        collectionName: "Tunnetut henkilöt",
        accent: "#C9A96A",
        playedToday: false,
        person: null,
        image: null,
        firstQuestion,
        browseHref: "/2-0/kokoelma/tunnetut-henkilot",
        browseLabel: "Lisää tunnettuja henkilöitä →",
        playHref: dayHref,
      };
    }
  }

  return (
    <main style={{ minHeight: "100dvh" }}>
      {/* HEADER: uusi TopBar tulee layoutista (navigaatiojärjestelmä, lukittu
          17.8.2026) — vanha tn-header + header-CTA poistettu. Etusivulla palkki
          kelluu läpikuultavana heron päällä; herolle 72 px:n yläpehmuste, jottei
          sisältö jää palkin alle. */}

      {/* ─── HERO: editorial spotlight, EI arvontanappia ─── */}
      <section className="tn-hero" style={{ paddingTop: 72 }}>
        <div className="tn-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/20/hero-mikko-laura.webp" alt="" />
        </div>
        <div className="tn-shell">
          <div className="tn-hero-inner">
            <span className="tn-eyebrow">Uutta joka päivä</span>
            <h1 className="tn-display">
              Tiedätkö <em>enemmän</em> kuin luulet?
            </h1>
            <p>
              Mikko ja Laura kokosivat yli {Math.floor(total / 10) * 10} visaa Netflix-sarjoista
              maajoukkueisiin. Uutta joka päivä, aina ilmaista.
            </p>
            <div className="tn-hero-chips">
              <span className="tn-trustchip">{total}+ visaa</span>
              <span className="tn-trustchip">Kuvavisat &amp; Megavisat</span>
              <span className="tn-trustchip">Aina ilmainen</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PÄIVÄ-SLOTTI ─── */}
      <section className="tn-section" id="paiva">
        <div className="tn-shell">
          <span className="tn-eyebrow" style={{ color: "var(--tn-gold)" }}>Tänään</span>
          <div className="tn-section-head">
            <h2 className="tn-section-title">{dayPick ? "Päivän visa" : "Päivän sankari"}</h2>
            <span className="tn-section-sub" style={{ margin: 0 }}>{fiDate(today)} · uusi joka päivä</span>
          </div>
          <div className="tn-day-grid" style={{ marginTop: 18 }}>
            {dailyData ? (
              <DailyQuizCard variant={dailyVariant} data={dailyData} />
            ) : (
              <div className="tn-empty">Päivän sankari palaa huomenna.</div>
            )}
            <PutkiCard dayHref={dayHref} />
          </div>
        </div>
      </section>

      {/* ─── ALOITA NÄISTÄ: isot hero-nostot syy-eyebrowein ─── */}
      <section className="tn-section" id="kokoelmat">
        <div className="tn-shell">
          <span className="tn-eyebrow" style={{ color: "var(--tn-text-muted)" }}>Kokoelmat</span>
          <div className="tn-section-head">
            <h2 className="tn-section-title">Aloita näistä</h2>
            <a className="tn-morelink" href="#selaa">Kaikki kokoelmat →</a>
          </div>
          {/* Uudelleenpriorisointi (Heikki 10.8.2026): Suomen luonto + Suomen
              tarinat (kulttuuri) päänostoiksi — TV & Urheilu siirtyivät Selaa
              lisää -ruudukkoon. */}
          <div className="tn-feature-grid" style={{ marginTop: 18 }}>
            <a className="tn-feature" href="/2-0/kokoelma/luonto" style={{ ["--tn-feature-accent" as string]: "#3FBF7F" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/20/luonto/hero-landing.webp" alt="" />
              <div className="tn-feature-body">
                <span className="tn-chip">Teemakokoelma · {n("luonto")} visaa</span>
                <div className="tn-feature-title">Suomen luonto</div>
                <p className="tn-feature-desc">Suurpedoista revontuliin ja soista saimaannorppaan — tunnetko oikeasti lähimetsäsi?</p>
                <div className="tn-feature-tags">
                  <span className="tn-chip">Eläimet</span>
                  <span className="tn-chip">Maastot &amp; vedet</span>
                  <span className="tn-chip">Ilmiöt</span>
                </div>
              </div>
            </a>
            <a className="tn-feature" href="/2-0/kokoelma/kulttuuri" style={{ ["--tn-feature-accent" as string]: "var(--tn-gold)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/20/kulttuuri/hero-kollaasi.webp" alt="" />
              <div className="tn-feature-body">
                <span className="tn-chip">Teemakokoelma · {n("kulttuuri")} visaa</span>
                <div className="tn-feature-title">Suomen tarinat</div>
                <p className="tn-feature-desc">Tekijät ja klassikot Muumeista kultakauteen — kulttuuri joka jäi elämään.</p>
                <div className="tn-feature-tags">
                  <span className="tn-chip">Taide &amp; design</span>
                  <span className="tn-chip">Kirjallisuus</span>
                  <span className="tn-chip">Musiikki &amp; näyttämö</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ─── SELAA LISÄÄ: kompakti ruudukko ─── */}
      <section className="tn-section" id="selaa" style={{ paddingTop: 0 }}>
        <div className="tn-shell">
          <div className="tn-section-head">
            <h2 className="tn-section-title">Selaa lisää</h2>
          </div>
          <div className="tn-browse-grid" style={{ marginTop: 18 }}>
            {[
              /* 10.8.2026: TV & Urheilu tänne päänostojen tieltä. Kumpi/Järjestä
                 piilotettu 2.0:sta (siirretty 2.5:een) ja Ruoka & juoma piilossa
                 kunnes sisältöä on enemmän. */
              /* 14.8.2026: Megavisat teemakokoelmien joukkoon (Heikin päätös,
                 työjärjestys kohta 4) — landari /2-0/megavisat. */
              { href: "/2-0/megavisat", img: "/20/megavisat/mega-hero.webp", chip: "Pelimuoto", title: "Megavisat", meta: "20 · 50 · 100 kysymystä", accent: "var(--tn-gold)" },
              { href: "/2-0/kokoelma/tv", img: "/20/hero-tv-laura.webp", chip: "Kokoelma", title: "TV & Suoratoisto", meta: `${n("tv")} visaa · Netflix-hitit & kotimaiset`, accent: "var(--tn-magenta)" },
              { href: "/2-0/kokoelma/urheilu", img: "/20/hero-urheilu-mikko.webp", chip: "Kokoelma", title: "Urheilu", meta: `${n("urheilu")} visaa · Joukkueväreissä`, accent: "var(--tn-lime)" },
              /* Historia-aikajana (6.8.2026) — motiivikortti kunnes kokoelma saa omat kuvat */
              { href: "/2-0/kokoelma/historia", img: "/20/historia/hero-aikajana.webp", chip: "Teemakokoelma", title: "Historia", meta: `${n("historia")} visaa · Aikajana`, accent: "var(--tn-gold)" },
              { href: "/2-0/kokoelma/elokuvat", img: "/20/teema-elokuvat.webp", chip: "Kokoelma", title: "Elokuvat", meta: `${n("elokuvat")} visaa`, accent: "var(--tn-acc-elokuvat)" },
              { href: "/2-0/kokoelma/musiikki", img: "/20/teema-musiikki.webp", chip: "Kokoelma", title: "Musiikki", meta: `${n("musiikki")} visaa`, accent: "var(--tn-acc-musiikki)" },
              { href: "/2-0/kokoelma/kuvavisat", img: "/20/teema-liput.webp", chip: "Kuvakokoelma", title: "Kuvavisat", meta: "Liput, vaakunat, eläimet…", accent: "var(--tn-azure)" },
              /* 15.8.2026: Matkakohteet → Maantieto-flagship (CD:n design) */
              { href: "/2-0/kokoelma/matkakohteet", img: "/20/maantieto/hero-landing.webp", chip: "Teemakokoelma", title: "Maantieto", meta: `${n("matkakohteet")} visaa · Maailman ääriltä kotia kohti`, accent: "#46D6C8" },
              { href: "/2-0/kokoelma/tunnetut-henkilot", img: "/20/teema-tunnetut-henkilot.webp", chip: "Kokoelma", title: "Tunnetut henkilöt", meta: "Tutut kasvot", accent: "var(--tn-amber)" },
            ].map((c) => (
              <a key={c.title} className="tn-browse" href={c.href} style={{ ["--tn-browse-accent" as string]: c.accent }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt="" loading="lazy" />
                <span className="tn-chip tn-browse-chip">{c.chip}</span>
                <div className="tn-browse-body">
                  <div className="tn-browse-title">{c.title}</div>
                  {c.meta && <div className="tn-browse-meta">{c.meta}</div>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MEGA-PANEELI (kulta) — tulossa Vaihe 7:ssä ─── */}
      <section className="tn-section" id="pelimuodot">
        <div className="tn-shell">
          <div className="tn-mega">
            {/* 13.8.2026: MEGA-juliste kehystettynä korttina (CD:n Megavisat-
                designin malli) — ei enää taustakuvana, jonka MEGA-teksti jäi
                faktarivien alle. Faktat puhtaalla taustalla julisteen vieressä. */}
            <div className="tn-mega-grid" style={{ position: "relative" }}>
              <div>
                <span className="tn-chip" style={{ color: "var(--tn-gold)" }}>Megavisat</span>
                <div className="tn-display" style={{ fontSize: "clamp(28px, 4vw, 44px)", marginTop: 12 }}>Suuri Mega</div>
                <div className="tn-mega-num">50</div>
                <p style={{ color: "var(--tn-text-soft)", maxWidth: "40ch" }}>
                  <b style={{ color: "var(--tn-gold)" }}>50 kysymystä kaikista kokoelmista.</b> Yksi istunto.
                  Ei taukoja, ei tekosyitä.
                </p>
                <a className="tn-game-next" href="/2-0/peli?mega=suuri-mega-50" style={{ display: "inline-block", marginTop: 14, background: "var(--tn-gold)", textDecoration: "none", padding: "14px 28px", fontSize: 15 }}>
                  Aloita Mega →
                </a>
                <a href="/2-0/megavisat" style={{ display: "inline-block", marginTop: 14, marginLeft: 18, color: "var(--tn-gold)", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
                  Kaikki megavisat →
                </a>
              </div>
              <div style={{ display: "grid", gap: 10, alignContent: "center" }}>
                <div className="tn-mega-fact"><span>Kysymyksiä</span><b>50</b></div>
                <div className="tn-mega-fact"><span>Kesto</span><b>~20 min</b></div>
                <div className="tn-mega-fact"><span>Aihe</span><b>Kaikki kokoelmat</b></div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="tn-mega-poster" src="/20/megavisat/mega-hero.webp" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── UUSIMMAT VISAT: eri kokoelmien uusimmat suoraan kannasta ─── */}
      <section className="tn-section">
        <div className="tn-shell">
          <div className="tn-section-head">
            <h2 className="tn-section-title">Uusimmat visat</h2>
            <span className="tn-section-sub" style={{ margin: 0 }}>Jokaisen kokoelman tuorein</span>
          </div>
          {/* 11.8.2026: visan oma kuva mukaan kun sellainen on (kulttuuri/luonto)
              + linkit 2.0-kuoreen (aiemmin oletus /visa/ vei 1.0-peliin). */}
          <div className="tn-card-row" style={{ marginTop: 18 }}>
            {newestByCollection.map((q) => (
              <QuizCard
                key={q.id}
                quiz={q as unknown as QuizCardData}
                img={topicImgFor(q.collection, q.slug)}
                href={`/2-0/peli?quiz_id=${q.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 🔥 TÄNÄÄN SUOSITUINTA — näkyy vasta kun pelidataa on ─── */}
      {trending.length >= 3 && (
        <section className="tn-section">
          <div className="tn-shell">
            <div className="tn-section-head">
              <h2 className="tn-section-title">🔥 Tänään suosituinta</h2>
              <span className="tn-section-sub" style={{ margin: 0 }}>Päivittyy tunnin välein</span>
            </div>
            <div className="tn-rank-grid" style={{ marginTop: 18 }}>
              {trending.map((t, i) => (
                <a key={t!.id} className="tn-rank" href={`/visa/${t!.custom_slug ?? t!.slug}`}>
                  <span className="tn-rank-num" style={{ color: rankColors[i % 6] }}>{i + 1}</span>
                  <span>
                    <span className="tn-rank-title">{t!.display_title ?? t!.title}</span>
                    <span className="tn-rank-meta" style={{ display: "block" }}>{t!.plays} pelattu tänään</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Kausihero (Festarikesä) poistettu 10.8.2026 — kausi ohi (Heikki).
          Paikalle ei uutta kausinostoa ennen kuin ajankohtainen teema löytyy. */}

      {/* ─── ALANAVIGAATIO ─── */}
      <section className="tn-section" style={{ paddingBottom: 0 }}>
        <div className="tn-shell">
          <h4 style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--tn-text-dim)", marginBottom: 12 }}>
            Kaikki aiheet
          </h4>
          {/* 10.8.2026: Kumpi/Järjestä piilotettu (2.5), tyhjät kategoriat
              (Ruoka & juoma, Muoti & design) piilossa kunnes sisältöä on. */}
          <nav className="tn-chipnav">
            <a href="/2-0/kokoelma/tv">TV &amp; Suoratoisto</a>
            <a href="/2-0/kokoelma/urheilu">Urheilu</a>
            <a href="/2-0/kokoelma/musiikki">Musiikki</a>
            <a href="/2-0/kokoelma/elokuvat">Elokuvat</a>
            <a href="/2-0/kokoelma/matkakohteet">Maantieto</a>
            <a href="/2-0/kokoelma/tunnetut-henkilot">Tunnetut henkilöt</a>
            <a href="/2-0/peli?kuvavisa=liput">Liput</a>
            <a href="/2-0/kokoelma/kulttuuri">Kulttuuri</a>
            <a href="/2-0/kokoelma/historia">Historia</a>
            <a href="/2-0/kokoelma/luonto">Luonto</a>
          </nav>

          <footer className="tn-footer">
            <div className="tn-footer-grid">
              <div>
                <a className="tn-logo" href="/2-0" style={{ fontSize: 19 }}>
                  <b>TIETO</b>
                  <span>NIEKKA</span>
                </a>
                <p style={{ maxWidth: "36ch" }}>Visoja jotka eivät tunnu koulukokeelta. Uutta päivittäin, ilman rekisteröitymistä.</p>
              </div>
              <div>
                <h4>Kokoelmat</h4>
                <a href="/2-0/kokoelma/tv">TV &amp; Suoratoisto</a>
                <a href="/2-0/kokoelma/urheilu">Urheilu</a>
                <a href="/2-0/kokoelma/elokuvat">Elokuvat</a>
                <a href="/2-0/kokoelma/musiikki">Musiikki</a>
              </div>
              <div>
                <h4>Pelimuodot</h4>
                <a href="/peli">Klassinen</a>
                <a href="/2-0/megavisat">Megavisat</a>
                <a href="/2-0/kokoelma/kuvavisat">Kuvavisat</a>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 28, fontSize: 12.5 }}>
              <span>© {today.getFullYear()} Tietoniekka</span>
              <a href="/tietosuoja" style={{ color: "var(--tn-text-dim)", textDecoration: "none" }}>Tietosuoja</a>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
