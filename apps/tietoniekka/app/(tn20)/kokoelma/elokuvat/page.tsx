// ELOKUVAT yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 19.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/elokuvat.ts, visat osioihin quizzes.section_tags-
// tagista. Vanha sivukohtainen toteutus (CD "TN Elokuvat -teemasivu" 15.8.2026) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { ELOKUVAT } from "@/lib/kokoelmat/elokuvat";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("elokuvat");
  const title = pc?.seo_title ?? "Elokuvat — tietovisat valkokankaalta";
  const description =
    pc?.seo_description ??
    "Tietovisat blockbustereista, kotimaisista klassikoista ja elokuva-alan legendoista.";
  const canonical = `${SITE_URL}/kokoelma/elokuvat`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/elokuvat" }) };
}

export default async function ElokuvatLanding() {
  const d = await haeRunkoData(ELOKUVAT);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
