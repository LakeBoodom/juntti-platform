// LUONTO yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/luonto.ts, visat osioihin quizzes.section_tags-tagista,
// kuva- ja äänivisat V6:ssa. Vanha sivukohtainen toteutus (CD "TN Luonto-kokoelma v3.0": pelimuotovalinta,
// suodattimet) poistettu; vanhat ?suodata=-linkit ohjataan middlewaressa osion tai pelien ankkuriin.
import "../../runko.css";
import "../../aanivisa-banneri.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import PeliBanneri from "@/components/tn20/runko/PeliBanneri";
import AaniBanneri from "@/components/tn20/aanivisa/AaniBanneri";
import { haeAaniBanneri } from "@/lib/aanivisat/data";
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
  const [d, aani] = await Promise.all([haeRunkoData(LUONTO), haeAaniBanneri()]);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  /* Äänivisa V4-pelibannerina (Heikki 20.10.2026). 27.10.2026: sama kuvitettu banneri kuin etusivulla
     (CD "TN Aanivisat – bannerit ja hero" 2a), ei enää vanhaa sonogrammikorttia. */
  const banneri = aani ? (
    <PeliBanneri nimi="Äänivisa">
      <AaniBanneri b={aani} />
    </PeliBanneri>
  ) : undefined;
  return <KokoelmaRunko d={d} tunnusosa={banneri} />;
}
