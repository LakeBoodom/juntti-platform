// LAITA JÄRJESTYKSEEN — pakan sivu /peli/jarjesta/<pakka> (brief §2 3.10.2026, vaalit-brief §2 5.10.2026).
// Vain julkaistut pakat (pakat.ts `julkaistu`); muut 404.
// Aloitusnäkymä (H1, kuvaus, rajaus, "Näin pelaat") renderöidään palvelimella ja
// välimuistitetaan; kierros arvotaan vasta "Aloita"-napista (Server Action), joten
// sivu ei lue searchParamsia eikä kaikille tarjoilla samaa välimuistissa olevaa kierrosta.

import { PELIMUODOT } from "@/lib/pelimuodot";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta, jakoOsoite, pelituloksenOg } from "@/lib/jakoMeta";
import { JULKAISTUT, haePakka, pakkaHref } from "@/lib/jarjesta/pakat";
import JarjestaClient from "./JarjestaClient";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return JULKAISTUT.map((p) => ({ pakka: p.slug }));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ pakka: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const p = haePakka((await params).pakka);
  /* Jaettu tulos (?tulos=n-total, 23.10.2026): og-kuvaus tuloksesta, og:url = jaettu linkki. */
  const sp = await searchParams;
  if (!p) return {};
  const url = pakkaHref(p);
  return {
    title: `${p.seoTitle} | Tietoniekka`,
    description: `${p.kuvaus} ${p.rajaus}`,
    alternates: { canonical: url },
    ...jakoMeta({ ...(pelituloksenOg(sp, "oikein") ?? { title: p.seoTitle, description: p.kuvaus }), url: jakoOsoite(url, sp, ["tulos"]), kuva: `/og/jarjesta/${p.slug}` }),
  };
}

export default async function JarjestaPakkaPage({ params }: { params: Promise<{ pakka: string }> }) {
  const p = haePakka((await params).pakka);
  if (!p) notFound();
  // Muut järjestyspelit: saman kokoelman pakat ensin.
  const muut = JULKAISTUT.filter((x) => x.slug !== p.slug)
    .sort((a, b) => Number(b.collection.slug === p.collection.slug) - Number(a.collection.slug === p.collection.slug))
    /* Pikakorjaus 22.10.2026: samat pelikortit kuin "Seuraava peli" (rekisterin rivi, nimi ilman pelin etuliitettä). */
    .flatMap((x) => PELIMUODOT.filter((m) => m.slug === `jarjesta-${x.slug}`))
    .map((m) => ({ ...m, nimi: m.nimi.replace(/^Laita järjestykseen: /, "") }));
  return (
    <>
      <JsonLd data={peliLd({ name: p.seoTitle, url: pakkaHref(p), description: p.kuvaus })} />
      <JarjestaClient pakka={p} muut={muut} />
    </>
  );
}
