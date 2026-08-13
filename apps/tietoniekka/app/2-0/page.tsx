// TIETONIEKKA 2.0 — ETUSIVU (Vaihe 3, lukittu runko: TOTEUTUSSUUNNITELMA §2.3)
// HERO (ei arvontaa) → PÄIVÄ (sankari + Putki) → ALOITA NÄISTÄ → SELAA LISÄÄ
// → MEGA → 🔥 TÄNÄÄN SUOSITUINTA (vain kun dataa) → KAUSIHERO → ALANAVI + FOOTER.
// Kuori staattinen, luvut dynaamisia kannasta.

import { getSupabase, SITE_SLUG } from "@/lib/supabase";
import { QuizCard, type QuizCardData } from "@/components/tn20/cards";
import { WideCard } from "@/components/tn20/WideCard";
import { motifPathFor } from "@/components/tn20/motif-paths";
import { kulttuuriImg } from "@/lib/kulttuuri";
import { luontoImg } from "@/lib/luonto";
import { urheiluImg } from "@/lib/urheilu";
import PutkiCard from "./PutkiCard";

/** Visan oma kuva (flagship-kokoelmien topicImg) — sama putki kuin pelinäkymässä.
    Palauttaa null jos kokoelmalla ei ole visakohtaisia kuvia (→ SVG-motiivi). */
