// TIETONIEKKA 2.0 — korttijärjestelmän katselmussivu (PORTTI 2)
// Renderöi kortit OIKEALLA tuotantodatalla (quiz_cards + celebrities).
// Ei linkitetty mistään; robots noindex layoutissa.

import { getSupabase } from "@/lib/supabase";
import { QuizCard, SportCard, PersonCard, type QuizCardData } from "@/components/tn20/cards";

export const dynamic = "force-dynamic";

/* Urheilun demo-mäppäys Portti 2:ta varten: laji + joukkueväri titlestä.
   Oikea backfill (genre + väri kantaan) tehdään urheilukokoelman vuorolla. */
const SPORT_RULES: Array<{ match: RegExp; sport: string; color: string; short?: string }> = [
  { match: /arsenal/i, sport: "jalkapallo", color: "#ef0107", short: "Arsenal FC" },
  { match: /liverpool/i, sport: "jalkapallo", color: "#c8102e", short: "Liverpool FC" },
  { match: /belgian/i, sport: "jalkapallo", color: "#e30613", short: "Belgia" },
  { match: /brasilia/i, sport: "jalkapallo", color: "#ffdc02", short: "Brasilia" },
  { match: /englannin/i, sport: "jalkapallo", color: "#8faee0", short: "Englanti" },
  { match: /espanjan/i, sport: "jalkapallo", color: "#c60b1e", short: "Espanja" },
  { match: /argentiinan/i, sport: "jalkapallo", color: "#75aadb", short: "Argentiina" },
  { match: /norjan/i, sport: "jalkapallo", color: "#ba0c2f", short: "Norja" },
  { match: /portugali/i, sport: "jalkapallo", color: "#da291c", short: "Portugali" },
  { match: /ranskan/i, sport: "jalkapallo", color: "#4d7fd1", short: "Ranska" },
  { match: /suomen miesten/i, sport: "jalkapallo", color: "#5b8ff0", short: "Huuhkajat" },
  { match: /mm-kisat|mm-finaalit|italia 1990/i, sport: "jalkapallo", color: "#e8a320" },
  { match: /formula/i, sport: "f1", color: "#ff1e00", short: "Formula 1" },
  { match: /ralli/i, sport: "ralli", color: "#4d9fff", short: "MM-ralli" },
  { match: /tennik|federer|us open/i, sport: "tennis", color: "#dfff4f" },
  { match: /golf|the open/i, sport: "golf", color: "#4ade80", short: "The Open" },
  { match: /olympiastadion/i, sport: "stadion", color: "#e8a320", short: "Olympiastadion" },
];

function sportFor(title: string) {
  for (const r of SPORT_RULES) if (r.match.test(title)) return r;
  return { sport: "stadion", color: "var(--tn-lime)" };
}

function ageOn(birth: string, on: Date): number {
  const b = new Date(birth);
  let a = on.getFullYear() - b.getFullYear();
  const m = on.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < b.getDate())) a--;
  return a;
}

/* Seuraavat synttärit tästä päivästä eteenpäin (kk+pv), sama logiikka kuin sankariarkistossa. */
function nextBirthdays<T extends { birth_date: string }>(rows: T[], count: number, today: Date) {
  const key = (m: number, d: number) => m * 100 + d;
  const todayKey = key(today.getMonth() + 1, today.getDate());
  return rows
    .map((r) => {
      const b = new Date(r.birth_date);
      const k = key(b.getMonth() + 1, b.getDate());
      return { r, sort: k >= todayKey ? k - todayKey : k + 1300 - todayKey, k };
    })
    .sort((x, y) => x.sort - y.sort)
    .slice(0, count);
}

