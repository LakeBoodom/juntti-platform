// JÄRJESTÄ — pakan sivu /peli/jarjesta/<pakka> (brief §2 3.10.2026, vaalit-brief §2 5.10.2026, osa C 31.10.2026).
// Kaksi pakkatyyppiä: Laita järjestykseen -pakat (pakat.ts, vain julkaistut) ja Ikäjärjestyksen aiheet
// (ikajarjestys-<aihe>, lib/jarjesta/hub.ts). Muut osoitteet 404.
// Ilman parametreja sivu on pelin aloitus. Hubin kortista (?aloita=1) ensimmäinen kierros arvotaan jo palvelimella,
// jolloin pelaaja on heti pelilaudalla. Ikäjärjestyksen ?henkilot= (jaettu tai henkilösivun kierros) toimii samoin.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta, jakoOsoite, pelituloksenOg } from "@/lib/jakoMeta";
import { ikajarjestysTaso, jarjestaTaso } from "@/lib/pelitasot";
import { JULKAISTUT, haePakka, pakkaHref } from "@/lib/jarjesta/pakat";
import { haeJarjestysKierros } from "@/lib/jarjesta/kierros";
import { IKA_PAKAT, haeIkaPakka, type IkaPakka } from "@/lib/jarjesta/hub";
import { getChainRound, getChainRoundByIds } from "@/lib/ikajarjestys";
import { henkiloKuva } from "@/lib/henkilokuvat";
import JarjestaClient from "./JarjestaClient";
import IkajarjestysClient from "./IkajarjestysClient";

export const dynamicParams = false;

type Haku = Promise<Record<string, string | string[] | undefined>>;

export function generateStaticParams() {
  return [...IKA_PAKAT, ...JULKAISTUT].map((p) => ({ pakka: p.slug }));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ pakka: string }>; searchParams: Haku }): Promise<Metadata> {
  const slug = (await params).pakka;
  /* Jaettu tulos (?tulos=n-total, 23.10.2026): og-kuvaus tuloksesta, og:url = jaettu linkki. */
  const sp = await searchParams;
  const ika = haeIkaPakka(slug);
  if (ika) {
    const nimi = `Ikäjärjestys: ${ika.nimi}`;
    const kuvaus = "Aseta kymmenen tunnettua henkilöä syntymävuoden mukaiseen järjestykseen vanhimmasta nuorimpaan.";
    return {
      title: `${nimi} – järjestä syntymävuoden mukaan | Tietoniekka`,
      description: kuvaus,
      alternates: { canonical: ika.href },
      ...jakoMeta({ ...(pelituloksenOg(sp, "oikein", ikajarjestysTaso) ?? { title: nimi, description: kuvaus }), url: jakoOsoite(ika.href, sp, ["henkilot", "tulos"]), kuva: "/og/sivu/ikajarjestys" }),
    };
  }
  const p = haePakka(slug);
  if (!p) return {};
  const url = pakkaHref(p);
  return {
    title: `${p.seoTitle} | Tietoniekka`,
    description: `${p.kuvaus} ${p.rajaus}`,
    alternates: { canonical: url },
    ...jakoMeta({ ...(pelituloksenOg(sp, "oikein", (o, k) => jarjestaTaso(o, k, p.collection.slug)) ?? { title: p.seoTitle, description: p.kuvaus }), url: jakoOsoite(url, sp, ["tulos"]), kuva: `/og/jarjesta/${p.slug}` }),
  };
}

export default async function JarjestaPakkaPage({ params, searchParams }: { params: Promise<{ pakka: string }>; searchParams: Haku }) {
  const slug = (await params).pakka;
  const sp = await searchParams;
  const aloita = sp.aloita === "1" || sp.autostart === "1";
  const ika = haeIkaPakka(slug);
  if (ika) return <IkajarjestysSivu pakka={ika} aloita={aloita} henkilot={typeof sp.henkilot === "string" ? sp.henkilot.split(",") : null} />;
  const p = haePakka(slug);
  if (!p) notFound();
  const initialRound = aloita ? await haeJarjestysKierros(p.slug) : null;
  return (
    <>
      <JsonLd data={peliLd({ name: p.seoTitle, url: pakkaHref(p), description: p.kuvaus })} />
      <JarjestaClient key={initialRound ? "aloitettu" : "aloitus"} pakka={p} initialRound={initialRound} />
    </>
  );
}

/** Ikäjärjestyksen pakka (entinen /peli/ikajarjestys?category=, siirretty osaan C 31.10.2026). */
async function IkajarjestysSivu({ pakka, aloita, henkilot }: { pakka: IkaPakka; aloita: boolean; henkilot: string[] | null }) {
  // Henkilösivun nosto ja jaettu kierros: ?henkilot=id,id,… → täsmälleen nämä (design v0.3, 4a).
  const initialRound = henkilot ? await getChainRoundByIds(henkilot) : aloita ? await getChainRound(pakka.kategoria) : null;

  // P3 (Heikki 21.10.2026): aloitukseen kasvoketju — kymmenen kasvoa vanhimmasta nuorimpaan selittää pelin yhdellä
  // silmäyksellä. Vain omat kuvakopiot (henkiloKuva); kaksi arvontaa, jotta kymmenen kuvallista löytyy.
  let kasvot: Array<{ id: string; name: string; kuva: string; birthDate: string }> = [];
  if (!initialRound?.length) {
    const ehdokkaat = [...(await getChainRound(pakka.kategoria)), ...(await getChainRound(pakka.kategoria))];
    const nahty = new Set<string>();
    for (const h of ehdokkaat) {
      const kuva = henkiloKuva(h.image_url);
      if (!kuva || nahty.has(h.id) || kasvot.length >= 10) continue;
      nahty.add(h.id);
      kasvot.push({ id: h.id, name: h.name, kuva, birthDate: h.birthDate });
    }
    kasvot = kasvot.sort((a, b) => a.birthDate.localeCompare(b.birthDate));
  }

  return (
    <>
      <JsonLd data={peliLd({ name: `Ikäjärjestys: ${pakka.nimi}`, url: pakka.href, description: "Aseta kymmenen tunnettua henkilöä syntymävuoden mukaiseen järjestykseen." })} />
      <IkajarjestysClient pakka={pakka} initialRound={initialRound?.length ? initialRound : null} kasvot={kasvot} />
    </>
  );
}
