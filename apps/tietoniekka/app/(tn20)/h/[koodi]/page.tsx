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

import { jakoMeta, JAKO_OG_OTSIKKO, jakoKuvaus } from "@/lib/jakoMeta";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Peli20 from "../../peli/page";
import { haeHaaste } from "@/lib/haaste";
import { variaationNimi, haeKuvakysymys } from "@/lib/kuvavisat2026";
import { mahtuuKorttiin } from "@/lib/kysymyskortti";

export const dynamic = "force-dynamic";

const OTSIKOT: Record<string, string> = {
  liput: "Lippuvisa", vaakunat: "Vaakunavisa", vaakuna: "Vaakunavisa", linnut: "Lintuvisa",
  elaimet: "Eläinvisa", kasvit: "Kasvivisa", maalaukset: "Maalausvisa",
  henkilot: "Henkilövisa", rakennukset: "Rakennusvisa", kaupungit: "Kaupunkivisa",
};

export async function generateMetadata(
  { params, searchParams }: { params: Promise<{ koodi: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> },
): Promise<Metadata> {
  const { koodi } = await params;
  const { k } = await searchParams;
  const h = await haeHaaste(koodi);
  if (!h) return { title: "Haastetta ei löytynyt | Tietoniekka" };
  const nimi = variaationNimi(h.kuvavisa, h.taso, h.maanosa) ?? OTSIKOT[h.kuvavisa] ?? "Kuvavisa";
  const title = `Kaverisi sai ${h.oikein}/${h.kysymyksia} — pystytkö parempaan?`;
  const description = `${nimi}: ${h.kysymyksia} kuvaa, neljä vaihtoehtoa. Samat kuvat samassa järjestyksessä kuin haastajalla.`;
  /* Vaihe D/E (23.10.2026): haastetunnuksen jakokuva on postikortti (tulos kannasta), ja Facebookin linkissä ?k=<kuvan id>
     kysymyskortti. og-kentät kuten /visa/-tuloslinkillä. */
  const kuvaParam = new URLSearchParams({ tulos: `${h.oikein}-${h.kysymyksia}`, nimi });
  /* og-kentät 23.10.2026 (Heikki): yhteinen otsikko ja "Sain 9/10. Pystytkö parempaan?" (kuvavisoilla ei tasonimeä). */
  const ogOtsikko = JAKO_OG_OTSIKKO;
  const ogKuvaus = jakoKuvaus(`${h.oikein}/${h.kysymyksia}`, null, h.oikein === h.kysymyksia);
  let ogOsoite = `/h/${koodi}`;
  if (typeof k === "string" && h.kuvaIdt.includes(k)) {
    const kysymys = await haeKuvakysymys(k);
    if (kysymys && mahtuuKorttiin({ question: kysymys.question, options: kysymys.options })) {
      kuvaParam.set("k", k);
      ogOsoite = `/h/${koodi}?k=${encodeURIComponent(k)}`;
    }
  }
  return {
    title: `${title} | Tietoniekka`,
    description,
    ...jakoMeta({ title: ogOtsikko, description: ogKuvaus, url: ogOsoite, kuva: `/og/kuvavisa/${encodeURIComponent(h.kuvavisa)}?${kuvaParam}` }),
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
