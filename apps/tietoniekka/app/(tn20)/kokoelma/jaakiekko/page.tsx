// JÄÄKIEKKO yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 19.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/jaakiekko.ts, visat osioihin quizzes.section_tags-
// tagista. Vanha sivukohtainen toteutus (CD "TN Jaakiekko -teemasivu" 22.8.2026: kaukalokartta,
// paitaseinä, erät) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { JAAKIEKKO } from "@/lib/kokoelmat/jaakiekko";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("jaakiekko");
  const title = pc?.seo_title ?? "Jääkiekko — Liiga, Leijonat ja NHL tietovisoina";
  const description =
    pc?.seo_description ??
    "Kaikki jääkiekosta: Liigan seuravisat ja derbyt, Leijonien kultavuodet ja suomalaisten NHL-historia.";
  const canonical = `${SITE_URL}/kokoelma/jaakiekko`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/jaakiekko" }) };
}

export default async function JaakiekkoLanding() {
  const d = await haeRunkoData(JAAKIEKKO);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
