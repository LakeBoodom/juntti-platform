// Visapakettien reittien yhteinen logiikka: /visapaketti/<slug>, /visapaketti/<sarja>/<painos> ja niiden
// /ruutu-, /tulosta- ja /vetaja-näkymät. Paketti haetaan kerran per pyyntö (cache), metatiedot ja sivu jakavat haun.
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { jakoMeta } from "@/lib/jakoMeta";
import { haeSivu, tasoParametrista, type Sivu, type Taso } from "@/lib/visapaketit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export type Haku = Record<string, string | string[] | undefined>;
export type Nakyma = "sivu" | "ruutu" | "tulosta" | "vetaja";

const hae = cache((slug: string, painos: string | null, esikatselu: string | null) => haeSivu(slug, painos, esikatselu));

const yksi = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);

export async function pakettiMetadata(slug: string, painos: string | null, sp: Haku, nakyma: Nakyma): Promise<Metadata> {
  const sivu = await hae(slug, painos, yksi(sp.esikatselu));
  if (!sivu) return { robots: { index: false } };
  const p = sivu.vp.paketti;
  const nimi = p.seo_title ?? (p.painos_nimi ? `${p.otsikko} – ${p.painos_nimi}` : p.otsikko);
  const title = nakyma === "sivu" ? `${nimi} | Tietoniekka` : `${p.otsikko} – ${{ ruutu: "näytä ruudulla", tulosta: "tulosta", vetaja: "juontajalle" }[nakyma]} | Tietoniekka`;
  const description = p.seo_description ?? undefined;
  const canonical = `${SITE_URL}${sivu.polku}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    // Televisionäkymä, tuloste ja juontajan näkymä: sisältö on jo pakettisivulla. Esikatselu (luonnos) ei koskaan indeksiin.
    ...(nakyma !== "sivu" || sivu.vp.esikatselu ? { robots: { index: false, follow: nakyma !== "sivu" } } : {}),
    ...jakoMeta({ title: nimi, description, url: canonical, kuva: `/og/visapaketti/${p.slug}` }),
  };
}

/** Hakee sivun tai 404; litteä painososoite (/visapaketti/pubivisa-2026-…) ohjataan painoksen omaan osoitteeseen. */
export async function pakettiReitti(slug: string, painos: string | null, sp: Haku, nakyma: Nakyma): Promise<{ sivu: Sivu; taso: Taso; esikatselu: string | null }> {
  const esikatselu = yksi(sp.esikatselu);
  const sivu = await hae(slug, painos, esikatselu);
  if (!sivu) notFound();
  const pyydetty = `/visapaketti/${slug}${painos ? `/${painos}` : ""}`;
  if (sivu.polku !== pyydetty) {
    const q = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
    permanentRedirect(`${sivu.polku}${nakyma === "sivu" ? "" : `/${nakyma}`}${q.size ? `?${q}` : ""}`);
  }
  return { sivu, taso: tasoParametrista(sivu.vp.paketti, sp.taso), esikatselu };
}
