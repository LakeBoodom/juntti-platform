// HISTORIA yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/historia.ts (V4 = aikajana), visat osioihin
// quizzes.section_tags-tagista. Vanha sivukohtainen toteutus (CD "Tietoniekka - Historia" 6.8.2026,
// HistoriaClient) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { HISTORIA } from "@/lib/kokoelmat/historia";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("historia");
  const title = pc?.seo_title ?? "Suomen historia — aikajana ja tietovisat";
  const description =
    pc?.seo_description ??
    "Kivikaudesta nykypäivään. Jokainen aikakausi on oma visansa — pelaa järjestyksessä tai poimi jakso, joka kiinnostaa.";
  const canonical = `${SITE_URL}/kokoelma/historia`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/historia" }) };
}

export default async function HistoriaLanding() {
  const d = await haeRunkoData(HISTORIA);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
