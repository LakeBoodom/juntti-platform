// TIETONIEKKA 2.0 — JÄÄKIEKKO: teemasivu (CD "TN Jaakiekko -teemasivu"
// 22.8.2026, design_handoff_jaakiekko/README.md). Kahdeksas teemasivu ja
// ensimmäinen jossa on interaktiivinen komponentti (Suomi-kaukalokartta).
// Staattinen segmentti — EI korvaa urheiluhubia: jääkiekkovisat näkyvät
// jatkossakin myös urheilukokoelmassa (README luku 6, Heikin linjaus 17.8.).
//
// Rakenne: hero (kausitilamerkki + scoreboard-navi) → 1. erä (kartta 17
// seuraa + seurakortti + paitaseinä) → Derbyvisat (3) → Jatkoerä: Liigan
// kohokohdat (5, tummempi vyö) → 2. erä: Leijonien kultavisat (9) →
// 3. erä: Suomen NHL historia (3). Yhteensä 37 korttipaikkaa.
//
// Julkaisematon sisältö (README luku 3): kortin tila määräytyy siitä,
// löytyykö slugia vastaava JULKAISTU visa (quiz_cards = status published).
// Kartta + paitaseinä näyttävät aina kaikki 17; ruudukot "Tulossa"-tilassa,
// julkaistut ensin. Tietoiset poisjätöt: ei vaikeustasoja, putkea,
// kysymysmääriä korteissa, suosituin/trendaa-merkintöjä, taulukkonäkymää
// eikä seurakortin tilastoruudukkoa.
// Kaikki korttien faktaväittämät ovat CD:n designcopya — tarkistetaan
// copy/SEO-passissa (README luku 4); kausisidonnaiset tekstit lib-configissa.

import "../../jaakiekko.css";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import Crumbs from "@/components/tn20/Crumbs";
import KiekkoKartta, { type KarttaTeam } from "@/components/tn20/KiekkoKartta";
import {
  JK_KAUSI, JK_HERO, JK_PERIODS, JK_COPY, JK_TEAMS,
  JK_DERBIES, JK_GENERAL, JK_LIONS, JK_NHL, type JkCard,
} from "@/lib/jaakiekko";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("jaakiekko");
  const title = pc?.seo_title ?? "Jääkiekko — Liiga, Leijonat ja NHL tietovisoina";
  const description =
    pc?.seo_description ??
    "Kaikki jääkiekosta: Liigan seuravisat Suomi-kartalla, Leijonien kultavuodet ja suomalaisten NHL-historia.";
  const canonical = `${SITE_URL}/2-0/kokoelma/jaakiekko`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type Row = { slug: string; custom_slug: string | null; published_at: string | null };

const hrefFor = (r: Row | undefined) =>
  r ? `/2-0/peli?visa=${r.custom_slug ?? r.slug}` : null;

/** Ruudukon kortti: julkaistut ensin, Tulossa perään — kummankin sisällä
    README:n listausjärjestys (README luku 3: älä sekoita keskenään). */
function orderCards(cards: Array<JkCard & { playHref: string | null }>) {
  return [...cards.filter((c) => c.playHref), ...cards.filter((c) => !c.playHref)];
}

