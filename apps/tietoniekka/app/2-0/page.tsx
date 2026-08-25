// TIETONIEKKA 2.0 — ETUSIVU 2026 (design_handoff_etusivu_2026, toteutettu
// 18.8.2026 — korvasi 28.7. lukitun rungon, Heikki vahvisti 17.8.: "uusi
// design on totuus"). Rakenne ylhäältä alas:
//   sticky navi (TopBar layoutista) → kompakti hero → Päivän visa →
//   putkinauha (64px) → viisi täysleveää kuratoitua nostoa → "Uusimmat
//   visat" -tikkeri → footer.
// Poistuneet osiot: Aloita näistä, Selaa lisää -ruudukko, Mega-paneeli,
// trending, chipnav (Megavisat elää valikossa, footerissa ja tikkerissä).
// Kuori staattinen, luvut ja sisältö dynaamisia kannasta; nostot
// lib/etusivu.ts-configista (kuratoitu, kausivaihdot yhdestä paikasta).

import { getSupabase, SITE_SLUG } from "@/lib/supabase";
import { kulttuuriImg } from "@/lib/kulttuuri";
import { luontoImg } from "@/lib/luonto";
import { urheiluImg } from "@/lib/urheilu";
import { maantietoImg } from "@/lib/maantieto";
import { tvImg } from "@/lib/tv";
import { musiikkiImg } from "@/lib/musiikki";
import { elokuvatImg } from "@/lib/elokuvat";
import { jalkapalloQuizImg } from "@/lib/jalkapallo";
import { jaakiekkoQuizImg } from "@/lib/jaakiekko";
import { DailyQuizCard, type DailyQuizCardData, type DailyQuizVariant } from "@/components/tn20/DailyQuizCard";
import StreakStrip from "@/components/tn20/StreakStrip";
import { ETUSIVU_HERO, SPOTLIGHTS, HISTORIA_STOPS, FOOTER_COLLECTIONS, FOOTER_MODES } from "@/lib/etusivu";
import "./etusivu.css";

/* Kokoelman nimi DailyQuizCardin chippiin — sama sanasto kuin pelin
   loaderissa (app/2-0/peli/page.tsx COLLECTION_LABEL). */
const COLLECTION_NAME: Record<string, string> = {
  tv: "TV & Suoratoisto", urheilu: "Urheilu", elokuvat: "Elokuvat", musiikki: "Musiikki",
  matkakohteet: "Maantieto", yleistieto: "Yleistieto", kulttuuri: "Kulttuuri",
  historia: "Historia", luonto: "Luonto", "tunnetut-henkilot": "Tunnetut henkilöt",
};

/** Visan oma kuva (teemakokoelmien topicImg). Bugikorjaus 25.8.2026 (Heikin
    kuvakaappaus): TV/Musiikki/Elokuvat-haarat puuttuivat — teemasivut ja
    kuvat (lib/tv.ts jne.) lisättiin 22.–23.8. mutta tätä dispatcheria ei
    laajennettu, joten esim. Putous-päivän visa renderöityi "plain"-korttina
    ilman kuvaa vaikka /20/tv/<slug>.webp oli olemassa. Kuvan asettelu
    (140px-nauha, object-fit: cover, focal 50%/46%) on sama huolella
    määritelty putki kuin muillakin — vain haku puuttui. */
const topicImgFor = (collection: string | null | undefined, slug: string | null | undefined): string | null =>
  collection === "kulttuuri" ? kulttuuriImg(slug)
  : collection === "luonto" ? luontoImg(slug)
  /* urheilu kattaa myös jalkapallo- ja jääkiekkoteemasivujen visat (Heikin
     muistutus 25.8.): niiden kuvakortit on nimetty design-id:n mukaan, joten
     haku menee quiz-slug-mäppäysten kautta jos urheiluImg ei osu. */
  : collection === "urheilu" ? urheiluImg(slug) ?? jalkapalloQuizImg(slug) ?? jaakiekkoQuizImg(slug)
  : collection === "matkakohteet" ? maantietoImg(slug)
  : collection === "tv" ? tvImg(slug)
  : collection === "musiikki" ? musiikkiImg(slug)
  : collection === "elokuvat" ? elokuvatImg(slug)
  : null;

