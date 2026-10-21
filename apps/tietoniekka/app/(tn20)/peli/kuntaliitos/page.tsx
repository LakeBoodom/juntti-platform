// KUNTALIITOS — reittipelin sivu (CD "Kuntaliitos v0.2", kierros 5 = v1:n säännöt).
// Julkaistu 26.9.2026 Pelimuodot-valikkoon (Heikki: "Mene suosituksillasi").
//   /peli/kuntaliitos               päivän reitti (sama kaikille tänään)
//   /peli/kuntaliitos?reitti=x7k2   tietty reitti (Arvo uusi reitti, haastelinkki)
//   /peli/kuntaliitos?maakunta=uusimaa   reitti alkaa Uudeltamaalta (oma päivän reitti per maakunta)
// Reitti ja sen alueen kartta arvotaan palvelimella (lib/kuntaliitos/reitti.ts).

import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import { helsinginPaiva } from "@/lib/aika";
import { arvoReitti, KL_LAHDE, KL_MAAKUNNAT, maakuntaTunnuksella } from "@/lib/kuntaliitos/reitti";
import ReittipeliClient from "@/components/tn20/reittipeli/ReittipeliClient";
import "./kuntaliitos.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kuntaliitos – rakenna reitti naapurikuntien kautta | Tietoniekka",
  description:
    "Järjestä kahdeksan kuntaa reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen raja. Uusi päivän reitti joka päivä – tunnetko Suomen kuntakartan?",
  // Reittiparametrit (?reitti=) ovat saman sivun muunnelmia
  alternates: { canonical: "/peli/kuntaliitos" },
  ...jakoMeta({
    title: "Kuntaliitos – rakenna reitti naapurikuntien kautta",
    description: "Järjestä kahdeksan kuntaa reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen raja. Uusi päivän reitti joka päivä.",
    url: "/peli/kuntaliitos",
    kuva: "/og/sivu/kuntaliitos",
  }),
};

const SIEMEN = /^[a-z0-9-]{3,40}$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function KuntaliitosSivu({ searchParams }: Props) {
  const sp = await searchParams;
  const pyydetty = typeof sp.reitti === "string" && SIEMEN.test(sp.reitti) ? sp.reitti : null;
  const paiva = helsinginPaiva();
  const siemen = pyydetty ?? paiva.iso;
  const maakunta = maakuntaTunnuksella(typeof sp.maakunta === "string" ? sp.maakunta : null);
  return (
    <>
      <JsonLd data={peliLd({ name: "Kuntaliitos", url: "/peli/kuntaliitos", description: "Järjestä kahdeksan kuntaa reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen raja. Uusi päivän reitti joka päivä." })} />
      <ReittipeliClient
        peli="kuntaliitos"
        reitti={arvoReitti(siemen, maakunta?.nimi ?? null)}
        maakunnat={KL_MAAKUNNAT}
        maakuntaTunnus={maakunta?.tunnus ?? null}
        siemen={siemen}
        paivanReitti={!pyydetty}
        paivays={`${paiva.pv}.${paiva.kk}.`}
        lahde={KL_LAHDE}
      />
    </>
  );
}
