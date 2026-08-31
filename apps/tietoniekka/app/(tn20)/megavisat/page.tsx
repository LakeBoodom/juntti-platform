// TIETONIEKKA 2.0 — MEGAVISAT-LANDING (uusi CD-design 26.8.2026,
// design_handoff_megavisat/README.md: hero "Pitkä peli" + MEGA-kuvamerkki →
// nosto (Yleistiedon mega) → kuvakorttiruudukko 6 megaa → Näin mega toimii →
// footer). Korvaa 13.–14.8. version (aihekortit ilman kuvia, pituusvalitsin
// piilotettuna Aloita/Tulossa-logiikan taakse).
//
// README:n vakiosäännöt noudatettu: EI pituus/suodatin-pillereitä, EI
// "Tulossa"-kortteja (kaikki 7 megaa on koottu mega_questions-tauluun,
// pelattavissa vaikka status=draft — draft on tarkoituksellinen niin kauan
// kuin koko 2.0 on preview-branchilla, Heikin päätös 26.8.2026). Kortit
// haetaan kannasta slugilla — jos mega puuttuisi, kortti jää pois listasta
// hiljaa sen sijaan että linkittäisi tyhjään.
//
// Designin oma header + heron sisäinen inline-nav jätetty pois — sama
// linjaus kuin muissa teemasivuissa (Jääkiekko/Jalkapallo/Maantieto):
// sivuston globaali yläpalkki + Crumbs-murupolku hoitavat navigaation.

import "../megavisat.css";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import Crumbs from "@/components/tn20/Crumbs";
import { MEGA_FEATURED, MEGA_GRID, MEGA_WORD_MARK, megaDuration } from "@/lib/megavisat";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Megavisat — pitkät tietovisat ilman taukoja | Tietoniekka";
  const description =
    "Megavisa on yksi istunto ilman taukoja: valitse aihe ja pelaa loppuun asti. Ei selityksiä — vain pisteet ja putki.";
  const canonical = `${SITE_URL}/megavisat`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type MegaRow = { slug: string; title: string; teaser: string | null };

