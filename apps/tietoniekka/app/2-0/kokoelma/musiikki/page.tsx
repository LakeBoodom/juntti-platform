// TIETONIEKKA 2.0 — MUSIIKKI: teemasivun uusi design (CD "TN Musiikki
// -teemasivu" 19.8.2026, design_handoff_musiikki/README.md). Korvaa
// geneerisen hub-templaten ([collection]/page.tsx) tälle kokoelmalle —
// staattinen segmentti ohittaa dynaamisen reitin, sama malli kuin TV:llä.
//
// Rakenteellisesti IDENTTINEN TV & Suoratoisto -sivun kanssa (README: "sama
// komponentti eri datalla ilman rakenteellisia poikkeuksia") — erot ovat
// konfiguraatiota: violetti #A24BFF/#C68BFF (.tne-mus), 6 aihepiiriä,
// oma herokuva (70% 50%). Poimitut TOISTUVAT aihepiireissä (Heikki 19.8. —
// sama sääntö kuin TV:llä). Kolme festarivisaa (Blockfest, Euroviisut,
// Weekend Festival) EI näy sivulla (Heikin päätös 19.8. — design on totuus).
// Tietoisia poisjättöjä: ei vaikeustasoja, putkea, kysymysmääriä,
// genremerkintöjä korteissa, ei suosituin/trendaa, ei poimintaselitettä.

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import Crumbs from "@/components/tn20/Crumbs";
import {
  MUSIIKKI_HERO, MUSIIKKI_HERO_POSITION, musiikkiIntro, MUSIIKKI_BADGE,
  MUSIIKKI_FEATURED, MUSIIKKI_SECTIONS, musiikkiImg,
} from "@/lib/musiikki";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("musiikki");
  const title = pc?.seo_title ?? "Musiikki ja artistit — tietovisat";
  const description =
    pc?.seo_description ??
    "Artistivisat suomirapista stadionien supertähtiin — testaa kuinka tarkasti kuuntelet.";
  const canonical = `${SITE_URL}/2-0/kokoelma/musiikki`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type Card = {
  id: string; slug: string | null; custom_slug: string | null;
  title: string; display_title: string | null; teaser: string | null;
  question_count: number; published_at: string | null;
};

const playHref = (c: Card) =>
  c.custom_slug || c.slug ? `/2-0/peli?visa=${c.custom_slug ?? c.slug}` : `/2-0/peli?quiz_id=${c.id}`;

const cardName = (c: Card) => c.display_title ?? c.title;

