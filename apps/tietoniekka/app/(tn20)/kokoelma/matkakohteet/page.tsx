// MAANTIETO (/kokoelma/matkakohteet) yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja
// pelikehys", vaihe 3, 19.10.2026). Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/matkakohteet.ts,
// visat osioihin quizzes.section_tags-tagista. Vanha sivukohtainen toteutus (CD "Tietoniekka -
// Maantieto" 15.8.2026) poistettu. Kokoelma-arvo kannassa on 'matkakohteet' → URL säilyy.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { MATKAKOHTEET } from "@/lib/kokoelmat/matkakohteet";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("matkakohteet");
  const title = pc?.seo_title ?? "Maantieto — Maailman ääriltä kotia kohti";
  const description =
    pc?.seo_description ??
    "Tietovisoja vuorista, meristä, joista, saarista ja kaupungeista — myös niistä, jotka luulet tuntevasi.";
  const canonical = `${SITE_URL}/kokoelma/matkakohteet`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/matkakohteet" }) };
}

export default async function MaantietoLanding() {
  const d = await haeRunkoData(MATKAKOHTEET);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
