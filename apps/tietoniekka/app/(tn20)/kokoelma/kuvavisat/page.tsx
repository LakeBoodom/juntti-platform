// KUVAVISAT yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Staattinen segmentti ohittaa [collection]-reitin. Kohteet ovat kuvavisojen kategorioita ja muunnelmia
// (lib/kokoelmat/kuvavisat.ts). P5 (Heikki 21.10.2026): V2–V5:n tilalla viikon visa heti heron alla ja
// kategoriaruudukko esikatselukuvineen (KuvavisaKategoriat); viikon visa pois V6-pelilistasta.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { KUVAVISAT, kuvavisaKohteet } from "@/lib/kokoelmat/kuvavisat";
import { getKuvavisatHub, getViikkovisa } from "@/lib/kuvavisat2026";
import { viikkoInfo } from "@/lib/viikkovisa";
import KuvavisaKategoriat from "@/components/tn20/runko/KuvavisaKategoriat";

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
  const [hub, vv] = await Promise.all([getKuvavisatHub(), getViikkovisa()]);
  const d = await haeRunkoData(KUVAVISAT, kuvavisaKohteet(hub.kategoriat));
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  /* Viikkotiedot palvelimella (viikkoInfo), ei selaimen kellosta. */
  const viikkovisa = vv ? { info: viikkoInfo(vv.vuosi, vv.viikko), kuvia: vv.kuvaIdt.length } : null;
  return (
    <KokoelmaRunko
      d={viikkovisa ? { ...d, pelit: d.pelit.filter((p) => p.slug !== "kuvavisa-viikko") } : d}
      sisalto={<KuvavisaKategoriat kategoriat={hub.kategoriat} viikkovisa={viikkovisa} />}
    />
  );
}
