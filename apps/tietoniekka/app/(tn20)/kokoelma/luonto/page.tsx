// LUONTO yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/luonto.ts, visat osioihin quizzes.section_tags-tagista,
// kuva- ja äänivisat V6:ssa. Vanha sivukohtainen toteutus (CD "TN Luonto-kokoelma v3.0": pelimuotovalinta,
// suodattimet) poistettu; vanhat ?suodata=-linkit ohjataan middlewaressa osion tai pelien ankkuriin.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { LUONTO } from "@/lib/kokoelmat/luonto";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("luonto");
  const title = pc?.seo_title ?? "Suomen luonto — eläimet, kasvit ja ilmiöt";
  const description = pc?.seo_description ?? "Tietovisat suurpedoista lintuihin, soista revontuliin. Tunnetko lähimetsäsi?";
  const canonical = `${SITE_URL}/kokoelma/luonto`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/luonto" }) };
}

export default async function LuontoLanding() {
  const d = await haeRunkoData(LUONTO);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
