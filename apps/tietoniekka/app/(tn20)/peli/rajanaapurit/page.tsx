// RAJANAAPURIT — reittipeli valtioilla ja lipuilla (27.9.2026). Kuntaliitoksen sisarpeli:
// sama moottori ja näkymä. Design: CD "Rajanaapurit v0.2" (Documents/Tietoniekka.com/
// Kartta- ja liitoskokoelma). Julkaistu 27.9.2026 Pelimuodot-valikkoon ja etusivun banneriin.
//   /peli/rajanaapurit                  viikon reitti + hero (koko maailma, lib/reittipeli/viikonReitit.ts)
//   /peli/rajanaapurit?maanosa=eurooppa päivän reitti Euroopasta
//   /peli/rajanaapurit?reitti=x7k2      tietty reitti (Arvo uusi reitti, haastelinkki); ?reitti=uusi arpoo uuden

import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta, jakoOsoite } from "@/lib/jakoMeta";
import { esikatselu } from "@/lib/esikatselu";
import type { Metadata } from "next";
import { helsinginPaiva } from "@/lib/aika";
import { arvoReitti, reittiAlueista, RN_MAANOSAT, maanosaTunnuksella } from "@/lib/rajanaapurit/reitti";
import { sivunReitti, viikonAikavali } from "@/lib/reittipeli/viikonReitit";
import ReittipeliClient from "@/components/tn20/reittipeli/ReittipeliClient";
import { reittiJakokuva, reittiKorttinimi } from "@/lib/reittipeli/kuvat";
import { uusiReittiSiemen } from "@/lib/kuntaliitos";
import { redirect } from "next/navigation";
import "../kuntaliitos/kuntaliitos.css";
import "../kuntaliitos/reittihero.css";

export const dynamic = "force-dynamic";

/* og:url = jaettu haastelinkki parametreineen (Heikki 23.10.2026); canonical pysyy parametrittomana. */
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Rajanaapurit – rakenna reitti naapurivaltioiden kautta | Tietoniekka",
    description:
      "Järjestä kahdeksan valtiota reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen maaraja. Uusi viikon reitti joka maanantai.",
    alternates: { canonical: "/peli/rajanaapurit" },
    ...jakoMeta({
      /* Esikatselukortti (v4 §4): "{Lähtö} → {Maali} – karttapeli" jaetulla reitillä, muuten pelin nimi. */
      ...esikatselu({ nimi: reittiKorttinimi("rajanaapurit", sp) ?? "Rajanaapurit", muoto: "rajanaapurit" }),
      url: jakoOsoite("/peli/rajanaapurit", sp, ["maanosa", "reitti", "tulos"]),
      kuva: reittiJakokuva("rajanaapurit", sp, "/og/sivu/rajanaapurit"),
    }),
  };
}

const SIEMEN = /^[a-z0-9-]{3,40}$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RajanaapuritSivu({ searchParams }: Props) {
  const sp = await searchParams;
  // Seuraava peli -kortti "Arvo uusi reitti" (7d): siemen arvotaan palvelimella.
  if (sp.reitti === "uusi") redirect(`/peli/rajanaapurit?reitti=${uusiReittiSiemen()}`);
  const pyydetty = typeof sp.reitti === "string" && SIEMEN.test(sp.reitti) ? sp.reitti : null;
  const paiva = helsinginPaiva();
  const maanosa = maanosaTunnuksella(typeof sp.maanosa === "string" ? sp.maanosa : null);
  const valinta = sivunReitti("rajanaapurit", { paivaIso: paiva.iso, pyydetty, ryhma: maanosa?.nimi ?? null }, { arvo: arvoReitti, alueista: reittiAlueista });
  return (
    <>
      <JsonLd data={peliLd({ name: "Rajanaapurit", url: "/peli/rajanaapurit", description: "Järjestä kahdeksan valtiota reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen maaraja. Uusi viikon reitti joka maanantai." })} />
      <ReittipeliClient
        peli="rajanaapurit"
        reitti={valinta.reitti}
        maakunnat={RN_MAANOSAT}
        maakuntaTunnus={maanosa?.tunnus ?? null}
        siemen={valinta.siemen}
        paivanReitti={!pyydetty}
        reittiNimi={maanosa ? `Päivän reitti ${paiva.pv}.${paiva.kk}.` : `Viikon reitti ${viikonAikavali(valinta.kuluva)}`}
        otsikko={valinta.otsikko}
        intro={valinta.intro}
        viikko={valinta.kuluva}
      />
    </>
  );
}
