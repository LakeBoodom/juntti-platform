// JALKAPALLO yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 19.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/jalkapallo.ts, visat osioihin quizzes.section_tags-
// tagista. Vanha sivukohtainen toteutus (CD "TN Jalkapallo -teemasivu" 25.8.2026: paitaseinä, suurseurojen
// maasuodatin) poistettu; vanhat ?seura=-linkit ohjataan middlewaressa osion ankkuriin.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { JALKAPALLO } from "@/lib/kokoelmat/jalkapallo";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("jalkapallo");
  const title = pc?.seo_title ?? "Jalkapallo — Valioliiga, suurseurat ja Mestarien liiga tietovisoina";
  const description =
    pc?.seo_description ??
    "Kaikki jalkapallosta: 20 Valioliigan seuravisaa, Euroopan suurseurat ja Mestarien liigan ikuiset illat — sekä suomalaiset eurokentillä.";
  const canonical = `${SITE_URL}/kokoelma/jalkapallo`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/jalkapallo" }) };
}

export default async function JalkapalloLanding() {
  const d = await haeRunkoData(JALKAPALLO);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
