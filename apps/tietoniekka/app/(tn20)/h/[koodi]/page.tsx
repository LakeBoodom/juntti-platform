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

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Peli20 from "../../peli/page";
import { haeHaaste } from "@/lib/haaste";
import { variaationNimi } from "@/lib/kuvavisat2026";

export const dynamic = "force-dynamic";

const OTSIKOT: Record<string, string> = {
  liput: "Lippuvisa", vaakunat: "Vaakunavisa", vaakuna: "Vaakunavisa", linnut: "Lintuvisa",
  elaimet: "Eläinvisa", kasvit: "Kasvivisa", maalaukset: "Maalausvisa",
  henkilot: "Henkilövisa", rakennukset: "Rakennusvisa", kaupungit: "Kaupunkivisa",
};

export async function generateMetadata(
  { params }: { params: Promise<{ koodi: string }> },
): Promise<Metadata> {
  const { koodi } = await params;
  const h = await haeHaaste(koodi);
  if (!h) return { title: "Haastetta ei löytynyt | Tietoniekka" };
  const nimi = variaationNimi(h.kuvavisa, h.taso, h.maanosa) ?? OTSIKOT[h.kuvavisa] ?? "Kuvavisa";
  const title = `Kaverisi sai ${h.oikein}/${h.kysymyksia} — pystytkö parempaan?`;
  const description = `${nimi}: ${h.kysymyksia} kuvaa, neljä vaihtoehtoa. Samat kuvat samassa järjestyksessä kuin haastajalla.`;
  return {
    title: `${title} | Tietoniekka`,
    description,
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", title, description },
    twitter: { card: "summary_large_image", title, description },
    /* Haastelinkkejä on yksi per peli — ne eivät kuulu hakukoneisiin, ja
       kanoninen osoite on kortiston perusvisa. */
    robots: { index: false, follow: true },
    alternates: { canonical: `/peli?kuvavisa=${encodeURIComponent(h.kuvavisa)}` },
  };
}

export default async function Haastelinkki(
  { params }: { params: Promise<{ koodi: string }> },
) {
  const { koodi } = await params;
  const h = await haeHaaste(koodi);
  if (!h || h.kuvaIdt.length === 0) notFound();

  return Peli20({
    searchParams: Promise.resolve({
      kuvavisa: h.kuvavisa,
      ids: h.kuvaIdt.join(","),
      ...(h.taso ? { taso: h.taso } : {}),
      ...(h.maanosa ? { maanosa: h.maanosa } : {}),
      h: koodi,
    }),
  });
}
