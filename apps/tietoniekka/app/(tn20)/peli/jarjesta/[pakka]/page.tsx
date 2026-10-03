// LAITA JÄRJESTYKSEEN — pakan sivu /peli/jarjesta/<pakka> (brief §2, 3.10.2026).
// Aloitusnäkymä (H1, kuvaus, rajaus, "Näin pelaat") renderöidään palvelimella ja
// välimuistitetaan; kierros arvotaan vasta "Aloita"-napista (Server Action), joten
// sivu ei lue searchParamsia eikä kaikille tarjoilla samaa välimuistissa olevaa kierrosta.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { PAKAT, haePakka, pakkaHref } from "@/lib/jarjesta/pakat";
import JarjestaClient from "./JarjestaClient";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return PAKAT.map((p) => ({ pakka: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pakka: string }> }): Promise<Metadata> {
  const p = haePakka((await params).pakka);
  if (!p) return {};
  const url = pakkaHref(p);
  return {
    title: `${p.seoTitle} | Tietoniekka`,
    description: `${p.kuvaus} ${p.rajaus}`,
    alternates: { canonical: url },
    ...jakoMeta({ title: p.seoTitle, description: p.kuvaus, url, kuva: `/og/jarjesta/${p.slug}` }),
  };
}

export default async function JarjestaPakkaPage({ params }: { params: Promise<{ pakka: string }> }) {
  const p = haePakka((await params).pakka);
  if (!p) notFound();
  const muut = PAKAT.filter((x) => x.slug !== p.slug).map((x) => ({ href: pakkaHref(x), otsikko: x.otsikko }));
  return (
    <>
      <JsonLd data={peliLd({ name: p.seoTitle, url: pakkaHref(p), description: p.kuvaus })} />
      <JarjestaClient pakka={p} muut={muut} />
    </>
  );
}
