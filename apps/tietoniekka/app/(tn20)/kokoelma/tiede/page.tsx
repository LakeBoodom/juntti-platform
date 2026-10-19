// TIEDE & TEKNOLOGIA yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3,
// 19.10.2026). Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/tiede.ts, visat osioihin
// quizzes.section_tags-tagista. Vanha sivukohtainen toteutus (CD 20.9.2026) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { TIEDE } from "@/lib/kokoelmat/tiede";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const metadata: Metadata = {
  title: "Tiede ja teknologia — tietovisat",
  description:
    "20 tietovisaa kehosta avaruuteen: aivot, genetiikka, aurinkokunta, dinosaurukset, keksinnöt ja tiedemyytit. Ilmaisia visoja ilman kirjautumista.",
  alternates: { canonical: `${SITE_URL}/kokoelma/tiede` },
  ...jakoMeta({
    url: `${SITE_URL}/kokoelma/tiede`,
    title: "Tiede ja teknologia — tietovisat",
    description: "Maailma on kummallisempi kuin luulet. Visat kehosta avaruuteen.",
    kuva: "/og/kokoelma/tiede",
  }),
};

export default async function TiedeLanding() {
  const d = await haeRunkoData(TIEDE);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
