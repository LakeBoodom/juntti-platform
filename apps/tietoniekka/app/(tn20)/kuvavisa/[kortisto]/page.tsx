// SEO-erä A6 (2.10.2026): kuvavisat ja Viikkovisa omiin polkuihin.
//   /kuvavisa/<kortisto>            = /peli?kuvavisa=<kortisto> (liput, vaakunat, linnut, elaimet,
//                                     kasvit, maalaukset, rakennukset, henkilot, kaupungit)
//   /kuvavisa/<kortisto>?taso=…     variaatiot parametreina; canonical = perusvisa
//   /kuvavisa/viikko                = Viikkovisa (/peli?viikkovisa=1); haastelinkki ?taso=&ids= → kortisto
// Ohut kääre kuten /visa/[slug]. Dynaaminen: kuvat arvotaan joka latauksella (sekoita).
// Vanhat /peli?kuvavisa=- ja /peli?viikkovisa=1-osoitteet toimivat edelleen.
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PeliPage, { generateMetadata as peliMetadata } from "../../peli/page";
import { KATEGORIAT } from "@/lib/kuvavisat2026";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ kortisto: string }>; searchParams: Promise<SP> };

const KORTISTOT = new Set([...KATEGORIAT.map((k) => k.type), "vaakuna", "kaupungit", "viikko"]);

function peliParametrit(kortisto: string, sp: SP): SP {
  if (kortisto === "viikko" && !sp.ids) return { ...sp, viikkovisa: "1" };
  return { ...sp, kuvavisa: kortisto };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { kortisto } = await params;
  if (!KORTISTOT.has(kortisto)) return {};
  return peliMetadata({ searchParams: Promise.resolve(peliParametrit(kortisto, await searchParams)) });
}

export default async function KuvavisaPolku({ params, searchParams }: Props) {
  const { kortisto } = await params;
  if (!KORTISTOT.has(kortisto)) notFound();
  return PeliPage({ searchParams: Promise.resolve(peliParametrit(kortisto, await searchParams)) });
}