function CardGrid({
  cards,
  size,
  variant,
}: {
  cards: Array<JkCard & { playHref: string | null }>;
  size: "l" | "s";
  /** "general" = Liigan kohokohdat: 6 korttia jaetaan kahdelle riville
      desktopissa sen sijaan että auto-fill jättäisi 6. kortin yksin
      omalle, koko leveyteen venytetylle rivilleen (Heikin katselmus 24.8.). */
  variant?: "general";
}) {
  return (
    <div className="tnj-grid" data-size={size} data-variant={variant}>
      {cards.map((c) => {
        const inner = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt={c.title} loading="lazy" />
            <span className="tnj-card-tag">{c.playHref ? c.tag : "Tulossa"}</span>
            <span className="tnj-card-text">
              <span className="tnj-card-title">{c.title}</span>
              {c.desc && <span className="tnj-card-desc">{c.desc}</span>}
            </span>
          </>
        );
        const style = { ["--tnj-accent" as string]: c.accent, color: c.accent };
        return c.playHref ? (
          <a key={c.title} className="tnj-card" href={c.playHref} data-bar={c.bar || undefined} style={style}>
            {inner}
          </a>
        ) : (
          <div key={c.title} className="tnj-card" data-tulossa data-bar={c.bar || undefined} style={style}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export default async function JaakiekkoLanding() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  // Kaikki sivun korttien slugit yhdellä kyselyllä — vain julkaistut palautuvat
  const allSlugs = [
    ...JK_TEAMS.map((t) => t.quizSlug),
    ...[...JK_DERBIES, ...JK_GENERAL, ...JK_LIONS, ...JK_NHL].map((c) => c.quizSlug),
  ].filter((s): s is string => Boolean(s));

  const { data } = await sb
    .from("quiz_cards" as never)
    .select("slug, custom_slug, published_at")
    .in("slug", allSlugs)
    .not("published_at", "is", null);
  const bySlug = new Map(((data ?? []) as unknown as Row[]).map((r) => [r.slug, r]));

  const teams: KarttaTeam[] = JK_TEAMS.map((t) => ({
    ...t,
    playHref: t.quizSlug ? hrefFor(bySlug.get(t.quizSlug)) : null,
  }));
  const withHref = (cards: JkCard[]) =>
    orderCards(cards.map((c) => ({ ...c, playHref: c.quizSlug ? hrefFor(bySlug.get(c.quizSlug)) : null })));

  const derbies = withHref(JK_DERBIES);
  const general = withHref(JK_GENERAL);
  const lions = withHref(JK_LIONS);
  const nhl = withHref(JK_NHL);

  return (
    <main className="tnk" style={{ minHeight: "100dvh", paddingBottom: 60 }}>
      {/* Sivuston vakiomurupolku (README avoin kohta 2: Etusivu-taso mukaan) */}
      <Crumbs
        items={[
          { label: "Kokoelmat", href: "/2-0/kokoelmat" },
          { label: "Urheilu", href: "/2-0/kokoelma/urheilu" },
          { label: "Jääkiekko" },
        ]}
      />
      <div className="tn-shell" style={{ paddingTop: "clamp(14px,2vw,26px)" }}>
        {/* ─── Hero + scoreboard ─── */}
        <section className="tnj-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tnj-hero-img" src={JK_HERO.img} alt="" />
          <div className="tnj-hero-body">
            <span className="tnj-status">
              <i aria-hidden />
              {JK_KAUSI.statusPill}
            </span>
            <h1 className="tnj-title">
              {JK_HERO.titleLines[0]}
              <b>{JK_HERO.titleLines[1]}</b>
            </h1>
            <p className="tnj-lede">{JK_HERO.intro}</p>
          </div>
        </section>
        <nav className="tnj-score" aria-label="Sivun osiot">
          {JK_PERIODS.map((p) => (
            <a key={p.href} href={p.href}>
              <span className="tnj-score-kicker">{p.kicker}</span>
              <span className="tnj-score-title">{p.title}</span>
              <span className="tnj-score-meta">{p.meta}</span>
            </a>
          ))}
        </nav>

        {/* ─── 1. erä — seuravisat ─── */}
        <section className="tnj-section" id="liiga">
          <div className="tnj-kickrow">
            <span className="tnj-kicker">1. erä</span>
            <i aria-hidden />
          </div>
          <div className="tnj-headrow">
            <h2 className="tnj-h2">{JK_COPY.liigaTitle}</h2>
            <p className="tnj-intro">{JK_COPY.liigaIntro}</p>
          </div>
          <KiekkoKartta
            teams={teams}
            defaultTeamId={JK_KAUSI.defaultTeamId}
            footnote={JK_COPY.mapFootnote(teams.length)}
          />
        </section>

        {/* ─── Derbyvisat ─── */}
        <section className="tnj-section">
          <div className="tnj-kickrow">
            <span className="tnj-kicker">{JK_COPY.derbyTitle}</span>
            <i aria-hidden />
          </div>
          <CardGrid cards={derbies} size="l" />
        </section>
      </div>

      {/* ─── Jatkoerä — Liigan kohokohdat (tummempi vyö) ─── */}
      <div className="tnj-belt">
        <div className="tn-shell">
          <section className="tnj-section">
            <div className="tnj-kickrow">
              <span className="tnj-kicker">{JK_COPY.generalKicker}</span>
              <i aria-hidden />
            </div>
            <div className="tnj-headrow">
              <h2 className="tnj-h2">{JK_COPY.generalTitle}</h2>
              <p className="tnj-intro">{JK_COPY.generalIntro}</p>
            </div>
            <div className="tnj-general-wrap">
              <CardGrid cards={general} size="s" variant="general" />
            </div>
          </section>
        </div>
      </div>

      <div className="tn-shell">
        {/* ─── 2. erä — Leijonat ─── */}
        <section className="tnj-section" id="leijonat">
          <div className="tnj-kickrow">
            <span className="tnj-kicker">2. erä</span>
            <i aria-hidden />
          </div>
          <div className="tnj-headrow">
            <h2 className="tnj-h2">{JK_COPY.lionsTitle}</h2>
            <p className="tnj-intro">{JK_COPY.lionsIntro}</p>
          </div>
          <CardGrid cards={lions} size="s" />
        </section>

        {/* ─── 3. erä — NHL ─── */}
        <section className="tnj-section" id="nhl">
          <div className="tnj-kickrow">
            <span className="tnj-kicker">3. erä</span>
            <i aria-hidden />
          </div>
          <div className="tnj-headrow">
            <h2 className="tnj-h2">{JK_COPY.nhlTitle}</h2>
            <p className="tnj-intro">{JK_COPY.nhlIntro}</p>
          </div>
          <CardGrid cards={nhl} size="l" />
        </section>
      </div>

      {/* Alatunniste tulee layoutista (SiteFooter, QA-005 29.8.2026) */}
    </main>
  );
}
