// KUMPI? 2.0 vaihe 2 — Päivän Kumpi? /kumpi/paivan (Heikki 17.11.2026). Sama kymmenen kysymyksen kierros kaikille koko
// Helsingin kalenteripäivän: siemen = päivämäärä, teema Yleistieto. Tulos säilyy selaimessa, ja saman päivän uusi käynti
// näyttää tuloksen (KumpiKierros, lib/kumpi/tallennus.ts).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jakoMeta, jakoOsoite } from "@/lib/jakoMeta";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { helsinginPaiva } from "@/lib/aika";
import { seuraavatPelit } from "@/lib/pelimuodot";
import { pelimuodonEhdokas } from "@/lib/seuraavaksi/hae";
import { arvoPaivan, paivanSiemen, PELITAPOJEN_TEEMA } from "@/lib/kumpi/sivu";
import KumpiKierros from "@/components/tn20/kumpi/KumpiKierros";
import "@/components/tn20/kumpi/kumpi.css";

export const dynamic = "force-dynamic";

const POLKU = "/kumpi/paivan";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return {
    title: "Päivän Kumpi?",
    description: "Päivän Kumpi?: kymmenen kysymystä, kaksi vaihtoehtoa, vain toinen on oikein. Sama kierros kaikille, uusi joka päivä.",
    alternates: { canonical: POLKU },
    ...jakoMeta({
      title: "Päivän Kumpi?",
      description: "Kaksi vaihtoehtoa, vain toinen on oikein. Uusi kierros joka päivä.",
      url: jakoOsoite(POLKU, await searchParams, ["oikein"]),
      kuva: "/og/sivu/kumpi",
    }),
  };
}

export default async function PaivanKumpi() {
  const { iso } = helsinginPaiva();
  const kysymykset = await arvoPaivan(iso);
  if (!kysymykset) notFound();
  return (
    <>
      <JsonLd data={peliLd({ name: "Päivän Kumpi?", url: POLKU, description: "Kaksi vaihtoehtoa, vain toinen on oikein. Uusi kierros joka päivä." })} />
      <KumpiKierros
        kysymykset={kysymykset}
        teema={{ slug: PELITAPOJEN_TEEMA, nimi: "Päivän peli" }}
        siemen={paivanSiemen(iso)}
        polku={POLKU}
        pelitapa="paivan"
        pvm={iso}
        seuraavat={seuraavatPelit("kumpi").map((p, i) => ({ paikka: i + 1, ehdokkaat: [pelimuodonEhdokas(p, `kumpi:${p.slug}`)] }))}
      />
    </>
  );
}
