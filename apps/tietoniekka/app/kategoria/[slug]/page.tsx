import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "../../../lib/categories";

/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — /kategoria/[slug]
   Visuaalinen hero kategorialle + iso "Pelaa visaa" -CTA.
   v1: kevyt landing — sis. otsikko, intro, visa-määrä, CTA peliin.
   Visa-listanäkymä lisätään myöhemmin kun admin-tool tuottaa
   useita visa-konfiguraatioita per kategoria.
   ───────────────────────────────────────────────────────────────── */

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return { title: "Kategoria ei löydy — Tietoniekka" };
  return {
    title: `${cat.title} — Tietoniekka`,
    description: cat.intro,
  };
}

export default async function KategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  return (
    <main className="kategoria-page">
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

      {/* Hero — kategoriakuva taustana, gradient-overlay, otsikko + intro + CTA */}
      <section
        className="kategoria-hero"
        style={{
          ["--kat-color" as string]: cat.colorVar,
          ["--bg-image" as string]: `url(${cat.imageUrl})`,
        } as React.CSSProperties}
      >
        <div className="kategoria-hero-content">
          <span className="kategoria-eyebrow">— Kategoria</span>
          <h1 className="kategoria-title">{cat.title}</h1>
          <p className="kategoria-tagline">{cat.description}</p>
          <span className="kategoria-badge">{cat.visaCount} visaa</span>
          <p className="kategoria-intro">{cat.intro}</p>
          <Link
            href={`/peli?kat=${cat.slug}`}
            className="btn btn-primary btn-large kategoria-cta"
          >
            PELAA {cat.title}-VISAA →
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
