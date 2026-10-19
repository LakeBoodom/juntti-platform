// KULTTUURI yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 19.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/kulttuuri.ts, visat osioihin quizzes.section_tags-
// tagista. Vanha sivukohtainen toteutus (CD "Tietoniekka - Kulttuuri", suodatinchipit) poistettu;
// vanhat ?suodata=-linkit ohjataan middlewaressa osion ankkuriin.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { KULTTUURI } from "@/lib/kokoelmat/kulttuuri";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("kulttuuri");
  const title = pc?.seo_title ?? "Kulttuuri — Suomen tarinat, tekijät ja klassikot";
  const description =
    pc?.seo_description ??
    "Tietovisat taiteesta, musiikista, kirjallisuudesta, designista ja suomalaisista ilmiöistä.";
  const canonical = `${SITE_URL}/kokoelma/kulttuuri`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/kulttuuri" }) };
}

export default async function KulttuuriLanding() {
  const [d, pc] = await Promise.all([haeRunkoData(KULTTUURI), getPageContent("kulttuuri")]);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return (
    <KokoelmaRunko
      d={d}
      jalkiosa={
        pc?.learn ? (
          <div className="rk-jalki">
            <LearnArticle learn={pc.learn} fallbackTitle="Kulttuuri" accent={KULTTUURI.accent} />
          </div>
        ) : null
      }
    />
  );
}