const topicImgFor = (collection: string | null | undefined, slug: string | null | undefined): string | null =>
  collection === "kulttuuri" ? kulttuuriImg(slug)
  : collection === "luonto" ? luontoImg(slug)
  : collection === "urheilu" ? urheiluImg(slug)
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

  return { counts, total: cards.length, hero, sankariIsToday: hero?.dist === 0, dayPick, trending, today, newestByCollection };
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
  const { counts, total, hero, sankariIsToday, dayPick, trending, today, newestByCollection } = data;

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

  return (
    <main style={{ minHeight: "100dvh" }}>
      {/* ─── HEADER — sisältö samassa 1280px-linjassa kuin muu sivu ─── */}
      <header className="tn-header">
        <div className="tn-header-in">
          <a className="tn-logo" href="/2-0">
            <b>TIETO</b>
            <span>NIEKKA</span>
          </a>
          <nav className="tn-nav">
            <a href="#kokoelmat">Kokoelmat</a>
            <a href="#pelimuodot">Pelimuodot</a>
            <a href="#paiva">Tänään</a>
          </nav>
          <a className="tn-header-cta" href={dayHref}>
            {dayPick ? "Pelaa päivän visa" : "Pelaa päivän sankari"}
          </a>
        </div>
      </header>

      {/* ─── HERO: editorial spotlight, EI arvontanappia ─── */}
      <section className="tn-hero">
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
            {dayPick?.kind === "quiz" ? (
              <WideCard
                href={dayHref}
                color={DAY_ACCENT[dayPick.card.collection ?? ""] ?? "var(--tn-gold)"}
                motifPath={motifPathFor(dayPick.card.collection, (dayPick.card.genre as string | null) ?? null, dayPick.card.title)}
                img={topicImgFor(dayPick.card.collection, dayPick.card.slug)}
                title={dayPick.card.display_title ?? dayPick.card.title}
                desc={(dayPick.card.teaser as string | null) ?? null}
                mode="Klassinen"
                meta={`${(dayPick.card.question_count as number | null) ?? "?"} kysymystä`}
              />
            ) : sankariCeleb ? (
              <article className="tn-sankari-card">
                <div className="tn-sankari-photo">
                  {sankariCeleb.image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={sankariCeleb.image_url} alt={sankariCeleb.name} />
                  )}
                  {/* Wikipedia-kuvien lähde + lisenssi (CC) — lisenssiehto (Heikki 10.8.2026) */}
                  {sankariCeleb.image_url && sankariCeleb.wikipedia_url && (
                    <a className="tn-photo-credit" href={sankariCeleb.wikipedia_url} target="_blank" rel="noopener noreferrer">
                      Kuva: Wikipedia (CC)
                    </a>
                  )}
                </div>
                <div className="tn-sankari-body">
                  <span className="tn-chip" style={{ color: "var(--tn-amber)", alignSelf: "start" }}>
                    {sankariToday ? "🔥 Tänään juhlii" : "🎂 Seuraavaksi juhlii"}
                  </span>
                  <div className="tn-sankari-age">
                    <b>{age(sankariCeleb.birth_date, sankariToday)} vuotta</b> — {sankariCeleb.name}
                  </div>
                  <div className="tn-sankari-meta">
                    Syntynyt {new Date(sankariCeleb.birth_date).getDate()}.{new Date(sankariCeleb.birth_date).getMonth() + 1}.
                    {new Date(sankariCeleb.birth_date).getFullYear()} · {sankariCeleb.role}
                  </div>
                  <a className="tn-cta" href={sankariCeleb.trivia_quiz_id ? dayHref : sankariCeleb.slug ? `/sankari/${sankariCeleb.slug}` : "#"}>
                    Aloita visa →
                  </a>
                  <a className="tn-textlink" href="/2-0/kokoelma/tunnetut-henkilot">
                    Selaa tunnettuja henkilöitä →
                  </a>
                </div>
              </article>
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
              { href: "/2-0/kokoelma/tv", img: "/20/hero-tv-laura.webp", chip: "Kokoelma", title: "TV & Suoratoisto", meta: `${n("tv")} visaa · Netflix-hitit & kotimaiset`, accent: "var(--tn-magenta)" },
              { href: "/2-0/kokoelma/urheilu", img: "/20/hero-urheilu-mikko.webp", chip: "Kokoelma", title: "Urheilu", meta: `${n("urheilu")} visaa · Joukkueväreissä`, accent: "var(--tn-lime)" },
              /* Historia-aikajana (6.8.2026) — motiivikortti kunnes kokoelma saa omat kuvat */
              { href: "/2-0/kokoelma/historia", img: "/20/historia/hero-aikajana.webp", chip: "Teemakokoelma", title: "Historia", meta: `${n("historia")} visaa · Aikajana`, accent: "var(--tn-gold)" },
              { href: "/2-0/kokoelma/elokuvat", img: "/20/teema-elokuvat.webp", chip: "Kokoelma", title: "Elokuvat", meta: `${n("elokuvat")} visaa`, accent: "var(--tn-acc-elokuvat)" },
              { href: "/2-0/kokoelma/musiikki", img: "/20/teema-musiikki.webp", chip: "Kokoelma", title: "Musiikki", meta: `${n("musiikki")} visaa`, accent: "var(--tn-acc-musiikki)" },
              { href: "/2-0/kokoelma/kuvavisat", img: "/20/teema-liput.webp", chip: "Kuvakokoelma", title: "Kuvavisat", meta: "Liput, vaakunat, eläimet…", accent: "var(--tn-azure)" },
              { href: "/2-0/kokoelma/matkakohteet", img: "/20/teema-maantieto.webp", chip: "Kokoelma", title: "Matkakohteet", meta: `${n("matkakohteet")} visaa`, accent: "var(--tn-acc-matkakohteet)" },
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* 11.8.2026: Heikin tekstivapaa Megavisu (ei leivottuja lukuja) */}
            <img src="/20/megavisa.webp" alt="" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "42%", objectFit: "cover", objectPosition: "center", opacity: 0.35, maskImage: "linear-gradient(90deg, transparent, black 40%)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 40%)" }} />
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
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <div className="tn-mega-fact"><span>Kysymyksiä</span><b>50</b></div>
                <div className="tn-mega-fact"><span>Kesto</span><b>~20 min</b></div>
                <div className="tn-mega-fact"><span>Aihe</span><b>Kaikki kokoelmat</b></div>
              </div>
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
            <a href="/2-0/kokoelma/matkakohteet">Matkakohteet</a>
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
                <a href="/2-0/peli?mega=suuri-mega-50">Megavisat</a>
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
