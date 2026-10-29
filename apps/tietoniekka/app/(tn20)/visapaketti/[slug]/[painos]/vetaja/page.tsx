// /visapaketti/<sarja>/<painos>/vetaja — painoksen juontajan näkymä (noindex).
import VetajaSivu from "@/components/tn20/visapaketit/VetajaSivu";
import { pakettiMetadata, pakettiReitti, type Haku } from "@/components/tn20/visapaketit/reitit";

type Props = { params: Promise<{ slug: string; painos: string }>; searchParams: Promise<Haku> };

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug, painos } = await params;
  return pakettiMetadata(slug, painos, await searchParams, "vetaja");
}

export default async function Page({ params, searchParams }: Props) {
  const { slug, painos } = await params;
  const { sivu, taso, esikatselu } = await pakettiReitti(slug, painos, await searchParams, "vetaja");
  return <VetajaSivu sivu={sivu} taso={taso} esikatselu={esikatselu} />;
}
