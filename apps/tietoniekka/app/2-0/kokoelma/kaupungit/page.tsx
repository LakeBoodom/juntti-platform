// TIETONIEKKA 2.0 — SUOMEN KAUPUNGIT: teemasivu (CD "TN Suomen kaupungit
// -teemasivu" 27.8.2026, design_handoff_suomen_kaupungit/README.md).
// Kymmenes teemasivu. Staattinen segmentti ohittaa dynaamisen
// [collection]-reitin — sama malli kuin Jääkiekko/Jalkapallo/Urheilu:
// visat ovat kannassa "yleistieto"-kokoelmaa, mutta teemasivu nostetaan
// navigaatioon omana kohtanaan ja visamäärä lasketaan tämän sivun omasta
// slugilistasta (lib/kaupungit.ts KAUPUNGIT), ei collection-kentästä.
//
// Matkapassi-konsepti: kartta on pelilauta, leimat kertyvät pelaamalla
// (ei tuloksesta riippuen — Heikin päätös 28.8.2026), tallennus
// localStorageen ilman kirjautumista (ks. KaupunkiPelilauta.tsx).
//
// Kaikki 20 kaupunkivisaa julkaistiin tämän sivun rakentamisen yhteydessä
// 28.8.2026 (olivat draft, 10 kysymystä/visa — löydettiin ja varmistettiin
// Heikin toimittamalla kaupunki→otsikko-mäppäyksellä, koska README:n
// design-id ei vastaa visojen oikeita slugeja). Suomi-megavisa-CTA linkkaa
// Suomen kaupungit -megavisaan ?mega=-osoitteella (QA-001, 29.8.2026; aiemmin
// ?visa=kaikki-suomesta-mega, joka antoi tyhjän sivun).

import "../../kaupungit.css";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import Crumbs from "@/components/tn20/Crumbs";
import KaupunkiPelilauta from "@/components/tn20/KaupunkiPelilauta";
import KaupunkiMatkapassi, { KaupunkiMatkapassiBadge } from "@/components/tn20/KaupunkiMatkapassi";
import { KAUPUNGIT, KAUPUNGIT_HERO_IMG, SUOMI_MEGA_SLUG, kaupunkiImg } from "@/lib/kaupungit";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("kaupungit");
  const title = pc?.seo_title ?? "Suomen kaupungit — matkusta halki Suomen tietovisoina";
  const description =
    pc?.seo_description ??
    "20 kaupunkia, 20 visaa. Valitse kaupunki kartalta, pelaa ja kerää leimoja matkapassiisi.";
  const canonical = `${SITE_URL}/2-0/kokoelma/kaupungit`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type Row = { slug: string; published_at: string | null; question_count: number | null };

export default async function KaupungitLanding() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const slugs = KAUPUNGIT.map((c) => c.quizSlug);
  const { data } = await sb
    .from("quiz_cards" as never)
    .select("slug, published_at, question_count")
    .in("slug", slugs);
  const bySlug = new Map(((data ?? []) as unknown as Row[]).map((r) => [r.slug, r]));

  const publishedIds = new Set(
    KAUPUNGIT.filter((c) => bySlug.get(c.quizSlug)?.published_at).map((c) => c.id),
  );
  const questionCounts: Record<string, number> = {};
  for (const c of KAUPUNGIT) {
    questionCounts[c.id] = bySlug.get(c.quizSlug)?.question_count ?? 10;
  }

  return (
    <main className="tnk tnk2" style={{ minHeight: "100dvh" }}>
      <Crumbs
        items={[
          { label: "Kokoelmat", href: "/2-0/kokoelmat" },
          { label: "Maantieto", href: "/2-0/kokoelma/matkakohteet" },
          { label: "Suomen kaupungit" },
        ]}
      />

      {/* ─── Hero + matkapassi ─── */}
      <section className="tnk2-herowrap">
        <div className="tnk2-hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={KAUPUNGIT_HERO_IMG} alt="" fetchPriority="high" />
        </div>
        <div className="tn-shell tnk2-hero">
          <span className="tnk2-badge">
            <i aria-hidden />Kaupunkivisat
          </span>
          <h1 className="tnk2-h1">
            Matkusta<br />halki Suomen
          </h1>
          <p className="tnk2-lede">
            Jokaisella kaupungilla on oma visansa. Pelaa, kerää leimoja matkapassiisi ja katso, kuinka pitkälle
            matkasi kantaa.
          </p>
          <KaupunkiMatkapassi />
        </div>
      </section>

      <KaupunkiPelilauta publishedIds={publishedIds} questionCounts={questionCounts} />

      {/* ─── CTA — Suomi-megavisa ─── */}
      <section className="tn-shell tnk2-ctasection">
        <div className="tnk2-ctabox">
          <div className="tnk2-ctabox-bg" aria-hidden>
            {["helsinki", "tampere", "vaasa", "rovaniemi"].map((id) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={id} src={kaupunkiImg(id)} alt="" />
            ))}
          </div>
          <svg className="tnk2-ctabox-route" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
            <path
              d="M2,32 C24,27 30,13 52,16 C72,19 80,8 98,12" fill="none" stroke="#35D6A0" strokeWidth={1.5}
              strokeDasharray="4 6" strokeLinecap="round" vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="tnk2-ctabox-content">
            <div className="tnk2-ctabox-text">
              <KaupunkiMatkapassiBadge />
              <h3 className="tnk2-h3">Valmis koko Suomen kierrokseen?</h3>
              <p className="tnk2-ctabox-desc">
                Kysymyksiä kaikista 20 kaupungista yhdessä visassa. Jätä kartta sivuun ja katso, kuinka hyvin tunnet
                Suomen.
              </p>
            </div>
            <a className="tnk2-ctabox-btn" href={`/2-0/peli?mega=${SUOMI_MEGA_SLUG}`}>Pelaa Suomen kaupungit -megavisa</a>
          </div>
        </div>
      </section>

      {/* Alatunniste tulee layoutista (SiteFooter, QA-005 29.8.2026) */}
    </main>
  );
}
