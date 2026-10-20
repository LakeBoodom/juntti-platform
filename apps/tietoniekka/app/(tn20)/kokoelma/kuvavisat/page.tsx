// KUVAVISAT yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Staattinen segmentti ohittaa [collection]-reitin. Kohteet ovat kuvavisojen kategorioita ja muunnelmia
// (lib/kokoelmat/kuvavisat.ts). Vanha toteutus (KuvavisatHub, Kuvavisat 2.0 17.9.2026) poistettu.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { KUVAVISAT, kuvavisaKohteet } from "@/lib/kokoelmat/kuvavisat";
import { getKuvavisatHub } from "@/lib/kuvavisat2026";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("kuvavisat");
  const title = pc?.seo_title ?? "Kuvavisat — tietovisat";
  const description =
    pc?.seo_description ??
    "Tunnista liput, vaakunat, linnut, eläimet, maalaukset, rakennukset ja kasvit. Valitse kategoria ja sinulle sopiva vaikeustaso.";
  const canonical = `${SITE_URL}/kokoelma/kuvavisat`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/kuvavisat" }) };
}

export default async function KuvavisatLanding() {
  const hub = await getKuvavisatHub();
  const d = await haeRunkoData(KUVAVISAT, kuvavisaKohteet(hub.kategoriat));
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} />;
}
