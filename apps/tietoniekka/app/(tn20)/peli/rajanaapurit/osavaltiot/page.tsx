// RAJANAAPURIT: YHDYSVALLAT — Rajanaapurien variantti osavaltioilla (CD-handoff 1.11.2026). Sama moottori ja
// näkymä kuin maapelissä; aineisto lib/rajanaapurit/osavaltiot.json, ei aluevalintaa (Heikki 1.11.2026).
//   /peli/rajanaapurit/osavaltiot              viikon reitti + hero (lib/reittipeli/viikonReitit.ts)
//   /peli/rajanaapurit/osavaltiot?reitti=x7k2  tietty reitti (Arvo uusi reitti, haastelinkki); ?reitti=uusi arpoo uuden
//   /peli/osavaltiot                           ohjaus tänne (next.config.mjs)

import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta, jakoOsoite } from "@/lib/jakoMeta";
import { esikatselu } from "@/lib/esikatselu";
import type { Metadata } from "next";
import { helsinginPaiva } from "@/lib/aika";
import { arvoUsaReitti, usaReittiAlueista } from "@/lib/rajanaapurit/osavaltiot";
import { RN_USA_SIVU } from "@/lib/rajanaapurit";
import { sivunReitti, viikonAikavali } from "@/lib/reittipeli/viikonReitit";
import ReittipeliClient from "@/components/tn20/reittipeli/ReittipeliClient";
import { reittiJakokuva, reittiKorttinimi, reittiKoukku } from "@/lib/reittipeli/kuvat";
import { reittiKaveri } from "@/lib/kaveri";
import { uusiReittiSiemen } from "@/lib/kuntaliitos";
import { maanantai, viikonSiemen } from "@/lib/reittipeli/viikonReitit";
import { redirect } from "next/navigation";
import "../../kuntaliitos/kuntaliitos.css";
import "../../kuntaliitos/reittihero.css";

export const dynamic = "force-dynamic";

const KUVAUS = "Järjestä kahdeksan Yhdysvaltain osavaltiota reitiksi niin, että jokaisella vierekkäisellä parilla on yhteinen maaraja. Uusi viikon reitti joka maanantai.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Rajanaapurit: Yhdysvallat – rakenna reitti osavaltioiden kautta | Tietoniekka",
    description: KUVAUS,
    alternates: { canonical: RN_USA_SIVU },
    ...jakoMeta({
      /* Esikatselukortti (v4 §4): "{Lähtö} → {Maali} – karttapeli" jaetulla reitillä, muuten pelin nimi. */
      ...esikatselu({ nimi: reittiKorttinimi("osavaltiot", sp) ?? "Rajanaapurit: Yhdysvallat", muoto: "osavaltiot", koukku: reittiKoukku("osavaltiot", sp) }),
      url: jakoOsoite(RN_USA_SIVU, sp, ["reitti", "tulos"]),
      kuva: reittiJakokuva("osavaltiot", sp, `/og/reitti/osavaltiot?reitti=${viikonSiemen(maanantai(helsinginPaiva().iso))}`),
    }),
  };
}

const SIEMEN = /^[a-z0-9-]{3,40}$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OsavaltiotSivu({ searchParams }: Props) {
  const sp = await searchParams;
  if (sp.reitti === "uusi") redirect(`${RN_USA_SIVU}?reitti=${uusiReittiSiemen()}`);
  const pyydetty = typeof sp.reitti === "string" && SIEMEN.test(sp.reitti) ? sp.reitti : null;
  const paiva = helsinginPaiva();
  const valinta = sivunReitti("osavaltiot", { paivaIso: paiva.iso, pyydetty, ryhma: null }, { arvo: arvoUsaReitti, alueista: usaReittiAlueista });
  return (
    <>
      <JsonLd data={peliLd({ name: "Rajanaapurit: Yhdysvallat", url: RN_USA_SIVU, description: KUVAUS })} />
      <ReittipeliClient
        peli="osavaltiot"
        reitti={valinta.reitti}
        maakunnat={[]}
        maakuntaTunnus={null}
        siemen={valinta.siemen}
        paivanReitti={!pyydetty}
        reittiNimi={`Viikon reitti ${viikonAikavali(valinta.kuluva)}`}
        otsikko={valinta.otsikko}
        intro={valinta.intro}
        viikko={valinta.kuluva}
        kaveri={pyydetty ? reittiKaveri(sp.tulos, sp.y) : null}
      />
    </>
  );
}
