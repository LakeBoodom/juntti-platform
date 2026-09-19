// TIETONIEKKA 2.0 — ETUSIVU 2026 PROD (design_handoff_etusivu_2026_prod, toteutettu
// 28.8.2026 — korvasi 18.8. version kokonaan; Heikki: "uusi design korvaa nykyisen
// 2.0 työhaaran"). Rakenne ylhäältä alas:
//   ylätunniste (TopBar layoutista: tagline, nostot, Päivän putki) → kategoriarivi →
//   Kuvavisat-banneri (18.9.2026, korvasi lippuvisa-heron ja viikkovisapromon)
//   → Suositut kokoelmat (6) → Kuka on vanhin? -banneri → Laura ja Mikko (profiilit + 4 korttia)
//   → Päivän visa + Päivän sankari (19.9.2026) → Uusimmat visat -ticker → footer.
// Poistuneet: Laura & Mikko -duohero, upotettu ensimmäinen kysymys, putkinauha,
// viisi täysleveää nostoa, historia-aikajana.
// Kuori staattinen (lib/etusivu.ts), Päivän visa ja ticker dynaamisia kannasta.
// Sivu käyttää container-kyselyitä (.tn20 on inline-size-container → cqw).

import { getSupabase, SITE_SLUG } from "@/lib/supabase";
import { resolveCollection } from "@/lib/visanKokoelma";
import { helsinginPaiva } from "@/lib/aika";
import PaivanVisaCard from "@/components/tn20/PaivanVisaCard";
import { paivanVisaTila, type PaivanVisaData } from "@/lib/paivanVisa";
import PaivanSankari from "@/components/tn20/PaivanSankari";
import { muotoileSankari, type SankariRivi } from "@/lib/paivanSankari";
import { KuvavisatBanneri, IkajarjestysBanneri } from "@/components/tn20/EtusivunBannerit";
import { getViikkovisa } from "@/lib/kuvavisat2026";
import { getKuvavisaYhteenveto, getBanneriHenkilot } from "@/lib/etusivunBannerit";
import {
  CATEGORY_CHIPS, POPULAR_COLLECTIONS, HOSTS, HOSTS_INTRO,
} from "@/lib/etusivu";
import "./etusivu.css";
import "./etusivun-bannerit.css";

export const dynamic = "force-dynamic";

type Card = {
  id: string; slug: string; custom_slug: string | null; title: string;
  display_title: string | null; collection: string | null; play_count: number;
  published_at: string | null; game_mode?: string | null; teaser?: string | null;
  question_count?: number | null; category?: string | null; genre?: string | null;
};

/** paivan_visa_tanaan()-funktion rivi (supabase/migrations/20260919_paivan_visa_funktiot.sql) */
type PaivanVisaRivi = {
  rule_id: string; quiz_id: string; paiva: string;
  intro_headline: string | null; intro_text: string | null;
  auto_filled: boolean; vaihdettu: boolean;
};

type PaivanVisaQuiz = {
  id: string; slug: string | null; title: string; display_title: string | null;
  teaser: string | null; description: string | null;
  collection: string | null; category: string | null; genre: string | null;
  hero_image: string | null; hero_focal_x: number | string | null;
  hero_focal_y: number | string | null; hero_alt: string | null;
};

/* Esikatselu (vain preview/kehitys, ei tuotannossa): ?pv=A|B|C näyttää
   Päivän visan kyseisessä tilassa mallitekstillä ja ?sankari=YYYY-MM-DD
   päivän sankarin toiselta päivältä (esim. 2027-06-23 = muistopäivä). */
const ESIKATSELU = process.env.VERCEL_ENV !== "production";
const MALLI_INTRO = {
  headline: "Kahdeksankymmentä merkkiä pitkä koukkuotsikko täyttää rivin aivan reunaan asti",
  text: "Kahdensadanneljänkymmenen merkin mittainen koukkuteksti vie laatasta kolme riviä työpöydällä ja näyttää tarkalleen kuinka korkeaksi laatta kasvaa silloin kun toimitus käyttää koko sallitun tilan viimeistä merkkiä myöten loppuun.",
};

/* Wikimedian thumb-osoitteessa leveys on polussa; 1280 on suurin toimiva porras. */
const wikiThumb = (url: string, width: number) =>
  /\/thumb\//.test(url) ? url.replace(/\/(\d+)px-/, `/${width}px-`) : url;

const pos = (x: number | string | null, y: number | string | null, dx: number, dy: number) => {
  const n = (v: number | string | null, d: number) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));
  return `${Math.round(n(x, dx) * 100)}% ${Math.round(n(y, dy) * 100)}%`;
};

