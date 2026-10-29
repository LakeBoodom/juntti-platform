// /visapaketti/<sarja>/<painos>/ruutu — painoksen televisionäkymä (noindex).
import RuutuSivu from "@/components/tn20/visapaketit/RuutuSivu";
import { pakettiMetadata, pakettiReitti, type Haku } from "@/components/tn20/visapaketit/reitit";

type Props = { params: Promise<{ slug: string; painos: string }>; searchParams: Promise<Haku> };

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug, painos } = await params;
  return pakettiMetadata(slug, painos, await searchParams, "ruutu");
}

export default async function Page({ params, searchParams }: Props) {
  const { slug, painos } = await params;
  const { sivu, taso, esikatselu } = await pakettiReitti(slug, painos, await searchParams, "ruutu");
  return <RuutuSivu sivu={sivu} taso={taso} esikatselu={esikatselu} />;
}
