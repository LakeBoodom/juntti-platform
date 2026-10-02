// RAJANAAPURIT — reittipeli valtioilla ja lipuilla (27.9.2026). Kuntaliitoksen sisarpeli:
// sama moottori ja näkymä. Design: CD "Rajanaapurit v0.2" (Documents/Tietoniekka.com/
// Kartta- ja liitoskokoelma). Julkaistu 27.9.2026 Pelimuodot-valikkoon ja etusivun banneriin.
//   /peli/rajanaapurit                  päivän reitti (koko maailma)
//   /peli/rajanaapurit?maanosa=eurooppa päivän reitti Euroopasta
//   /peli/rajanaapurit?reitti=x7k2      tietty reitti (Arvo uusi reitti, haastelinkki)

import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import { helsinginPaiva } from "@/lib/aika";
import { arvoReitti, RN_LAHDE, RN_MAANOSAT, maanosaTunnuksella } from "@/lib/rajanaapurit/reitti";
import ReittipeliClient from "@/components/tn20/reittipeli/ReittipeliClient";
import "../kuntaliitos/kuntaliitos.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rajanaapurit – rakenna reitti naapurivaltioiden kautta | Tietoniekka",
  description:
    "Järjestä kahdeksan valtiota reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen maaraja. Uusi päivän reitti joka päivä.",
  alternates: { canonical: "/peli/rajanaapurit" },
  ...jakoMeta({
    title: "Rajanaapurit – rakenna reitti naapurivaltioiden kautta",
    description: "Järjestä kahdeksan valtiota reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen maaraja. Uusi päivän reitti joka päivä.",
    url: "/peli/rajanaapurit",
    kuva: "/og/sivu/rajanaapurit",
  }),
};

const SIEMEN = /^[a-z0-9-]{3,40}$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RajanaapuritSivu({ searchParams }: Props) {
  const sp = await searchParams;
  const pyydetty = typeof sp.reitti === "string" && SIEMEN.test(sp.reitti) ? sp.reitti : null;
  const paiva = helsinginPaiva();
  const siemen = pyydetty ?? paiva.iso;
  const maanosa = maanosaTunnuksella(typeof sp.maanosa === "string" ? sp.maanosa : null);
  return (
    <>
      <JsonLd data={peliLd({ name: "Rajanaapurit", url: "/peli/rajanaapurit", description: "Järjestä kahdeksan valtiota reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen maaraja. Uusi päivän reitti joka päivä." })} />
      <ReittipeliClient
        peli="rajanaapurit"
        reitti={arvoReitti(siemen, maanosa?.nimi ?? null)}
        maakunnat={RN_MAANOSAT}
        maakuntaTunnus={maanosa?.tunnus ?? null}
        siemen={siemen}
        paivanReitti={!pyydetty}
        paivays={`${paiva.pv}.${paiva.kk}.`}
        lahde={RN_LAHDE}
      />
    </>
  );
}
