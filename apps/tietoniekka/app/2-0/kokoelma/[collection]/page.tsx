// TIETONIEKKA 2.0 — kokoelmahub (Vaihe 4 ensiversio + Tunnetut henkilöt -hub)
// Sama template kaikille umbrelloille: hero → suodattimet → Uusimmat → Selaa kaikki.
// Tunnetut henkilöt: 🎂 synttäririvi + ammatti→kategoria-suodatus (PAATOKSET 2026-07-29).

import { getSupabase } from "@/lib/supabase";
import { QuizCard, PersonCard, type QuizCardData } from "@/components/tn20/cards";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Meta = {
  title: string;
  tagline: string;
  accent: string;
  img?: string;
  modes?: Array<{ label: string; href: string }>;
};

const COLLECTIONS: Record<string, Meta> = {
  tv: {
    title: "TV & Suoratoisto",
    tagline: "Netflix-hitit, kotimaiset sarjat ja ne joita et myönnä katsoneesi.",
    accent: "var(--tn-acc-tv)",
    img: "/20/hero-tv-laura.webp",
  },
  urheilu: {
    title: "Urheilu",
    tagline: "Maajoukkueet, F1, tennis ja MM-kisat. Joukkue kerrallaan, omilla väreillä.",
    accent: "var(--tn-acc-urheilu)",
    img: "/20/hero-urheilu-mikko.webp",
    modes: [{ label: "⚡ Kumpi? · Urheilu", href: "/kumpi" }],
  },
  musiikki: {
    title: "Musiikki",
    tagline: "Suomirockista Euroviisuihin — ja siihen yhteen biisiin joka jäi päähän.",
    accent: "var(--tn-acc-musiikki)",
    img: "/20/teema-musiikki.webp",
    modes: [{ label: "⚡ Kumpi? · Muusikot", href: "/kumpi" }],
  },
  elokuvat: {
    title: "Elokuvat",
    tagline: "Ikimuistoiset kotimaiset ja kansainväliset klassikot.",
    accent: "var(--tn-acc-elokuvat)",
    img: "/20/teema-elokuvat.webp",
  },
  matkakohteet: {
    title: "Matkakohteet & Maantiede",
    tagline: "Kiinnostavimmat matkakohteet, luonnon ihmeet ja maailmankartta.",
    accent: "var(--tn-acc-matkakohteet)",
    img: "/20/teema-maantieto.webp",
    modes: [
      { label: "⚡ Kumpi? · Maantieto", href: "/kumpi" },
      { label: "↕ Järjestä · Maantieto", href: "/jarjesta" },
    ],
  },
  yleistieto: {
    title: "Yleistieto",
    tagline: "Historia, ruoka & juoma, kulttuuri ja kaikki siltä väliltä.",
    accent: "var(--tn-acc-yleistieto)",
    img: "/20/teema-ruoka-juoma.webp",
    modes: [{ label: "↕ Järjestä · Sekoitus", href: "/jarjesta" }],
  },
  "tunnetut-henkilot": {
    title: "Tunnetut henkilöt",
    tagline: "Näyttelijät, artistit, urheilijat ja muut tutut kasvot — kuinka hyvin tunnet heidät?",
    accent: "var(--tn-amber)",
    img: "/20/teema-tunnetut-henkilot.webp",
    modes: [{ label: "⚡ Kumpi? · Ihmiset", href: "/kumpi" }],
  },
};

/* Ammatti → kategoria -lookup (PAATOKSET 2026-07-29): kortti näyttää tarkan
   ammatin, filtteri käyttää tätä mäppiä. Uusi ammatti = 1 rivi. */
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
const GROUP_LABELS: Array<{ key: string; label: string }> = [
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
  if (c.trivia_quiz_id) return `/peli?quiz_id=${c.trivia_quiz_id}`;
  return c.slug ? `/sankari/${c.slug}` : "#";
}

function HubHero({ meta, count }: { meta: Meta; count?: string }) {
  return (
    <section className="tn-hero" style={{ minHeight: 300 }}>
      <div className="tn-hero-media">
        {meta.img && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={meta.img} alt="" />
        )}
      </div>
      <div className="tn-shell">
        <div className="tn-hero-inner" style={{ padding: "clamp(40px, 6vw, 72px) 0 clamp(28px, 4vw, 48px)" }}>
          <nav style={{ fontSize: 13, color: "var(--tn-text-muted)", marginBottom: 10 }}>
            <a href="/2-0" style={{ color: "inherit", textDecoration: "none" }}>Etusivu</a>
            {" / "}
            <span style={{ color: meta.accent }}>{meta.title}</span>
          </nav>
          <h1 className="tn-display" style={{ fontSize: "clamp(34px, 6vw, 60px)", margin: "0 0 12px" }}>
            {meta.title}
          </h1>
          <p style={{ margin: 0 }}>{meta.tagline}</p>
          {count && <p style={{ color: "var(--tn-text-muted)", fontSize: 13.5, marginTop: 10 }}>{count}</p>}
        </div>
      </div>
    </section>
  );
}

function FilterChips({
  base, current, items, allLabel,
}: {
  base: string; current: string; items: Array<{ key: string; label: string }>; allLabel?: string;
}) {
  return (
    <nav className="tn-chipnav" style={{ marginBottom: 24 }}>
      {items.map((f) => {
        const active = current === f.key;
        const href = f.key === "kaikki" ? base : `${base}?suodata=${f.key}`;
        return (
          <a
            key={f.key}
            href={href}
            style={active ? { background: "var(--tn-lime)", color: "var(--tn-bg)", borderColor: "var(--tn-lime)", fontWeight: 700 } : undefined}
          >
            {f.key === "kaikki" && allLabel ? allLabel : f.label}
          </a>
        );
      })}
    </nav>
  );
}

