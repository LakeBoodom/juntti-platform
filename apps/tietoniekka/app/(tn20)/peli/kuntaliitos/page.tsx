// KUNTALIITOS — reittipelin sivu (CD "Kuntaliitos v0.2", kierros 5 = v1:n säännöt).
// Julkaistu 26.9.2026 Pelimuodot-valikkoon (Heikki: "Mene suosituksillasi").
//   /peli/kuntaliitos               päivän reitti (sama kaikille tänään)
//   /peli/kuntaliitos?reitti=x7k2   tietty reitti (Arvo uusi reitti, haastelinkki)
// Reitti ja sen alueen kartta arvotaan palvelimella (lib/kuntaliitos/reitti.ts).

import type { Metadata } from "next";
import { helsinginPaiva } from "@/lib/aika";
import { arvoReitti, KL_LAHDE } from "@/lib/kuntaliitos/reitti";
import KuntaliitosClient from "./KuntaliitosClient";
import "./kuntaliitos.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kuntaliitos – rakenna reitti naapurikuntien kautta | Tietoniekka",
  description:
    "Järjestä kahdeksan kuntaa reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen raja. Uusi päivän reitti joka päivä – tunnetko Suomen kuntakartan?",
  // Reittiparametrit (?reitti=) ovat saman sivun muunnelmia
  alternates: { canonical: "/peli/kuntaliitos" },
};

const SIEMEN = /^[a-z0-9-]{3,40}$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function KuntaliitosSivu({ searchParams }: Props) {
  const sp = await searchParams;
  const pyydetty = typeof sp.reitti === "string" && SIEMEN.test(sp.reitti) ? sp.reitti : null;
  const paiva = helsinginPaiva();
  const siemen = pyydetty ?? paiva.iso;
  return (
    <KuntaliitosClient
      reitti={arvoReitti(siemen)}
      siemen={siemen}
      paivanReitti={!pyydetty}
      paivays={`${paiva.pv}.${paiva.kk}.`}
      lahde={KL_LAHDE}
    />
  );
}
