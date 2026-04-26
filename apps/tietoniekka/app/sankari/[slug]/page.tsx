import Link from "next/link";
import { notFound } from "next/navigation";
import { SANKARIT, getSankari, getAge, formatBirthDateFi } from "../../../lib/sankarit";

/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — /sankari/[slug]
   Päivän sankari -sivu: hero (kuva, ikäpilleri, nimi, rooli, syntymäaika),
   lyhyt bio, iso "Pelaa visa" -CTA → /peli?paivan_sankari=1.
   ───────────────────────────────────────────────────────────────── */

export function generateStaticParams() {
  return SANKARIT.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSankari(slug);
  if (!s) return { title: "Sankari ei löydy — Tietoniekka" };
  return {
    title: `${s.name} — Päivän sankari · Tietoniekka`,
    description: s.bio,
  };
}

export default async function SankariPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sankari = getSankari(slug);
  if (!sankari) notFound();

  const age = getAge(sankari.birthDate);

  return (
    <main className="sankari-page">
      {/* Topbar — sama kuin etusivulla */}
      <header className="topbar">
        <Link href="/" className="logo" aria-label="Etusivulle">
          <div className="name">
            <span className="tieto">TIETO</span>
            <span className="niekka">NIEKKA</span>
          </div>
          <span className="tagline">Testaa tietosi</span>
        </Link>
      </header>

      {/* Hero — iso kuva taustana, gold age-pilleri, nimi, rooli + syntymäaika */}
      <section className="sankari-hero">
        <div className="sankari-hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sankari.imageUrl} alt={sankari.name} />
          {sankari.wikiCredit && (
            <span className="sankari-wiki-credit">{sankari.wikiCredit}</span>
          )}
        </div>
        <div className="sankari-hero-content">
          <span className="sankari-eyebrow">— Päivän sankari</span>
          <span className="sankari-age-pill">🎂 Tänään {age} vuotta</span>
          <h1 className="sankari-name">{sankari.name}</h1>
          <p className="sankari-meta">
            {sankari.role} · Syntynyt {formatBirthDateFi(sankari.birthDate)}
          </p>
        </div>
      </section>

      {/* Bio + CTA */}
      <section className="sankari-bio-section">
        <div className="sankari-bio-content">
          <p className="sankari-bio">{sankari.bio}</p>
          <Link
            href="/peli?paivan_sankari=1"
            className="btn btn-primary btn-large sankari-cta"
          >
            PELAA {sankari.name.split(" ")[0]}-VISA →
          </Link>
        </div>
      </section>

      {/* Footer — sama kuin etusivulla */}
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
