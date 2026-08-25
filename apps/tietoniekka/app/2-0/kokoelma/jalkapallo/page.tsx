// TIETONIEKKA 2.0 — JALKAPALLO: teemasivu (CD "TN Jalkapallo -teemasivu"
// 25.8.2026, design_handoff_jalkapallo_teemasivu/README.md). Yhdeksäs
// teemasivu. Staattinen segmentti ohittaa dynaamisen [collection]-reitin —
// EI korvaa urheiluhubia: jalkapallovisat näkyvät jatkossakin myös
// urheilukokoelmassa (sama linjaus kuin jääkiekolla 17.8.).
//
// Rakenne CD:n mukaan: hero (kausibadge + H1 + osiovalinta A/B/C) →
// Pinnalla nyt (3) → Lohko A: Valioliiga (valittu seura + paitaseinä 19) →
// Valioliigan yleisvisat (4) → Lohko B: Euroopan suurseurat (15, maasuodatin,
// tumma vyö) → Lohko C: Mestarien liiga (5) → Suomalaiset eurokentillä (3).
// Yhteensä 46 visakorttipaikkaa.
//
// Designin oma header + heron sisäinen murupolku jätetty pois — landingit
// ovat headerittömiä ja sivuston vakiomurupolku (Crumbs) hoitaa paluun
// (sama päätös kuin Maantiedossa ja Jääkiekossa).
//
// Julkaisematon sisältö (vakiosääntö): kortin tila määräytyy siitä, löytyykö
// slugia vastaava JULKAISTU visa (quiz_cards). Paitaseinä näyttää aina kaikki
// 19; suurseuroissa julkaisematon (25.8.: Leverkusen) himmenee "Tulossa".
// Paitaseinän valinta peilataan ?seura=<id>-parametriin (README:n suositus) —
// serveri lukee sen alkuvalinnaksi, klikkaus päivittää history.replaceState.
// Kaikki korttitekstit ovat CD:n designcopya — tarkistetaan copy/SEO-passissa.

import "../../jalkapallo.css";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import Crumbs from "@/components/tn20/Crumbs";
import JpPaitaseina, { type JpWallClub } from "@/components/tn20/JpPaitaseina";
import JpSuurseurat, { type JpEuroCard } from "@/components/tn20/JpSuurseurat";
import {
  JP_KAUSI, JP_HERO, JP_PARTS, JP_CLUBS, JP_EURO,
  JP_FEATURED, JP_PL_GENERAL, JP_CL, JP_FINNS, jpImg, type JpCard,
} from "@/lib/jalkapallo";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("jalkapallo");
  const title = pc?.seo_title ?? "Jalkapallo — Valioliiga, suurseurat ja Mestarien liiga tietovisoina";
  const description =
    pc?.seo_description ??
    "Kaikki jalkapallosta: 19 Valioliigan seuravisaa, Euroopan suurseurat ja Mestarien liigan ikuiset illat — sekä suomalaiset eurokentillä.";
  const canonical = `${SITE_URL}/2-0/kokoelma/jalkapallo`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type Row = { slug: string; custom_slug: string | null; question_count: number | null; published_at: string | null };

const hrefFor = (r: Row | undefined) =>
  r ? `/2-0/peli?visa=${r.custom_slug ?? r.slug}` : null;

function ThemeCard({ c, playHref, variant }: { c: JpCard; playHref: string | null; variant: "pl" | "cl" | "finn" }) {
  const tag = playHref ? c.tag : "Tulossa";
  if (variant === "pl" || variant === "finn") {
    // Teksti kokonaan kuvan päällä: pl = pystykortti (4/5), finn = 16/10
    const inner = (
      <span className={variant === "pl" ? "tnjp-plcard-in" : "tnjp-plcard-in tnjp-plcard-in-wide"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.img} alt={c.title} loading="lazy" style={{ objectPosition: c.pos }} />
        <span className="tnjp-card-tag">{tag}</span>
        <span className="tnjp-plcard-text">
          <span className="tnjp-plcard-title">{c.title}</span>
          <span className="tnjp-plcard-desc">{c.desc}</span>
        </span>
      </span>
    );
    return playHref ? (
      <a className="tnjp-plcard" href={playHref} style={{ color: c.color }}>{inner}</a>
    ) : (
      <div className="tnjp-plcard" data-tulossa style={{ color: c.color, opacity: .72 }}>{inner}</div>
    );
  }
  // CL-kortti (16/10 + tekstiosa)
  const inner = (
    <span className="tnjp-ecard-in">
      <span className="tnjp-ecard-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.img} alt={c.title} loading="lazy" style={{ objectPosition: c.pos }} />
        <span className="tnjp-card-tag">{tag}</span>
        <span className="tnjp-ecard-name">{c.title}</span>
      </span>
      <span className="tnjp-ecard-body">
        <span className="tnjp-ecard-hook">{c.desc}</span>
        <span className="tnjp-ecard-foot">
          <span>10 kys.</span>
          <span className="tnjp-ecard-q">{playHref ? "Pelaa →" : "Tulossa"}</span>
        </span>
      </span>
    </span>
  );
  return playHref ? (
    <a className="tnjp-ecard" href={playHref} style={{ color: c.color }}>{inner}</a>
  ) : (
    <div className="tnjp-ecard" data-tulossa style={{ color: c.color }}>{inner}</div>
  );
}

