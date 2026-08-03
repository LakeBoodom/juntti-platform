import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getCelebrityBySlug, listCelebrities } from "../../../lib/queries";
import { formatBirthDateFi } from "../../../lib/sankarit";

/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — /sankari/[slug]
   v4 (2026-08-02, SEO_STRATEGIA.md §5.4): kaikilla kannan henkilöillä on
   nyt osoite, joten sivu ei voi enää olettaa että kyseessä on tämän päivän
   synttärisankari. Ikä ja otsikko mukautuvat, ja sivulle on lisätty
   Person-schema sameAs-linkillä Wikipediaan — se sitoo sivun tunnettuun
   entiteettiin tietämysgraafissa.
   ───────────────────────────────────────────────────────────────── */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const revalidate = 3600; // 1 h cache

export async function generateStaticParams() {
  const all = await listCelebrities();
  return all.filter((c) => c.slug).map((c) => ({ slug: c.slug! }));
}

/** Ikä tänään. Jos syntymäpäivä on jo ollut tänä vuonna, se on täytetty ikä. */
function currentAge(birth: string): number {
  const b = new Date(birth);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
}

function isBirthdayToday(birth: string): boolean {
  const b = new Date(birth);
  const t = new Date();
  return b.getMonth() === t.getMonth() && b.getDate() === t.getDate();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sankari = await getCelebrityBySlug(slug);
  if (!sankari) return { title: "Henkilöä ei löytynyt — Tietoniekka" };

  const role = sankari.role ?? "tunnettu henkilö";
  const title = `${sankari.name} — tietovisa ja taustat`;
  const description =
    sankari.bio_short?.slice(0, 155) ??
    `Kuka on ${sankari.name}? ${role}, syntynyt ${formatBirthDateFi(sankari.birth_date)}. Testaa kuinka hyvin tunnet hänet ilmaisella tietovisalla.`;

  return {
    title: { absolute: `${title} | Tietoniekka` },
    description,
    alternates: { canonical: `${SITE_URL}/sankari/${slug}` },
    openGraph: {
      type: "profile",
      locale: "fi_FI",
      siteName: "Tietoniekka",
      title,
      description,
      url: `${SITE_URL}/sankari/${slug}`,
      images: sankari.image_url ? [{ url: sankari.image_url }] : undefined,
    },
  };
}

export default async function SankariPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sankari = await getCelebrityBySlug(slug);
  if (!sankari) notFound();

  const age = currentAge(sankari.birth_date);
  const birthdayToday = isBirthdayToday(sankari.birth_date);
  const role = sankari.role ?? null;
  const url = `${SITE_URL}/sankari/${slug}`;

  /* Muut samana päivänä syntyneet — sisäistä linkitystä ja aito syy palata. */
  const all = await listCelebrities();
  const b = new Date(sankari.birth_date);
  const sameDay = all
    .filter((c) => {
      if (!c.slug || c.slug === slug) return false;
      const d = new Date(c.birth_date);
      return d.getMonth() === b.getMonth() && d.getDate() === b.getDate();
    })
    .slice(0, 6);

  /* Person-schema. sameAs sitoo sivun Wikipedian entiteettiin — tämä on
     tärkein yksittäinen merkintä henkilösivulla (SEO_STRATEGIA.md §7). */
  const personLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: sankari.name,
    url,
    birthDate: sankari.birth_date,
  };
  if (role) personLd.jobTitle = role;
  if (sankari.bio_short) personLd.description = sankari.bio_short;
  if (sankari.image_url) personLd.image = sankari.image_url;
  if (sankari.wikipedia_url) personLd.sameAs = [sankari.wikipedia_url];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Etusivu", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tunnetut henkilöt", item: `${SITE_URL}/2-0/kokoelma/tunnetut-henkilot` },
      { "@type": "ListItem", position: 3, name: sankari.name, item: url },
    ],
  };

  return (
    <main className="sankari-page">
      <Script id="ld-person" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(personLd)}
      </Script>
      <Script id="ld-breadcrumb" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(breadcrumbLd)}
      </Script>

      <header className="topbar">
        <Link href="/" className="logo" aria-label="Etusivulle">
          <div className="name">
            <span className="tieto">TIETO</span>
            <span className="niekka">NIEKKA</span>
          </div>
          <span className="tagline">Testaa tietosi</span>
        </Link>
      </header>

      <nav className="sankari-crumbs" aria-label="Murupolku">
        <Link href="/">Etusivu</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/2-0/kokoelma/tunnetut-henkilot">Tunnetut henkilöt</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{sankari.name}</span>
      </nav>

      <section className="sankari-hero">
        <div className="sankari-hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sankari.image_url ?? "https://placehold.co/600x750/1a3a45/e8a320?text=" + encodeURIComponent(sankari.name)}
            alt={sankari.name}
          />
          {sankari.wikipedia_url && <span className="sankari-wiki-credit">📷 Wikipedia</span>}
        </div>
        <div className="sankari-hero-content">
          <span className="sankari-eyebrow">— Tunnettu henkilö</span>
          {birthdayToday && <span className="sankari-age-pill">🎂 Tänään {age} vuotta</span>}
          <h1 className="sankari-name">{sankari.name.toUpperCase()}</h1>
          <p className="sankari-meta">
            {role ? `${role} · ` : ""}Syntynyt {formatBirthDateFi(sankari.birth_date)}
            {!birthdayToday && age >= 0 ? ` · ${age} vuotta` : ""}
          </p>
        </div>
      </section>

      <section className="sankari-bio-section">
        <div className="sankari-bio-content">
          {sankari.bio_short && <p className="sankari-bio">{sankari.bio_short}</p>}

          {sankari.trivia_quiz_id ? (
            <Link
              href={`/peli?quiz_id=${sankari.trivia_quiz_id}`}
              className="btn btn-primary btn-large sankari-cta"
            >
              PELAA {sankari.name.split(" ")[0].toUpperCase()}-VISA →
            </Link>
          ) : (
            <p className="sankari-meta" style={{ opacity: 0.6 }}>
              Visa tästä henkilöstä on vielä työn alla.
            </p>
          )}

          {sankari.wikipedia_url && (
            <p className="sankari-source">
              Lisätietoa:{" "}
              <a href={sankari.wikipedia_url} target="_blank" rel="noopener noreferrer">
                {sankari.name} Wikipediassa
              </a>
            </p>
          )}
        </div>
      </section>

      {sameDay.length > 0 && (
        <section className="sankari-sameday">
          <div className="sankari-bio-content">
            <h2>Samana päivänä syntyneet</h2>
            <ul>
              {sameDay.map((c) => (
                <li key={c.slug}>
                  <Link href={`/sankari/${c.slug}`}>{c.name}</Link>
                  {c.role && <span> · {c.role}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="sankari-bio-section">
        <div className="sankari-bio-content">
          <Link href="/2-0/kokoelma/tunnetut-henkilot" className="sankari-source">
            Selaa kaikkia tunnettuja henkilöitä →
          </Link>
        </div>
      </section>

      <footer className="footer">
        <Link href="/" className="footer-logo">TIETONIEKKA</Link>
        <p className="footer-meta">
          © 2026 Tietoniekka.fi · <Link href="/tietosuoja">Tietosuoja</Link>
        </p>
      </footer>
    </main>
  );
}
