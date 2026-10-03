// Erä B3: lajisivu /henkilot/<ryhma>/<laji> (esim. /henkilot/urheilijat/moottoriurheilu).
import "../../../henkilo.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jakoMeta } from "@/lib/jakoMeta";
import { haeHakemisto } from "@/lib/henkilot";
import { RYHMAT, lajiMonikko, lajiNimi } from "@/lib/henkiloRyhmat";
import Lista from "../../Lista";

export const revalidate = 3600;

export async function generateStaticParams() {
  const kaikki = await haeHakemisto();
  return [...new Set(kaikki.filter((r) => r.laji).map((r) => `${r.ryhma}/${r.laji}`))].map((x) => {
    const [ryhma, laji] = x.split("/");
    return { ryhma, laji };
  });
}

async function hae(ryhma: string, laji: string) {
  const g = RYHMAT.find((r) => r.key === ryhma);
  if (!g) return null;
  const jasenet = (await haeHakemisto()).filter((r) => r.ryhma === g.key && r.laji === laji);
  return jasenet.length ? { g, jasenet } : null;
}

const otsikkoOf = (laji: string) => {
  const m = lajiMonikko(laji);
  return m ? m.charAt(0).toUpperCase() + m.slice(1) : lajiNimi(laji);
};

export async function generateMetadata({ params }: { params: Promise<{ ryhma: string; laji: string }> }): Promise<Metadata> {
  const { ryhma, laji } = await params;
  const x = await hae(ryhma, laji);
  if (!x) return {};
  const url = `/henkilot/${ryhma}/${laji}`;
  const description = `${otsikkoOf(laji)}: ${x.jasenet.length} tunnettua henkilöä – ikä, syntymäpäivä ja tietovisa jokaisesta.`;
  return {
    title: `${otsikkoOf(laji)} – ikä ja syntymäpäivä | Tietoniekka`,
    description,
    alternates: { canonical: url },
    ...jakoMeta({ title: otsikkoOf(laji), description, url, kuva: "/og/kokoelma/tunnetut-henkilot" }),
  };
}

export default async function LajiPage({ params }: { params: Promise<{ ryhma: string; laji: string }> }) {
  const { ryhma, laji } = await params;
  const x = await hae(ryhma, laji);
  if (!x) notFound();
  return (
    <Lista
      murut={[
        { label: "Tunnetut henkilöt", href: "/kokoelma/tunnetut-henkilot" },
        { label: x.g.lyhyt, href: `/henkilot/${x.g.key}` },
        { label: lajiNimi(laji) },
      ]}
      otsikko={otsikkoOf(laji)}
      lead={`${x.jasenet.length} henkilöä, ikä ja syntymäpäivä jokaisesta.`}
      osiot={[{ rivit: x.jasenet }]}
    />
  );
}
