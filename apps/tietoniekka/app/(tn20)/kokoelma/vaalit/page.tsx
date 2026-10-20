// VAALIT JA POLITIIKKA yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3,
// 20.10.2026). Kohteet (visat, politiikan historia, vallan kasvot) tulevat lib/vaalit/data.ts:stä
// (lib/kokoelmat/vaalit.ts); V4 = vaalilaskuri; Vaalipiiriketju ja Laita järjestykseen -pakat V6:ssa.
// Vanha sivukohtainen toteutus (CD 5.10.2026: vaalipiirikartta, pakkakortit, kasvoketjubanneri) poistettu.
// ISR 1 h (laskuri päivittyy päivittäin).
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import Vaalilaskuri from "@/components/tn20/runko/Vaalilaskuri";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { VAALIT, vaalitKohteet } from "@/lib/kokoelmat/vaalit";
import { haeVaalitHub } from "@/lib/vaalit/data";

export const revalidate = 3600;

const POLKU = "/kokoelma/vaalit";
const OTSIKKO = "Vaalit ja politiikka – tietovisat ja pelit eduskunnasta | Tietoniekka";
const KUVAUS =
  "Tunnetko eduskunnan? Eduskuntavaalit, 13 vaalipiiriä, puoluejohtajat, pääministerit ja presidentit sekä Suomen politiikan historia visoina. Laskuri eduskuntavaaleihin 18.4.2027.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: OTSIKKO,
    description: KUVAUS,
    alternates: { canonical: POLKU },
    ...jakoMeta({ title: "Vaalit ja politiikka", description: KUVAUS, url: POLKU, kuva: "/og/kokoelma/vaalit" }),
  };
}

export default async function VaalitLanding() {
  const hub = await haeVaalitHub();
  const d = await haeRunkoData(VAALIT, vaalitKohteet(hub));
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  return <KokoelmaRunko d={d} tunnusosa={<Vaalilaskuri />} />;
}
