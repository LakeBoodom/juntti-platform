// URHEILU yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 19.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/urheilu.ts, visat osioihin quizzes.section_tags-
// tagista. Vanha sivukohtainen toteutus (CD "TN Urheilu -teemasivu" 26.8.2026, lohkot + portit) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { URHEILU } from "@/lib/kokoelmat/urheilu";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("urheilu");
  const title = pc?.seo_title ?? "Urheilu — Formula 1, ralli, golf, tennis ja urheiluhistoria";
  const description =
    pc?.seo_description ??
    "Kaasua, mailoja ja mitaleita: viisi lajilohkoa, joissa testataan sekä kuningasluokan tieto että suomalaisten suuret hetket. Jääkiekolla ja jalkapallolla on omat teemasivunsa.";
  const canonical = `${SITE_URL}/kokoelma/urheilu`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/urheilu" }) };
}

export default async function UrheiluLanding() {
  const d = await haeRunkoData(URHEILU);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
