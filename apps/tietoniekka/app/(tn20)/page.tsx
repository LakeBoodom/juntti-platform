// TIETONIEKKA 2.0 — ETUSIVU 2026 PROD (design_handoff_etusivu_2026_prod, toteutettu
// 28.8.2026 — korvasi 18.8. version kokonaan; Heikki: "uusi design korvaa nykyisen
// 2.0 työhaaran"). Rakenne ylhäältä alas:
//   ylätunniste (TopBar layoutista: tagline, nostot, Päivän putki) → kategoriarivi →
//   Kuvavisat-banneri (18.9.2026, korvasi lippuvisa-heron ja viikkovisapromon)
//   → Suositut kokoelmat (6) → Kuka on vanhin? -banneri → Laura ja Mikko (profiilit + 4 korttia)
//   → Päivän visa → Uusimmat visat -ticker → footer.
// Poistuneet: Laura & Mikko -duohero, upotettu ensimmäinen kysymys, putkinauha,
// viisi täysleveää nostoa, historia-aikajana.
// Kuori staattinen (lib/etusivu.ts), Päivän visa ja ticker dynaamisia kannasta.
// Sivu käyttää container-kyselyitä (.tn20 on inline-size-container → cqw).

import { getSupabase, SITE_SLUG } from "@/lib/supabase";
import { resolveCollection } from "@/lib/visanKokoelma";
import { KAUPUNGIT, kaupunkiImg } from "@/lib/kaupungit";
import { helsinginPaiva, pvmOsat } from "@/lib/aika";
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
import { KuvavisatBanneri, IkajarjestysBanneri } from "@/components/tn20/EtusivunBannerit";
import { getViikkovisa } from "@/lib/kuvavisat2026";
import { getKuvavisaYhteenveto, getBanneriHenkilot } from "@/lib/etusivunBannerit";
import {
  CATEGORY_CHIPS, POPULAR_COLLECTIONS, HOSTS, HOSTS_INTRO,
} from "@/lib/etusivu";
import "./etusivu.css";
import "./etusivun-bannerit.css";

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

/* ── Päivän visan kuva (bugi A, 19.9.2026) ─────────────────────────────
   Aiemmin kuva haettiin vain teemakokoelmien topicImg-dispatcherista, joten
   kaupunki-, yleistieto- ja megavisoille kortti näytti designin paikkamerkin
   "Kuva — päivänsankari". Nyt visan oma kuva aina ensin, visatyypistä
   riippumatta; null → brändipinta ilman tekstiä. */
const KOKOELMAKUVA: Record<string, string> = {
  elokuvat: "/20/etusivu/coll-elokuvat.webp",
  kaupungit: "/20/etusivu/coll-kaupungit.webp",
  matkakohteet: "/20/etusivu/coll-maantieto.webp",
  megavisat: "/20/etusivu/coll-megavisat.webp",
};
/* resolveCollection antaa kokoelmattomille (yleistieto) juontajakuvan — se ei
   kerro visan aiheesta mitään, joten sitä ei käytetä Päivän visan kuvana. */
const GENEERINEN_BG = "/20/hero-mikko-laura.webp";

function paivanVisanKuva(
  q: { id: string; slug: string | null; collection?: string | null; category?: string | null; genre?: string | null },
  quizImage: string | null,
  celebImage: string | null,
): { src: string; pos: string } | null {
  if (quizImage) return { src: quizImage, pos: "50% 40%" };          // 1. quizzes.image_url
  if (celebImage) return { src: celebImage, pos: "50% 30%" };        // 2. synttäri-/henkilövisa
  const topic = topicImgFor(q.collection, q.slug);                   // 3a. visan teemakuva
  if (topic) return { src: topic, pos: "50% 46%" };
  const kokoelma = resolveCollection({ collection: q.collection ?? null, category: q.category ?? null, genre: q.genre ?? null });
  if (kokoelma.key === "kaupungit") {                                // 3b. kaupungin oma kuva
    const k = KAUPUNGIT.find((c) => c.quizSlug === q.slug);
    if (k) return { src: kaupunkiImg(k.id), pos: "50% 50%" };
  }
  const coll = KOKOELMAKUVA[kokoelma.key];                           // 3c. kokoelman kuva
  if (coll) return { src: coll, pos: "50% 50%" };
  if (kokoelma.bg && kokoelma.bg !== GENEERINEN_BG) return { src: kokoelma.bg, pos: "50% 40%" };
  return null;                                                       // 4. brändipinta
}

