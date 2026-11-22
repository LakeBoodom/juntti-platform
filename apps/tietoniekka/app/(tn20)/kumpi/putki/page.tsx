// KUMPI? 2.0 vaihe 2 — Putki /kumpi/putki (Heikki 17.11.2026). Kysymyksiä tulee niin kauan kuin vastaat oikein; kello
// 10 s, kysymyksestä 21 alkaen 7 s; väärä vastaus tai loppunut aika katkaisee putken. Teema Yleistieto, vaikeus nousee
// kysymysnumeron mukaan (lib/kumpi/generate.ts teePutki). Sivu antaa ensimmäiset 40 kysymystä, jatko haetaan
// rajapinnasta /api/kumpi/putki samalla siemenellä. Ennätys selaimessa (lib/kumpi/tallennus.ts).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jakoMeta, jakoOsoite } from "@/lib/jakoMeta";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { seuraavatPelit } from "@/lib/pelimuodot";
import { pelimuodonEhdokas } from "@/lib/seuraavaksi/hae";
import { arvoPutki, PELITAPOJEN_TEEMA, PUTKI_ERA, teemojenNimet, uusiPutkiSiemen } from "@/lib/kumpi/sivu";
import KumpiKierros from "@/components/tn20/kumpi/KumpiKierros";
import "@/components/tn20/kumpi/kumpi.css";

export const dynamic = "force-dynamic";

const POLKU = "/kumpi/putki";
const KUVAUS = "Kumpi? Putki: kymmenen sekuntia per kysymys, ja yksi virhe katkaisee putken. Montako saat peräkkäin oikein?";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return {
    title: "Kumpi? Putki",
    description: KUVAUS,
    alternates: { canonical: POLKU },
    ...jakoMeta({
      title: "Kumpi? Putki",
      description: "Kello käy, ja yksi virhe katkaisee putken.",
      url: jakoOsoite(POLKU, await searchParams, ["oikein"]),
      kuva: "/og/sivu/kumpi",
    }),
  };
}

export default async function KumpiPutki() {
  const siemen = uusiPutkiSiemen();
  const kysymykset = await arvoPutki(siemen, 0, PUTKI_ERA);
  if (!kysymykset || kysymykset.length < 10) notFound();
  return (
    <>
      <JsonLd data={peliLd({ name: "Kumpi? Putki", url: POLKU, description: KUVAUS })} />
      <KumpiKierros
        kysymykset={kysymykset}
        teema={{ slug: PELITAPOJEN_TEEMA, nimi: "Putki" }}
        siemen={siemen}
        polku={POLKU}
        pelitapa="putki"
        putki={{ siemen, teemaNimet: teemojenNimet() }}
        seuraavat={seuraavatPelit("kumpi").map((p, i) => ({ paikka: i + 1, ehdokkaat: [pelimuodonEhdokas(p, `kumpi:${p.slug}`)] }))}
      />
    </>
  );
}
