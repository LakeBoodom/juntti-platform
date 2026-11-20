// JUNANKULJETTAJA — neljäs karttapeli (CD "Junankuljettaja, kierros 1"; Heikin päätökset 20.11.2026).
//   /peli/junankuljettaja                          päivän vuoro keskitasolla + hero (sama kaikille, vaihtuu keskiyöllä)
//   /peli/junankuljettaja?taso=helppo              päivän vuoro valitulla tasolla + hero
//   /peli/junankuljettaja?taso=keski&reitti=x7k2   tietty vuoro (Arvo uusi vuoro, haastelinkki); ?reitti=uusi arpoo uuden
// Vuoro ja sen kuntakartta lasketaan palvelimella (lib/junankuljettaja/vuoro.ts). Pelinäkymä on sama kuin muissa
// reittipeleissä (ReittipeliClient), erot pelin asetuksissa ja Jk-osissa.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta, jakoOsoite } from "@/lib/jakoMeta";
import { esikatselu } from "@/lib/esikatselu";
import { helsinginPaiva } from "@/lib/aika";
import { reittiKaveri } from "@/lib/kaveri";
import { uusiReittiSiemen } from "@/lib/kuntaliitos";
import { maanantai } from "@/lib/reittipeli/viikonReitit";
import { JK_OLETUSTASO, JK_SIVU, JK_TASOT, jkTaso } from "@/lib/junankuljettaja";
import { paivanValinta, valintaSiemenesta, vuoro, vuoronNimet } from "@/lib/junankuljettaja/vuoro";
import ReittipeliClient from "@/components/tn20/reittipeli/ReittipeliClient";
import "../kuntaliitos/kuntaliitos.css";
import "./junankuljettaja.css";

export const dynamic = "force-dynamic";

const KUVAUS = "Järjestä kuusi väliasemaa radan varrelle lähdöstä määränpäähän. Uusi päivän vuoro joka päivä – tunnetko Suomen radat?";
const SIEMEN = /^[a-z0-9-]{3,40}$/;

type Haku = Record<string, string | string[] | undefined>;

/** Jaettu vuoro (?reitti=) tai null. */
function jaettu(sp: Haku) {
  const siemen = typeof sp.reitti === "string" && SIEMEN.test(sp.reitti) ? sp.reitti : null;
  return siemen ? valintaSiemenesta(siemen, jkTaso(sp.taso) ?? JK_OLETUSTASO) : null;
}

/* og:url = jaettu haastelinkki parametreineen; canonical pysyy parametrittomana. Kuva ei paljasta reittiä: vain lähtö,
   määränpää, katkoviiva ja juna (CD kierros 1, kohta 5). */
export async function generateMetadata({ searchParams }: { searchParams: Promise<Haku> }): Promise<Metadata> {
  const sp = await searchParams;
  const v = jaettu(sp);
  const n = v ? vuoronNimet(v) : null;
  const kuva = n ? `/og/junankuljettaja?reitti=${n.siemen}` : "/og/junankuljettaja";
  return {
    title: "Junankuljettaja – järjestä asemat radan varrelle | Tietoniekka",
    description: KUVAUS,
    alternates: { canonical: JK_SIVU },
    ...jakoMeta({
      ...esikatselu({ nimi: n ? `${n.lahto} → ${n.maaranpaa}` : "Junankuljettaja", muoto: "junankuljettaja", koukku: n ? `Pääsetkö ${n.otsikko} asema kerrallaan?` : null }),
      url: jakoOsoite(JK_SIVU, sp, ["taso", "reitti", "tulos", "y"]),
      kuva,
    }),
  };
}

export default async function JunankuljettajaSivu({ searchParams }: { searchParams: Promise<Haku> }) {
  const sp = await searchParams;
  const taso = jkTaso(sp.taso) ?? JK_OLETUSTASO;
  if (sp.reitti === "uusi") redirect(`${JK_SIVU}?taso=${taso}&reitti=${uusiReittiSiemen()}`);
  const v = jaettu(sp);
  const iso = helsinginPaiva().iso;
  const valinta = v ?? paivanValinta(iso, taso);
  const vu = vuoro(valinta);
  const kaveri = v ? reittiKaveri(sp.tulos, sp.y, "asemaväliä") : null;
  return (
    <>
      <JsonLd data={peliLd({ name: "Junankuljettaja", url: JK_SIVU, description: KUVAUS })} />
      <ReittipeliClient
        peli="junankuljettaja"
        reitti={vu.reitti}
        maakunnat={JK_TASOT.map((t) => ({ nimi: t.nimi, tunnus: t.taso }))}
        maakuntaTunnus={v ? vu.taso : taso}
        siemen={vu.siemen}
        paivanReitti={!v}
        reittiNimi="Päivän vuoro"
        otsikko={vu.otsikko}
        intro={!v}
        viikko={maanantai(iso)}
        kaveri={kaveri}
      />
    </>
  );
}
