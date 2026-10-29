// /visapaketti/<sarja>/<painos> — sarjan yksittäinen painos (sama pakettisivupohja, oma canonical).
import PakettiSivu from "@/components/tn20/visapaketit/PakettiSivu";
import { pakettiMetadata, pakettiReitti, type Haku } from "@/components/tn20/visapaketit/reitit";

type Props = { params: Promise<{ slug: string; painos: string }>; searchParams: Promise<Haku> };

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug, painos } = await params;
  return pakettiMetadata(slug, painos, await searchParams, "sivu");
}

export default async function Page({ params, searchParams }: Props) {
  const { slug, painos } = await params;
  const { sivu, taso, esikatselu } = await pakettiReitti(slug, painos, await searchParams, "sivu");
  return <PakettiSivu sivu={sivu} taso={taso} esikatselu={esikatselu} />;
}
