// /kokoelma/euroviisut — kokoelma pelkästä asetuksesta (lib/kokoelmat/euroviisut.ts). Tuotannossa 404,
// kunnes julkaistuja visoja on ≥ 3; esikatselussa näkyy aina (runko vaihe 2, 19.10.2026).
import "../../runko.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jakoMeta } from "@/lib/jakoMeta";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import Euroviisulaskuri from "@/components/tn20/runko/Euroviisulaskuri";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { EUROVIISUT } from "@/lib/kokoelmat/euroviisut";
import { euroviisutTila } from "@/lib/kokoelmat/luonnokset";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";
const esikatselu = () => process.env.VERCEL_ENV !== "production";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Euroviisut – tietovisat Suomen viisutaipaleesta ja UMK:sta";
  const canonical = `${SITE_URL}/kokoelma/euroviisut`;
  return {
    title,
    description: EUROVIISUT.ingress,
    alternates: { canonical },
    robots: esikatselu() ? { index: false } : undefined,
    ...jakoMeta({ title, description: EUROVIISUT.ingress, url: canonical, kuva: "/og-image.png" }),
  };
}

export default async function EuroviisutSivu() {
  /* Tuotannossa 404, kunnes julkaistuja visoja on ≥ 3; esikatselussa auki ja luonnokset mukana. */
  if (!(await euroviisutTila()).auki) notFound();
  const d = await haeRunkoData(EUROVIISUT);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} heroLisa={<Euroviisulaskuri />} />;
}