async function getData(opts: { pvTila: string | null; sankariPaiva: string | null }) {
  const sb = getSupabase();
  if (!sb) return null;

  const [cardsRes, siteRes] = await Promise.all([
    sb.from("quiz_cards" as never).select("*"),
    sb.from("sites").select("id").eq("slug", SITE_SLUG).maybeSingle(),
  ]);
  const cards = (cardsRes.data ?? []) as Card[];
  const siteId = (siteRes.data as { id: string } | null)?.id ?? null;
  /* Kaikki "tänään"-logiikka Suomen aikaan (lib/aika.ts, kanta: helsinki_tanaan()). */
  const today = helsinginPaiva();

  /* ── Päivän visa + Päivän sankari (toteutusohje 19.9.2026) ──
     Molemmat ratkaistaan kannassa: paivan_visa_tanaan() palauttaa päivän
     ajastetun rivin tai täyttää sen automaattisesti (idempotentti, sama visa
     kaikille); paivan_sankari() johtaa sankarin syntymäpäivästä. Sama visa ei
     näy kahdesti — funktio vaihtaa Päivän visan, jos se osuisi sankarin visaan. */
  let pv: PaivanVisaRivi | null = null;
  let sankari: SankariRivi | null = null;
  if (siteId) {
    const [pvRes, sRes] = await Promise.all([
      sb.rpc("paivan_visa_tanaan" as never, { p_site: siteId } as never),
      sb.rpc("paivan_sankari" as never, { p_site: siteId, p_date: opts.sankariPaiva ?? today.iso } as never),
    ]);
    pv = ((pvRes.data ?? []) as PaivanVisaRivi[])[0] ?? null;
    sankari = ((sRes.data ?? []) as SankariRivi[])[0] ?? null;
  }

  let daily: PaivanVisaData | null = null;
  if (pv?.quiz_id) {
    const { data: q } = await sb
      .from("quizzes")
      .select("id, slug, title, display_title, teaser, description, collection, category, genre, hero_image, hero_focal_x, hero_focal_y, hero_alt" as never)
      .eq("id", pv.quiz_id)
      .maybeSingle();
    const quiz = q as PaivanVisaQuiz | null;
    if (quiz) {
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
      const tila = ESIKATSELU ? opts.pvTila : null;
      const intro =
        tila === "A" ? MALLI_INTRO
        : tila === "C" ? { headline: null, text: MALLI_INTRO.text }
        : tila === "B" ? null
        : pv.intro_headline || pv.intro_text ? { headline: pv.intro_headline, text: pv.intro_text }
        : null;
      daily = {
        badge: { label: kokoelma.label, href: kokoelma.hub },
        title: quiz.display_title ?? quiz.title,
        meta: (() => {
          const n = cards.find((c) => c.id === quiz.id)?.question_count;
          return n ? `${n} kysymystä` : null;
        })(),
        lede: quiz.teaser?.trim() || quiz.description?.trim() || null,
        intro,
        stamp: `Tänään ${today.pv}.${today.kk}.`,
        imageUrl,
        imagePos: pos(quiz.hero_focal_x, quiz.hero_focal_y, 0.5, isPerson ? 0.15 : 0.4),
        imageAlt: quiz.hero_alt ?? "",
        playHref: `/peli?quiz_id=${quiz.id}&paivan_visa=1`,
        playedHref: kokoelma.hub,
      };
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

  return {
    daily,
    sankari: sankari ? muotoileSankari(sankari) : null,
    today,
    latest,
  };
}

export default async function Etusivu20({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : null);
  const sankariParam = ESIKATSELU ? one("sankari") : null;
  const [data, vv, kvYhteenveto, henkilot] = await Promise.all([
    getData({
      pvTila: one("pv"),
      sankariPaiva: sankariParam && /^\d{4}-\d{2}-\d{2}$/.test(sankariParam) ? sankariParam : null,
    }),
    getViikkovisa(), getKuvavisaYhteenveto(), getBanneriHenkilot(),
  ]);
  if (!data) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  /* Viikkovisa näkyy nyt Kuvavisat-bannerin merkkinä (kierros 12);
     null (ei aktiivisia kuvia) → merkki jää pois. */
  const viikko = vv ? { viikko: vv.viikko, kuvia: vv.kuvaIdt.length } : null;
  const { daily, sankari, today, latest } = data;


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
            {/* Tilassa B päiväleima on otsikkorivillä; A/C:ssä koukkulaatassa. */}
            {(!daily || paivanVisaTila(daily) === "B") && (
              <span className="tn-es-date">Tänään {today.pv}.{today.kk}.</span>
            )}
          </div>
          {daily ? <PaivanVisaCard data={daily} /> : <div className="tn-es-pv tn-es-pv--empty">Päivän visa palaa huomenna.</div>}
          {/* Päivän sankari: vakiopaikka Päivän visan alla; ei sankaria → ei lohkoa. */}
          {sankari && <PaivanSankari data={sankari} />}
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
