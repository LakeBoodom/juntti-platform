import { notFound } from "next/navigation";
import Link from "next/link";
import { getCelebrityBySlug, getAllCelebrities, getCelebritiesByDate } from "../../lib/queries";
import { getAge, formatBirthDateFi } from "../../lib/utils";
import HeroCard from "../components/HeroCard";
import ListCard from "../components/ListCard";

export const revalidate = 3600;

export async function generateStaticParams() {
  const all = await getAllCelebrities();
  return all.filter((c) => c.slug).map((c) => ({ slug: c.slug! }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCelebrityBySlug(slug);
  if (!c) return { title: "Henkilö ei löydy | synttarit.com" };
  const age = getAge(c.birth_date);
  return {
    title: `${c.name} syntymäpäivä – ${age} vuotta`,
    description: `${c.name} on syntynyt ${formatBirthDateFi(c.birth_date)}. ${c.bio_short ?? ""}`,
  };
}

export default async function CelebrityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const celebrity = await getCelebrityBySlug(slug);
  if (!celebrity) notFound();

  const age = getAge(celebrity.birth_date);
  const d = new Date(celebrity.birth_date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Muut samana päivänä syntyvät
  const sameDay = (await getCelebritiesByDate(month, day))
    .filter((c) => c.id !== celebrity.id)
    .slice(0, 4);

  return (
    <main>
      <header className="topbar">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Synttärit" className="topbar-logo" />
        </Link>
      </header>

      {/* Hero-kortti henkilösivulla */}
      <HeroCard celebrity={celebrity} todayStr={todayStr} />

      {/* Bio */}
      {celebrity.bio_short && (
        <div style={{ padding: "16px 16px 8px" }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {celebrity.bio_short}
          </p>
        </div>
      )}

      {/* Syntymäpäivätieto */}
      <div style={{ padding: "8px 16px 16px" }}>
        <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Syntynyt {formatBirthDateFi(celebrity.birth_date)} · {age} vuotta
          {celebrity.wikipedia_url && (
            <> · <a href={celebrity.wikipedia_url} target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Wikipedia</a></>
          )}
        </p>
      </div>

      {/* Muut saman päivän synttärit */}
      {sameDay.length > 0 && (
        <>
          <p className="section-title">Myös tänään syntyy</p>
          {sameDay.map((c) => (
            <ListCard key={c.id} celebrity={c} todayStr={todayStr} />
          ))}
        </>
      )}

      <footer className="footer">
        <Link href="/">← Takaisin etusivulle</Link>
        <p style={{ marginTop: 8 }}>© 2026 synttarit.com</p>
      </footer>
    </main>
  );
}
