// Visapakettien reittien yhteinen logiikka: /visapaketti/<slug>, /visapaketti/<sarja>/<painos>,
// /visapaketti/<slug>/lapset ('molemmat'-paketin lastenversio, 1.11.2026) ja niiden /ruutu-, /tulosta- ja /vetaja-näkymät. Paketti haetaan kerran per pyyntö (cache), metatiedot ja sivu jakavat haun.
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { jakoMeta } from "@/lib/jakoMeta";
import {
  haeSivu, lapsetHref, sivunHakuotsikko, sivunNimi, sivunTaso, sivunTekstit, valitsinNakyy, type Sivu, type Taso,
} from "@/lib/visapaketit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export type Haku = Record<string, string | string[] | undefined>;
export type Nakyma = "sivu" | "ruutu" | "tulosta" | "vetaja";

const hae = cache((slug: string, painos: string | null, esikatselu: string | null) => haeSivu(slug, painos, esikatselu));

const yksi = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);

export async function pakettiMetadata(slug: string, painos: string | null, sp: Haku, nakyma: Nakyma): Promise<Metadata> {
  const sivu = await hae(slug, painos, yksi(sp.esikatselu));
  if (!sivu) return { robots: { index: false } };
  const p = sivu.vp.paketti;
  const nimi = sivunHakuotsikko(sivu);
  const title = nakyma === "sivu" ? `${nimi} | Tietoniekka` : `${sivunNimi(sivu)} – ${{ ruutu: "näytä ruudulla", tulosta: "tulosta", vetaja: "juontajalle" }[nakyma]} | Tietoniekka`;
  const description = sivunTekstit(sivu).kuvaus ?? undefined;
  const canonical = `${SITE_URL}${sivu.kanoninen}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    // Televisionäkymä, tuloste ja juontajan näkymä: sisältö on jo pakettisivulla. Esikatselu (luonnos) ei koskaan indeksiin.
    ...(nakyma !== "sivu" || sivu.vp.esikatselu ? { robots: { index: false, follow: nakyma !== "sivu" } } : {}),
    ...jakoMeta({ title: nimi, description, url: canonical, kuva: `/og/visapaketti/${p.slug}` }),
  };
}

/** Hakee sivun tai 404. Litteä painososoite (/visapaketti/pubivisa-2026-…) ohjataan painoksen omaan osoitteeseen ja
 *  vanha ?taso=lapset lastenversion osoitteeseen (/visapaketti/joulu/lapset, 1.11.2026), samaan näkymään (301). */
export async function pakettiReitti(slug: string, painos: string | null, sp: Haku, nakyma: Nakyma): Promise<{ sivu: Sivu; taso: Taso; esikatselu: string | null }> {
  const esikatselu = yksi(sp.esikatselu);
  const sivu = await hae(slug, painos, esikatselu);
  if (!sivu) notFound();
  const pyydetty = `/visapaketti/${slug}${painos ? `/${painos}` : ""}`;
  const lapsiin = sp.taso === "lapset" && !sivu.taso && valitsinNakyy(sivu.vp.paketti);
  if (sivu.polku !== pyydetty || lapsiin) {
    const q = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" && k !== "taso" ? [[k, v]] : [])));
    const kohde = lapsiin ? lapsetHref(sivu.vp.paketti) : sivu.polku;
    permanentRedirect(`${kohde}${nakyma === "sivu" ? "" : `/${nakyma}`}${q.size ? `?${q}` : ""}`);
  }
  return { sivu, taso: sivunTaso(sivu), esikatselu };
}
