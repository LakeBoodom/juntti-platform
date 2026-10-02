// TIETONIEKKA 2.0 — /visa/<slug> = visan kanoninen osoite (julkaisu 31.8.2026).
// Ohut kääre pelinäkymän ympärille: sama server-loader ja sama GameClient kuin
// /peli?visa=<slug>, mutta siisti polku hakukoneille ja jaettaville linkeille.
// 1.0:n /visa/<slug>-sivut (staattinen intro + "Aloita"-nappi) korvautuivat
// tällä — vanhat osoitteet toimivat sellaisenaan, koska slugit ovat samat.
//
// SEO-erä A4 (2.10.2026): ISR 3600. Sivu EI lue searchParamsia (se tekisi siitä dynaamisen);
// parametrilliset pyynnöt (?tulos=, ?paivan_visa=1, ?hero=) ohjataan middlewaressa sisäisesti
// dynaamiseen /peli?visa=<slug>&…-reittiin. Ks. middleware.ts.
import PeliPage, { generateMetadata as peliMetadata } from "../../peli/page";
import type { Metadata } from "next";

export const revalidate = 3600;
/* Ilman generateStaticParamsia dynaaminen segmentti renderöidään joka pyynnöllä (ei ISR:ää).
   Tyhjä lista = sivut generoidaan ensimmäisellä käynnillä ja välimuistitetaan. */
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return peliMetadata({ searchParams: Promise.resolve({ visa: decodeURIComponent(slug) }) });
}

export default async function VisaPage({ params }: Props) {
  const { slug } = await params;
  return PeliPage({ searchParams: Promise.resolve({ visa: decodeURIComponent(slug) }) });
}
