import { getTodaysCelebrities, getAllCelebrities } from "../lib/queries";
import { getAge, getMonthNameFi } from "../lib/utils";
import HeroCard from "./components/HeroCard";
import ListCard from "./components/ListCard";
import YearCalendar from "./components/YearCalendar";

export const revalidate = 300; // 5 min cache

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
        <img src="/logo.png" alt="Synttärit" className="topbar-logo" />
        <button className="topbar-icon-btn" aria-label="Haku">
          <i className="ti ti-search" aria-hidden="true" />
        </button>
      </header>

      {/* Hero */}
      {hero ? (
        <HeroCard celebrity={hero} todayStr={todayStr} />
      ) : (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
          Ei tänään syntyviä julkkiksia — tarkista huomenna!
        </div>
      )}

      {/* Myös tänään syntyy */}
      {listCelebrities.length > 0 && (
        <>
          <div className="sec-label">
            <span className="sl-txt">Myös tänään syntyy</span>
            <div className="sl-line" />
          </div>
          <div className="list-cards-wrap">
            {listCelebrities.map((c) => (
              <ListCard key={c.id} celebrity={c} todayStr={todayStr} />
            ))}
          </div>
        </>
      )}

      {/* Koko vuosi */}
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

      {/* Bottom nav */}
      <nav className="bottom-nav" aria-label="Päänavigaatio">
        <a href="/" className="bn-item active" aria-label="Synttärit">
          <i className="ti ti-cake" aria-hidden="true" />
          <span>Synttärit</span>
        </a>
        <button className="bn-item" aria-label="Visat" disabled>
          <i className="ti ti-target" aria-hidden="true" />
          <span>Visat</span>
        </button>
        <button className="bn-item" aria-label="Haku">
          <i className="ti ti-search" aria-hidden="true" />
          <span>Haku</span>
        </button>
        <button className="bn-item" aria-label="Lisää">
          <i className="ti ti-menu-2" aria-hidden="true" />
          <span>Lisää</span>
        </button>
      </nav>
    </main>
  );
}
