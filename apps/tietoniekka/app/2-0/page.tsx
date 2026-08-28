// TIETONIEKKA 2.0 — ETUSIVU 2026 PROD (design_handoff_etusivu_2026_prod, toteutettu
// 28.8.2026 — korvasi 18.8. version kokonaan; Heikki: "uusi design korvaa nykyisen
// 2.0 työhaaran"). Rakenne ylhäältä alas:
//   ylätunniste (TopBar layoutista: tagline, nostot, Päivän putki) → kategoriarivi →
//   lippuvisa-hero → Suositut kokoelmat (6) → Laura ja Mikko (profiilit + 4 korttia)
//   → Päivän visa → Uusimmat visat -ticker → footer.
// Poistuneet: Laura & Mikko -duohero, upotettu ensimmäinen kysymys, putkinauha,
// viisi täysleveää nostoa, historia-aikajana.
// Kuori staattinen (lib/etusivu.ts), Päivän visa ja ticker dynaamisia kannasta.
// Sivu käyttää container-kyselyitä (.tn20 on inline-size-container → cqw).

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
import { urheilulajitQuizImg } from "@/lib/urheilulajit";
import PaivanVisaCard, { type PaivanVisaData } from "@/components/tn20/PaivanVisaCard";
import {
  CATEGORY_CHIPS, ETUSIVU_HERO, POPULAR_COLLECTIONS, HOSTS, HOSTS_INTRO,
  FOOTER_COLLECTIONS, FOOTER_MODES, FOOTER_SITE, FOOTER_INSTAGRAM,
} from "@/lib/etusivu";
import "./etusivu.css";

/* Kokoelman nimi Päivän visan merkkiin — sama sanasto kuin pelin loaderissa. */
const COLLECTION_NAME: Record<string, string> = {
  tv: "TV & Suoratoisto", urheilu: "Urheilu", elokuvat: "Elokuvat", musiikki: "Musiikki",
  matkakohteet: "Maantieto", yleistieto: "Yleistieto", kulttuuri: "Kulttuuri",
  historia: "Historia", luonto: "Luonto", "tunnetut-henkilot": "Tunnetut henkilöt",
};

/** Visan oma kuva (teemakokoelmien topicImg) — sama dispatcher kuin 25.–26.8. */
const topicImgFor = (collection: string | null | undefined, slug: string | null | undefined): string | null =>
  collection === "kulttuuri" ? kulttuuriImg(slug)
  : collection === "luonto" ? luontoImg(slug)
  : collection === "urheilu" ? urheiluImg(slug) ?? jalkapalloQuizImg(slug) ?? jaakiekkoQuizImg(slug) ?? urheilulajitQuizImg(slug)
  : collection === "matkakohteet" ? maantietoImg(slug)
  : collection === "tv" ? tvImg(slug)
  : collection === "musiikki" ? musiikkiImg(slug)
  : collection === "elokuvat" ? elokuvatImg(slug)
  : null;

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

type Card = {
  id: string; slug: string; custom_slug: string | null; title: string;
  display_title: string | null; collection: string | null; play_count: number;
  published_at: string | null; game_mode?: string | null; teaser?: string | null;
  question_count?: number | null;
};

async function getData() {
  const sb = getSupabase();
  if (!sb) return null;

  const [cardsRes, celebsRes] = await Promise.all([
    sb.from("quiz_cards" as never).select("*"),
    sb.from("celebrities").select("id, slug, name, role, image_url, wikipedia_url, birth_date, trivia_quiz_id"),
  ]);
  const cards = (cardsRes.data ?? []) as Card[];
  const celebs = (celebsRes.data ?? []) as Celeb[];

  // Päivän sankari: tämän päivän synttärit, muuten seuraava tuleva
  const today = new Date();
  const key = (m: number, d: number) => m * 100 + d;
  const todayKey = key(today.getMonth() + 1, today.getDate());
  const sorted = celebs
    .filter((c) => c.trivia_quiz_id)
    .map((c) => {
      const b = new Date(c.birth_date);
      const k = key(b.getMonth() + 1, b.getDate());
      return { c, dist: k >= todayKey ? k - todayKey : k + 1300 - todayKey };
    })
    .sort((a, b) => a.dist - b.dist);
  const hero = sorted[0] ?? null;

  // Päivän visa: manuaalinen valinta administa (schedule_rules). Fallback = sankari.
  type DayPick = { kind: "celeb"; celeb: Celeb; isToday: boolean } | { kind: "quiz"; card: Card } | null;
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

  /* Ticker: uusimmat visat julkaisujärjestyksessä. Henkilövisat pois
     (Heikki 11.8.2026: tehdään varastoon). Pelimuototunnus vain Megalle. */
  const latest = cards
    .filter((c) => c.collection && c.collection !== "tunnetut-henkilot" && c.published_at)
    .sort((a, b) => (b.published_at! > a.published_at! ? 1 : -1))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      name: (c.display_title ?? c.title) as string,
      mode: c.game_mode === "mega" ? "Megavisa" : undefined,
      href: `/2-0/peli?quiz_id=${c.id}`,
    }));

  return { hero, sankariIsToday: hero?.dist === 0, dayPick, today, latest };
}

