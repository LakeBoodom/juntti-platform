import { getTodaysCelebrities, getAllCelebrities } from "../lib/queries";
import { getAge, getMonthNameFi } from "../lib/utils";
import HeroCard from "./components/HeroCard";
import ListCard from "./components/ListCard";
import YearCalendar from "./components/YearCalendar";

export const revalidate = 300; // 5 min cache, päivittyy itsestään

export default async function HomePage() {
  const [todaysCelebrities, allCelebrities] = await Promise.all([
    getTodaysCelebrities(),
    getAllCelebrities(),
  ]);

  const hero = todaysCelebrities.find((c) => c.is_hero) ?? todaysCelebrities[0] ?? null;
  const listCelebrities = todaysCelebrities.filter((c) => c.id !== hero?.id);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  return (
    <main>
      {/* Topbar */}
      <header className="topbar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Synttärit" className="topbar-logo" />
      </header>

      {/* Kerros 1: Hero */}
      {hero ? (
        <HeroCard celebrity={hero} todayStr={todayStr} />
      ) : (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
          Ei tänään syntyviä julkkiksia — tarkista huomenna!
        </div>
      )}

      {/* Kerros 2: Myös tänään syntyy */}
      {listCelebrities.length > 0 && (
        <>
          <p className="section-title">Myös tänään syntyy</p>
          {listCelebrities.map((c) => (
            <ListCard key={c.id} celebrity={c} todayStr={todayStr} />
          ))}
        </>
      )}

      {/* Kerros 3: Koko vuosi */}
      <YearCalendar celebrities={allCelebrities} today={today} />

      {/* SEO-häntä */}
      <div className="seo-tail">
        {allCelebrities.map((c) => (
          <span key={c.id}>
            {c.name} syntymäpäivä {c.birth_date} ({getAge(c.birth_date)} v){" "}
          </span>
        ))}
      </div>

      <footer className="footer">
        <p>© 2026 synttarit.com · <a href="/tietosuoja">Tietosuoja</a></p>
      </footer>
    </main>
  );
}
