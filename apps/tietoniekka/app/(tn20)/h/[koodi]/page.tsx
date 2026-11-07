// KUVAVISAT 2.0 — HAASTELINKKI /h/<koodi> (K3, 17.9.2026)
//
// Lyhyt jaettava osoite. Aiemmin haastelinkki oli
// /peli?kuvavisa=liput&ids=<10 × uuid> eli ~370 merkkiä: WhatsAppissa se
// näytti roskalta ja katkesi esikatselussa.
//
// Reitti ei rakenna peliä itse vaan kutsuu /peli-sivun komponenttia samoilla
// parametreilla kuin haastaja pelasi. Näin kuvavisan pelin rakennuslogiikka
// (arvonta, varakortit, variaationimet, kuvalevy) pysyy yhdessä paikassa.
// Pelisivu tunnistaa ?h=<koodi>:n ja hakee haastajan tuloksen vertailuun.
//
// Metadata on tarkoituksella OMA: juurilayoutin openGraph.title on kaikilla
// sivuilla sama, ja juuri tämä osoite on se jonka kaveri saa WhatsAppissa.

import { jakoMeta } from "@/lib/jakoMeta";
import { esikatselu } from "@/lib/esikatselu";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Peli20 from "../../peli/page";
import { haeHaaste } from "@/lib/haaste";
import { variaationNimi, haeKuvakysymys, kuvavisanNimi } from "@/lib/kuvavisat2026";
import { mahtuuKorttiin } from "@/lib/kysymyskortti";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ koodi: string }> }): Promise<Metadata> {
  const { koodi } = await params;
  const h = await haeHaaste(koodi);
  if (!h) return { title: "Haastetta ei löytynyt | Tietoniekka" };
  const nimi = variaationNimi(h.kuvavisa, h.taso, h.maanosa) ?? kuvavisanNimi(h.kuvavisa);
  const title = `Kaverisi sai ${h.oikein}/${h.kysymyksia}`;
  const description = `${nimi}: ${h.kysymyksia} kuvaa, neljä vaihtoehtoa. Samat kuvat samassa järjestyksessä kuin haastajalla.`;
  /* Esikatselukortti (Jakotekstit v4 §4, vaihe 2): "{nimi} – kuvavisa", koukku = sarjan ensimmäinen korttiin mahtuva
     kuvakysymys (sama kaikille jaoille, ei tulosta kortissa). Vanhojen linkkien ?k= ohitetaan. */
  let koukku: Awaited<ReturnType<typeof haeKuvakysymys>> = null;
  for (const id of h.kuvaIdt.slice(0, 5)) {
    const q = await haeKuvakysymys(id);
    /* Jakokorteissa ei henkilökuvia (v4 §4). */
    if (q && q.type !== "henkilot" && q.question.trim().length <= 75 && mahtuuKorttiin({ question: q.question, options: q.options })) { koukku = q; break; }
  }
  const kuvaParam = new URLSearchParams({ nimi, ...(koukku ? { k: koukku.id } : {}) });
  const kortti = esikatselu({ nimi, muoto: "kuvavisa", n: h.kysymyksia, koukku: koukku?.question });
  return {
    title: `${title} | Tietoniekka`,
    description,
    ...jakoMeta({ ...kortti, url: `/h/${koodi}`, kuva: `/og/kuvavisa/${encodeURIComponent(h.kuvavisa)}?${kuvaParam}` }),
    /* Haastelinkkejä on yksi per peli — ne eivät kuulu hakukoneisiin, ja
       kanoninen osoite on kortiston perusvisa (SEO-erä A6: /kuvavisa/<kortisto>). */
    robots: { index: false, follow: true },
    alternates: { canonical: `/kuvavisa/${encodeURIComponent(h.kuvavisa)}` },
  };
}

export default async function Haastelinkki(
  { params, searchParams }: { params: Promise<{ koodi: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> },
) {
  const { koodi } = await params;
  /* Vaihe E: Facebookin kysymyskortin linkki /h/<koodi>?k=<kuvan id> → sarja alkaa kaverin kuvalla. */
  const { k } = await searchParams;
  const h = await haeHaaste(koodi);
  if (!h || h.kuvaIdt.length === 0) notFound();

  return Peli20({
    searchParams: Promise.resolve({
      kuvavisa: h.kuvavisa,
      ids: h.kuvaIdt.join(","),
      ...(h.taso ? { taso: h.taso } : {}),
      ...(h.maanosa ? { maanosa: h.maanosa } : {}),
      h: koodi,
      ...(typeof k === "string" && h.kuvaIdt.includes(k) ? { k } : {}),
    }),
  });
}
