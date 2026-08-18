// TIETONIEKKA 2.0 — KULTTUURI: flagship-teemakokoelman landing
// (Heikki 6.8.2026 + CD "Tietoniekka - Kulttuuri" -parannuskierros)
// Poikkeaa hub-templatesta tarkoituksella: oma visuaalinen landing, jonka
// kortit käyttävät visakohtaisia kuvia (ei SVG-motiiveja). Väriratkaisu CD:n
// mukaan: yönsininen VAIN pintoina (ei tekstin/napin värinä), kulta aksenttina,
// lime vain toiminnoissa. Header/footer perusmustalla → sama tuote kuin muut.
// Staattinen segmentti ohittaa dynaamisen [collection]-reitin Next.js:ssä.

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import Crumbs from "@/components/tn20/Crumbs";
import {
  KULTTUURI_HERO, KULTTUURI_SUBS, KULTTUURI_CURATED, kulttuuriImg,
} from "@/lib/kulttuuri";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("kulttuuri");
  const title = pc?.seo_title ?? "Kulttuuri — Suomen tarinat, tekijät ja klassikot";
  const description =
    pc?.seo_description ??
    "Tietovisat taiteesta, musiikista, kirjallisuudesta, designista ja suomalaisista ilmiöistä.";
  const canonical = `${SITE_URL}/2-0/kokoelma/kulttuuri`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type Card = {
  id: string; slug: string | null; custom_slug: string | null;
  title: string; display_title: string | null; teaser: string | null;
  difficulty: string | null; subcollection: string | null;
  question_count: number; badge: string | null; published_at: string | null;
};

const playHref = (c: Card) =>
  c.custom_slug || c.slug ? `/2-0/peli?visa=${c.custom_slug ?? c.slug}` : `/2-0/peli?quiz_id=${c.id}`;

function CardMeta({ c }: { c: Card }) {
  return (
    <span className="tnk-cardmeta">
      {c.question_count} kysymystä
    </span>
  );
}

