// TV & SUORATOISTO — ensimmäinen kokoelmasivu yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko
// ja pelikehys", vaihe 1, 19.10.2026). Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/tv.ts, visat
// osioihin quizzes.section_tags-tagista. Vanha sivukohtainen toteutus (CD 19.8.2026) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { TV } from "@/lib/kokoelmat/tv";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("tv");
  const title = pc?.seo_title ?? "TV & Suoratoisto — sarjavisat";
  const description = pc?.seo_description ?? "Tietovisat sarjoista joita katsottiin liian myöhään ja muistetaan liian hyvin.";
  const canonical = `${SITE_URL}/kokoelma/tv`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/tv" }) };
}

export default async function TvLanding() {
  const d = await haeRunkoData(TV);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
