// TIETONIEKKA 2.0 — kokoelmahubit, CD:n päivitetty design 2026-07-31
// ("kortti oli liian dominoiva" → leveä kortti, visa pääosassa)
// Rakenne: kokoelmahero → suodattimet (pelitapa + 🔒 Mega + sarja/laji)
// → rivit (data-vetoiset) → Selaa kaikki -CTA-paneeli → #kaikki-ruudukko.
// Kuvavisat: oma kortistoruudukko suoraan kannasta.
// Tunnetut henkilöt: oma hub (ennallaan, Heikin ohje 2026-07-31).

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { PersonCard, type QuizCardData } from "@/components/tn20/cards";
import { WideCard } from "@/components/tn20/WideCard";
import { MOTIF_PATHS, motifPathFor } from "@/components/tn20/motif-paths";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import { getPageContent } from "@/lib/pageContent";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

/* Hubin metadata page_content-taulusta. Aiemmin hubit perivät 2.0-layoutin
   geneerisen "esikatselu"-otsikon — ks. SEO_STRATEGIA.md §3.2. */
export async function generateMetadata(
  { params }: { params: Promise<{ collection: string }> }
): Promise<Metadata> {
  const { collection } = await params;
  const pc = await getPageContent(collection);
  const hub = HUBS[collection];
  if (!pc && !hub) return {};

  const title = pc?.seo_title ?? `${hub?.name ?? "Kokoelma"} — tietovisat`;
  const description = pc?.seo_description ?? hub?.lede(0) ?? undefined;
  const canonical = `${SITE_URL}/2-0/kokoelma/${collection}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "fi_FI",
      siteName: "Tietoniekka",
      url: canonical,
      title,
      description,
    },
  };
}

/* ─────────── Hub-konfiguraatio (CD:n designit) ─────────── */

type HubSource = { kind: "collection" | "category"; value: string } | { kind: "kuvavisa" } | { kind: "person" };
type HubMeta = {
  name: string;          // breadcrumbiin ja muihin yhteyksiin — aina kokonainen sana/nimi
  oneWord?: boolean;     // true = otsikko on yksi sana → yhdelle riville (ei rivinvaihtoa)
  titleTop: string;
  titleAccent: string;
  accent: string;
  accentLight: string;
  img: string;
  imgPos?: string;
  lede: (n: number) => string;
  chips: (n: number) => string[];
  source: HubSource;
  modes: Array<{ label: string; icon: string; href: string }>;
  ctaTitle: (n: number) => string;
  ctaDesc: string;
};

const MODE_KUMPI = { label: "Kumpi?", icon: "◑", href: "/kumpi" };
const MODE_JARJESTA = { label: "Järjestä", icon: "⇅", href: "/jarjesta" };

const HUBS: Record<string, HubMeta> = {
  tv: {
    name: "TV & Suoratoisto",
    titleTop: "TV &", titleAccent: "Suoratoisto",
    accent: "#FF3D9E", accentLight: "#FF6FB5",
    img: "/20/hero-tv-laura.webp",
    lede: (n) => `${n} visaa sarjoista joita katsottiin liian myöhään. Valitse genre tai pelitapa.`,
    chips: (n) => [`${n} visaa`, "6 genreä", "Kotimaiset & ulkomaiset"],
    source: { kind: "collection", value: "tv" },
    modes: [],
    ctaTitle: (n) => `Kaikki ${n} sarjavisaa`,
    ctaDesc: "Valitse genre tai selaa koko katalogi — Frendeistä Sopranosiin.",
  },
  urheilu: {
    name: "Urheilu", oneWord: true,
    titleTop: "Urhei", titleAccent: "lu",
    accent: "#B6FF3C", accentLight: "#CFFF7A",
    img: "/20/hero-urheilu-mikko.webp",
    lede: (n) => `${n} visaa joukkue kerrallaan. Jokainen kortti kantaa joukkueen omat värit — ei kokoelmaväriä.`,
    chips: (n) => [`${n} visaa`, "Maajoukkueet & seurat", "3 pelimuotoa"],
    source: { kind: "collection", value: "urheilu" },
    modes: [MODE_KUMPI, MODE_JARJESTA],
    ctaTitle: (n) => `Kaikki ${n} urheiluvisaa`,
    ctaDesc: "Valitse laji, sarja tai oma joukkue.",
  },
  elokuvat: {
    name: "Elokuvat", oneWord: true,
    titleTop: "Elo", titleAccent: "kuvat",
    accent: "#FF5C3D", accentLight: "#FF8566",
    img: "/20/teema-elokuvat.webp",
    lede: (n) => `${n} visaa valkokankaalta: blockbusterit, kotimaiset klassikot ja ne joita ei myönnetä katsotuiksi.`,
    chips: (n) => [`${n} visaa`, "Klassikot & uutuudet"],
    source: { kind: "collection", value: "elokuvat" },
    modes: [],
    ctaTitle: (n) => `Kaikki ${n} elokuvavisaa`,
    ctaDesc: "Selaa koko katalogi tai poimi klassikko.",
  },
  musiikki: {
    name: "Musiikki", oneWord: true,
    titleTop: "Mu", titleAccent: "siikki",
    accent: "#A855F7", accentLight: "#C79BFB",
    img: "/20/teema-musiikki.webp",
    lede: (n) => `${n} visaa levyistä, riimeistä ja festareista. Iskelmästä metalliin, Spotifysta vinyyliin.`,
    chips: (n) => [`${n} visaa`, "Suomi & maailma", "2 pelimuotoa"],
    source: { kind: "collection", value: "musiikki" },
    modes: [MODE_KUMPI],
    ctaTitle: (n) => `Kaikki ${n} musiikkivisaa`,
    ctaDesc: "Artistit, bändit ja festarit — valitse omasi.",
  },
  matkakohteet: {
    name: "Matkakohteet", oneWord: true,
    titleTop: "Matka", titleAccent: "kohteet",
    accent: "#E8A320", accentLight: "#F5C462",
    img: "/20/teema-maantieto.webp",
    lede: (n) => `${n} visaa kaupungeista, saarista ja luonnosta. Maailma pääkaupungeista pikkukyliin.`,
    chips: (n) => [`${n} visaa`, "Maantieto & luonto", "3 pelimuotoa"],
    source: { kind: "collection", value: "matkakohteet" },
    modes: [MODE_KUMPI, MODE_JARJESTA],
    ctaTitle: (n) => `Kaikki ${n} matkavisaa`,
    ctaDesc: "Valitse maanosa tai kohde — tai ota satunnainen matka.",
  },
  ruokajuoma: {
    name: "Ruoka & juoma",
    titleTop: "Ruoka &", titleAccent: "juoma",
    accent: "#F2C230", accentLight: "#F9D971",
    img: "/20/teema-ruoka-juoma.webp",
    lede: (n) => `${n} visaa keittiöistä, resepteistä ja juomista. Kotiruoasta Michelin-tähtiin.`,
    chips: (n) => [`${n} visaa`, "Osa Yleistietoa"],
    source: { kind: "category", value: "ruoka-juoma" },
    modes: [],
    ctaTitle: (n) => `Kaikki ${n} ruokavisaa`,
    ctaDesc: "Katalogi kasvaa — uusia keittiöitä tulossa.",
  },
  luonnonihmeet: {
    name: "Luonnon ihmeet",
    titleTop: "Luonnon", titleAccent: "ihmeet",
    accent: "#2FD9A5", accentLight: "#7CEBC8",
    img: "/20/teema-luonto.webp",
    lede: (n) => `${n} visaa eläimistä, luonnosta ja sen ilmiöistä. Lähimetsästä revontuliin.`,
    chips: (n) => [`${n} visaa`, "Osa Matkakohteita"],
    source: { kind: "category", value: "luonto" },
    modes: [MODE_KUMPI],
    ctaTitle: (n) => `Kaikki ${n} luontovisaa`,
    ctaDesc: "Eläimet, kasvit ja ilmiöt — tunnetko lähimetsäsi?",
  },
  kuvavisat: {
    name: "Kuvavisat", oneWord: true,
    titleTop: "Kuva", titleAccent: "visat",
    accent: "#4C9AFF", accentLight: "#8FC0FF",
    img: "/20/teema-liput.webp",
    lede: (n) => `Tunnistuspelit yhdessä paikassa: liput, vaakunat, eläimet ja muut. ${n} kuvaa, yksi silmäys kerrallaan.`,
    chips: (n) => [`${n} kuvaa`, "Kortistot kannasta"],
    source: { kind: "kuvavisa" },
    modes: [],
    ctaTitle: () => "Ota satunnainen kortisto",
    ctaDesc: "Yksi kuva, neljä vaihtoehtoa — kuinka tarkka silmäsi on?",
  },
  yleistieto: {
    name: "Yleistieto", oneWord: true,
    titleTop: "Yleis", titleAccent: "tieto",
    accent: "#E8A320", accentLight: "#F5C462",
    img: "/20/teema-ruoka-juoma.webp",
    lede: (n) => `${n} visaa historiasta, kulttuurista ja kaikesta siltä väliltä.`,
    chips: (n) => [`${n} visaa`, "Pitkä häntä asuu täällä"],
    source: { kind: "collection", value: "yleistieto" },
    modes: [MODE_JARJESTA],
    ctaTitle: (n) => `Kaikki ${n} yleistietovisaa`,
    ctaDesc: "Historia, ruoka, muoti ja loput.",
  },
  "tunnetut-henkilot": {
    name: "Tunnetut henkilöt",
    titleTop: "Tunnetut", titleAccent: "henkilöt",
    accent: "#C9A96A", accentLight: "#E3CFA6",
    img: "/20/teema-tunnetut-henkilot.webp",
    lede: () => "Näyttelijät, artistit, urheilijat ja muut tutut kasvot — kuinka hyvin tunnet heidät?",
    chips: () => ["3 pelitapaa", "Uusia henkilöitä joka viikko"],
    source: { kind: "person" },
    modes: [MODE_KUMPI],
    ctaTitle: () => "Selaa kaikkia",
    ctaDesc: "",
  },
};

/* Kuvakortistot: label + motiivi + väri per kannan type */
const DECK_META: Record<string, { label: string; note: string; motif: string; color: string }> = {
  liput: { label: "Liput", note: "Tunnista maa lipusta", motif: "lippu", color: "#4C9AFF" },
  vaakunat: { label: "Vaakunat", note: "Kunnat ja kilvet", motif: "vaakuna", color: "#8FC0FF" },
  elaimet: { label: "Eläimet", note: "Lajit lähikuvassa", motif: "elain", color: "#2FD9A5" },
  linnut: { label: "Linnut", note: "Siivet ja nokat", motif: "lintu", color: "#7CEBC8" },
  kasvit: { label: "Kasvit", note: "Lehti, kukka, kaarna", motif: "kasvi", color: "#4ADE80" },
  henkilot: { label: "Henkilöt", note: "Kasvot ja nimet", motif: "kasvot", color: "#F0A24B" },
  rakennukset: { label: "Rakennukset", note: "Tunnista rakennus", motif: "torni", color: "#F2C230" },
  kaupungit: { label: "Kaupungit", note: "Tunnista kaupunki", motif: "kaupunki", color: "#F5C462" },
  maalaukset: { label: "Maalaukset", note: "Taide tunnistettavana", motif: "naamio", color: "#E85D9E" },
};

/* Urheilun joukkuevärit titlestä (kunnes backfill kannassa) */
const TEAM_COLORS: Array<[RegExp, string]> = [
  [/arsenal/i, "#EF0107"], [/liverpool/i, "#C8102E"], [/belgian/i, "#E30613"],
  [/brasilia/i, "#FFDC02"], [/englannin/i, "#8FAEE0"], [/espanjan/i, "#C60B1E"],
  [/argentiinan/i, "#75AADB"], [/norjan/i, "#BA0C2F"], [/portugali/i, "#DA291C"],
  [/ranskan/i, "#4D7FD1"], [/suomen|huuhkaja/i, "#5B8FF0"], [/formula|f1/i, "#FF1E00"],
  [/ralli/i, "#4D9FFF"], [/tennik|federer|us open/i, "#DFFF4F"], [/golf|the open/i, "#4ADE80"],
  [/olympiastadion/i, "#E8A320"], [/italia/i, "#4A85E0"],
];
function teamColor(title: string, fallback: string) {
  for (const [re, c] of TEAM_COLORS) if (re.test(title)) return c;
  return fallback;
}

const TV_SHADES: Record<string, string> = {
  komedia: "#FF6FB5", draama: "#E04597", rikosdraama: "#C22C7C", scifi: "#FF4DD2",
  kauhu: "#9C2263", "tosi-tv": "#FF77C8", dokumentti: "#D155A0", animaatio: "#FF5CA8",
};

type Card = QuizCardData & { subcollection: string | null; published_at: string | null; category?: string };

function cardColor(hub: HubMeta, q: Card): string {
  if (q.collection === "urheilu") return teamColor(q.title, hub.accentLight);
  if (q.collection === "tv" && q.genre && TV_SHADES[q.genre]) return TV_SHADES[q.genre];
  return hub.accentLight;
}

/* Urheilun laji-chip titlestä — tarkempi kuin "Urheilu" (Heikin toive 2026-07-31).
   Oikea laji-backfill kantaan tehdään urheilukokoelman vuorolla. */
const SPORT_LABEL: Array<[RegExp, string]> = [
  [/formula|f1/i, "Formula 1"], [/ralli/i, "Ralli"],
  [/tennik|federer|us open/i, "Tennis"], [/golf|the open/i, "Golf"],
  [/koripallo|nba|susijengi/i, "Koripallo"], [/kiekko|nhl|liiga(?!ssa)|leijon/i, "Jääkiekko"],
  [/yleisurheilu|keihä/i, "Yleisurheilu"], [/olympiastadion|stadion/i, "Stadionit"],
  [/maajoukkue|jalkapallo|futis|fc |mm-kisat|mm-finaal|huuhkaja|arsenal|liverpool/i, "Jalkapallo"],
];
function sportLabel(title: string): string | null {
  for (const [re, label] of SPORT_LABEL) if (re.test(title)) return label;
  return null;
}

function toWide(hub: HubMeta, q: Card, genreLabel: Map<string, string>) {
  // Hubissa aihe on jo selvä — chip näytetään vain kun se kertoo jotain LISÄÄ:
  // genre (TV), laji (urheilu) tai alakokoelma. Muuten ei chippiä.
  const chip =
    (q.genre && (genreLabel.get(q.genre) ?? q.genre)) ||
    (q.collection === "urheilu" ? sportLabel(q.title) : null) ||
    (q.subcollection ? q.subcollection.charAt(0).toUpperCase() + q.subcollection.slice(1) : null);
  return {
    href: `/2-0/peli?quiz_id=${q.id}`,
    color: cardColor(hub, q),
    motifPath: motifPathFor(q.collection, q.genre, q.title),
    genreChip: chip ?? undefined,
    title: q.display_title ?? q.title,
    desc: q.teaser,
    mode: "Klassinen",
    meta: `${q.question_count} kysymystä`,
    badge: q.badge,
  };
}

/* ─────────── Sivu ─────────── */

export default async function KokoelmaHub({
  params, searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { collection } = await params;
  const sp = await searchParams;
  const filter = typeof sp.suodata === "string" ? sp.suodata : "kaikki";
  const hub = HUBS[collection];
  if (!hub) notFound();

  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  /* Kokoelman oma aiheopas (page_content) — SEO_STRATEGIA.md §5.2 */
  const pc = await getPageContent(collection);
  const article = pc?.learn ? (
    <LearnArticle learn={pc.learn} fallbackTitle={hub.name} accent={hub.accent} />
  ) : null;

  /* ── Tunnetut henkilöt (ennallaan) ── */
  if (hub.source.kind === "person") {
    return <PersonHub hub={hub} filter={filter} article={article} />;
  }

  /* ── Kuvavisat: kortistoruudukko kannasta ── */
  if (hub.source.kind === "kuvavisa") {
    const { data } = await sb.from("kuvavisas").select("type, active");
    const rows = (data ?? []) as Array<{ type: string; active: boolean }>;
    const counts: Record<string, number> = {};
    for (const r of rows) if (r.active) counts[r.type] = (counts[r.type] ?? 0) + 1;
    const decks = Object.entries(counts)
      .filter(([, n]) => n >= 5)
      .sort((a, b) => b[1] - a[1])
      .map(([type, n]) => ({ type, n, meta: DECK_META[type] ?? { label: type, note: "", motif: "kysymys", color: hub.accentLight } }));
    const total = decks.reduce((s, d) => s + d.n, 0);
    const words: Record<number, string> = { 4: "Neljä", 5: "Viisi", 6: "Kuusi", 7: "Seitsemän", 8: "Kahdeksan" };
    const deckWord = words[decks.length] ?? `${decks.length}`;

    return (
      <HubShell hub={hub} count={total} filter={filter} filters={[]} article={article}>
        <section className="tn-section" style={{ paddingTop: 8 }}>
          <div className="tn-hubrow-head">
            <div>
              <h2 className="tn-section-title">{deckWord} kuvakokoelmaa</h2>
              <div className="tn-hubrow-note">Jokainen tunnistuspeli omalla kortistollaan — uudet kortistot ilmestyvät tähän suoraan kannasta</div>
            </div>
          </div>
          <div className="tn-card-grid">
            {decks.map((d) => (
              <a key={d.type} className="tn-deck" href={`/peli?kuvavisa=${d.type}`} style={{ color: d.meta.color }}>
                <div className="tn-deck-inner">
                  <div className="tn-deck-wash" />
                  <div className="tn-deck-glow" />
                  <svg viewBox="0 0 200 260" className="tn-deck-motif" aria-hidden>
                    <path d={MOTIF_PATHS[d.meta.motif]} fill="none" stroke="currentColor" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="tn-deck-fade" />
                  <div className="tn-deck-body">
                    <div className="tn-deck-title">{d.meta.label}</div>
                    <div className="tn-deck-note">{d.meta.note} · {d.n} kuvaa</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
        <section className="tn-section">
          <div className="tn-ctapanel" style={{ ["--tn-hub-accent" as string]: hub.accent }}>
            <div style={{ flex: "2 1 min(100%, 280px)" }}>
              <h2 className="tn-display" style={{ fontSize: "clamp(24px, 3.4cqw, 44px)", margin: "0 0 10px" }}>{hub.ctaTitle(total)}</h2>
              <p style={{ margin: 0, color: "#B9AF9B", maxWidth: "38ch" }}>{hub.ctaDesc}</p>
            </div>
            <a className="tn-cta" href={`/peli?kuvavisa=${decks[0]?.type ?? "liput"}`} style={{ color: "var(--tn-bg)" }}>
              Pelaa heti →
            </a>
          </div>
        </section>
      </HubShell>
    );
  }

  /* ── Visahubit ── */
  const base = sb.from("quiz_cards" as never).select("*");
  const scoped =
    hub.source.kind === "collection" ? base.eq("collection", hub.source.value) : base.eq("category", hub.source.value);
  const [cardsRes, genresRes] = await Promise.all([
    scoped.order("published_at", { ascending: false }),
    sb.from("genres" as never).select("collection, genre_key, label, sort_order").order("sort_order"),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as Card[];
  const genres = (genresRes.data ?? []) as unknown as Array<{ collection: string; genre_key: string; label: string }>;
  const genreLabel = new Map(genres.map((g) => [g.genre_key, g.label]));

  const present = new Set(cards.map((c) => c.genre).filter(Boolean));
  const subs = [...new Set(cards.map((c) => c.subcollection).filter(Boolean))] as string[];
  const filters: Array<{ key: string; label: string }> = [
    ...subs.map((s) => ({ key: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
    ...genres.filter((g) => present.has(g.genre_key)).map((g) => ({ key: g.genre_key, label: g.label })),
  ];

  const visible = filter === "kaikki" ? cards : cards.filter((c) => c.genre === filter || c.subcollection === filter);

  // Rivit (vain ne joissa on sisältöä): Uusimmat + alakokoelmat + Vaikeimmat
  const rowsOut: Array<{ title: string; note: string; cards: Card[] }> = [];
  if (filter === "kaikki") {
    rowsOut.push({ title: "Uusimmat", note: "Tuoreimmat lisäykset kokoelmaan", cards: cards.slice(0, 8) });
    for (const s of subs) {
      const sc = cards.filter((c) => c.subcollection === s);
      if (sc.length >= 3)
        rowsOut.push({
          title: s.charAt(0).toUpperCase() + s.slice(1),
          note: s === "kotimaiset" ? "Suomessa tehtyä" : "Maailmalta",
          cards: sc.slice(0, 8),
        });
    }
    const hard = cards.filter((c) => c.badge === "vaikea");
    if (hard.length >= 3) rowsOut.push({ title: "Vaikeimmat", note: "Faneille — varoitettu on", cards: hard.slice(0, 8) });
  }

  return (
    <HubShell hub={hub} count={cards.length} filter={filter} filters={filters} basePath={`/2-0/kokoelma/${collection}`} article={article}>
      {rowsOut.map((row) => (
        <section key={row.title} className="tn-section" style={{ paddingTop: 8, paddingBottom: 0 }}>
          <div className="tn-hubrow-head">
            <div>
              <h2 className="tn-section-title">{row.title}</h2>
              <div className="tn-hubrow-note">{row.note}</div>
            </div>
            <a className="tn-morelink" href="#kaikki" style={{ color: hub.accentLight }}>Selaa kaikki →</a>
          </div>
          <div className="tn-hubrow-scroller">
            {row.cards.map((c) => (
              <WideCard key={c.id} {...toWide(hub, c, genreLabel)} />
            ))}
          </div>
        </section>
      ))}

      <section className="tn-section" style={{ paddingBottom: 0 }}>
        <div className="tn-ctapanel" style={{ ["--tn-hub-accent" as string]: hub.accent }}>
          <div style={{ flex: "2 1 min(100%, 280px)" }}>
            <h2 className="tn-display" style={{ fontSize: "clamp(24px, 3.4cqw, 44px)", margin: "0 0 10px" }}>{hub.ctaTitle(cards.length)}</h2>
            <p style={{ margin: 0, color: "#B9AF9B", maxWidth: "38ch" }}>{hub.ctaDesc}</p>
          </div>
          <a className="tn-cta" href="#kaikki" style={{ color: "var(--tn-bg)" }}>
            Selaa kaikki {cards.length} →
          </a>
        </div>
      </section>

      <section className="tn-section" id="kaikki">
        <div className="tn-hubrow-head">
          <div>
            <h2 className="tn-section-title">{filter === "kaikki" ? "Kaikki visat" : filters.find((f) => f.key === filter)?.label ?? filter}</h2>
            <div className="tn-hubrow-note">{visible.length} visaa</div>
          </div>
        </div>
        {visible.length === 0 ? (
          <div className="tn-empty">Tällä suodattimella ei löytynyt visoja. Kokeile toista.</div>
        ) : (
          <div className="tn-wide-grid">
            {visible.map((c) => (
              <WideCard key={c.id} {...toWide(hub, c, genreLabel)} />
            ))}
          </div>
        )}
      </section>
    </HubShell>
  );
}

/* ─────────── Kuori: hero + suodattimet ─────────── */

function HubShell({
  hub, count, filter, filters, basePath, children, article,
}: {
  hub: HubMeta; count: number; filter: string;
  filters: Array<{ key: string; label: string }>; basePath?: string;
  children: React.ReactNode;
  /* Kokoelman oma aiheopas (page_content). Renderöidään palvelimelta
     visalistan alle — SEO_STRATEGIA.md §5.2. */
  article?: React.ReactNode;
}) {
  return (
    <main style={{ minHeight: "100dvh", paddingBottom: 60 }}>
      <section className="tn-hero" style={{ minHeight: "clamp(320px, 40vw, 520px)", display: "flex", alignItems: "flex-end" }}>
        <div className="tn-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hub.img} alt="" style={{ objectPosition: hub.imgPos ?? "52% 38%" }} />
        </div>
        <div className="tn-shell" style={{ position: "relative", width: "100%" }}>
          <div style={{ padding: "clamp(80px, 12vw, 140px) 0 clamp(26px, 3.6vw, 62px)", maxWidth: 640 }}>
            <nav style={{ fontSize: 13, fontWeight: 700, color: "#8E8676", marginBottom: 14 }}>
              <a href="/2-0" style={{ color: "inherit", textDecoration: "none" }}>Kokoelmat</a>
              {" / "}
              <span style={{ color: hub.accentLight }}>{hub.name}</span>
            </nav>
            <h1 className="tn-display" style={{ fontSize: hub.oneWord ? "clamp(34px, 6.2vw, 84px)" : "clamp(38px, 7.4vw, 96px)", lineHeight: 0.9, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
              {hub.titleTop}
              {hub.oneWord ? null : <br />}
              <span style={{ color: hub.accent }}>{hub.titleAccent}</span>
            </h1>
            <p style={{ margin: "0 0 18px", color: "var(--tn-text-soft)", fontSize: "clamp(14px, 1.5vw, 20px)", lineHeight: 1.5, maxWidth: "40ch" }}>
              {hub.lede(count)}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 13, fontWeight: 700 }}>
              {hub.chips(count).map((c, i) => (
                <span
                  key={c}
                  className="tn-trustchip"
                  style={i === 0 ? { background: `color-mix(in srgb, ${hub.accent} 16%, transparent)`, borderColor: `color-mix(in srgb, ${hub.accent} 50%, transparent)`, color: hub.accentLight } : undefined}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="tn-shell">
        <section className="tn-section" style={{ paddingBottom: 0 }}>
          <div className="tn-filters">
            <div className="tn-filtergroup">
              <div className="tn-filterlabel">Pelitapa</div>
              <nav className="tn-chipnav">
                <a href={basePath ?? "#"} style={{ background: "var(--tn-lime)", color: "var(--tn-bg)", borderColor: "var(--tn-lime)", fontWeight: 800 }}>Kaikki</a>
                {hub.modes.map((m) => (
                  <a key={m.label} href={m.href}><span style={{ opacity: 0.9, marginRight: 6 }}>{m.icon}</span>{m.label}</a>
                ))}
                <span className="tn-lockchip" title="Vaatii lisää kysymyksiä">🔒 Mega</span>
              </nav>
              <div className="tn-filternote">Lukittu muoto avautuu, kun kysymyksiä on tarpeeksi.</div>
            </div>
            {filters.length > 0 && basePath && (
              <div className="tn-filtergroup">
                <div className="tn-filterlabel">Sarja tai laji</div>
                <nav className="tn-chipnav">
                  <a href={basePath} style={filter === "kaikki" ? { borderColor: hub.accent, color: hub.accentLight, fontWeight: 800 } : undefined}>Kaikki</a>
                  {filters.map((f) => (
                    <a
                      key={f.key}
                      href={`${basePath}?suodata=${f.key}`}
                      style={filter === f.key ? { borderColor: hub.accent, color: hub.accentLight, fontWeight: 800 } : undefined}
                    >
                      {f.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </section>
        {children}
      </div>
      {article}
    </main>
  );
}

/* ─────────── Tunnetut henkilöt -hub (ennallaan) ─────────── */

const ROLE_GROUPS: Record<string, string[]> = {
  nayttelijat: ["näyttelijä"],
  artistit: ["laulaja", "muusikko", "räppäri", "rap-artisti", "pop-artisti", "pianisti", "oopperalaulaja", "kapellimestari", "dj", "viihdetaiteilija"],
  urheilijat: [
    "jääkiekkoilija", "jalkapalloilija", "formulakuljettaja", "f1-kuljettaja", "hiihtäjä", "tennispelaaja",
    "mäkihyppääjä", "taitoluistelija", "jalkapallovalmentaja", "lentopalloilija", "alppihiihtäjä",
    "ralliautoilija", "rallikuljettaja", "painija", "golfaaja", "yleisurheilija", "seiväshyppääjä",
    "koripalloilija", "uimari", "kiekkoilija", "valmentaja",
  ],
  poliitikot: ["poliitikko", "presidentti", "ministeri", "kansanedustaja", "kuninkaallinen"],
};
const GROUP_LABELS = [
  { key: "kaikki", label: "Kaikki" },
  { key: "nayttelijat", label: "Näyttelijät" },
  { key: "artistit", label: "Artistit" },
  { key: "urheilijat", label: "Urheilijat" },
  { key: "poliitikot", label: "Poliitikot & merkkihenkilöt" },
  { key: "muut", label: "Muut" },
];
function roleGroup(role: string | null): string {
  const r = (role ?? "").toLowerCase();
  for (const [key, roles] of Object.entries(ROLE_GROUPS)) if (roles.some((x) => r.includes(x) || x.includes(r))) return key;
  return "muut";
}

type Celeb = {
  id: string; slug: string | null; name: string; role: string | null;
  image_url: string | null; birth_date: string; trivia_quiz_id: string | null;
};
function playHref(c: Celeb): string {
  if (c.trivia_quiz_id) return `/2-0/peli?quiz_id=${c.trivia_quiz_id}`;
  return c.slug ? `/sankari/${c.slug}` : "#";
}

async function PersonHub({ hub, filter, article }: { hub: HubMeta; filter: string; article?: React.ReactNode }) {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  const { data } = await sb
    .from("celebrities")
    .select("id, slug, name, role, image_url, birth_date, trivia_quiz_id")
    .order("name");
  const celebs = (data ?? []) as Celeb[];

  const today = new Date();
  const key = (m: number, d: number) => m * 100 + d;
  const todayKey = key(today.getMonth() + 1, today.getDate());
  const bdays = celebs
    .filter((c) => c.trivia_quiz_id)
    .map((c) => {
      const b = new Date(c.birth_date);
      const k = key(b.getMonth() + 1, b.getDate());
      return { c, dist: k >= todayKey ? k - todayKey : k + 1300 - todayKey };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 12);
  const filtered = filter === "kaikki" ? celebs : celebs.filter((c) => roleGroup(c.role) === filter);

  return (
    <main style={{ minHeight: "100dvh", paddingBottom: 80 }}>
      <section className="tn-hero" style={{ minHeight: "clamp(300px, 34vw, 460px)", display: "flex", alignItems: "flex-end" }}>
        <div className="tn-hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hub.img} alt="" />
        </div>
        <div className="tn-shell" style={{ position: "relative", width: "100%" }}>
          <div style={{ padding: "clamp(70px, 10vw, 120px) 0 clamp(26px, 3.6vw, 52px)", maxWidth: 640 }}>
            <nav style={{ fontSize: 13, fontWeight: 700, color: "#8E8676", marginBottom: 14 }}>
              <a href="/2-0" style={{ color: "inherit", textDecoration: "none" }}>Kokoelmat</a>
              {" / "}
              <span style={{ color: hub.accentLight }}>Tunnetut henkilöt</span>
            </nav>
            <h1 className="tn-display" style={{ fontSize: "clamp(36px, 6.6vw, 84px)", lineHeight: 0.88, margin: "0 0 14px" }}>
              {hub.titleTop}
              <br />
              <span style={{ color: hub.accent }}>{hub.titleAccent}</span>
            </h1>
            <p style={{ margin: "0 0 14px", color: "var(--tn-text-soft)", maxWidth: "44ch" }}>{hub.lede(0)}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 13, fontWeight: 700 }}>
              {hub.chips(0).map((c) => (
                <span key={c} className="tn-trustchip">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="tn-shell">
        <section className="tn-section" style={{ paddingTop: 24 }}>
          <div className="tn-hubrow-head">
            <div>
              <h2 className="tn-section-title">🎂 Tänään &amp; tulevat synttärit</h2>
              <div className="tn-hubrow-note">Sankariarkisto — valitse kenet haluat pelata</div>
            </div>
          </div>
          <div className="tn-card-row">
            {bdays.map(({ c, dist }) => {
              const b = new Date(c.birth_date);
              const chip = dist === 0 ? "🔥 Tänään" : dist === 1 ? "Huomenna" : `${b.getDate()}.${b.getMonth() + 1}.`;
              let a = today.getFullYear() - b.getFullYear();
              const m = today.getMonth() - b.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < b.getDate())) a--;
              return (
                <PersonCard key={c.id} person={c} dateChip={chip} ageLabel={`${dist === 0 ? a : a + 1} vuotta`} href={playHref(c)} />
              );
            })}
          </div>
        </section>

        <section className="tn-section" style={{ paddingTop: 0 }}>
          <div className="tn-hubrow-head">
            <div>
              <h2 className="tn-section-title">Selaa kaikkia</h2>
              <div className="tn-hubrow-note">Kortti vie suoraan henkilön visaan (5 kysymystä).</div>
            </div>
          </div>
          <nav className="tn-chipnav" style={{ marginBottom: 24 }}>
            {GROUP_LABELS.map((f) => {
              const active = filter === f.key;
              const href = f.key === "kaikki" ? "/2-0/kokoelma/tunnetut-henkilot" : `/2-0/kokoelma/tunnetut-henkilot?suodata=${f.key}`;
              return (
                <a key={f.key} href={href} style={active ? { background: "var(--tn-lime)", color: "var(--tn-bg)", borderColor: "var(--tn-lime)", fontWeight: 700 } : undefined}>
                  {f.label}
                </a>
              );
            })}
          </nav>
          {filtered.length === 0 ? (
            <div className="tn-empty">Tästä ryhmästä ei löytynyt vielä henkilöitä.</div>
          ) : (
            <div className="tn-card-grid">
              {filtered.map((c) => (
                <PersonCard key={c.id} person={c} href={playHref(c)} />
              ))}
            </div>
          )}
        </section>
      </div>
      {article}
    </main>
  );
}
