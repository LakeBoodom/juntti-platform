// LUONTO yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/luonto.ts, visat osioihin quizzes.section_tags-tagista,
// kuva- ja äänivisat V6:ssa. Vanha sivukohtainen toteutus (CD "TN Luonto-kokoelma v3.0": pelimuotovalinta,
// suodattimet) poistettu; vanhat ?suodata=-linkit ohjataan middlewaressa osion tai pelien ankkuriin.
import "../../runko.css";
import "../../aanikortti.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import PeliBanneri from "@/components/tn20/runko/PeliBanneri";
import AaniKortti, { type KorttiNayte } from "@/components/tn20/aanivisa/AaniKortti";
import { aanivisaHref } from "@/lib/aanivisat";
import { haeNayte, julkaistutRyhmat, viikonPaaryhma } from "@/lib/aanivisat/data";
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

/** Äänivisakortti (V4 tyyppi 3, Heikki 20.10.2026): kuluvan viikon pääryhmä ja sen näyte, kuten tuotannon
 *  Luonto v3.0 -sivulla. Ei julkaistuja ryhmiä → ei banneria. */
async function haeAaniKortti(): Promise<KorttiNayte | null> {
  const ryhmat = await julkaistutRyhmat();
  const naytteet = (await Promise.all(ryhmat.map((r) => haeNayte(r)))).filter((n): n is NonNullable<typeof n> => !!n);
  if (!naytteet.length) return null;
  const paa = viikonPaaryhma(naytteet.map((n) => n.ryhma), naytteet[0].viikko);
  const n = naytteet.find((x) => x.ryhma.key === paa?.key) ?? null;
  return n
    ? {
        ryhma: n.ryhma.key, otsikko: n.ryhma.otsikko, kuvaus: n.ryhma.kortti, href: aanivisaHref(n.ryhma),
        vuosi: n.vuosi, viikko: n.viikko, audio: n.audio, sono: n.sono, jakso: n.jakso, tauko: n.tauko,
      }
    : null;
}

export default async function LuontoLanding() {
  const [d, aani] = await Promise.all([haeRunkoData(LUONTO), haeAaniKortti()]);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  const banneri = aani ? (
    <PeliBanneri nimi="Äänivisa">
      <div className="tnl3">
        <AaniKortti k={aani} />
      </div>
    </PeliBanneri>
  ) : undefined;
  return <KokoelmaRunko d={d} tunnusosa={banneri} />;
}