/** quizzes.image_url (ei ole quiz_cards-näkymässä). Tyhjä useimmilla visoilla
    19.9.2026 — kun kenttä täytetään, se voittaa kaikki päätellyt kuvat. */
async function getQuizImageUrl(id: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("quizzes").select("image_url" as never).eq("id", id).maybeSingle();
  const url = (data as { image_url?: string | null } | null)?.image_url ?? null;
  return url && url.trim() ? url : null;
}

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
  question_count?: number | null; category?: string | null; genre?: string | null;
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
  /* Suomen aika (19.9.2026): aiemmin new Date() palvelimella = UTC, jolloin
     Päivän visa ja päivänsankari vaihtuivat klo 3 (kesäaika) / 2 (talviaika). */
  const today = helsinginPaiva();
  const key = (m: number, d: number) => m * 100 + d;
  const todayKey = key(today.kk, today.pv);
  const sorted = celebs
    .filter((c) => c.trivia_quiz_id)
    .map((c) => {
      const b = pvmOsat(c.birth_date);
      const k = key(b.kk, b.pv);
      return { c, dist: k >= todayKey ? k - todayKey : k + 1300 - todayKey };
    })
    .sort((a, b) => a.dist - b.dist);
  const hero = sorted[0] ?? null;

  // Päivän visa: manuaalinen valinta administa (schedule_rules). Fallback = sankari.
  type DayPick = { kind: "celeb"; celeb: Celeb; isToday: boolean } | { kind: "quiz"; card: Card } | null;
  let dayPick: DayPick = null;
  const todayIso = today.iso;
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
        const b = pvmOsat(celeb.birth_date);
        dayPick = { kind: "celeb", celeb, isToday: key(b.kk, b.pv) === todayKey };
      } else {
        const card = cards.find((c) => c.id === pickedId);
        if (card) dayPick = { kind: "quiz", card };
      }
    }
  }

  /* Ticker: uusimmat visat julkaisujärjestyksessä. Henkilövisat pois
     (Heikki 11.8.2026: tehdään varastoon). Pelimuototunnus vain Megalle. */
  /* QA-001 (29.8.2026): megat linkitetään ?mega=<slug> (kysymykset
     mega_questions-taulussa, ?quiz_id antoi tyhjän sivun). Yleistieto ei ole
     2.0:ssa omana kokoelmana (Heikki 3) → sen visoista mukana vain
     kaupunkivisat ja megat. */
  const latest = cards
    .filter((c) => c.collection && c.collection !== "tunnetut-henkilot" && c.published_at)
    .filter((c) => c.collection !== "yleistieto" || c.category === "kaupungit" || c.game_mode === "mega")
    .sort((a, b) => (b.published_at! > a.published_at! ? 1 : -1))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      name: (c.display_title ?? c.title) as string,
      mode: c.game_mode === "mega" ? "Megavisa" : undefined,
      href: c.game_mode === "mega" && c.slug ? `/peli?mega=${c.slug}` : `/peli?quiz_id=${c.id}`,
    }));

  return { hero, sankariIsToday: hero?.dist === 0, dayPick, today, latest, cards, celebs };
}

function age(birth: string, onNextBirthday: boolean) {
  const b = pvmOsat(birth);
  const t = helsinginPaiva();
  let a = t.vuosi - b.vuosi;
  const m = t.kk - b.kk;
  if (m < 0 || (m === 0 && t.pv < b.pv)) a--;
  return onNextBirthday ? a : a + 1;
}

const fiBirth = (iso: string) => {
  const b = pvmOsat(iso);
  return `${b.pv}.${b.kk}.${b.vuosi}`;
};

