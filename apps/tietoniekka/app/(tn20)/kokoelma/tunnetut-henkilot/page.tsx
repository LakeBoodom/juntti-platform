// TUNNETUT HENKILÖT yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Staattinen segmentti ohittaa [collection]-reitin. Kohteet ovat henkilöitä, joilla on julkaistu visa
// (lib/kokoelmat/henkilot.ts); V4 = synttärit, V3:n yläpuolella henkilöhaku. Vanha toteutus (PersonHub:
// ryhmäkortit, Ikäjärjestys-nosto, PersonBrowser) poistettu — Ikäjärjestys on V6-peli.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import Synttarit from "@/components/tn20/runko/Synttarit";
import HenkiloHaku from "@/components/tn20/runko/HenkiloHaku";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { HENKILOT, haeHenkilot } from "@/lib/kokoelmat/henkilot";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min (synttärit päivittyvät)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("tunnetut-henkilot");
  const title = pc?.seo_title ?? "Tunnetut henkilöt — tietovisat";
  const description = pc?.seo_description ?? "Näyttelijät, artistit, urheilijat ja muut tutut kasvot — kuinka hyvin tunnet heidät?";
  const canonical = `${SITE_URL}/kokoelma/tunnetut-henkilot`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/tunnetut-henkilot" }) };
}

export default async function TunnetutHenkilotLanding() {
  const h = await haeHenkilot();
  if (!h) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  const d = await haeRunkoData(HENKILOT, h.kohteet);
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} tunnusosa={<Synttarit lista={h.synttarit} />} v3Lisa={<HenkiloHaku henkilot={h.haku} />} />;
}
