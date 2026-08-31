// TIETONIEKKA 2.0 — MAANTIETO: flagship-teemakokoelman landing
// (CD:n design "Tietoniekka - Maantieto" + Heikin kuvat, 15.8.2026).
// Kolmas flagship Kulttuurin ja Luonnon rinnalle. Kokoelma-arvo kannassa on
// 'matkakohteet' → URL /kokoelma/matkakohteet säilyy; staattinen
// segmentti ohittaa dynaamisen [collection]-reitin.
// Rakenne CD:n mukaan: hero (petrooli + teal, "Maailman ääriltä kotia
// kohti", kuva oikealla) → Tietoniekan poiminnat (3 vaakakorttia) →
// Lauran ja Mikon poiminta (Kanariansaaret) → Pelaa myös nämä -kuvaruudukko
// → footer. Designin header/Putki-pilleri jätetty pois — landingit ovat
// headerittömiä kuten Kulttuuri ja Luonto (murupolku hoitaa paluun).

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import Crumbs from "@/components/tn20/Crumbs";
import {
  MAANTIETO_HERO, MAANTIETO_LM, MAANTIETO_DESC, MAANTIETO_CURATED,
  MAANTIETO_GRID_ORDER, maantietoImg,
} from "@/lib/maantieto";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("matkakohteet");
  const title = pc?.seo_title ?? "Maantieto — Maailman ääriltä kotia kohti";
  const description =
    pc?.seo_description ??
    "Tietovisoja vuorista, meristä, joista, saarista ja kaupungeista — myös niistä, jotka luulet tuntevasi.";
  const canonical = `${SITE_URL}/kokoelma/matkakohteet`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type Card = {
  id: string; slug: string | null; custom_slug: string | null;
  title: string; display_title: string | null; teaser: string | null;
  question_count: number; badge: string | null; published_at: string | null;
};

const playHref = (c: Card) =>
  c.custom_slug || c.slug ? `/peli?visa=${c.custom_slug ?? c.slug}` : `/peli?quiz_id=${c.id}`;

const descFor = (c: Card) => MAANTIETO_DESC[c.slug ?? ""] ?? c.teaser ?? "";

export default async function MaantietoLanding() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const [cardsRes, pc] = await Promise.all([
    sb.from("quiz_cards" as never)
      .select("id, slug, custom_slug, title, display_title, teaser, question_count, badge, published_at")
      .eq("collection", "matkakohteet")
      .order("published_at", { ascending: false }),
    getPageContent("matkakohteet"),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as Card[];
  const count = cards.length;
  const questions = cards.reduce((s, c) => s + (c.question_count ?? 0), 0);

  const bySlug = new Map(cards.map((c) => [c.slug ?? "", c]));
  const poiminnat = MAANTIETO_CURATED.poiminnat.map((s) => bySlug.get(s)).filter(Boolean) as Card[];
  const lm = bySlug.get(MAANTIETO_CURATED.lm) ?? null;
  const ctaTarget = bySlug.get(MAANTIETO_CURATED.cta) ?? cards[0] ?? null;

  // Pelaa myös nämä: CD:n järjestys ensin, uudet (listalta puuttuvat) perään.
  const shownIds = new Set([...poiminnat.map((c) => c.id), ...(lm ? [lm.id] : [])]);
  const ordered = MAANTIETO_GRID_ORDER.map((s) => bySlug.get(s)).filter(Boolean) as Card[];
  const orderedIds = new Set(ordered.map((c) => c.id));
  const grid = [
    ...ordered.filter((c) => !shownIds.has(c.id)),
    ...cards.filter((c) => !orderedIds.has(c.id) && !shownIds.has(c.id)),
  ];

  const article = pc?.learn ? (
    <LearnArticle learn={pc.learn} fallbackTitle="Maantieto" accent="#46D6C8" />
  ) : null;

  return (
    <main className="tnt" style={{ minHeight: "100dvh" }}>
      {/* Murupolkurivi palkin alla (nav-speksi 17.8.2026) — korvasi heron inline-navin */}
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: "Maantieto" }]} />
      {/* ─── Hero: petrooli + teal, kuva oikealla (CD) ─── */}
      <section className="tnt-hero">
        <div className="tnt-hero-text">
          <span className="tnt-eyebrow">Teemakokoelma</span>
          <h1 className="tnt-title">
            <span>Maailman ääriltä</span>
            <br />
            kotia kohti
          </h1>
          <p className="tnt-lede">
            Tietovisoja vuorista, meristä, joista, saarista ja kaupungeista — myös
            niistä, jotka luulet tuntevasi.
          </p>
          {ctaTarget && (
            <a className="tnt-cta" href={playHref(ctaTarget)}>Aloita maailmanmatka</a>
          )}
          <div className="tnt-hero-chips">
            <span className="tnt-chip"><b>{count}</b> visaa</span>
            <span className="tnt-chip"><b>{questions}</b> kysymystä</span>
          </div>
        </div>
        <div className="tnt-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MAANTIETO_HERO} alt="" fetchPriority="high" />
        </div>
      </section>

      <div className="tn-shell">
        {/* ─── Tietoniekan poiminnat: 3 vaakakorttia (CD) ─── */}
        {poiminnat.length > 0 && (
          <section className="tnt-section">
            <h2 className="tnt-h2">Tietoniekan poiminnat</h2>
            <div className="tnt-picks">
              {poiminnat.map((c) => (
                <a key={c.id} className="tnt-pick" href={playHref(c)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={maantietoImg(c.slug) ?? MAANTIETO_HERO} alt="" loading="lazy" />
                  <span className="tnt-pick-body">
                    <span className="tnt-pick-title">{c.display_title ?? c.title}</span>
                    <span className="tnt-pick-desc">{descFor(c)}</span>
                    <span className="tnt-pick-arrow" aria-hidden="true">→</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ─── Lauran ja Mikon poiminta (CD: Kanariansaaret) ─── */}
        {lm && (
          <section className="tnt-section">
            <div className="tnt-lm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MAANTIETO_LM} alt="Laura ja Mikko matkalla" loading="lazy" />
              <div className="tnt-lm-body">
                <span className="tnt-lm-attr">★ Lauran ja Mikon poiminta</span>
                <h2 className="tnt-lm-title">{lm.display_title ?? lm.title}</h2>
                <p className="tnt-lm-desc">{descFor(lm)}</p>
                <a className="tnt-cta" href={playHref(lm)}>Pelaa poiminta</a>
              </div>
            </div>
          </section>
        )}

        {/* ─── Pelaa myös nämä: kuvakorttiruudukko (CD) ─── */}
        <section className="tnt-section" id="kaikki">
          <h2 className="tnt-h2">Pelaa myös nämä</h2>
          <div className="tnt-grid">
            {grid.map((c) => (
              <a key={c.id} className="tnt-card" href={playHref(c)}>
                <span className="tnt-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={maantietoImg(c.slug) ?? MAANTIETO_HERO} alt="" loading="lazy" />
                  {c.badge === "uusi" && <span className="tnt-badge">Uusi</span>}
                </span>
                <span className="tnt-card-body">
                  <span className="tnt-card-title">{c.display_title ?? c.title}</span>
                  <span className="tnt-card-desc">{descFor(c)}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {article}
      </div>

      {/* Alatunniste tulee layoutista (SiteFooter, QA-005 29.8.2026) */}
    </main>
  );
}
