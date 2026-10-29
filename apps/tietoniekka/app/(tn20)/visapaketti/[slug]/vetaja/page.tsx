// /visapaketti/<slug>/vetaja — juontajan näkymä (noindex).
import VetajaSivu from "@/components/tn20/visapaketit/VetajaSivu";
import { pakettiMetadata, pakettiReitti, type Haku } from "@/components/tn20/visapaketit/reitit";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Haku> };

export async function generateMetadata({ params, searchParams }: Props) {
  return pakettiMetadata((await params).slug, null, await searchParams, "vetaja");
}

export default async function Page({ params, searchParams }: Props) {
  const { sivu, taso, esikatselu } = await pakettiReitti((await params).slug, null, await searchParams, "vetaja");
  return <VetajaSivu sivu={sivu} taso={taso} esikatselu={esikatselu} />;
}
