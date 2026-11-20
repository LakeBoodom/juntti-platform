// KUMPI? 2.0 — Kierros-sivun palvelinosa (teemasivu /kumpi/[teema] ja seurasivu /kumpi/seura/[seura]).
// Kymmenen kysymystä arvotaan palvelimella siemenestä: ?sarja=<siemen> antaa saman kierroksen (jaettu linkki),
// ilman sitä arvotaan uusi. Selaimeen lähtevät vain arvotut kysymykset, ei teeman koko dataa.
import { notFound } from "next/navigation";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { seuraavatPelit } from "@/lib/pelimuodot";
import { pelimuodonEhdokas } from "@/lib/seuraavaksi/hae";
import { arvoKierros, sarjaSiemen } from "@/lib/kumpi/sivu";
import type { Teema } from "@/lib/kumpi/teemat";
import KumpiKierros from "./KumpiKierros";
import "./kumpi.css";

/** Teeman kotikokoelma "Pelaa seuraavaksi" -valintaan: saman aiheen pelit ensin. */
const KOTI: Record<Teema["ryhma"], string> = {
  jaakiekko: "jaakiekko", urheilu: "urheilu", suomi: "kaupungit", luonto: "luonto", maailma: "matkakohteet", ihmiset: "tunnetut-henkilot",
};

export default async function KierrosSivu({ teema, polku, sarja }: { teema: Teema; polku: string; sarja: unknown }) {
  const { siemen } = sarjaSiemen(teema, sarja);
  const kysymykset = await arvoKierros(teema, siemen);
  if (!kysymykset) notFound();
  return (
    <>
      <JsonLd data={peliLd({ name: `Kumpi? ${teema.nimi}`, url: polku, description: `Kumpi? ${teema.nimi}: kaksi vaihtoehtoa, vain toinen on oikein.` })} />
      <KumpiKierros
        kysymykset={kysymykset}
        teema={{ slug: teema.slug, nimi: teema.nimi }}
        siemen={siemen}
        polku={polku}
        seuraavat={seuraavatPelit("kumpi", KOTI[teema.ryhma]).map((p, i) => ({ paikka: i + 1, ehdokkaat: [pelimuodonEhdokas(p, `kumpi:${p.slug}`)] }))}
      />
    </>
  );
}