export default async function MegavisatLanding() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const allSlugs = [MEGA_FEATURED.slug, ...MEGA_GRID.map((c) => c.slug)];

  const { data: quizRows } = await sb
    .from("quizzes" as never)
    .select("id, slug, title, teaser")
    .eq("game_mode" as unknown as "status", "mega")
    .in("slug", allSlugs);
  const quizzes = (quizRows ?? []) as unknown as Array<MegaRow & { id: string }>;
  const bySlug = new Map(quizzes.map((q) => [q.slug, q]));

  // Kysymysmäärä lasketaan mega_questions-taulusta (MEGA_SPEC §1: mega on
  // viittauskooste, ei kopio — question_count ei ole quizzes-sarake).
  const idBySlug = new Map(quizzes.map((q) => [q.id, q.slug]));
  const { data: linkRows } = await sb
    .from("mega_questions" as never)
    .select("mega_quiz_id")
    .in("mega_quiz_id", quizzes.map((q) => q.id));
  const countBySlug = new Map<string, number>();
  for (const row of (linkRows ?? []) as unknown as Array<{ mega_quiz_id: string }>) {
    const slug = idBySlug.get(row.mega_quiz_id);
    if (!slug) continue;
    countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1);
  }

  const featuredQuiz = bySlug.get(MEGA_FEATURED.slug);
  const featuredCount = countBySlug.get(MEGA_FEATURED.slug) ?? 0;
  const gridItems = MEGA_GRID
    .map((c) => ({ card: c, quiz: bySlug.get(c.slug), count: countBySlug.get(c.slug) ?? 0 }))
    .filter((g) => g.quiz && g.count > 0);

  const totalMegas = (featuredQuiz && featuredCount > 0 ? 1 : 0) + gridItems.length;
  const totalQuestions = (featuredQuiz && featuredCount > 0 ? featuredCount : 0) +
    gridItems.reduce((sum, g) => sum + g.count, 0);

  return (
    <main className="tnm2" style={{ minHeight: "100dvh" }}>
      <Crumbs items={[{ label: "Megavisat" }]} />

      {/* ─── Hero: "Pitkä peli" ─── */}
      <section className="tnm2-herowrap">
        <div className="tn-shell tnm2-hero">
          <div className="tnm2-hero-left">
            <span className="tnm2-pill">Megavisat</span>
            <h1 className="tnm2-h1">Pitkä<br />peli</h1>
            <p className="tnm2-lede">
              Megavisa on yksi istunto ilman taukoja: valitse aihe ja pelaa loppuun asti.{" "}
              <b>Ei selityksiä</b> — vain pisteet ja putki.
            </p>
            {totalMegas > 0 && (
              <div className="tnm2-stats">
                <div className="tnm2-stat">
                  <span className="tnm2-stat-val">{totalMegas}</span>
                  <span className="tnm2-stat-label">megavisaa</span>
                </div>
                <div className="tnm2-stat">
                  <span className="tnm2-stat-val">20–50</span>
                  <span className="tnm2-stat-label">kysymystä per mega</span>
                </div>
                <div className="tnm2-stat">
                  <span className="tnm2-stat-val">0</span>
                  <span className="tnm2-stat-label">taukoa</span>
                </div>
              </div>
            )}
          </div>
          <div className="tnm2-hero-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tnm2-wordmark" src={MEGA_WORD_MARK} alt="" aria-hidden fetchPriority="high" />
          </div>
        </div>
      </section>

      {/* ─── Nosto: Yleistiedon mega ─── */}
      {featuredQuiz && featuredCount > 0 && (
        <section className="tn-shell tnm2-featwrap">
          <a className="tnm2-feat" href={`/peli?mega=${featuredQuiz.slug}`}>
            <span className="tnm2-feat-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MEGA_FEATURED.img} alt="" loading="eager" style={{ objectPosition: MEGA_FEATURED.pos }} />
              <span className="tnm2-feat-badge">Uusin</span>
            </span>
            <span className="tnm2-feat-body">
              <span className="tnm2-feat-tag"><i aria-hidden />{MEGA_FEATURED.tag}</span>
              <span className="tnm2-feat-title">{featuredQuiz.title}</span>
              <span className="tnm2-feat-desc">{MEGA_FEATURED.desc}</span>
              <span className="tnm2-feat-foot">
                <span className="tnm2-feat-num">
                  {featuredCount}
                  <small>kysymystä · {megaDuration(featuredCount)}</small>
                </span>
                <span className="tnm2-feat-cta">Aloita mega →</span>
              </span>
            </span>
          </a>
        </section>
      )}

      {/* ─── Kaikki megavisat ─── */}
      {gridItems.length > 0 && (
        <section className="tn-shell tnm2-section" id="megat">
          <div className="tnm2-gridhead">
            <h2 className="tnm2-h2">Kaikki megavisat</h2>
            <span className="tnm2-gridnote">
              {totalMegas} megavisaa · {totalQuestions} kysymystä yhteensä
            </span>
          </div>
          <div className="tnm2-grid">
            {gridItems.map(({ card, quiz, count }) => (
              <a key={card.slug} className="tnm2-card" href={`/peli?mega=${quiz!.slug}`}>
                <span className="tnm2-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.img} alt="" loading="lazy" style={{ objectPosition: card.pos }} />
                  <span className="tnm2-card-qpill">
                    <b>{count}</b>
                    <span>kysymystä</span>
                  </span>
                  <span className="tnm2-card-tag"><i aria-hidden />{card.tag}</span>
                </span>
                <span className="tnm2-card-body">
                  <span className="tnm2-card-title">{quiz!.title}</span>
                  <span className="tnm2-card-desc">{card.desc}</span>
                  <span className="tnm2-card-foot">
                    <span className="tnm2-card-duration">{megaDuration(count)} · yksi istunto</span>
                    <span className="tnm2-card-cta">Aloita →</span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── Näin mega toimii ─── */}
      <section className="tn-shell tnm2-section">
        <h2 className="tnm2-h2">Näin mega toimii</h2>
        <div className="tnm2-rules">
          {[
            { n: 1, t: "Valitse aihe", d: "Jokainen mega on oma kokonaisuutensa: 20 kysymystä kahvitauolle, 50 illan sessioon." },
            { n: 2, t: "Yksi istunto, ei taukoja", d: "Mega ei tallenna välitilaa. Poistuminen kesken päättää kierroksen." },
            { n: 3, t: "Putki ratkaisee", d: "Peräkkäiset oikeat kasvattavat kerrointa. Yksi väärä nollaa sen." },
          ].map((r) => (
            <div key={r.n} className="tnm2-rule">
              <span className="tnm2-rule-num">{r.n}</span>
              <span>
                <b>{r.t}</b>
                <p>{r.d}</p>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Alatunniste tulee layoutista (SiteFooter, QA-005 29.8.2026) */}
    </main>
  );
}