export default async function KulttuuriLanding({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = typeof sp.suodata === "string" ? sp.suodata : "kaikki";

  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const [cardsRes, pc] = await Promise.all([
    sb.from("quiz_cards" as never)
      .select("id, slug, custom_slug, title, display_title, teaser, difficulty, subcollection, question_count, badge, published_at")
      .eq("collection", "kulttuuri")
      .order("published_at", { ascending: false }),
    getPageContent("kulttuuri"),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as Card[];
  const count = cards.length;
  const questions = cards.reduce((s, c) => s + (c.question_count ?? 0), 0);

  const bySlug = new Map(cards.map((c) => [c.slug ?? "", c]));
  const features = KULTTUURI_CURATED.features.map((s) => bySlug.get(s)).filter(Boolean) as Card[];
  const pick = bySlug.get(KULTTUURI_CURATED.lauranJaMikon) ?? null;
  const ctaTarget = bySlug.get(KULTTUURI_CURATED.cta) ?? cards[0] ?? null;

  const featIds = new Set(features.map((f) => f.id));
  const rest = cards.filter((c) => !featIds.has(c.id));
  const visible = filter === "kaikki" ? rest : rest.filter((c) => c.subcollection === filter);
  const presentSubs = KULTTUURI_SUBS.filter((s) => cards.some((c) => c.subcollection === s.key));

  const article = pc?.learn ? (
    <LearnArticle learn={pc.learn} fallbackTitle="Kulttuuri" accent="#E8A320" />
  ) : null;

  return (
    <main className="tnk" style={{ minHeight: "100dvh", paddingBottom: 60 }}>
      {/* Murupolkurivi palkin alla (nav-speksi 17.8.2026) — korvasi heron inline-navin */}
      <Crumbs items={[{ label: "Kokoelmat", href: "/2-0/kokoelmat" }, { label: "Kulttuuri" }]} />
      {/* ─── Hero: kollaasi + kaksivärinen otsikko (CD) ─── */}
      <section className="tnk-herowrap">
        <div className="tn-shell">
        <div className="tnk-hero">
        <div className="tnk-hero-text">
          <span className="tnk-eyebrow">— Teemakokoelma</span>
          <h1 className="tn-display tnk-title">
            <span>Suomen tarinat,</span><br />tekijät ja klassikot
          </h1>
          <p className="tnk-lede">
            {count} visaa taiteesta, musiikista, kirjallisuudesta, designista ja suomalaisista ilmiöistä.
          </p>
          {ctaTarget && (
            <a className="tnk-cta" href={playHref(ctaTarget)}>Aloita kulttuurimatka</a>
          )}
          <div className="tnk-hero-chips">
            <span className="tnk-chip"><b>{count}</b> visaa</span>
            <span className="tnk-chip"><b>{questions}</b> kysymystä</span>
            <span className="tnk-chip">Taide · Design · Tarinat</span>
          </div>
        </div>
        <div className="tnk-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={KULTTUURI_HERO} alt="" />
        </div>
        </div>
        </div>
      </section>

      <div className="tn-shell">
        {/* ─── Alakokoelmasuodattimet (CD:n 4 chippiä) ─── */}
        <nav className="tn-chipnav tnk-filters" aria-label="Alakokoelmat">
          <a href="/2-0/kokoelma/kulttuuri" data-active={filter === "kaikki" || undefined}>Kaikki</a>
          {presentSubs.map((s) => (
            <a key={s.key} href={`/2-0/kokoelma/kulttuuri?suodata=${s.key}`} data-active={filter === s.key || undefined}>
              {s.label}
            </a>
          ))}
        </nav>

        {/* ─── Aloita näistä: kuratoidut nostot ─── */}
        {filter === "kaikki" && features.length > 0 && (
          <section className="tn-section" style={{ paddingTop: 20, paddingBottom: 0 }}>
            <div className="tn-section-head">
              <h2 className="tn-section-title">Aloita näistä</h2>
            </div>
            <div className="tnk-feature-grid">
              {features.map((c, i) => (
                <a key={c.id} className="tnk-feature" href={playHref(c)} data-first={i === 0 || undefined}>
                  <span className="tnk-feature-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={kulttuuriImg(c.slug) ?? KULTTUURI_HERO} alt="" loading={i === 0 ? undefined : "lazy"} />
                  </span>
                  <span className="tnk-feature-body">
                    <span className="tnk-cardtitle">{c.display_title ?? c.title}</span>
                    <CardMeta c={c} />
                    {c.teaser && <span className="tnk-cardteaser">{c.teaser}</span>}
                    <span className="tnk-arrow" aria-hidden>→</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ─── Lauran ja Mikon valinta ─── */}
        {filter === "kaikki" && pick && (
          <section className="tn-section" style={{ paddingTop: 16, paddingBottom: 0 }}>
            <a className="tnk-pick" href={playHref(pick)}>
              <span className="tnk-pick-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/20/kulttuuri/laura-mikko.webp" alt="Laura ja Mikko" loading="lazy" />
              </span>
              <span className="tnk-pick-body">
                <span className="tnk-pick-label">★ Lauran ja Mikon valinta</span>
                <span className="tnk-cardtitle">{pick.display_title ?? pick.title}</span>
                <CardMeta c={pick} />
              </span>
              <span className="tnk-arrow" aria-hidden>→</span>
            </a>
          </section>
        )}

        {/* ─── Kaikki visat kuvakortteina ─── */}
        <section className="tn-section" id="kaikki">
          <div className="tn-section-head">
            <h2 className="tn-section-title">
              {filter === "kaikki" ? "Kokeile myös näitä" : KULTTUURI_SUBS.find((s) => s.key === filter)?.label ?? "Visat"}
            </h2>
            <div className="tn-hubrow-note">{(filter === "kaikki" ? rest : visible).length} visaa</div>
          </div>
          {visible.length === 0 ? (
            <div className="tn-empty">Tällä suodattimella ei löytynyt visoja. Kokeile toista.</div>
          ) : (
            <div className="tnk-grid">
              {visible.map((c) => (
                <a key={c.id} className="tnk-card" href={playHref(c)}>
                  <span className="tnk-card-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={kulttuuriImg(c.slug) ?? KULTTUURI_HERO} alt="" loading="lazy" />
                    {c.badge === "uusi" && <span className="tnk-badge">Uusi</span>}
                  </span>
                  <span className="tnk-card-body">
                    <span className="tnk-cardtitle">{c.display_title ?? c.title}</span>
                    <CardMeta c={c} />
                    {c.teaser && <span className="tnk-cardteaser">{c.teaser}</span>}
                    <span className="tnk-arrow" aria-hidden>→</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
      {article}
    </main>
  );
}
