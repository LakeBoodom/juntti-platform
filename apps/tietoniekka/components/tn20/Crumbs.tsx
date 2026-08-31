// TIETONIEKKA 2.0 — MURUPOLKURIVI (nav-speksin näkymä 03, lukittu 17.8.2026).
// 44 px:n hillitty rivi yläpalkin alla kaikilla alasivuilla: Etusivu / Kokoelmat / Sivu.
// 13 px — ei kilpaile sivun otsikon kanssa. Vierii sisällön mukana pois (palkki jää).
// Linkit vievät todellisille sivuille (Kokoelmat → /kokoelmat). Korvaa flagshipien
// herojen sisäiset murupolut (tnt/tne/tnm-crumb + hub-templaten inline-nav).
export type CrumbItem = { label: string; href?: string };

export default function Crumbs({ items }: { items: CrumbItem[] }) {
  return (
    <nav className="tn-crumbrow" aria-label="Murupolku">
      <div className="tn-shell tn-crumbrow-in">
        <a href="/">Etusivu</a>
        {items.map((c) => (
          <span key={c.label} className="tn-crumbrow-seg">
            <span className="tn-crumbrow-sep" aria-hidden>
              /
            </span>
            {c.href ? <a href={c.href}>{c.label}</a> : <span className="tn-crumbrow-cur">{c.label}</span>}
          </span>
        ))}
      </div>
    </nav>
  );
}
