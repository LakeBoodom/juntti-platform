// TIETONIEKKA 2.0 — URHEILU: lajiteemasivu (CD "TN Urheilu -teemasivu"
// 26.8.2026, design_handoff_urheilu_teemasivu/README.md). Staattinen
// segmentti ohittaa dynaamisen [collection]-urheiluhubin — tämä sivu KORVAA
// vanhan kaikki-visat-listaavan hubin. Sivu on urheilun "muut lajit"
// -kokoelma: jääkiekolla ja jalkapallolla on omat teemasivut, joihin täältä
// vain portataan (README: niiden visoja EI listata tässä).
//
// Rakenne: hero (rallihyppy + H1 + lohkovalinta-nauha) → lohkot A–E
// (Formula 1 / Ralli / Golf / Tennis / Urheiluhistoria, 16 visaa) →
// Omat teemasivut -portit (Jääkiekko, Jalkapallo). Designin header + heron
// sisämurupolku jätetty pois (landingit headerittömiä, Crumbs hoitaa).
//
// LAAJENNETTAVUUS (README:n tärkein vaatimus): kaikki sisältö tulee
// lib/urheilulajit.ts-lohkolistasta — uusi lohko tai visa lisätään sinne,
// EI tähän tiedostoon. Kirjain ("Lohko F"), tumma tausta (parillinen),
// kicker-väri (viimeinen oranssi), visamäärät ja nauha johdetaan listasta.
// Ei lohkokohtaista erikoiskoodia: pääkortti on layout "lead" -ominaisuus.
// Kaksi korttianatomiaa kuvasuhteen mukaan (16/10 = kuva + tekstiosa,
// muut = teksti kuvan päällä). CD:n konfiguraatioliput toteutettu
// designin oletuksin: nauha näkyy, portit sivun alaosassa, alaotsikot päällä.
//
// Julkaisematon sisältö (vakiosääntö): kortti on pelattava kun slugia
// vastaava JULKAISTU visa löytyy (quiz_cards); muuten Tulossa-tilassa.
// Lohko ilman yhtään julkaistua visaa piilotetaan kokonaan, myös nauhasta
// (README §Tyhjät tilat). Visamäärät ovat julkaistujen määriä — ei koskaan
// kovakoodattuja. 26.8.2026 kaikki 16 visaa ovat julkaistuja.

import "../../urheilulajit.css";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import Crumbs from "@/components/tn20/Crumbs";
import {
  UL_HERO, UL_LOHKOT, UL_GATES, ulKicker, ulDark, ulKickerColor,
  type UlLohko, type UlVisa,
} from "@/lib/urheilulajit";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("urheilu");
  const title = pc?.seo_title ?? "Urheilu — Formula 1, ralli, golf, tennis ja urheiluhistoria";
  const description =
    pc?.seo_description ??
    "Kaasua, mailoja ja mitaleita: viisi lajilohkoa, joissa testataan sekä kuningasluokan tieto että suomalaisten suuret hetket. Jääkiekolla ja jalkapallolla on omat teemasivunsa.";
  const canonical = `${SITE_URL}/kokoelma/urheilu`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type Row = { slug: string; custom_slug: string | null; published_at: string | null };

const hrefFor = (r: Row | undefined) =>
  r ? `/peli?visa=${r.custom_slug ?? r.slug}` : null;

/* Overlay-kortti: kaikki teksti kuvan päällä (21/9 lead, 4/5, 16/9).
   Split-kortti: kuva + tekstiosa (16/10). Anatomia on kuvasuhteen funktio —
   ei lajin (README §Laajennettavuus). */
