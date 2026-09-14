// TIETONIEKKA 2.0 — /visa/<slug> = visan kanoninen osoite (julkaisu 31.8.2026).
// Ohut kääre pelinäkymän ympärille: sama server-loader ja sama GameClient kuin
// /peli?visa=<slug>, mutta siisti polku hakukoneille ja jaettaville linkeille.
// 1.0:n /visa/<slug>-sivut (staattinen intro + "Aloita"-nappi) korvautuivat
// tällä — vanhat osoitteet toimivat sellaisenaan, koska slugit ovat samat.
import PeliPage, { generateMetadata as peliMetadata } from "../../peli/page";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  /* Hero-testiparametri (?hero=uusi) välitetään myös kanoniselle polulle, jotta
     uutta aloitusnäkymää voi katsoa /visa/<slug>-osoitteessa. */
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return peliMetadata({ searchParams: Promise.resolve({ visa: slug }) });
}

export default async function VisaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  return PeliPage({ searchParams: Promise.resolve({ ...sp, visa: slug }) });
}
