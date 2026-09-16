// TIETOKETJU: IKÄJÄRJESTYS — pelisivun server-loader.
// Kun tullaan promo-linkistä (?category=...&autostart=1), ensimmäinen
// kierros arvotaan jo palvelimella (ei tyhjää välähdystä ennen peliä).
// Ilman autostartia sivu avaa CategoryPicker-aloitusnäkymän clientillä.

import type { Metadata } from "next";
import { getChainRound } from "@/lib/ikajarjestys";
import IkajarjestysClient from "./IkajarjestysClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tietoketju: Ikäjärjestys – aseta henkilöt syntymävuoden mukaan | Tietoniekka",
  description:
    "Aseta kymmenen tunnettua suomalaista syntymävuoden mukaiseen järjestykseen. Nopeatempoinen uusi tietopeli Tietoniekassa — ei kirjautumista.",
};

export default async function IkajarjestysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "kaikki";
  const autostart = sp.autostart === "1";

  const initialRound = autostart ? await getChainRound(category) : null;

  return <IkajarjestysClient initialCategory={category} initialRound={initialRound} />;
}