export default async function KokoelmaHub({
  params, searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { collection } = await params;
  const sp = await searchParams;
  const filter = typeof sp.suodata === "string" ? sp.suodata : "kaikki";
  const meta = COLLECTIONS[collection];
  if (!meta) notFound();

  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  /* ───────── Tunnetut henkilöt -hub ───────── */
  if (collection === "tunnetut-henkilot") {
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
        <HubHero meta={meta} count="3 pelitapaa · uusia henkilöitä joka viikko" />
        <div className="tn-shell">
          <section className="tn-section" style={{ paddingTop: 24 }}>
            <div className="tn-section-head">
              <h2 className="tn-section-title">🎂 Tänään &amp; tulevat synttärit</h2>
            </div>
            <p className="tn-section-sub">Sankariarkisto — valitse kenet haluat pelata</p>
            <div className="tn-card-row">
              {bdays.map(({ c, dist }) => {
                const b = new Date(c.birth_date);
                const chip = dist === 0 ? "🔥 Tänään" : dist === 1 ? "Huomenna" : `${b.getDate()}.${b.getMonth() + 1}.`;
                let a = today.getFullYear() - b.getFullYear();
                const m = today.getMonth() - b.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < b.getDate())) a--;
                return (
                  <PersonCard
                    key={c.id}
                    person={c}
                    dateChip={chip}
                    ageLabel={`${dist === 0 ? a : a + 1} vuotta`}
                    href={playHref(c)}
                  />
                );
              })}
            </div>
          </section>

          <section className="tn-section" style={{ paddingTop: 0 }}>
            <div className="tn-section-head">
              <h2 className="tn-section-title">Selaa kaikkia</h2>
            </div>
            <p className="tn-section-sub">Kortti vie suoraan henkilön visaan (5 kysymystä).</p>
            <FilterChips base="/2-0/kokoelma/tunnetut-henkilot" current={filter} items={GROUP_LABELS} />
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

          {meta.modes && (
            <nav className="tn-chipnav">
              {meta.modes.map((m) => (
                <a key={m.href + m.label} href={m.href}>{m.label}</a>
              ))}
            </nav>
          )}
        </div>
      </main>
    );
  }

  /* ───────── Yleinen kokoelmahub ───────── */
  const [cardsRes, genresRes] = await Promise.all([
    sb
      .from("quiz_cards" as never)
      .select("*")
      .eq("collection", collection)
      .order("published_at", { ascending: false }),
    sb.from("genres" as never).select("genre_key, label, sort_order").eq("collection", collection).order("sort_order"),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as (QuizCardData & { subcollection: string | null; published_at: string })[];
  const genres = (genresRes.data ?? []) as unknown as Array<{ genre_key: string; label: string }>;

  // Suodatinchipit: alakokoelmat + genret joissa oikeasti on sisältöä (data-vetoinen)
  const present = new Set(cards.map((c) => c.genre).filter(Boolean));
  const subs = [...new Set(cards.map((c) => c.subcollection).filter(Boolean))] as string[];
  const filters: Array<{ key: string; label: string }> = [
    { key: "kaikki", label: "Kaikki" },
    ...subs.map((s) => ({ key: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
    ...genres.filter((g) => present.has(g.genre_key)).map((g) => ({ key: g.genre_key, label: g.label })),
  ];

  const filtered =
    filter === "kaikki" ? cards : cards.filter((c) => c.genre === filter || c.subcollection === filter);
  const newest = cards.slice(0, 8);
  const genreLabel = new Map(genres.map((g) => [g.genre_key, g.label]));
  const withLabel = (q: (typeof cards)[number]) => ({ ...q, genre_label: q.genre ? genreLabel.get(q.genre) ?? q.genre : null });

  return (
    <main style={{ minHeight: "100dvh", paddingBottom: 80 }}>
      <HubHero meta={meta} count={`${cards.length} visaa`} />
      <div className="tn-shell" style={{ ["--tn-card-accent" as string]: meta.accent }}>
        {filters.length > 1 && (
          <FilterChips base={`/2-0/kokoelma/${collection}`} current={filter} items={filters} />
        )}

        {filter === "kaikki" && (
          <section className="tn-section" style={{ paddingTop: 0 }}>
            <div className="tn-section-head">
              <h2 className="tn-section-title">Uusimmat</h2>
            </div>
            <div className="tn-card-row" style={{ marginTop: 16 }}>
              {newest.map((q) => (
                <QuizCard key={q.id} quiz={withLabel(q)} />
              ))}
            </div>
          </section>
        )}

        <section className="tn-section" style={{ paddingTop: filter === "kaikki" ? 0 : 8 }}>
          <div className="tn-section-head">
            <h2 className="tn-section-title">{filter === "kaikki" ? "Kaikki visat" : `${filters.find((f) => f.key === filter)?.label ?? filter}`}</h2>
            <span className="tn-section-sub" style={{ margin: 0 }}>{filtered.length} visaa</span>
          </div>
          {filtered.length === 0 ? (
            <div className="tn-empty" style={{ marginTop: 16 }}>
              Tällä suodattimella ei löytynyt visoja. Kokeile toista.
            </div>
          ) : (
            <div className="tn-card-grid" style={{ marginTop: 16 }}>
              {filtered.map((q) => (
                <QuizCard key={q.id} quiz={withLabel(q)} />
              ))}
            </div>
          )}
        </section>

        {meta.modes && (
          <nav className="tn-chipnav">
            {meta.modes.map((m) => (
              <a key={m.href + m.label} href={m.href}>{m.label}</a>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
}