function age(birth: string, onNextBirthday: boolean) {
  const b = new Date(birth);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return onNextBirthday ? a : a + 1;
}

const fiBirth = (iso: string) => {
  const b = new Date(iso);
  return `${b.getDate()}.${b.getMonth() + 1}.${b.getFullYear()}`;
};

export default async function Etusivu20() {
  const data = await getData();
  if (!data) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  const { hero, sankariIsToday, dayPick, today, latest } = data;

  /* Päivän visan sisältö: adminin valinta (visa tai sankari) tai synttärisankari. */
  let daily: PaivanVisaData | null = null;
  const celeb = dayPick?.kind === "celeb" ? dayPick.celeb : !dayPick ? hero?.c ?? null : null;
  const celebToday = dayPick?.kind === "celeb" ? dayPick.isToday : sankariIsToday;

  if (dayPick?.kind === "quiz") {
    const c = dayPick.card;
    const collection = c.collection ?? "yleistieto";
    const img = topicImgFor(collection, c.slug);
    daily = {
      badge: COLLECTION_NAME[collection] ?? "Päivän visa",
      title: c.display_title ?? c.title,
      meta: c.question_count ? `${c.question_count} kysymystä` : null,
      lede: c.teaser ?? null,
      imageUrl: img,
      imagePos: "50% 46%",
      imageAlt: "Päivän visan kuva",
      playHref: `/2-0/peli?quiz_id=${c.id}&paivan_visa=1`,
      playedHref: `/2-0/kokoelma/${collection}`,
      playedCta: "Lisää visoja →",
    };
  } else if (celeb?.trivia_quiz_id) {
    daily = {
      badge: celebToday ? "Tänään juhlii" : "Seuraavaksi juhlii",
      title: celebToday ? `${age(celeb.birth_date, true)} vuotta — ${celeb.name}` : celeb.name,
      meta: `Syntynyt ${fiBirth(celeb.birth_date)}${celeb.role ? ` · ${celeb.role}` : ""}`,
      lede: "Kuinka hyvin tunnet päivänsankarin uran ja tunnetuimmat saavutukset?",
      imageUrl: celeb.image_url,
      imagePos: "50% 30%",
      imageAlt: "Päivänsankarin kuva",
      playHref: `/2-0/peli?quiz_id=${celeb.trivia_quiz_id}&${dayPick ? "paivan_visa" : "paivan_sankari"}=1`,
      playedHref: "/2-0/kokoelma/tunnetut-henkilot",
      playedCta: "Pelaa henkilövisoja →",
    };
  }

  /* Ticker duplikoidaan kertaalleen saumattomaan looppiin (design). */
  const tickerItems = [...latest, ...latest];

  return (
    <main className="tn-es-page">
      {/* ─── Kategoriarivi ─── */}
      <div className="tn-es-catbar">
        <nav className="tn-es-cats" aria-label="Kategoriat">
          {CATEGORY_CHIPS.map((c) => (
            <a key={c.label} className="tn-es-cat" href={c.href}>{c.label}</a>
          ))}
        </nav>
      </div>

      <div className="tn-es-main">
        {/* ─── Lippuvisa-hero ─── */}
        <a className="tn-es-hero" href={ETUSIVU_HERO.href}>
          <span className="tn-es-hero-bg" aria-hidden style={{ backgroundImage: `url(${ETUSIVU_HERO.img})`, backgroundPosition: ETUSIVU_HERO.pos }} />
          <span className="tn-es-hero-panel">
            <h1 className="tn-es-h1">{ETUSIVU_HERO.title}</h1>
            <p className="tn-es-hero-lede">{ETUSIVU_HERO.lede}</p>
            <span className="tn-es-btn">{ETUSIVU_HERO.cta}</span>
          </span>
        </a>

        {/* ─── Suositut kokoelmat ─── */}
        <section aria-labelledby="suositut">
          <div className="tn-es-head">
            <h2 className="tn-es-h2" id="suositut">Suositut kokoelmat</h2>
            <p className="tn-es-sub">Valitse aihe ja löydä seuraava visasi.</p>
          </div>
          <div className="tn-es-grid">
            {POPULAR_COLLECTIONS.map((c) => (
              <a key={c.key} className="tn-es-card" href={c.href}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="tn-es-card-img" src={c.img} alt="" loading="lazy" style={{ objectPosition: c.pos }} />
                <span className="tn-es-card-shade" aria-hidden />
                <span className="tn-es-card-foot">
                  <span className="tn-es-card-title">{c.title}</span>
                  <span className="tn-es-arrow" aria-hidden>→</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ─── Laura ja Mikko ─── */}
        <section className="tn-es-hosts" aria-labelledby="juontajat">
          <h2 className="tn-es-h2" id="juontajat">{HOSTS_INTRO.title}</h2>
          <p className="tn-es-hosts-lede">{HOSTS_INTRO.lede}</p>
          <div className="tn-es-hosts-grid">
            {HOSTS.map((h) => (
              <div key={h.key} className="tn-es-host" data-accent={h.accent}>
                <div className="tn-es-host-profile">
                  <div className="tn-es-host-img" role="img" aria-label={h.name} style={{ backgroundImage: `url(${h.img})` }} />
                  <div className="tn-es-host-text">
                    <div className="tn-es-host-name">{h.heading}</div>
                    <div className="tn-es-host-role">{h.role}</div>
                  </div>
                </div>
                <div className="tn-es-host-cards">
                  {h.cards.map((c) => (
                    <a key={c.key} className="tn-es-hcard" href={c.href}>
                      <span className="tn-es-card-bg" aria-hidden style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos }} />
                      <span className="tn-es-card-shade tn-es-card-shade--h" aria-hidden />
                      <span className="tn-es-card-foot tn-es-card-foot--h">
                        <span className="tn-es-hcard-text">
                          <span className="tn-es-card-title">{c.title}</span>
                          <span className="tn-es-hcard-desc">{c.desc}</span>
                        </span>
                        <span className="tn-es-arrow" aria-hidden>→</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Päivän visa ─── */}
        <section id="paivan-visa" aria-labelledby="paivan-visa-h">
          <div className="tn-es-head tn-es-head--row">
            <h2 className="tn-es-h2 tn-es-h2--nowrap" id="paivan-visa-h">Päivän visa</h2>
            <span className="tn-es-date">Tänään {today.getDate()}.{today.getMonth() + 1}.</span>
          </div>
          {daily ? <PaivanVisaCard data={daily} /> : <div className="tn-es-day tn-es-day--empty">Päivän visa palaa huomenna.</div>}
        </section>

        {/* ─── Uusimmat visat ─── */}
        <section aria-labelledby="uusimmat">
          <div className="tn-es-head">
            <h2 className="tn-es-h2" id="uusimmat">Uusimmat visat</h2>
          </div>
          <div className="tn-es-ticker" data-ticker>
            <div className="tn-es-ticker-track" data-ticker-track>
              {tickerItems.map((t, i) => (
                <a
                  key={`${t.id}-${i}`}
                  className="tn-es-chip"
                  href={t.href}
                  aria-hidden={i >= latest.length || undefined}
                  tabIndex={i >= latest.length ? -1 : undefined}
                >
                  <i aria-hidden />
                  {t.name}
                  {t.mode && <span className="tn-es-chip-mode">{t.mode}</span>}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ─── Footer ─── */}
      <footer className="tn-es-foot">
        <div className="tn-es-foot-in">
          <div className="tn-es-foot-grid">
            <div className="tn-es-foot-brand">
              <a className="tn-logo tn-es-foot-logo" href="/2-0">
                <b>TIETO</b>
                <span>NIEKKA</span>
              </a>
              <p className="tn-es-foot-desc">Suomalainen tietovisasivusto. Uusia tietovisoja jatkuvasti.</p>
              <div className="tn-es-foot-h">Seuraa Tietoniekkaa somessa</div>
              <a className="tn-es-foot-ig" href={FOOTER_INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Tietoniekka Instagramissa">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" />
                </svg>
                Instagram
              </a>
            </div>
            <nav className="tn-es-foot-col" aria-label="Kokoelmat">
              <div className="tn-es-foot-h">Kokoelmat</div>
              {FOOTER_COLLECTIONS.map((c) => <a key={c.href} href={c.href}>{c.label}</a>)}
            </nav>
            <nav className="tn-es-foot-col" aria-label="Pelimuodot">
              <div className="tn-es-foot-h">Pelimuodot</div>
              {FOOTER_MODES.map((m) => <a key={m.href} href={m.href}>{m.label}</a>)}
            </nav>
            <nav className="tn-es-foot-col" aria-label="Tietoniekka">
              <div className="tn-es-foot-h">Tietoniekka</div>
              {FOOTER_SITE.map((m) => <a key={m.href} href={m.href}>{m.label}</a>)}
            </nav>
          </div>
          <div className="tn-es-foot-base">
            <span>© {today.getFullYear()} Tietoniekka</span>
            <span>Tehty Suomessa</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
