// TIETOKETJU: IKÄJÄRJESTYS — pelisivun server-loader.
// Kun tullaan promo-linkistä (?category=...&autostart=1), ensimmäinen
// kierros arvotaan jo palvelimella (ei tyhjää välähdystä ennen peliä).
// Ilman autostartia sivu avaa CategoryPicker-aloitusnäkymän clientillä.

import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import { getChainRound, getChainRoundByIds } from "@/lib/ikajarjestys";
import IkajarjestysClient from "./IkajarjestysClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tietoketju: Ikäjärjestys – aseta henkilöt syntymävuoden mukaan | Tietoniekka",
  description:
    "Aseta kymmenen tunnettua suomalaista syntymävuoden mukaiseen järjestykseen. Nopeatempoinen uusi tietopeli Tietoniekassa — ei kirjautumista.",
  /* SEO-erä A2/A7: canonical (?category= ja ?autostart= ovat saman sivun muunnelmia) + jakokuva. */
  alternates: { canonical: "/peli/ikajarjestys" },
  ...jakoMeta({
    title: "Tietoketju: Ikäjärjestys",
    description: "Aseta kymmenen tunnettua suomalaista syntymävuoden mukaiseen järjestykseen.",
    url: "/peli/ikajarjestys",
    kuva: "/og/sivu/ikajarjestys",
  }),
};

export default async function IkajarjestysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "kaikki";
  const autostart = sp.autostart === "1";

  // Henkilösivun nosto: ?henkilot=id,id,id,id → täsmälleen nämä (design v0.3, 4a).
  const henkilot = typeof sp.henkilot === "string" ? sp.henkilot.split(",") : null;
  const initialRound = henkilot ? await getChainRoundByIds(henkilot) : autostart ? await getChainRound(category) : null;

  return (
    <>
      <JsonLd data={peliLd({ name: "Tietoketju: Ikäjärjestys", url: "/peli/ikajarjestys", description: "Aseta kymmenen tunnettua suomalaista syntymävuoden mukaiseen järjestykseen." })} />
      <IkajarjestysClient initialCategory={category} initialRound={initialRound} />
    </>
  );
}
