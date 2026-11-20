// KUMPI? 2.0 — seuran kierros /kumpi/seura/[seura] (Heikki 20.11.2026: seurat eivät näy hubin ruudukossa; tänne
// Oma seura -valinnasta, jääkiekkohubista ja seuran visasivulta). Sama pelinäkymä kuin teemasivulla, palkissa seuran nimi.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jakoMeta, jakoOsoite } from "@/lib/jakoMeta";
import { seuraTeema } from "@/lib/kumpi/teemat";
import KierrosSivu from "@/components/tn20/kumpi/KierrosSivu";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ seura: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const slug = (await params).seura;
  const t = seuraTeema(slug);
  if (!t) return {};
  const polku = `/kumpi/seura/${slug}`;
  return {
    title: `Kumpi? ${t.nimi}`,
    description: `Kumpi? ${t.nimi}: kumpi pelasi enemmän, kumpi teki enemmän maaleja? Kymmenen kysymyksen kierros seuran pelaajista.`,
    alternates: { canonical: polku },
    ...jakoMeta({
      title: `Kumpi? ${t.nimi}`,
      description: "Kaksi vaihtoehtoa, vain toinen on oikein.",
      url: jakoOsoite(polku, await searchParams, ["sarja", "oikein"]),
      kuva: "/og/sivu/kumpi", // oma Kumpi?-kortti tulee SVG-korttijärjestelmään; siihen asti oletuskuva
    }),
  };
}

export default async function KumpiSeuraSivu({ params, searchParams }: Props) {
  const slug = (await params).seura;
  const t = seuraTeema(slug);
  if (!t) notFound();
  const sp = await searchParams;
  return <KierrosSivu teema={t} polku={`/kumpi/seura/${slug}`} sarja={sp.sarja} />;
}
