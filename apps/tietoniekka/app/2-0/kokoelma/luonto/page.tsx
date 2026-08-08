// TIETONIEKKA 2.0 — LUONTO: flagship-teemakokoelman landing
// (Heikki 7.8.2026, sama malli kuin Kulttuuri — vain värimaailma vaihtuu)
// Poikkeaa hub-templatesta tarkoituksella: oma visuaalinen landing, jonka
// kortit käyttävät visakohtaisia kuvia (ei SVG-motiiveja). Korvaa entisen
// "Luonnon ihmeet" -hub-sivun (joka käytti dynaamista [collection]-reittiä
// category='luonto' -suodattimella osana Matkakohteita).
// Staattinen segmentti ohittaa dynaamisen [collection]-reitin Next.js:ssä.
//
// Responsiivinen uudistus (Heikki 8.8.2026): oma 1240px-sisältölinja
// (.tnl-shell), hero 44/56-jaolla desktopilla ja kuva ylhäällä kapealla,
// suodattimet siirretty "Kaikki luontovisat" -osioon (eivät näytä
// vaikuttavan Aloita näistä -nostoihin, jotka näkyvät aina), mobiilissa
// ruudukko avataan ShowAllCards-napilla 8 kortin jälkeen.

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import {
  LUONTO_HERO, LUONTO_SUBS, LUONTO_CURATED, luontoImg,
} from "@/lib/luonto";
import { ShowAllCards } from "./ShowAllCards";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("luonto");
  const title = pc?.seo_title ?? "Suomen luonto — eläimet, kasvit ja ilmiöt";
  const description =
    pc?.seo_description ??
    "Tietovisat suurpedoista lintuihin, soista revontuliin. Tunnetko lähimetsäsi?";
  const canonical = `${SITE_URL}/2-0/kokoelma/luonto`;
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

