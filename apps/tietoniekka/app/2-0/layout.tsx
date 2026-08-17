// TIETONIEKKA 2.0 — oma layout (Neon Night). Skoopattu .tn20-luokkaan,
// jotta nykyinen sivusto ei muutu. Fontit: Archivo (display) + Instrument Sans (body).
import type { Metadata } from "next";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/900.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import "./tn20.css";
import { getSupabase } from "@/lib/supabase";
import TopBar, { type NavCounts } from "@/components/tn20/TopBar";

export const metadata: Metadata = {
  title: "Tietoniekka 2.0 — esikatselu",
  robots: { index: false, follow: false },
};

/* Navigaation visamäärät kannasta (CD-sääntö: ei keksittyjä lukuja).
   Sama quiz_cards-näkymä kuin etusivulla — vain julkaistut visat. */
async function getNavCounts(): Promise<NavCounts> {
  try {
    const sb = getSupabase();
    if (!sb) return {};
    const { data } = await sb.from("quiz_cards" as never).select("collection");
    const counts: NavCounts = {};
    for (const r of (data ?? []) as Array<{ collection: string | null }>) {
      if (r.collection) counts[r.collection] = (counts[r.collection] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function Tn20Layout({ children }: { children: React.ReactNode }) {
  const counts = await getNavCounts();
  return (
    <div className="tn20">
      {/* Navigaatiojärjestelmä (lukittu 17.8.2026) — piiloutuu itse pelinäkymässä */}
      <TopBar counts={counts} />
      {children}
    </div>
  );
}
