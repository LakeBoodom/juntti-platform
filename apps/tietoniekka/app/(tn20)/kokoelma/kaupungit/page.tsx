// SUOMEN KAUPUNGIT yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/kaupungit.ts, visat osioihin quizzes.section_tags-tagista.
// Vanha sivukohtainen toteutus (CD 27.8.2026: kartta-pelilauta, matkapassi) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { KAUPUNGIT_KOKOELMA } from "@/lib/kokoelmat/kaupungit";
import { KAUPUNGIT_LISTA, haeKaupunkilista } from "@/lib/kaupunkisivu";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("kaupungit");
  const title = pc?.seo_title ?? "Suomen kaupungit — matkusta halki Suomen tietovisoina";
  const description =
    pc?.seo_description ?? "Oma visa joka kaupungille Hangosta Lapin tuntureille. Kuinka hyvin tunnet Suomen kaupungit?";
  const canonical = `${SITE_URL}/kokoelma/kaupungit`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/kaupungit" }) };
}

export default async function KaupungitLanding() {
  const [d, kaupungit] = await Promise.all([haeRunkoData(KAUPUNGIT_KOKOELMA), haeKaupunkilista()]);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  /* Kaupunkisivut (7.11.2026): linkki kaupunkilistaan samassa paikassa kuin Tunnetut henkilöt -sivun A–Ö-linkki. */
  const lista = kaupungit.length ? (
    <div className="rk-haku">
      <div className="rk-haku-rivi">
        <a className="rk-haku-kaikki" href={KAUPUNGIT_LISTA}>Kaikki {kaupungit.length} kaupunkisivua A–Ö →</a>
      </div>
    </div>
  ) : null;
  return <KokoelmaRunko d={d} v3Lisa={lista} />;
}
