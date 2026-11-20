// KUMPI? 2.0 — teeman kierros /kumpi/[teema] (brief A3: Kierros). Pelinäkymä omalla palkillaan (lib/nav.ts isGameRoute).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jakoMeta, jakoOsoite } from "@/lib/jakoMeta";
import { teemaSlugilla } from "@/lib/kumpi/teemat";
import KierrosSivu from "@/components/tn20/kumpi/KierrosSivu";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ teema: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const t = teemaSlugilla((await params).teema);
  if (!t) return {};
  const polku = `/kumpi/${t.slug}`;
  return {
    title: `Kumpi? ${t.nimi}`,
    description: `Kumpi? ${t.nimi}: kaksi vaihtoehtoa, vain toinen on oikein. Kymmenen kysymyksen kierros.`,
    alternates: { canonical: polku },
    ...jakoMeta({
      title: `Kumpi? ${t.nimi}`,
      description: "Kaksi vaihtoehtoa, vain toinen on oikein.",
      url: jakoOsoite(polku, await searchParams, ["sarja", "oikein"]),
      kuva: "/og/sivu/kumpi", // oma Kumpi?-kortti tulee SVG-korttijärjestelmään; siihen asti oletuskuva
    }),
  };
}

export default async function KumpiTeemaSivu({ params, searchParams }: Props) {
  const t = teemaSlugilla((await params).teema);
  if (!t) notFound();
  const sp = await searchParams;
  return <KierrosSivu teema={t} polku={`/kumpi/${t.slug}`} sarja={sp.sarja} />;
}