export default async function JalkapalloLanding({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  const params = await searchParams;
  const seuraParam = typeof params.seura === "string" ? params.seura : undefined;

  const allSlugs = [
    ...JP_CLUBS.map((c) => c.quizSlug),
    ...JP_EURO.map((c) => c.quizSlug),
    ...[...JP_PL_GENERAL, ...JP_CL, ...JP_FINNS].map((c) => c.quizSlug),
    ...JP_FEATURED.map((f) => f.quizSlug),
  ];

  const { data } = await sb
    .from("quiz_cards" as never)
    .select("slug, custom_slug, question_count, published_at")
    .in("slug", allSlugs)
    .not("published_at", "is", null);
  const bySlug = new Map(((data ?? []) as unknown as Row[]).map((r) => [r.slug, r]));

  const wallClubs: JpWallClub[] = JP_CLUBS.map((c) => ({
    id: c.id, name: c.name, short: c.short, city: c.city,
    founded: c.founded, stadium: c.stadium, color: c.color, tier: c.tier, hook: c.hook,
    img: jpImg(c.id),
    playHref: hrefFor(bySlug.get(c.quizSlug)),
    questionCount: bySlug.get(c.quizSlug)?.question_count ?? 10,
  }));

  const euroCards: JpEuroCard[] = JP_EURO.map((c) => ({
    id: c.id, name: c.name, country: c.country, stadium: c.stadium,
    color: c.color, hook: c.hook, img: jpImg(c.id),
    playHref: hrefFor(bySlug.get(c.quizSlug)),
    questionCount: bySlug.get(c.quizSlug)?.question_count ?? 10,
  }));

  const featured = JP_FEATURED.filter((f) => bySlug.has(f.quizSlug));

  return (
    <main className="tnk" style={{ minHeight: "100dvh" }}>
      <Crumbs
        items={[
          { label: "Kokoelmat", href: "/2-0/kokoelmat" },
          { label: "Urheilu", href: "/2-0/kokoelma/urheilu" },
          { label: "Jalkapallo" },
        ]}
      />

      {/* ─── Hero + osiovalinta ─── */}
      <section className="tnjp-herowrap">
        <div className="tnjp-hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={JP_HERO.img} alt="" fetchPriority="high" />
        </div>
        <div className="tn-shell tnjp-hero">
          <span className="tnjp-badge"><i aria-hidden />{JP_KAUSI.badge}</span>
          <h1 className="tnjp-h1">
            {JP_HERO.titleLines[0]}
            <br />
            {JP_HERO.titleLines[1]}
          </h1>
          <p className="tnjp-lede">
            {JP_HERO.introLines[0]}
            <br />
            {JP_HERO.introLines[1]}
          </p>
        </div>
        <div className="tn-shell">
          <nav className="tnjp-parts" aria-label="Sivun osiot">
            {JP_PARTS.map((p) => (
              <a key={p.href} className="tnjp-part" href={p.href} style={{ color: p.color }}>
                <span className="tnjp-part-kicker">{p.kicker}</span>
                <span className="tnjp-part-title">{p.title}</span>
                <span className="tnjp-part-meta">{p.meta}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ─── Pinnalla nyt ─── */}
      {featured.length > 0 && (
        <section className="tn-shell" style={{ paddingTop: "clamp(34px,4.4cqw,72px)" }}>
          <div className="tnjp-subhead">
            <h2 className="tnjp-h3">Pinnalla nyt</h2>
            <i aria-hidden />
            <span className="tnjp-subhead-meta">Kolme visaa, kolme liigaa</span>
          </div>
          <div className="tnjp-featured">
            {featured.map((f) => (
              <a key={f.quizSlug} className="tnjp-fcard" href={hrefFor(bySlug.get(f.quizSlug))!} style={{ color: f.color }}>
                <span className="tnjp-fcard-in">
                  <span className="tnjp-fcard-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.img} alt={f.title} loading="lazy" style={{ objectPosition: f.pos }} />
                    <span className="tnjp-card-tag">{f.league}</span>
                    <span className="tnjp-fcard-title">{f.title}</span>
                  </span>
                  <span className="tnjp-fcard-body">
                    <span className="tnjp-fcard-desc">{f.desc}</span>
                    <span className="tnjp-fcard-play">Pelaa →</span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── Lohko A — Valioliiga ─── */}
      <section className="tn-shell tnjp-section" id="valioliiga">
        <div className="tnjp-kickrow">
          <span className="tnjp-kicker">Lohko A</span>
          <i aria-hidden />
        </div>
        <div className="tnjp-headrow">
          <h2 className="tnjp-h2">Valioliiga ja<br />Englannin futis</h2>
          <p className="tnjp-intro">
            Yhdeksäntoista seuraa, yhdeksäntoista visaa. Valitse paita seinältä —
            loppu on sinun ja muistisi välillä.
          </p>
        </div>
        <JpPaitaseina clubs={wallClubs} defaultClubId={seuraParam} />
      </section>

      {/* ─── Valioliigan yleisvisat ─── */}
      <section className="tn-shell" style={{ paddingBottom: "clamp(34px,4.6cqw,72px)" }}>
        <div className="tnjp-subhead">
          <h2 className="tnjp-h3">Valioliigan yleisvisat</h2>
          <i aria-hidden />
          <span className="tnjp-subhead-meta">Seurarajat ylittävät klassikot</span>
        </div>
        <div className="tnjp-plgrid">
          {JP_PL_GENERAL.map((c) => (
            <ThemeCard key={c.quizSlug} c={c} playHref={hrefFor(bySlug.get(c.quizSlug))} variant="pl" />
          ))}
        </div>
      </section>

      {/* ─── Lohko B — Euroopan suurseurat (tumma vyö) ─── */}
      <div className="tnjp-belt" id="suurseurat">
        <div className="tn-shell">
          <div className="tnjp-kickrow">
            <span className="tnjp-kicker">Lohko B</span>
            <i aria-hidden />
          </div>
          <div className="tnjp-headrow">
            <h2 className="tnjp-h2">Euroopan<br />suurseurat</h2>
            <p className="tnjp-intro">
              Espanjan, Italian, Saksan ja Ranskan mahtiseurat — sekä Ajax, Celtic
              ja Benfica. Suodata maan mukaan.
            </p>
          </div>
          <JpSuurseurat clubs={euroCards} />
        </div>
      </div>

      {/* ─── Lohko C — Mestarien liiga ─── */}
      <section className="tn-shell tnjp-section" id="mestarienliiga">
        <div className="tnjp-kickrow">
          <span className="tnjp-kicker" style={{ color: "#E8A320" }}>Lohko C</span>
          <i aria-hidden />
        </div>
        <div className="tnjp-headrow">
          <h2 className="tnjp-h2">Mestarien liiga</h2>
          <p className="tnjp-intro">
            Historia, finaalit, maalintekijät, stadionit ja ne comebackit, joita
            ei uskoisi ilman videotallennetta.
          </p>
        </div>
        <div className="tnjp-eurogrid">
          {JP_CL.map((c) => (
            <ThemeCard key={c.quizSlug} c={c} playHref={hrefFor(bySlug.get(c.quizSlug))} variant="cl" />
          ))}
        </div>
      </section>

      {/* ─── Suomalaiset eurokentillä ─── */}
      <section className="tn-shell" style={{ paddingBottom: "clamp(44px,5.6cqw,92px)" }}>
        <div className="tnjp-subhead">
          <h2 className="tnjp-h3">Suomalaiset eurokentillä</h2>
          <i aria-hidden />
        </div>
        <div className="tnjp-eurogrid">
          {JP_FINNS.map((c) => (
            <ThemeCard key={c.quizSlug} c={c} playHref={hrefFor(bySlug.get(c.quizSlug))} variant="finn" />
          ))}
        </div>
      </section>

      <footer className="tnjp-footer">
        <div className="tn-shell">
          <span>Jalkapallo-kokoelma</span>
          <span>
            <a href="/2-0">Etusivu</a>
            {"  ·  "}
            <a href="/tietosuoja">Tietosuoja</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