export default async function KortitPreview() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const [tvRes, sportRes, otherRes, celebRes] = await Promise.all([
    sb.from("quiz_cards" as never).select("*").eq("collection", "tv").order("display_title"),
    sb.from("quiz_cards" as never).select("*").eq("collection", "urheilu").order("title"),
    sb
      .from("quiz_cards" as never)
      .select("*")
      .in("collection", ["elokuvat", "matkakohteet", "yleistieto", "musiikki"])
      .order("published_at", { ascending: false })
      .limit(10),
    sb.from("celebrities").select("id, slug, name, role, image_url, birth_date").limit(400),
  ]);

  const tv = (tvRes.data ?? []) as unknown as QuizCardData[];
  const sport = (sportRes.data ?? []) as unknown as (QuizCardData & { title: string })[];
  const other = (otherRes.data ?? []) as unknown as QuizCardData[];
  const celebs = (celebRes.data ?? []) as Array<{
    id: string; slug: string | null; name: string; role: string | null;
    image_url: string | null; birth_date: string;
  }>;

  const today = new Date();
  const bdays = nextBirthdays(celebs, 8, today);

  const section: React.CSSProperties = { padding: "40px clamp(16px, 4vw, 48px)" };
  const note: React.CSSProperties = { color: "var(--tn-text-muted)", fontSize: 13, margin: "6px 0 20px" };

  return (
    <main style={{ minHeight: "100dvh", paddingBottom: 80 }}>
      <header style={{ ...section, paddingBottom: 0 }}>
        <span className="tn-eyebrow">Portti 2 · katselmus</span>
        <h1 className="tn-display" style={{ fontSize: "clamp(28px, 6vw, 52px)", margin: "10px 0 4px" }}>
          Kortti<span style={{ color: "var(--tn-lime)" }}>järjestelmä</span>
        </h1>
        <p style={note}>
          Kaikki kortit renderöityvät suoraan tuotantokannasta (quiz_cards + celebrities). Ei yhtään
          korttikohtaista kuvatiedostoa.
        </p>
      </header>

      <section style={section}>
        <h2 className="tn-section-title">TV &amp; Suoratoisto — genrekortit ({tv.length})</h2>
        <p style={note}>Magenta-perhe · genre-motiivi + sävy · A/B/C-variaatio hash(id):stä · badge kannasta.</p>
        <div className="tn-card-grid">
          {tv.map((q) => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
      </section>

      <section style={section}>
        <h2 className="tn-section-title">Urheilu — laji + joukkueväri ({sport.length})</h2>
        <p style={note}>
          Laji-motiivi currentColorilla, ei tekstiä kortissa — nimi captionissa. (Lajit/värit demo-mäpistä;
          urheilun oikea backfill tehdään kokoelman vuorolla.)
        </p>
        <div className="tn-card-grid">
          {sport.map((q) => {
            const s = sportFor(q.title);
            const withShort = { ...q, display_title: (s as { short?: string }).short ?? q.title };
            return <SportCard key={q.id} quiz={withShort} sport={s.sport} teamColor={s.color} />;
          })}
        </div>
      </section>

      <section style={section}>
        <h2 className="tn-section-title">Tunnetut henkilöt — 🎂 seuraavat synttärit</h2>
        <p style={note}>Duotone-valokuva (grayscale + värikerros ≤ 55 %) · ikä kortissa · nimi + tarkka ammatti alla.</p>
        <div className="tn-card-grid">
          {bdays.map(({ r, sort }) => {
            const b = new Date(r.birth_date);
            const chip = sort === 0 ? "🔥 Tänään" : `${b.getDate()}.${b.getMonth() + 1}.`;
            return (
              <PersonCard
                key={r.id}
                person={r}
                dateChip={chip}
                ageLabel={`${ageOn(r.birth_date, today) + (sort === 0 ? 0 : 1)} vuotta`}
              />
            );
          })}
        </div>
      </section>

      <section style={section}>
        <h2 className="tn-section-title">Fallback-takuu — kokoelmamotiivit ilman genreä</h2>
        <p style={note}>
          Näillä visoilla ei ole vielä genreä kannassa → kortti käyttää kokoelman yleismotiivia. Kortti ei voi
          jäädä syntymättä.
        </p>
        <div className="tn-card-grid">
          {other.map((q) => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
      </section>

      <section style={section}>
        <h2 className="tn-section-title">Tilat</h2>
        <p style={note}>Lataus (skeleton) · tyhjä tila.</p>
        <div className="tn-card-grid">
          <div className="tn-skeleton" />
          <div className="tn-skeleton" />
          <div className="tn-skeleton" />
        </div>
        <div className="tn-empty" style={{ marginTop: 20 }}>
          Tässä kokoelmassa ei ole vielä visoja tällä suodattimella. Kokeile toista pelitapaa.
        </div>
      </section>
    </main>
  );
}
