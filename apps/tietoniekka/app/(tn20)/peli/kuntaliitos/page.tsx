// KUNTALIITOS — reittipelin sivu (CD "Kuntaliitos v0.2", kierros 5 = v1:n säännöt).
// Julkaistu 26.9.2026 Pelimuodot-valikkoon (Heikki: "Mene suosituksillasi").
//   /peli/kuntaliitos               viikon reitti + hero (sama kaikille koko viikon, lib/reittipeli/viikonReitit.ts)
//   /peli/kuntaliitos?reitti=x7k2   tietty reitti (Arvo uusi reitti, haastelinkki)
//   /peli/kuntaliitos?maakunta=uusimaa   reitti alkaa Uudeltamaalta (oma päivän reitti per maakunta)
// Reitti ja sen alueen kartta arvotaan palvelimella (lib/kuntaliitos/reitti.ts).

import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta, jakoOsoite, pelituloksenOg } from "@/lib/jakoMeta";
import { reittiTaso } from "@/lib/pelitasot";
import type { Metadata } from "next";
import { helsinginPaiva } from "@/lib/aika";
import { arvoReitti, reittiAlueista, PELATTAVIA, KL_LAHDE, KL_MAAKUNNAT, maakuntaTunnuksella } from "@/lib/kuntaliitos/reitti";
import { sivunReitti, viikonAikavali } from "@/lib/reittipeli/viikonReitit";
import ReittipeliClient from "@/components/tn20/reittipeli/ReittipeliClient";
import { reittiJakokuva } from "@/lib/reittipeli/kuvat";
import "./kuntaliitos.css";
import "./reittihero.css";

export const dynamic = "force-dynamic";

/* og:url = jaettu haastelinkki parametreineen (Heikki 23.10.2026); canonical pysyy parametrittomana. */
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Kuntaliitos – rakenna reitti naapurikuntien kautta | Tietoniekka",
    description:
      "Järjestä kahdeksan kuntaa reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen raja. Uusi viikon reitti joka maanantai – tunnetko Suomen kuntakartan?",
    // Reittiparametrit (?reitti=) ovat saman sivun muunnelmia
    alternates: { canonical: "/peli/kuntaliitos" },
    ...jakoMeta({
      ...(pelituloksenOg(sp, "yhteyttä", reittiTaso) ?? {
        title: "Kuntaliitos – rakenna reitti naapurikuntien kautta",
        description: "Järjestä kahdeksan kuntaa reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen raja. Uusi viikon reitti joka maanantai.",
      }),
      url: jakoOsoite("/peli/kuntaliitos", sp, ["maakunta", "reitti", "tulos"]),
      kuva: reittiJakokuva("kuntaliitos", sp, "/og/sivu/kuntaliitos"),
    }),
  };
}

const SIEMEN = /^[a-z0-9-]{3,40}$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function KuntaliitosSivu({ searchParams }: Props) {
  const sp = await searchParams;
  const pyydetty = typeof sp.reitti === "string" && SIEMEN.test(sp.reitti) ? sp.reitti : null;
  const paiva = helsinginPaiva();
  const maakunta = maakuntaTunnuksella(typeof sp.maakunta === "string" ? sp.maakunta : null);
  const valinta = sivunReitti("kuntaliitos", { paivaIso: paiva.iso, pyydetty, ryhma: maakunta?.nimi ?? null }, { arvo: arvoReitti, alueista: reittiAlueista });
  return (
    <>
      <JsonLd data={peliLd({ name: "Kuntaliitos", url: "/peli/kuntaliitos", description: "Järjestä kahdeksan kuntaa reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen raja. Uusi viikon reitti joka maanantai." })} />
      <ReittipeliClient
        peli="kuntaliitos"
        reitti={valinta.reitti}
        maakunnat={KL_MAAKUNNAT}
        maakuntaTunnus={maakunta?.tunnus ?? null}
        siemen={valinta.siemen}
        paivanReitti={!pyydetty}
        reittiNimi={maakunta ? `Päivän reitti ${paiva.pv}.${paiva.kk}.` : `Viikon reitti ${viikonAikavali(valinta.kuluva)}`}
        otsikko={valinta.otsikko}
        intro={valinta.intro}
        luvut={[`${PELATTAVIA} kuntaa`, `${KL_MAAKUNNAT.length} maakuntaa`]}
        lahde={KL_LAHDE}
        viikko={valinta.kuluva}
      />
    </>
  );
}