function VisaKortti({
  v, ratio, playHref, wide,
}: {
  v: UlVisa; ratio: string; playHref: string | null; wide?: boolean;
}) {
  const tag = playHref ? v.tag : "Tulossa";
  const split = ratio === "16/10";
  const inner = split ? (
    <span className="tnu-scard-in">
      <span className="tnu-scard-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={v.img} alt={v.title} loading="lazy" style={{ objectPosition: v.pos }} />
        <span className="tnu-card-tag">{tag}</span>
        <span className="tnu-scard-title">{v.title}</span>
      </span>
      <span className="tnu-scard-body">
        <span className="tnu-scard-sub">{v.sub}</span>
        <span className="tnu-scard-foot">
          <span className="tnu-start">{playHref ? "Aloita visa →" : "Tulossa"}</span>
        </span>
      </span>
    </span>
  ) : (
    <span
      className="tnu-ocard"
      data-ratio={ratio}
      data-wide={wide || undefined}
      style={{ aspectRatio: ratio.replace("/", " / ") }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={v.img} alt={v.title} loading="lazy" style={{ objectPosition: v.pos }} />
      <span className="tnu-card-tag">{tag}</span>
      <span className="tnu-ocard-text">
        <span className="tnu-ocard-title">{v.title}</span>
        <span className="tnu-ocard-sub">{v.sub}</span>
        <span className="tnu-ocard-foot">
          <span />
          <span className="tnu-start">{playHref ? "Aloita visa →" : "Tulossa"}</span>
        </span>
      </span>
    </span>
  );
  return playHref ? (
    <a className="tnu-card" href={playHref} style={{ color: v.color }}>{inner}</a>
  ) : (
    <div className="tnu-card" data-tulossa style={{ color: v.color, opacity: .72 }}>{inner}</div>
  );
}

export default async function UrheiluLanding() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const allSlugs = UL_LOHKOT.flatMap((l) => l.visat.map((v) => v.quizSlug));
  const { data } = await sb
    .from("quiz_cards" as never)
    .select("slug, custom_slug, published_at")
    .in("slug", allSlugs)
    .not("published_at", "is", null);
  const bySlug = new Map(((data ?? []) as unknown as Row[]).map((r) => [r.slug, r]));

  /* Johdetut arvot: julkaistujen määrä per lohko; tyhjät lohkot piiloon
     (myös nauhasta). Kirjain/tausta/kicker-väri = paikan funktio. */
  const blocks = UL_LOHKOT
    .map((l) => ({ l, count: l.visat.filter((v) => bySlug.has(v.quizSlug)).length }))
    .filter((b) => b.count > 0);

  function Block({ l, count, index }: { l: UlLohko; count: number; index: number }) {
    const kicker = ulKicker(index);
    const kickerColor = ulKickerColor(index, blocks.length);
    const lead = l.layout === "lead" ? l.visat[0] : null;
    const rest = l.layout === "lead" ? l.visat.slice(1) : l.visat;
    return (
      <section className="tnu-block" data-dark={ulDark(index) || undefined} id={l.slug}>
        <div className="tn-shell">
          <div className="tnu-kickrow">
            <span className="tnu-kicker" style={{ color: kickerColor }}>{kicker}</span>
            <i aria-hidden />
            <span className="tnu-count">{count} visaa</span>
          </div>
          <div className="tnu-headrow">
            <h2 className="tnu-h2">{l.title}</h2>
            <p className="tnu-intro">{l.intro}</p>
          </div>
          {lead && (
            <div style={{ marginBottom: "clamp(10px,1.4cqw,20px)" }}>
              <VisaKortti v={lead} ratio="21/9" playHref={hrefFor(bySlug.get(lead.quizSlug))} wide />
            </div>
          )}
          <div
            className="tnu-grid"
            style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%,${l.gridMin}px),1fr))` }}
          >
            {rest.map((v) => (
              <VisaKortti key={v.quizSlug} v={v} ratio={l.ratio} playHref={hrefFor(bySlug.get(v.quizSlug))} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className="tnk" style={{ minHeight: "100dvh" }}>
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: "Urheilu" }]} />

      {/* ─── Hero + lohkovalinta-nauha (generoidaan lohkolistasta) ─── */}
      <section className="tnu-herowrap">
        <div className="tnu-hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={UL_HERO.img} alt="" fetchPriority="high" />
        </div>
        <div className="tn-shell tnu-hero">
          <h1 className="tnu-h1">
            {UL_HERO.titleLines[0]}
            <br />
            {UL_HERO.titleLines[1]}
          </h1>
          <p className="tnu-lede">
            {UL_HERO.introLines[0]}
            <br />
            {UL_HERO.introLines[1]}
          </p>
        </div>
        <div className="tn-shell">
          <nav className="tnu-parts" aria-label="Lajilohkot">
            {blocks.map(({ l, count }, i) => (
              <a key={l.slug} className="tnu-part" href={`#${l.slug}`} style={{ color: ulKickerColor(i, blocks.length) }}>
                <span className="tnu-part-kicker">{ulKicker(i)}</span>
                <span className="tnu-part-title">{l.navTitle}</span>
                <span className="tnu-part-meta">{count} visaa</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ─── Lohkot ─── */}
      {blocks.map(({ l, count }, i) => (
        <Block key={l.slug} l={l} count={count} index={i} />
      ))}

      {/* ─── Omat teemasivut (portit — eivät koskaan visalistoja) ─── */}
      <section className="tnu-gatesec">
        <div className="tn-shell">
          <div className="tnu-subhead">
            <h2 className="tnu-h3">Omat teemasivut</h2>
            <i aria-hidden />
            <span className="tnu-count">Kaksi lajia, kaksi omaa maailmaa</span>
          </div>
          <div className="tnu-gates">
            {UL_GATES.map((g) => (
              <a key={g.href} className="tnu-card" href={g.href} style={{ color: g.color }}>
                <span className="tnu-gate-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.img} alt={g.title} loading="lazy" style={{ objectPosition: g.pos }} />
                  <span className="tnu-gate-tag">Oma teemasivu</span>
                  <span className="tnu-gate-text">
                    <span className="tnu-gate-title">{g.title}</span>
                    <span className="tnu-gate-foot">
                      <span className="tnu-gate-desc">{g.desc}</span>
                      <span className="tnu-start">Siirry teemasivulle →</span>
                    </span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Alatunniste tulee layoutista (SiteFooter, QA-005 29.8.2026) */}
    </main>
  );
}
