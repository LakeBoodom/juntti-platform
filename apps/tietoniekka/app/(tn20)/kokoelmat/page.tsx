import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
// TIETONIEKKA 2.0 — KAIKKI KOKOELMAT -indeksi (navigaation "Kaikki kokoelmat →" -kohde).
// CD:n navigaatiosääntö (lukittu 17.8.2026): kaikki valikkolinkit vievät todellisille
// sivuille, eivät etusivun ankkureihin — tämä sivu on se todellinen sivu.
// Luvut kannasta (quiz_cards), lista lib/nav.ts-kokoonpanosta (sama kuin valikoissa).
import Crumbs from "@/components/tn20/Crumbs";
import { getCounts } from "@/lib/kokoelmaMaarat";
import { NAV_COLLECTIONS, NAV_MODES, navHref } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Kaikki kokoelmat – tietovisat aiheittain | Tietoniekka",
  description: "Valitse aihe: TV & suoratoisto, urheilu, jääkiekko, jalkapallo, elokuvat, musiikki, maantieto, Suomen kaupungit, tunnetut henkilöt, kulttuuri, historia, luonto, tiede & teknologia, juhlat sekä vaalit ja politiikka.",
  alternates: { canonical: "/kokoelmat" },
  ...jakoMeta({
    title: "Kaikki kokoelmat – tietovisat aiheittain",
    description: "Valitse aihe ja pelaa: urheilu, elokuvat, musiikki, historia, luonto, tunnetut henkilöt ja paljon muuta.",
    url: "/kokoelmat",
    kuva: "/og/sivu/kokoelmat",
  }),
};

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

export default async function KokoelmatPage() {
  const counts = await getCounts();

  return (
    <main style={{ minHeight: "100dvh" }}>
      <KokoelmaLd avain="kokoelmat" nimi="Kaikki kokoelmat" polku="/kokoelmat" />
      <Crumbs items={[{ label: "Kokoelmat" }]} />
      <div className="tn-shell">
      <header className="tn-colx-head">
        <h1 className="tn-colx-title">
          Kaikki <span>kokoelmat</span>
        </h1>
        <p className="tn-colx-lede">
          Valitse aihe, josta tiedät eniten — tai se, josta haluat oppia lisää.
        </p>
      </header>

      <div className="tn-colx-grid">
        {NAV_COLLECTIONS.map((c) => (
          <a
            key={c.slug}
            className="tn-colx-card"
            href={navHref(c)}
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
