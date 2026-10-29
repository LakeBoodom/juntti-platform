// /visapaketti/<slug> — pakettisivu; sarjan nimellä (/visapaketti/pubivisa) sarjan uusin painos + arkisto.
import PakettiSivu from "@/components/tn20/visapaketit/PakettiSivu";
import { pakettiMetadata, pakettiReitti, type Haku } from "@/components/tn20/visapaketit/reitit";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Haku> };

export async function generateMetadata({ params, searchParams }: Props) {
  return pakettiMetadata((await params).slug, null, await searchParams, "sivu");
}

export default async function Page({ params, searchParams }: Props) {
  const { sivu, taso, esikatselu } = await pakettiReitti((await params).slug, null, await searchParams, "sivu");
  return <PakettiSivu sivu={sivu} taso={taso} esikatselu={esikatselu} />;
}
