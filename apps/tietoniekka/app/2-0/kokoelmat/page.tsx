// TIETONIEKKA 2.0 — KAIKKI KOKOELMAT -indeksi (navigaation "Kaikki kokoelmat →" -kohde).
// CD:n navigaatiosääntö (lukittu 17.8.2026): kaikki valikkolinkit vievät todellisille
// sivuille, eivät etusivun ankkureihin — tämä sivu on se todellinen sivu.
// Luvut kannasta (quiz_cards), lista lib/nav.ts-kokoonpanosta (sama kuin valikoissa).
import { getSupabase } from "@/lib/supabase";
import Crumbs from "@/components/tn20/Crumbs";
import { NAV_COLLECTIONS, NAV_MODES, hubHref } from "@/lib/nav";
import { JP_CLUBS, JP_EURO, JP_PL_GENERAL, JP_CL, JP_FINNS } from "@/lib/jalkapallo";
import { JK_TEAMS, JK_DERBIES, JK_GENERAL, JK_LIONS, JK_NHL } from "@/lib/jaakiekko";

export const dynamic = "force-dynamic";

/* Jääkiekko ja Jalkapallo eivät ole kannassa omia kokoelmia (visat ovat
   urheilua) — niiden visamäärät lasketaan teemasivujen visalistoista
   (julkaistut slugit), samat listat jotka sivut itse renderöivät. */
const JP_SLUGS = new Set(
  [...JP_CLUBS, ...JP_EURO, ...JP_PL_GENERAL, ...JP_CL, ...JP_FINNS].map((c) => c.quizSlug),
);
const JK_SLUGS = new Set(
  [
    ...JK_TEAMS.map((t) => t.quizSlug),
    ...[...JK_DERBIES, ...JK_GENERAL, ...JK_LIONS, ...JK_NHL].map((c) => c.quizSlug),
  ].filter((s): s is string => Boolean(s)),
);

async function getCounts(): Promise<Record<string, number>> {
  try {
    const sb = getSupabase();
    if (!sb) return {};
    const { data } = await sb.from("quiz_cards" as never).select("collection, slug");
    const counts: Record<string, number> = {};
    for (const r of (data ?? []) as Array<{ collection: string | null; slug: string | null }>) {
      if (r.collection) counts[r.collection] = (counts[r.collection] ?? 0) + 1;
      if (r.slug && JP_SLUGS.has(r.slug)) counts.jalkapallo = (counts.jalkapallo ?? 0) + 1;
      if (r.slug && JK_SLUGS.has(r.slug)) counts.jaakiekko = (counts.jaakiekko ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function KokoelmatPage() {
  const counts = await getCounts();

  return (
    <main style={{ minHeight: "100dvh" }}>
      <Crumbs items={[{ label: "Kokoelmat" }]} />
      <div className="tn-shell">
      <header className="tn-colx-head">
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
      </div>
    </main>
  );
}