export default async function MusiikkiLanding() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const [cardsRes, pc] = await Promise.all([
    sb.from("quiz_cards" as never)
      .select("id, slug, custom_slug, title, display_title, teaser, question_count, published_at")
      .eq("collection", "musiikki")
      .order("published_at", { ascending: false }),
    getPageContent("musiikki"),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as Card[];
  const bySlug = new Map(cards.map((c) => [c.slug ?? "", c]));

  // "Tietoniekka suosittelee" — täsmälleen 3. Poimitut TOISTUVAT aihepiireissä
  // (Heikin päätös 19.8.) — ruudukkoa EI suodateta featured-slugeilla.
  const featured = MUSIIKKI_FEATURED
    .map((f) => ({ ...f, card: bySlug.get(f.slug) }))
    .filter((f): f is typeof f & { card: Card } => Boolean(f.card));

  const sections = MUSIIKKI_SECTIONS.map((section) => ({
    ...section,
    cards: section.quizzes
      .map((q) => {
        const card = bySlug.get(q.slug);
        return card ? { card, hook: q.hook } : null;
      })
      .filter((x): x is { card: Card; hook: string } => Boolean(x)),
  })).filter((s) => s.cards.length > 0);
  const sectionCount = sections.length;
  // Sivun visamäärä = kuratoitujen osioiden uniikit visat (36) — EI koko
  // kokoelman rivimäärä, koska festarivisat eivät ole sivulla (Heikki 19.8.).
  const count = new Set(sections.flatMap((s) => s.cards.map(({ card }) => card.id))).size;

  const article = pc?.learn ? (
    <LearnArticle learn={pc.learn} fallbackTitle="Musiikki" accent="#A24BFF" />
  ) : null;

  return (
    <main className="tnk tne-mus" style={{ minHeight: "100dvh", paddingBottom: 60 }}>
      {/* Murupolkurivi palkin alla (nav-speksi 17.8.2026) */}
      <Crumbs items={[{ label: "Kokoelmat", href: "/2-0/kokoelmat" }, { label: "Musiikki" }]} />
      <div className="tn-shell" style={{ paddingTop: "clamp(14px,2vw,26px)" }}>
        {/* ─── Hero ─── */}
        <section className="tne-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="tne-hero-img"
            src={MUSIIKKI_HERO}
            alt=""
            style={{ objectPosition: MUSIIKKI_HERO_POSITION }}
          />
          <div className="tne-hero-body">
            {/* Kaksirivinen otsikko on typografinen ratkaisu (README §Hero) */}
            <h1 className="tne-title">
              Musiikki ja<b>Artistit</b>
            </h1>
            <p className="tne-lede">{musiikkiIntro(count)}</p>
            <div className="tne-pills">
              <span className="tne-pill" data-accent>{count} visaa</span>
              <span className="tne-pill">{sectionCount} lajityyppiä</span>
              <span className="tne-pill">{MUSIIKKI_BADGE}</span>
            </div>
          </div>
        </section>

        {/* ─── Tietoniekka suosittelee — EI selitekappaletta ─── */}
        {featured.length > 0 && (
          <section className="tne-section">
            <div className="tne-section-head">
              <div>
                <div className="tne-eyebrow"><i aria-hidden />Poiminnat</div>
                <h2>Tietoniekka suosittelee</h2>
              </div>
            </div>
            <div className="tne-feat-grid">
              {featured.map((f, i) => {
                const img = musiikkiImg(f.card.slug);
                return (
                  <a key={f.card.id} className="tne-feat" href={playHref(f.card)}>
                    <span className="tne-feat-media" data-noimg={img ? undefined : true}
                      style={img ? undefined : ({ ["--tne-fallback-accent" as string]: f.rankColor })}>
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={cardName(f.card)} />
                      )}
                      <span className="tne-feat-rank" style={{ color: f.rankColor }} aria-hidden>
                        {i + 1}
                      </span>
                      <h3 className="tne-feat-name">{cardName(f.card)}</h3>
                    </span>
                    <span className="tne-feat-body">
                      <p className="tne-feat-hook">{f.hook}</p>
                      <span className="tne-feat-cta">Pelaa visa →</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Aihepiirit 01–06 — kortit koukkuteksteillä ─── */}
        {sections.map((section) => (
          <section key={section.number} className="tne-section" style={{ ["--tne-accent" as string]: section.accent }}>
            <div className="tne-section-title-row">
              <span className="tne-section-num" aria-hidden>{section.number}</span>
              <h2 className="tne-section-title">{section.title}</h2>
              <span className="tne-section-count">{section.cards.length}</span>
            </div>
            <div className="tne-grid">
              {section.cards.map(({ card: c, hook }) => {
                const img = musiikkiImg(c.slug);
                return (
                  <a key={c.id} className="tne-card" href={playHref(c)} data-noimg={img ? undefined : true}>
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={cardName(c)} loading="lazy" />
                    )}
                    <span className="tne-card-text">
                      <h3 className="tne-card-name">{cardName(c)}</h3>
                      {hook && <span className="tne-card-hook">{hook}</span>}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        ))}

        {article}
      </div>

      {/* Alatunniste tulee layoutista (SiteFooter, QA-005 29.8.2026) */}
    </main>
  );
}
