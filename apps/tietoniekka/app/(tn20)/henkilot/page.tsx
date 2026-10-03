// Erä B3 (3.10.2026): henkilöhakemisto /henkilot (design 3d/3e). ISR 1 h: iät ja "tänään syntyneet".
import "../henkilo.css";
import type { Metadata } from "next";
import Crumbs from "@/components/tn20/Crumbs";
import { jakoMeta } from "@/lib/jakoMeta";
import { haeHakemisto } from "@/lib/henkilot";
import { KUUKAUDET, RYHMAT, kuukausiSlug, lajiNimi } from "@/lib/henkiloRyhmat";
import { tanaan } from "@/lib/henkilo";
import Hakemisto, { type AzRivi } from "./Hakemisto";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const n = (await haeHakemisto()).length;
  const description = `${n} tunnettua henkilöä A–Ö: ikä, syntymäpäivä ja tietovisa jokaisesta. Selaa ryhmittäin tai syntymäkuukauden mukaan.`;
  return {
    title: "Tunnetut henkilöt A–Ö – ikä ja syntymäpäivä | Tietoniekka",
    description,
    alternates: { canonical: "/henkilot" },
    ...jakoMeta({ title: "Tunnetut henkilöt A–Ö", description, url: "/henkilot", kuva: "/og/kokoelma/tunnetut-henkilot" }),
  };
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default async function HenkilotPage() {
  const kaikki = await haeHakemisto();
  const nyt = tanaan();
  const az: AzRivi[] = kaikki.map((r) => ({ href: r.href, name: r.name, meta: r.meta, image_url: r.image_url, kirjain: r.kirjain, haku: norm(r.name) }));

  const ryhmat = RYHMAT.map((g) => {
    const jasenet = kaikki.filter((r) => r.ryhma === g.key);
    const lajit = new Map<string, number>();
    for (const r of jasenet) if (r.laji) lajit.set(r.laji, (lajit.get(r.laji) ?? 0) + 1);
    return {
      nimi: g.nimi,
      href: `/henkilot/${g.key}`,
      n: jasenet.length,
      lajit: [...lajit.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([l, n]) => ({ nimi: lajiNimi(l), href: `/henkilot/${g.key}/${l}`, n })),
    };
  }).filter((g) => g.n > 0);

  const kuukaudet = KUUKAUDET.map((nimi, i) => ({
    nimi: nimi.charAt(0).toUpperCase() + nimi.slice(1),
    href: `/henkilot/kuukausi/${kuukausiSlug(i)}`,
    n: kaikki.filter((r) => r.synt?.m === i + 1).length,
  }));

  const tanaanRivit = az.filter((_, i) => kaikki[i].synt?.m === nyt.m && kaikki[i].synt?.d === nyt.d);

  return (
    <main className="hs hk-sivu">
      <Crumbs items={[{ label: "Tunnetut henkilöt", href: "/kokoelma/tunnetut-henkilot" }, { label: "A–Ö" }]} />
      <div className="tn-shell hk-shell">
        <header className="hk-head" style={{ ["--hk-lw" as string]: 10 }}>
          <h1 className="hk-h1">Tunnetut henkilöt A–Ö</h1>
          <p className="hk-lead">{kaikki.length} henkilöä, ikä ja syntymäpäivä jokaisesta.</p>
        </header>
        <Hakemisto
          rivit={az}
          ryhmat={ryhmat}
          kuukaudet={kuukaudet}
          tanaan={{ otsikko: `Tänään syntyneet (${nyt.d}.${nyt.m}.)`, rivit: tanaanRivit }}
        />
      </div>
    </main>
  );
}
