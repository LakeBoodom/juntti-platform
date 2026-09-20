// TIETONIEKKA 2.0 — TIEDE & TEKNOLOGIA -teemasivu (CD "Tietoniekka – Tiede ja
// teknologia -teemasivu", 20.9.2026). Kokoelman 12. teemasivu ja ensimmäinen,
// jonka visat ovat kannassa collection='yleistieto', category='tiede-teknologia'
// — kokoelma tunnistetaan kategoriasta (lib/visanKokoelma.ts).
//
// Rakenne designin mukaan: hero → aihepiirichipit → "Aloita näistä" (6) →
// aihepiirit 01 ja 02 → nostettu visa → aihepiirit 03 ja 04 → alaviite.
// Poimitut TOISTUVAT aihepiireissä (sama sääntö kuin TV- ja Musiikki-sivuilla).
// Kortin nimi ja koukku ovat designin copya (lib/tiede.ts), eivät visan omaa
// otsikkoa — visan koko nimi näkyy pelisivulla.

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import Crumbs from "@/components/tn20/Crumbs";
import {
  TIEDE_ALOITA, TIEDE_ALOITA_KICKER, TIEDE_BANNERI, TIEDE_FOOTNOTE, TIEDE_HERO, TIEDE_KATEGORIA,
  TIEDE_NOSTO, TIEDE_SECTIONS, tiedeImg,
} from "@/lib/tiede";
import "../../tiede.css";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const metadata: Metadata = {
  title: "Tiede ja teknologia — tietovisat",
  description:
    "20 tietovisaa kehosta avaruuteen: aivot, genetiikka, aurinkokunta, dinosaurukset, keksinnöt ja tiedemyytit. Ilmaisia visoja ilman kirjautumista.",
  alternates: { canonical: `${SITE_URL}/kokoelma/tiede` },
  openGraph: {
    type: "website", locale: "fi_FI", siteName: "Tietoniekka",
    url: `${SITE_URL}/kokoelma/tiede`,
    title: "Tiede ja teknologia — tietovisat",
    description: "Maailma on kummallisempi kuin luulet. 20 visaa kehosta avaruuteen.",
  },
};

type Card = {
  id: string; slug: string | null; custom_slug: string | null;
  title: string; display_title: string | null; question_count: number;
};

const playHref = (c: Card) =>
  c.custom_slug || c.slug ? `/peli?visa=${c.custom_slug ?? c.slug}` : `/peli?quiz_id=${c.id}`;

function Kortti({
  card, nimi, hook, nuoli = false,
}: { card: Card; nimi: string; hook: string; nuoli?: boolean }) {
  return (
    <a className="tnt-card" href={playHref(card)}>
      <span className="tnt-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tiedeImg(card.slug ?? "")} alt="" loading="lazy" />
      </span>
      <span className="tnt-card-body">
        <span className="tnt-card-text">
          <span className="tnt-card-name">{nimi}</span>
          <span className="tnt-card-hook">{hook}</span>
        </span>
        {nuoli && (
          <span className="tnt-card-arrow" aria-hidden>
            <i>→</i>
          </span>
        )}
      </span>
    </a>
  );
}