export default async function LuontoLanding({
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
      .eq("collection", "luonto")
      .order("published_at", { ascending: false }),
    getPageContent("luonto"),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as Card[];
  const count = cards.length;
  const questions = cards.reduce((s, c) => s + (c.question_count ?? 0), 0);

  const bySlug = new Map(cards.map((c) => [c.slug ?? "", c]));
  const features = LUONTO_CURATED.features.map((s) => bySlug.get(s)).filter(Boolean) as Card[];
  const pick = bySlug.get(LUONTO_CURATED.lauranJaMikon) ?? null;
  const ctaTarget = bySlug.get(LUONTO_CURATED.cta) ?? cards[0] ?? null;

  const featIds = new Set(features.map((f) => f.id));
  const rest = cards.filter((c) => !featIds.has(c.id));
  const visible = filter === "kaikki" ? rest : rest.filter((c) => c.subcollection === filter);
  const presentSubs = LUONTO_SUBS.filter((s) => cards.some((c) => c.subcollection === s.key));

  const article = pc?.learn ? (
    <LearnArticle learn={pc.learn} fallbackTitle="Luonto" accent="#3FBF7F" />
  ) : null;

  return (
    <main className="tnl" style={{ minHeight: "100dvh", paddingBottom: 60 }}>
      {/* ─── Hero: teksti 44 % + kuva 56 % desktopilla, kuva ylhäällä kapealla ─── */}
      <section className="tnl-herowrap">
        <div className="tnl-shell">
        <div className="tnl-hero">
        <div className="tnl-hero-text">
          <nav style={{ fontSize: 13, fontWeight: 700, color: "#8E8676", marginBottom: 16 }}>
            <a href="/2-0" style={{ color: "inherit", textDecoration: "none" }}>Kokoelmat</a>
            {" / "}
            <span style={{ color: "var(--tn-luonto-accent)" }}>Luonto</span>
          </nav>
          <span className="tnl-eyebrow">— Teemakokoelma</span>
          <h1 className="tn-display tnl-title">
            <span>Suomen luonto</span><br />lähimetsästä tunturiin
          </h1>
          <p className="tnl-lede">
            {count} visaa eläimistä, kasveista, maastoista ja luonnon ilmiöistä. Tunnetko oikeasti lähimetsäsi?
          </p>
          {ctaTarget && (
            <a className="tnl-cta" href={playHref(ctaTarget)}>Aloita luontomatka</a>
          )}
          <div className="tnl-hero-chips">
            <span className="tnl-chip"><b>{count}</b> visaa</span>
            <span className="tnl-chip"><b>{questions}</b> kysymystä</span>
            <span className="tnl-chip">Eläimet · Kasvit · Ilmiöt</span>
          </div>
        </div>
        <div className="tnl-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LUONTO_HERO} alt="" />
        </div>
        </div>
        </div>
      </section>

      <div className="tnl-shell">
        {/* ─── Aloita näistä: kuratoidut nostot — näkyvät aina, suodatin ei vaikuta ─── */}
        {features.length > 0 && (
          <section className="tnl-section">
            <div className="tn-section-head">
              <h2 className="tn-section-title">Aloita näistä</h2>
            </div>
            <div className="tnl-feature-grid">
              {features.map((c, i) => (
                <a key={c.id} className="tnl-feature" href={playHref(c)} data-first={i === 0 || undefined}>
                  <span className="tnl-feature-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={luontoImg(c.slug) ?? LUONTO_HERO} alt="" loading={i === 0 ? undefined : "lazy"} />
                  </span>
                  <span className="tnl-feature-body">
                    <span className="tnl-cardtitle">{c.display_title ?? c.title}</span>
                    <CardMeta c={c} />
                    {c.teaser && <span className="tnl-cardteaser">{c.teaser}</span>}
                    <span className="tnl-arrow" aria-hidden>→</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ─── Lauran ja Mikon valinta — editorial-nosto ─── */}
        {pick && (
          <section className="tnl-section tnl-section-tight">
            <a className="tnl-pick" href={playHref(pick)}>
              <span className="tnl-pick-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/20/luonto/laura-mikko.webp" alt="Laura ja Mikko" loading="lazy" />
              </span>
              <span className="tnl-pick-body">
                <span className="tnl-pick-label">★ Lauran ja Mikon valinta</span>
                <span className="tnl-cardtitle">{pick.display_title ?? pick.title}</span>
                <CardMeta c={pick} />
              </span>
              <span className="tnl-arrow" aria-hidden>→</span>
            </a>
          </section>
        )}

        {/* ─── Kaikki luontovisat: otsikko + kokonaismäärä + suodattimet + ruudukko ─── */}
        <section className="tnl-section" id="kaikki">
          <div className="tn-section-head">
            <h2 className="tn-section-title">Kaikki luontovisat</h2>
            <div className="tn-hubrow-note">{count} visaa</div>
          </div>
          <nav className="tn-chipnav tnl-filters" aria-label="Alakokoelmat">
            <a href="/2-0/kokoelma/luonto#kaikki" data-active={filter === "kaikki" || undefined}>Kaikki</a>
            {presentSubs.map((s) => (
              <a key={s.key} href={`/2-0/kokoelma/luonto?suodata=${s.key}#kaikki`} data-active={filter === s.key || undefined}>
                {s.label}
              </a>
            ))}
          </nav>
          {visible.length === 0 ? (
            <div className="tn-empty">Tällä suodattimella ei löytynyt visoja. Kokeile toista.</div>
          ) : (
            <ShowAllCards total={visible.length}>
              {visible.map((c) => (
                <a key={c.id} className="tnl-card" href={playHref(c)}>
                  <span className="tnl-card-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={luontoImg(c.slug) ?? LUONTO_HERO} alt="" loading="lazy" />
                    {c.badge === "uusi" && <span className="tnl-badge">Uusi</span>}
                  </span>
                  <span className="tnl-card-body">
                    <span className="tnl-cardtitle">{c.display_title ?? c.title}</span>
                    <CardMeta c={c} />
                    {c.teaser && <span className="tnl-cardteaser">{c.teaser}</span>}
                    <span className="tnl-arrow" aria-hidden>→</span>
                  </span>
                </a>
              ))}
            </ShowAllCards>
          )}
        </section>
      </div>
      {article}
    </main>
  );
}
