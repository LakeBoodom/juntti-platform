// /visapaketti/<slug>/ruutu — televisionäkymä (noindex).
import RuutuSivu from "@/components/tn20/visapaketit/RuutuSivu";
import { pakettiMetadata, pakettiReitti, type Haku } from "@/components/tn20/visapaketit/reitit";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Haku> };

export async function generateMetadata({ params, searchParams }: Props) {
  return pakettiMetadata((await params).slug, null, await searchParams, "ruutu");
}

export default async function Page({ params, searchParams }: Props) {
  const { sivu, taso, esikatselu } = await pakettiReitti((await params).slug, null, await searchParams, "ruutu");
  return <RuutuSivu sivu={sivu} taso={taso} esikatselu={esikatselu} />;
}