export default async function Etusivu20() {
  const [data, vv, kvYhteenveto, henkilot] = await Promise.all([
    getData(), getViikkovisa(), getKuvavisaYhteenveto(), getBanneriHenkilot(),
  ]);
  if (!data) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  /* Viikkovisa näkyy nyt Kuvavisat-bannerin merkkinä (kierros 12);
     null (ei aktiivisia kuvia) → merkki jää pois. */
  const viikko = vv ? { viikko: vv.viikko, kuvia: vv.kuvaIdt.length } : null;
  const { hero, sankariIsToday, dayPick, today, latest, cards, celebs } = data;

  /* Päivän visan sisältö: adminin valinta (visa tai sankari) tai synttärisankari.
     Heikin linjaus 19.9.2026: kortti ei oleta julkkista — merkki on aina visan
     kategoria (sama resolveri kuin pelisivulla) ja kuva visan oma. */
  let daily: PaivanVisaData | null = null;
  const celeb = dayPick?.kind === "celeb" ? dayPick.celeb : !dayPick ? hero?.c ?? null : null;
  const celebToday = dayPick?.kind === "celeb" ? dayPick.isToday : sankariIsToday;
  const dayQuizId = dayPick?.kind === "quiz" ? dayPick.card.id : celeb?.trivia_quiz_id ?? null;
  const dayCard = dayPick?.kind === "quiz" ? dayPick.card : dayQuizId ? cards.find((c) => c.id === dayQuizId) ?? null : null;
  const dayImageUrl = dayQuizId ? await getQuizImageUrl(dayQuizId) : null;

  if (dayPick?.kind === "quiz") {
    const c = dayPick.card;
    const kokoelma = resolveCollection({ collection: c.collection ?? null, category: c.category ?? null, genre: c.genre ?? null });
    const kuva = paivanVisanKuva(c, dayImageUrl, celebs.find((x) => x.trivia_quiz_id === c.id)?.image_url ?? null);
    daily = {
      badge: { label: kokoelma.label, href: kokoelma.hub },
      title: c.display_title ?? c.title,
      meta: c.question_count ? `${c.question_count} kysymystä` : null,
      lede: c.teaser ?? null,
      imageUrl: kuva?.src ?? null,
      imagePos: kuva?.pos,
      playHref: `/peli?quiz_id=${c.id}&paivan_visa=1`,
      /* Aiemmin /kokoelma/${collection} → kaupunkivisoilla /kokoelma/yleistieto (404). */
      playedHref: kokoelma.hub,
      playedCta: "Lisää visoja →",
    };
  } else if (celeb?.trivia_quiz_id) {
    const kokoelma = resolveCollection({
      collection: dayCard?.collection ?? "tunnetut-henkilot",
      category: dayCard?.category ?? null,
      genre: dayCard?.genre ?? null,
    });
    const b = pvmOsat(celeb.birth_date);
    const juhlii = celebToday ? "Tänään juhlii" : `Juhlii ${b.pv}.${b.kk}.`;
    const kuva = dayCard
      ? paivanVisanKuva(dayCard, dayImageUrl, celeb.image_url)
      : dayImageUrl || celeb.image_url ? { src: (dayImageUrl ?? celeb.image_url)!, pos: "50% 30%" } : null;
    daily = {
      badge: { label: kokoelma.label, href: kokoelma.hub },
      title: celebToday ? `${age(celeb.birth_date, true)} vuotta — ${celeb.name}` : celeb.name,
      meta: `${juhlii} · Syntynyt ${fiBirth(celeb.birth_date)}${celeb.role ? ` · ${celeb.role}` : ""}`,
      lede: "Kuinka hyvin tunnet päivänsankarin uran ja tunnetuimmat saavutukset?",
      imageUrl: kuva?.src ?? null,
      imagePos: kuva?.pos,
      playHref: `/peli?quiz_id=${celeb.trivia_quiz_id}&${dayPick ? "paivan_visa" : "paivan_sankari"}=1`,
      playedHref: kokoelma.hub,
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
        {/* ─── Kuvavisat-banneri (Design kierros 12A, 18.9.2026) ───
            Korvasi lippuvisa-heron ja sen alla olleen viikkovisapromon.
            Bannerin otsikko on etusivun h1. */}
        <KuvavisatBanneri yhteenveto={kvYhteenveto} viikko={viikko} />

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

        {/* ─── Kuka on vanhin? -banneri (Design kierros 12B) — ennen juontajia ─── */}
        <IkajarjestysBanneri henkilot={henkilot} />

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
            <span className="tn-es-date">Tänään {today.pv}.{today.kk}.</span>
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
    </main>
  );
}
