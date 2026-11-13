// MEGAVISAT /megavisat hub-rungolla (Heikki 12.11.2026, vaihe 2): 1) hero = studiokuva (Mikko) + nimi + intro omalla
// pohjallaan ja datasta laskettu rivi "{n} megavisaa · {min}–{max} kysymystä"; 2) ei nostoa (Heikki 12.11., vaihe 3): kaikki
// megat samanarvoisina riveinä uusin ensin (kannan luontiaika), tietorivi "{n} kysymystä · kesto"; 3) Näin mega toimii suljettuna.
// Kortit haetaan kannasta slugilla — jos mega puuttuu tai siinä ei ole pelattavia kysymyksiä, rivi jää pois hiljaa.
// Kysymysmäärät datasta (megaMaarat = pelattavat kysymykset, sama luku kuin pelissä), ei kovakoodattuina.

import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import { cache } from "react";
import { getSupabase } from "@/lib/supabase";
import Crumbs from "@/components/tn20/Crumbs";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import HubHero from "@/components/tn20/korttirivi/HubHero";
import HubRivit, { type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import HubOhjeet from "@/components/tn20/korttirivi/HubOhjeet";
import { MEGA_FEATURED, MEGA_GRID, megaDuration, megaMaarat, maaraVali, type MegaCard } from "@/lib/megavisat";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

/* SEO 25.10.2026 (Search Console): "megavisa"-haut sijalla 5–7, mutta 357 näytöstä 1 klikki —
   title ja kuvaus eivät kertoneet, mitä megavisa on. Luvut ja aiheet kannasta (haeMegat). */
export async function generateMetadata(): Promise<Metadata> {
  const megat = await haeMegat();
  const vali = megat ? maaraVali(megat.kaikkiMaarat) : null;
  const n = megat?.kaikkiMaarat.length ?? 0;
  const title = n && vali
    ? `Megavisat – ${n} pitkää tietovisaa, ${vali} kysymystä | Tietoniekka`
    : "Megavisat – pitkät tietovisat | Tietoniekka";
  const aiheet = megat?.aiheet.slice(0, 3) ?? [];
  const aiheista = aiheet.length === 3 ? ` aiheista ${aiheet[0]}, ${aiheet[1]} ja ${aiheet[2]}` : "";
  const description = vali
    ? `Pitkät tietovisat yhdeltä istumalta: ${vali} kysymystä${aiheista}. Ilmainen, ei kirjautumista.`
    : "Pitkät tietovisat yhdeltä istumalta. Ilmainen, ei kirjautumista.";
  const canonical = `${SITE_URL}/megavisat`;
  return {
    title: { absolute: title }, description,
    alternates: { canonical },
    ...jakoMeta({ title, description, url: canonical, kuva: "/og/sivu/megavisat" }),
  };
}

type MegaRow = { slug: string; title: string; teaser: string | null; created_at: string };

/** Sivun megat näyttöjärjestyksessä (nosto + ruudukko) pelattavine kysymysmäärineen; metadata ja sivu jakavat haun. */
const haeMegat = cache(async () => {
  const sb = getSupabase();
  if (!sb) return null;
  const allSlugs = [MEGA_FEATURED.slug, ...MEGA_GRID.map((c) => c.slug)];

  const { data: quizRows } = await sb
    .from("quizzes" as never)
    .select("id, slug, title, teaser, created_at")
    .eq("game_mode" as unknown as "status", "mega")
    .in("slug", allSlugs);
  const quizzes = (quizRows ?? []) as unknown as Array<MegaRow & { id: string }>;
  const bySlug = new Map(quizzes.map((q) => [q.slug, q]));

  // Kysymysmäärä = pelattavat kysymykset (megaMaarat: mega_questions-linkit, joiden kysymys näkyy julkisesti —
  // sama luku kuin pelissä). Heikki 20.10.2026: kaikki sivun luvut datasta, ei kovakoodattuina.
  const maaraById = await megaMaarat(sb, quizzes.map((q) => q.id));
  const countBySlug = new Map(quizzes.map((q) => [q.slug, maaraById.get(q.id) ?? 0]));

  const featuredQuiz = bySlug.get(MEGA_FEATURED.slug);
  const featuredCount = countBySlug.get(MEGA_FEATURED.slug) ?? 0;
  const gridItems = MEGA_GRID
    .map((c) => ({ card: c, quiz: bySlug.get(c.slug), count: countBySlug.get(c.slug) ?? 0 }))
    .filter((g) => g.quiz && g.count > 0);
  const kaikkiMaarat = [...(featuredQuiz && featuredCount > 0 ? [featuredCount] : []), ...gridItems.map((g) => g.count)];
  const aiheet = [...(featuredQuiz && featuredCount > 0 ? [MEGA_FEATURED.aihe] : []), ...gridItems.map((g) => g.card.aihe)];
  /* Hub-sivun rivit (vaihe 3): kaikki megat, uusin ensin kannan luontiajasta. */
  const rivit = [...(featuredQuiz && featuredCount > 0 ? [{ card: MEGA_FEATURED, quiz: featuredQuiz, count: featuredCount }] : []), ...gridItems.map((g) => ({ ...g, quiz: g.quiz! }))]
    .sort((a, b) => b.quiz.created_at.localeCompare(a.quiz.created_at));
  return { featuredQuiz, featuredCount, gridItems, kaikkiMaarat, aiheet, rivit };
});

/* Hero-tekstit: CC-brief "Hub-sivujen hero-tekstien yhtenäistys" (Heikki hyväksyi 13.11.2026). Koukku korostettuna, sitten myyntiteksti. */
const KOROSTUS = "Kymmenen kysymystä on vasta lämmittely.";
const INTRO = "Megavisa on tietovisojen pitkä matka: kysymys toisensa perään yleistiedosta, urheilusta, viihteestä ja Suomen kaupungeista. Mitä pidempi oikeiden putki, sitä kovempi kerroin – ja yksi väärä vastaus nollaa sen. Kuinka pitkälle tietosi kantavat?";

/* Rivi: nimi + tietorivi "{n} kysymystä · ~20 min" (datasta). */
const rivi = (card: MegaCard, quiz: MegaRow, count: number): RiviKortti => ({
  href: `/peli?mega=${quiz.slug}`,
  kuva: `/20/rivi/mega-${card.slug}.webp`,
  kuvaton: card.tag,
  nimi: quiz.title.replace(/ -/g, "\u00a0-"), // "Maailman kolkat -megavisa": yhdysmerkki ei jää rivin alkuun
  rivi: `${count} kysymystä · ${megaDuration(count)}`,
});

export default async function MegavisatLanding() {
  const megat = await haeMegat();
  if (!megat) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  const { kaikkiMaarat } = megat;
  const vali = maaraVali(kaikkiMaarat);
  const rivit = megat.rivit.map(({ card, quiz, count }) => rivi(card, quiz, count));
  const lyhin = kaikkiMaarat.length ? Math.min(...kaikkiMaarat) : 0;
  const pisin = kaikkiMaarat.length ? Math.max(...kaikkiMaarat) : 0;

  const saannot = [
    {
      t: "Valitse aihe",
      d: lyhin && lyhin !== pisin
        ? `Jokainen mega on oma kokonaisuutensa: ${lyhin} kysymystä kahvitauolle, ${pisin} illan sessioon.`
        : "Jokainen mega on oma kokonaisuutensa: valitse aihe ja pelaa yhdellä istumalla.",
    },
    { t: "Yksi istunto, ei taukoja", d: "Mega ei tallenna välitilaa. Poistuminen kesken päättää kierroksen." },
    { t: "Putki ratkaisee", d: "Peräkkäiset oikeat kasvattavat kerrointa. Yksi väärä nollaa sen." },
  ];

  return (
    <PeliKehys iho="tumma">
      <KokoelmaLd avain="megavisat" nimi="Megavisat" polku="/megavisat" />
      <Crumbs items={[{ label: "Megavisat" }]} />
      <main>
        <div className="hub">
          <HubHero
            kuva={{
              src: "/20/megavisat/mikko-hero.webp",
              srcSet: "/20/megavisat/mikko-hero-900.webp 900w, /20/megavisat/mikko-hero.webp 1672w",
              alt: "Mikko Megavisa-studiossa",
              width: 1672,
              height: 941,
              pos: "center 30%",
            }}
            nimi="Megavisat"
            korostus={KOROSTUS}
            intro={INTRO}
            lisa={kaikkiMaarat.length && vali ? `${kaikkiMaarat.length} megavisaa · ${vali} kysymystä` : undefined}
          />
          <HubRivit kortit={rivit} nimi="Megavisat" eager={4} />
          <HubOhjeet
            kohdat={[{
              otsikko: "Näin mega toimii",
              sisalto: (
                <ul>
                  {saannot.map((r) => (
                    <li key={r.t}><b>{r.t}.</b> {r.d}</li>
                  ))}
                </ul>
              ),
            }]}
          />
        </div>
      </main>
      {/* Alatunniste tulee layoutista (SiteFooter) */}
    </PeliKehys>
  );
}
