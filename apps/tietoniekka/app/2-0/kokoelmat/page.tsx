// TIETONIEKKA 2.0 — KAIKKI KOKOELMAT -indeksi (navigaation "Kaikki kokoelmat →" -kohde).
// CD:n navigaatiosääntö (lukittu 17.8.2026): kaikki valikkolinkit vievät todellisille
// sivuille, eivät etusivun ankkureihin — tämä sivu on se todellinen sivu.
// Luvut kannasta (quiz_cards), lista lib/nav.ts-kokoonpanosta (sama kuin valikoissa).
import { getSupabase } from "@/lib/supabase";
import { NAV_COLLECTIONS, NAV_MODES, hubHref } from "@/lib/nav";

export const dynamic = "force-dynamic";

async function getCounts(): Promise<Record<string, number>> {
  try {
    const sb = getSupabase();
    if (!sb) return {};
    const { data } = await sb.from("quiz_cards" as never).select("collection");
    const counts: Record<string, number> = {};
    for (const r of (data ?? []) as Array<{ collection: string | null }>) {
      if (r.collection) counts[r.collection] = (counts[r.collection] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function KokoelmatPage() {
  const counts = await getCounts();

  return (
    <main className="tn-shell" style={{ minHeight: "100dvh" }}>
      <header className="tn-colx-head">
        <nav aria-label="Murupolku" style={{ fontSize: 13, color: "var(--tn-text-dim)", marginBottom: 14 }}>
          <a href="/2-0" style={{ color: "inherit", textDecoration: "none" }}>
            Etusivu
          </a>
          <span aria-hidden> / </span>
          <span>Kokoelmat</span>
        </nav>
        <h1 className="tn-colx-title">
          Kaikki <span>kokoelmat</span>
        </h1>
        <p className="tn-colx-lede">
          Valitse aihe, josta tiedät eniten — tai se, josta haluat oppia lisää. Jokainen kokoelma
          kasvaa jatkuvasti.
        </p>
      </header>

      <div className="tn-colx-grid">
        {NAV_COLLECTIONS.map((c) => (
          <a
            key={c.slug}
            className="tn-colx-card"
            href={hubHref(c.slug)}
            style={{ "--dot": c.color } as React.CSSProperties}
          >
            <span className="tn-menu-dot" aria-hidden />
            <span>{c.label}</span>
            <span className="tn-colx-count">{counts[c.slug] ?? 0} visaa</span>
          </a>
        ))}
      </div>

      <p className="tn-colx-sub">Pelimuodot</p>
      <div className="tn-colx-grid">
        {NAV_MODES.map((m) => (
          <a
            key={m.href}
            className="tn-colx-card"
            href={m.href}
            style={{ "--dot": m.color } as React.CSSProperties}
          >
            <span className="tn-menu-dot" aria-hidden />
            <span>{m.label}</span>
            <span className="tn-colx-count">{m.desc}</span>
          </a>
        ))}
      </div>

      <div className="tn-colx-foot" />
    </main>
  );
}