/** Kokoelmien aksentit (sama paletti kuin hubeissa). */
const DAY_ACCENT: Record<string, string> = {
  tv: "#FF3D9E", urheilu: "#B6FF3C", elokuvat: "#FF5C3D", musiikki: "#A855F7",
  matkakohteet: "#46D6C8", ruokajuoma: "#F2C230", luonto: "#3FBF7F",
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

  const [cardsRes, celebsRes] = await Promise.all([
    sb.from("quiz_cards" as never).select("*"),
    sb.from("celebrities").select("id, slug, name, role, image_url, wikipedia_url, birth_date, trivia_quiz_id"),
  ]);

  const cards = (cardsRes.data ?? []) as Array<{
    id: string; slug: string; custom_slug: string | null; title: string;
    display_title: string | null; collection: string | null; play_count: number;
    published_at: string | null; game_mode?: string | null;
  } & Record<string, unknown>>;
  const celebs = (celebsRes.data ?? []) as Celeb[];

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
  // ohjaa myös 1.0-etusivun Päivän visaa). Fallback = synttärisankari.
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

  // Ensimmäinen kysymys mukaan SSR:ään (DailyQuizCard, 15.8.2026).
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

  /* Tikkeri: uusimmat visat julkaisujärjestyksessä. Henkilövisat pois
     (Heikki 11.8.2026: tehdään varastoon — uusin julkaisu ei ole
     ajankohtainen). Pelimuototunnus vain erikoismuodoille (README). */
  const latest = cards
    .filter((c) => c.collection && c.collection !== "tunnetut-henkilot" && c.published_at)
    .sort((a, b) => (b.published_at! > a.published_at! ? 1 : -1))
    .slice(0, 14)
    .map((c) => ({
      id: c.id,
      name: (c.display_title ?? c.title) as string,
      mode: c.game_mode === "mega" ? "Megavisa" : undefined,
      href: `/2-0/peli?quiz_id=${c.id}`,
    }));

  return { total: cards.length, hero, sankariIsToday: hero?.dist === 0, dayPick, firstQuestion, today, latest };
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
  const { total, hero, sankariIsToday, dayPick, firstQuestion, today, latest } = data;

  // Tänään-slotin sisältö: manuaalinen Päivän visa (dayPick) tai sankari-fallback.
  const sankariCeleb = dayPick?.kind === "celeb" ? dayPick.celeb : !dayPick ? hero?.c ?? null : null;
  const sankariToday = dayPick?.kind === "celeb" ? dayPick.isToday : sankariIsToday;
  const dayParam = dayPick ? "paivan_visa" : "paivan_sankari";
  const dayHref =
    dayPick?.kind === "quiz"
      ? `/2-0/peli?quiz_id=${dayPick.card.id}&paivan_visa=1`
      : sankariCeleb?.trivia_quiz_id
        ? `/2-0/peli?quiz_id=${sankariCeleb.trivia_quiz_id}&${dayParam}=1`
        : "#";

  // Variantin päättely (README:n dailyMedia): portrait = synttärisankari
  // kuvineen · landscape = visan topicImg · none = ei kuvaa.
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
        playHref: dayHref,
      };
    } else if (sankariCeleb && !sankariToday) {
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
        playHref: dayHref,
      };
    }
  }

  /* Tikkeri duplikoidaan kertaalleen saumattomaan looppiin (README). */
  const tickerItems = [...latest, ...latest];

  /* Kapealla aikajana supistuu neljään pysäkkiin (README): Esihistoria,
     Autonomia, Itsenäisyys, 1945→ — muut piilotetaan CSS:llä. */
  const narrowKeep = new Set([0, 2, 3, 5]);

  return (
    <main style={{ minHeight: "100dvh" }}>
      {/* ─── Kompakti hero — mobiilissa otsikko kuvan päälle vasempaan
             laitaan (Heikin katselmus 18.8.2026), jotta Päivän visa näkyy
             heti; kappale + proof pointit piilossa kapealla ─── */}
      <section className="tn-es-shell tn-es-hero" style={{ marginTop: 72 }}>
        <div className="tn-es-hero-text">
          <h1>
            Tiedätkö <em>enemmän</em> kuin luulet?
          </h1>
          <p className="tn-es-hero-p">
            Laura ja Mikko loivat uuden tietovisasivuston. Kaikki Suomen historiasta, luonnosta,
            urheilusta ja siitä sarjasta jota et myönnä katsovasi — yli {Math.floor(total / 10) * 10}{" "}
            visaa, uutta joka päivä.
          </p>
          <div className="tn-es-proofs">
            {ETUSIVU_HERO.proofs.map((p, i) => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
                {i > 0 && <i aria-hidden>·</i>}
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="tn-es-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ETUSIVU_HERO.img} alt="Laura ja Mikko, Tietoniekan juontajat" style={{ objectPosition: ETUSIVU_HERO.imgPos }} />
        </div>
      </section>

      {/* ─── Päivän visa + putkinauha (sama tuotealue) ─── */}
      <section className="tn-es-shell" id="paiva">
        <div className="tn-es-kicker">
          <span className="tn-es-kicker-dot" aria-hidden />
          <span className="tn-es-kicker-label">Päivän visa</span>
          <span className="tn-es-kicker-date">{fiDate(today)}</span>
        </div>
        {dailyData ? (
          <DailyQuizCard variant={dailyVariant} data={dailyData} />
        ) : (
          <div className="tn-empty">Päivän visa palaa huomenna.</div>
        )}
        <StreakStrip />
      </section>

      {/* ─── Pinnalla nyt: viisi täysleveää kuratoitua nostoa ─── */}
      <section className="tn-es-shell" style={{ paddingTop: 64 }} id="kokoelmat">
        <h2 className="tn-es-h2">Pinnalla nyt</h2>
        <div className="tn-es-spots">
          {SPOTLIGHTS.map((s) => (
            <a key={s.key} className="tn-es-spot" href={s.href} data-side={s.side}>
              <span className="tn-es-spot-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt="" loading="lazy" style={{ objectPosition: s.imgPos }} />
                {s.timeline && (
                  <>
                    <span className="tn-es-tl-shade" aria-hidden />
                    <span className="tn-es-tl" aria-hidden>
                      {HISTORIA_STOPS.map((stop, i) => (
                        <span
                          key={stop.label}
                          className="tn-es-tl-stop"
                          data-narrow-hide={narrowKeep.has(i) ? undefined : ""}
                        >
                          <span className="tn-es-tl-era">{stop.label}</span>
                          <span className="tn-es-tl-row">
                            <span className="tn-es-tl-dot" />
                            {i < HISTORIA_STOPS.length - 1 && <span className="tn-es-tl-line" />}
                          </span>
                          <span className="tn-es-tl-year">{stop.year}</span>
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </span>
              <span className="tn-es-spot-body">
                <span className="tn-es-spot-eyebrow">{s.eyebrow}</span>
                <span className="tn-es-spot-title">{s.title}</span>
                <span className="tn-es-spot-desc">{s.desc}</span>
                <span className="tn-es-spot-action">Avaa kokoelma →</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ─── Uusimmat visat -tikkeri ─── */}
      <section className="tn-es-ticker" aria-label="Uusimmat visat">
        <div className="tn-es-ticker-head">
          <span className="tn-es-ticker-label">Uusimmat visat</span>
          <span className="tn-es-ticker-rule" aria-hidden />
        </div>
        <div className="tn-es-ticker-track">
          <div className="tn-es-ticker-row">
            {tickerItems.map((t, i) => (
              <a key={`${t.id}-${i}`} className="tn-es-ticker-chip" href={t.href} aria-hidden={i >= latest.length || undefined} tabIndex={i >= latest.length ? -1 : undefined}>
                <i aria-hidden />
                <b>{t.name}</b>
                {t.mode && <span>{t.mode}</span>}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="tn-es-shell tn-es-foot">
        <div className="tn-es-foot-grid">
          <div>
            <a className="tn-logo" href="/2-0" style={{ fontSize: 24 }}>
              <b>TIETO</b>
              <span>NIEKKA</span>
            </a>
            <p className="tn-es-foot-desc">
              Suomalainen tietovisasivusto. Uusia tietovisoja jatkuvasti.
            </p>
            <div className="tn-es-foot-some">
              <span>Seuraa Tietoniekkaa somessa</span>
              <a
                className="tn-es-foot-ig"
                href="https://www.instagram.com/tietoniekka/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tietoniekka Instagramissa"
              >
                {/* Instagramin virallinen värillinen logo (CD:n design-paketista) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/20/etusivu/ig-logo.svg" alt="" width={20} height={20} />
              </a>
            </div>
          </div>
          <div>
            <h4>Kokoelmat</h4>
            <div className="tn-es-foot-col">
              {FOOTER_COLLECTIONS.map((c) => (
                <a key={c.label} href={c.href}>
                  {c.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>Pelimuodot</h4>
            <div className="tn-es-foot-col">
              {FOOTER_MODES.map((m) => (
                <a key={m.label} href={m.href}>
                  {m.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>Tietoniekka</h4>
            <div className="tn-es-foot-col">
              {/* "Tietoa meistä" ja "Palaute" lisätään kun sivut ovat olemassa */}
              <a href="/tietosuoja">Tietosuoja</a>
            </div>
          </div>
        </div>
        <div className="tn-es-foot-base">
          <span>© {today.getFullYear()} Tietoniekka</span>
          <span>Tehty Suomessa</span>
        </div>
      </footer>
    </main>
  );
}
