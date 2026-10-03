// Erä B3: synttärikalenteri /henkilot/kuukausi/<kk> (esim. /henkilot/kuukausi/lokakuu), päivittäin.
import "../../../henkilo.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jakoMeta } from "@/lib/jakoMeta";
import { haeHakemisto } from "@/lib/henkilot";
import { KUUKAUDET, kuukausiSlug } from "@/lib/henkiloRyhmat";
import Lista from "../../Lista";

export const revalidate = 3600;
export const dynamicParams = false;
export function generateStaticParams() {
  return KUUKAUDET.map((_, i) => ({ kk: kuukausiSlug(i) }));
}

const kuukausiOf = (kk: string) => KUUKAUDET.findIndex((_, i) => kuukausiSlug(i) === kk);
const Iso = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function generateMetadata({ params }: { params: Promise<{ kk: string }> }): Promise<Metadata> {
  const i = kuukausiOf((await params).kk);
  if (i < 0) return {};
  const nimi = KUUKAUDET[i];
  const url = `/henkilot/kuukausi/${kuukausiSlug(i)}`;
  const description = `Tunnetut henkilöt, joiden syntymäpäivä on ${nimi}ssa – päivä päivältä, ikä ja tietovisa jokaisesta.`;
  return {
    title: `Syntymäpäivät: ${nimi} – tunnetut henkilöt | Tietoniekka`,
    description,
    alternates: { canonical: url },
    ...jakoMeta({ title: `Syntymäpäivät: ${nimi}`, description, url, kuva: "/og/kokoelma/tunnetut-henkilot" }),
  };
}

export default async function KuukausiPage({ params }: { params: Promise<{ kk: string }> }) {
  const i = kuukausiOf((await params).kk);
  if (i < 0) notFound();
  const jasenet = (await haeHakemisto()).filter((r) => r.synt?.m === i + 1).sort((a, b) => (a.synt!.d - b.synt!.d) || (a.synt!.y - b.synt!.y));
  const paivat = new Map<number, typeof jasenet>();
  for (const r of jasenet) paivat.set(r.synt!.d, [...(paivat.get(r.synt!.d) ?? []), r]);
  return (
    <Lista
      murut={[{ label: "Tunnetut henkilöt", href: "/kokoelma/tunnetut-henkilot" }, { label: "A–Ö", href: "/henkilot" }, { label: `Synttärit: ${KUUKAUDET[i]}` }]}
      otsikko={`Syntymäpäivät: ${Iso(KUUKAUDET[i])}`}
      lead={`${jasenet.length} tunnettua henkilöä, joiden syntymäpäivä on ${KUUKAUDET[i]}ssa.`}
      chipit={KUUKAUDET.map((m, j) => ({ nimi: Iso(m), href: `/henkilot/kuukausi/${kuukausiSlug(j)}`, on: j === i }))}
      osiot={[...paivat.entries()].map(([d, rr]) => ({ otsikko: `${d}.${i + 1}.`, rivit: rr }))}
    />
  );
}
