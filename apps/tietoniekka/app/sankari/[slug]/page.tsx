import Link from "next/link";
import { notFound } from "next/navigation";
import { getCelebrityBySlug, listCelebrities } from "../../../lib/queries";
import { getAge, formatBirthDateFi } from "../../../lib/sankarit";

/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — /sankari/[slug]
   v3.2: hakee julkkiksen Supabasesta (oli aiemmin hardcoded "iina-kuustonen").
   ───────────────────────────────────────────────────────────────── */

export const revalidate = 3600; // 1 h cache

export async function generateStaticParams() {
  // Pre-renderöi kaikki sitellä olevat julkkikset
  const all = await listCelebrities();
  return all.filter((c) => c.slug).map((c) => ({ slug: c.slug! }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sankari = await getCelebrityBySlug(slug);
  if (!sankari) return { title: "Sankari ei löydy — Tietoniekka" };
  return {
    title: `${sankari.name} — Päivän sankari · Tietoniekka`,
    description: sankari.bio_short ?? `${sankari.name} — ${sankari.role}`,
  };
}

export default async function SankariPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sankari = await getCelebrityBySlug(slug);
  if (!sankari) notFound();

  const age = getAge(sankari.birth_date);

  return (
    <main className="sankari-page">
      <header className="topbar">
        <Link href="/" className="logo" aria-label="Etusivulle">
          <div className="name">
            <span className="tieto">TIETO</span>
            <span className="niekka">NIEKKA</span>
          </div>
          <span className="tagline">Testaa tietosi</span>
        </Link>
      </header>

      <section className="sankari-hero">
        <div className="sankari-hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sankari.image_url ?? "https://placehold.co/600x750/1a3a45/e8a320?text=" + encodeURIComponent(sankari.name)}
            alt={sankari.name}
          />
          {sankari.wikipedia_url && (
            <span className="sankari-wiki-credit">📷 Wikipedia</span>
          )}
        </div>
        <div className="sankari-hero-content">
          <span className="sankari-eyebrow">— Päivän sankari</span>
          <span className="sankari-age-pill">🎂 Tänään {age} vuotta</span>
          <h1 className="sankari-name">{sankari.name.toUpperCase()}</h1>
          <p className="sankari-meta">
            {sankari.role} · Syntynyt {formatBirthDateFi(sankari.birth_date)}
          </p>
        </div>
      </section>

      {sankari.bio_short && (
        <section className="sankari-bio-section">
          <div className="sankari-bio-content">
            <p className="sankari-bio">{sankari.bio_short}</p>
            {sankari.trivia_quiz_id ? (
              <Link
                href={`/peli?paivan_sankari=1&quiz_id=${sankari.trivia_quiz_id}`}
                className="btn btn-primary btn-large sankari-cta"
              >
                PELAA {sankari.name.split(" ")[0].toUpperCase()}-VISA →
              </Link>
            ) : (
              <p className="sankari-meta" style={{ opacity: 0.6 }}>
                Visa ei vielä saatavilla.
              </p>
            )}
          </div>
        </section>
      )}

      <footer className="footer">
        <Link href="/" className="footer-logo">TIETONIEKKA</Link>
        <p className="footer-meta">
          © 2026 Tietoniekka.com ·{" "}
          <Link href="/tietosuoja">Tietosuoja</Link> ·{" "}
          <Link href="/yhteystiedot">Yhteystiedot</Link>
        </p>
      </footer>
    </main>
  );
}
