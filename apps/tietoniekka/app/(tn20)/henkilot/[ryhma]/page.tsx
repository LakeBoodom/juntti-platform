// Erä B3: ryhmäsivu /henkilot/<ryhma> ("Kaikki N →" -linkkien kohde), lajichipit rajaukseen.
import "../../henkilo.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jakoMeta } from "@/lib/jakoMeta";
import { haeHakemisto, kirjaimittain } from "@/lib/henkilot";
import { RYHMAT, lajiNimi, type RyhmaKey } from "@/lib/henkiloRyhmat";
import Lista from "../Lista";

export const revalidate = 3600;
export const dynamicParams = false;
export function generateStaticParams() {
  return RYHMAT.map((r) => ({ ryhma: r.key }));
}

const ryhmaHaku = (k: string) => RYHMAT.find((r) => r.key === k) ?? null;

export async function generateMetadata({ params }: { params: Promise<{ ryhma: string }> }): Promise<Metadata> {
  const g = ryhmaHaku((await params).ryhma);
  if (!g) return {};
  const n = (await haeHakemisto()).filter((r) => r.ryhma === g.key).length;
  const description = `${g.nimi}: ${n} tunnettua henkilöä – ikä, syntymäpäivä ja tietovisa jokaisesta.`;
  return {
    title: `${g.nimi} – ikä ja syntymäpäivä | Tietoniekka`,
    description,
    alternates: { canonical: `/henkilot/${g.key}` },
    ...jakoMeta({ title: g.nimi, description, url: `/henkilot/${g.key}`, kuva: "/og/kokoelma/tunnetut-henkilot" }),
  };
}

export default async function RyhmaPage({ params }: { params: Promise<{ ryhma: string }> }) {
  const g = ryhmaHaku((await params).ryhma);
  if (!g) notFound();
  const jasenet = (await haeHakemisto()).filter((r) => r.ryhma === (g.key as RyhmaKey));
  const lajit = new Map<string, number>();
  for (const r of jasenet) if (r.laji) lajit.set(r.laji, (lajit.get(r.laji) ?? 0) + 1);
  return (
    <Lista
      murut={[{ label: "Tunnetut henkilöt", href: "/kokoelma/tunnetut-henkilot" }, { label: "A–Ö", href: "/henkilot" }, { label: g.nimi }]}
      otsikko={g.nimi}
      lead={`${jasenet.length} henkilöä, ikä ja syntymäpäivä jokaisesta.`}
      chipit={[...lajit.entries()].sort((a, b) => b[1] - a[1]).map(([l, n]) => ({ nimi: lajiNimi(l), href: `/henkilot/${g.key}/${l}`, n }))}
      osiot={kirjaimittain(jasenet).map((k) => ({ otsikko: k.k, rivit: k.rivit }))}
    />
  );
}