export default async function TiedeLanding() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const { data } = await sb
    .from("quiz_cards" as never)
    .select("id, slug, custom_slug, title, display_title, question_count")
    .eq("category", TIEDE_KATEGORIA);
  const cards = (data ?? []) as unknown as Card[];
  const bySlug = new Map(cards.map((c) => [c.slug ?? "", c]));
  const poimi = <T extends { slug: string }>(l: T[]) =>
    l.map((q) => ({ ...q, card: bySlug.get(q.slug) })).filter((q): q is T & { card: Card } => Boolean(q.card));

  const aloita = poimi(TIEDE_ALOITA);
  const sections = TIEDE_SECTIONS.map((s) => ({ ...s, cards: poimi(s.quizzes) })).filter((s) => s.cards.length > 0);
  const nosto = bySlug.get(TIEDE_NOSTO.slug) ?? null;
  /* Luvut kannasta, ei kovakoodattuina (design: "20 tietovisaa · satoja kysymyksiä"). */
  const visoja = new Set(sections.flatMap((s) => s.cards.map((c) => c.card.id))).size;
  const kysymyksia = sections
    .flatMap((s) => s.cards.map((c) => c.card))
    .filter((c, i, l) => l.findIndex((x) => x.id === c.id) === i)
    .reduce((a, c) => a + (c.question_count ?? 0), 0);

  return (
    <main className="tnt-page">
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: "Tiede & teknologia" }]} />
      <div className="tnt-shell">
        <div className="tnt-wrap">
          {/* ─── Hero ─── */}
          <section className="tnt-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TIEDE_HERO.img} alt="" fetchPriority="high" style={{ objectPosition: TIEDE_HERO.pos }} />
            <span className="tnt-hero-line" aria-hidden />
            <div className="tnt-hero-body">
              <div className="tnt-kicker"><i aria-hidden />{TIEDE_HERO.kicker}</div>
              <h1 className="tnt-h1">
                {TIEDE_HERO.titleLines[0]}
                <br />
                <span>{TIEDE_HERO.titleLines[1]}</span>
              </h1>
              <p className="tnt-lead">{TIEDE_HERO.lead}</p>
              <p className="tnt-intro">{TIEDE_HERO.intro}</p>
              <div className="tnt-actions">
                <a className="tnt-btn" href={`#${TIEDE_SECTIONS[0].id}`}>{TIEDE_HERO.cta}</a>
                <span className="tnt-hero-meta">
                  {visoja} tietovisaa<i aria-hidden />{kysymyksia} kysymystä
                </span>
              </div>
            </div>
          </section>

          {/* ─── Aihepiirichipit ─── */}
          <nav className="tnt-chips" aria-label="Aihepiirit">
            {sections.map((s) => (
              <a key={s.id} className="tnt-chip" href={`#${s.id}`}>
                {s.title}<b>{s.cards.length}</b>
              </a>
            ))}
          </nav>

          {/* ─── Aloita näistä ─── */}
          {aloita.length > 0 && (
            <section className="tnt-section tnt-section--start" aria-labelledby="tnt-aloita">
              <div className="tnt-starthead">
                <h2 className="tnt-h2" id="tnt-aloita">Aloita näistä</h2>
                <span>{TIEDE_ALOITA_KICKER}</span>
              </div>
              <div className="tnt-grid tnt-grid--start">
                {aloita.map((q) => (
                  <Kortti key={q.slug} card={q.card} nimi={q.nimi} hook={q.hook} nuoli />
                ))}
              </div>
            </section>
          )}

          {/* ─── Aihepiirit; nostettu visa osioiden 02 ja 03 välissä ─── */}
          {sections.map((s, i) => (
            <div key={s.id}>
              <section className="tnt-section" id={s.id} aria-labelledby={`${s.id}-h`}>
                <div className="tnt-sechead">
                  <span className="tnt-secnum" aria-hidden>{s.number}</span>
                  <span className="tnt-sectext">
                    <h2 className="tnt-sectitle" id={`${s.id}-h`}>{s.title}</h2>
                    <span className="tnt-secintro">{s.intro}</span>
                  </span>
                </div>
                <div className="tnt-grid">
                  {s.cards.map((q) => (
                    <Kortti key={q.slug} card={q.card} nimi={q.nimi} hook={q.hook} />
                  ))}
                </div>
              </section>

              {i === 1 && nosto && (
                <section className="tnt-section">
                  <a className="tnt-featured" href={playHref(nosto)}>
                    <span className="tnt-featured-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tiedeImg(TIEDE_NOSTO.slug)} alt="" loading="lazy" />
                    </span>
                    <span className="tnt-featured-body">
                      <span className="tnt-featured-kicker"><i aria-hidden />{TIEDE_NOSTO.kicker}</span>
                      <span className="tnt-featured-title">{TIEDE_NOSTO.title}</span>
                      <span className="tnt-featured-text">{TIEDE_NOSTO.text}</span>
                      <span className="tnt-actions">
                        <span className="tnt-btn">{TIEDE_NOSTO.cta}</span>
                        <span className="tnt-featured-meta">{TIEDE_NOSTO.meta}</span>
                      </span>
                    </span>
                  </a>
                </section>
              )}
            </div>
          ))}

          <footer className="tnt-foot">
            <span>© {new Date().getFullYear()} Tietoniekka</span>
            <span>{TIEDE_FOOTNOTE}</span>
          </footer>
        </div>
      </div>
    </main>
  );
}

