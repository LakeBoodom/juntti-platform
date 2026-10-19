// MUSIIKKI yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 19.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/musiikki.ts, visat osioihin quizzes.section_tags-
// tagista. Vanha sivukohtainen toteutus (CD "TN Musiikki -teemasivu" 19.8.2026) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { MUSIIKKI } from "@/lib/kokoelmat/musiikki";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("musiikki");
  const title = pc?.seo_title ?? "Musiikki ja artistit — tietovisat";
  const description =
    pc?.seo_description ??
    "Artistivisat suomirapista stadionien supertähtiin — testaa kuinka tarkasti kuuntelet.";
  const canonical = `${SITE_URL}/kokoelma/musiikki`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/musiikki" }) };
}

export default async function MusiikkiLanding() {
  const d = await haeRunkoData(MUSIIKKI);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
