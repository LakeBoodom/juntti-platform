// TIETONIEKKA 2.0 — ELOKUVAT: teemasivun uusi design (CD "TN Elokuvat
// -teemasivu" 15.8.2026, design_handoff_elokuvat/README.md). Korvaa
// geneerisen hub-templaten ([collection]/page.tsx) tälle kokoelmalle —
// staattinen segmentti ohittaa dynaamisen reitin Next.js:ssä, sama malli
// kuin Kulttuurilla ja Maantieteellä.
//
// Rakenne (README): Hero → "Tietoniekka suosittelee" (3 nostettua) → neljä
// numeroitua aihepiiriä (01–04). Tietoisia poisjättöjä: ei vaikeustasoja,
// pelimuotoja, putkea, "suosituin"/"trendaa"-merkintöjä, ei mega-visoja —
// älä lisää niitä takaisin.

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import Crumbs from "@/components/tn20/Crumbs";
import {
  ELOKUVAT_HERO, ELOKUVAT_FEATURED, ELOKUVAT_SECTIONS, elokuvatImg,
} from "@/lib/elokuvat";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("elokuvat");
  const title = pc?.seo_title ?? "Elokuvat — tietovisat valkokankaalta";
  const description =
    pc?.seo_description ??
    "Tietovisat blockbustereista, kotimaisista klassikoista ja elokuva-alan legendoista.";
  const canonical = `${SITE_URL}/2-0/kokoelma/elokuvat`;
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

export default async function ElokuvatLanding() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const [cardsRes, pc] = await Promise.all([
    sb.from("quiz_cards" as never)
      .select("id, slug, custom_slug, title, display_title, teaser, question_count, published_at")
      .eq("collection", "elokuvat")
      .order("published_at", { ascending: false }),
    getPageContent("elokuvat"),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as Card[];
  const bySlug = new Map(cards.map((c) => [c.slug ?? "", c]));
  const count = cards.length;
  const sectionCount = ELOKUVAT_SECTIONS.filter((s) => s.slugs.length > 0).length;

  // "Tietoniekka suosittelee" — täsmälleen 3, poimitut eivät toistu aihepiireissä.
  const featured = ELOKUVAT_FEATURED
    .map((f) => ({ ...f, card: bySlug.get(f.slug) }))
    .filter((f): f is typeof f & { card: Card } => Boolean(f.card));
  const featuredSlugs = new Set(featured.map((f) => f.slug));

  const article = pc?.learn ? (
    <LearnArticle learn={pc.learn} fallbackTitle="Elokuvat" accent="#FF5C3D" />
  ) : null;

  return (
    <main className="tnk" style={{ minHeight: "100dvh", paddingBottom: 60 }}>
      {/* Murupolkurivi palkin alla (nav-speksi 17.8.2026) — korvasi heron inline-navin */}
      <Crumbs items={[{ label: "Kokoelmat", href: "/2-0/kokoelmat" }, { label: "Elokuvat" }]} />
      <div className="tn-shell" style={{ paddingTop: "clamp(14px,2vw,26px)" }}>
        {/* ─── Hero ─── */}
        <section className="tne-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tne-hero-img" src={ELOKUVAT_HERO} alt="" />
          <div className="tne-hero-body">
            <h1 className="tne-title">
              Elo<b>kuvat</b>
            </h1>
            <p className="tne-lede">
              Tietovisat valkokankaalta: blockbusterit, kotimaiset klassikot ja ne joita ei myönnetä katsotuiksi.
            </p>
            <div className="tne-pills">
              <span className="tne-pill" data-accent>{count} visaa</span>
              <span className="tne-pill">{sectionCount} aihepiiriä</span>
              <span className="tne-pill">Uusia joka viikko</span>
            </div>
          </div>
        </section>

        {/* ─── Tietoniekka suosittelee ─── */}
        {featured.length > 0 && (
          <section className="tne-section">
            <div className="tne-section-head">
              <div>
                <div className="tne-eyebrow"><i aria-hidden />Poiminnat</div>
                <h2>Tietoniekka suosittelee</h2>
              </div>
              <p className="tne-section-desc">Kolme visaa joilla aloittaa — poimittu tällä viikolla.</p>
            </div>
            <div className="tne-feat-grid">
              {featured.map((f, i) => {
                const img = elokuvatImg(f.card.slug);
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

        {/* ─── Aihepiirit 01–04 ─── */}
        {ELOKUVAT_SECTIONS.map((section) => {
          const sectionCards = section.slugs
            .filter((slug) => !featuredSlugs.has(slug))
            .map((slug) => bySlug.get(slug))
            .filter((c): c is Card => Boolean(c));
          if (sectionCards.length === 0) return null;
          return (
            <section key={section.number} className="tne-section" style={{ ["--tne-accent" as string]: section.accent }}>
              <div className="tne-section-title-row">
                <span className="tne-section-num" aria-hidden>{section.number}</span>
                <h2 className="tne-section-title">{section.title}</h2>
                <span className="tne-section-count">{sectionCards.length} visaa</span>
              </div>
              <div className="tne-grid">
                {sectionCards.map((c) => {
                  const img = elokuvatImg(c.slug);
                  return (
                    <a key={c.id} className="tne-card" href={playHref(c)} data-noimg={img ? undefined : true}>
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={cardName(c)} loading="lazy" />
                      )}
                      <h3 className="tne-card-name">{cardName(c)}</h3>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}

        {article}
      </div>

      <footer className="tne-footer" style={{ borderTop: "1px solid #241E13", marginTop: "clamp(30px,4.6cqw,72px)" }}>
        <div className="tn-shell" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, paddingTop: 18, paddingBottom: 22, color: "#5F594C", fontWeight: 600, fontSize: 13 }}>
          <span>Elokuvat-kokoelma</span>
          <span>
            <a href="/2-0" style={{ color: "inherit", textDecoration: "none" }}>Etusivu</a>
            {"  ·  "}
            <a href="/tietosuoja" style={{ color: "inherit", textDecoration: "none" }}>Tietosuoja</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
