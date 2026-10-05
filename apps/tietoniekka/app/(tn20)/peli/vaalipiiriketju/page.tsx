// VAALIPIIRIKETJU — päivän peli /peli/vaalipiiriketju (toteutusbrief 5.10.2026 §3, CD-pelinäkymä).
// Sama ketju kaikille tänään (siemen = Helsingin päivä). Kierros arvotaan palvelimella
// (lib/vaalipiiriketju/data.ts, data välimuistissa 1 h); "jo pelattu" -tila on selaimessa.

import type { Metadata } from "next";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { helsinginPaiva } from "@/lib/aika";
import { haePakka, pakkaHref } from "@/lib/jarjesta/pakat";
import { VPK_NIMI, VPK_SIVU } from "@/lib/vaalipiiriketju";
import { paivanKierros } from "@/lib/vaalipiiriketju/data";
import VpkClient from "@/components/tn20/vaalipiiriketju/VpkClient";
import "./vaalipiiriketju.css";

export const dynamic = "force-dynamic";

const KUVAUS = "Järjestä kahdeksan kansanedustajaa ketjuksi niin, että jokaisen vaalipiiri rajautuu edellisen vaalipiiriin. Uusi ketju joka päivä.";

export const metadata: Metadata = {
  title: "Vaalipiiriketju – päivän peli kansanedustajista ja vaalipiireistä | Tietoniekka",
  description: KUVAUS,
  alternates: { canonical: VPK_SIVU },
  ...jakoMeta({ title: "Vaalipiiriketju – päivän peli", description: KUVAUS, url: VPK_SIVU, kuva: "/og/sivu/vaalipiiriketju" }),
};

const HUB = "/kokoelma/vaalit";
const LAHDE = "Kansanedustajat: eduskunnan avoin data (istuvat kansanedustajat). Vaalipiirien rajat: Tilastokeskus, CC BY 4.0.";

export default async function VaalipiiriketjuSivu() {
  const k = await paivanKierros(helsinginPaiva().iso);
  // Katselmus §5: pelilinkki Pääministerit-pakkaan vasta kun se on julki, muuten hubin pakkariviin.
  const pm = haePakka("paaministerit");
  const pakka = pm ? { href: pakkaHref(pm), teksti: "Pelaa Laita järjestykseen: Pääministerit" } : { href: `${HUB}#jarjestys`, teksti: "Laita järjestykseen -pelit" };
  return (
    <>
      <JsonLd data={peliLd({ name: VPK_NIMI, url: VPK_SIVU, description: KUVAUS })} />
      {k ? (
        <VpkClient k={k} pakka={pakka} hubHref={HUB} lahde={LAHDE} />
      ) : (
        <div className="vpk">
          <div className="vpk-virhe" role="alert">
            <b>Päivän ketjua ei saatu haettua.</b>
            <span>Kokeile hetken päästä uudelleen.</span>
            <a href={HUB}>← Vaalit ja politiikka</a>
          </div>
        </div>
      )}
    </>
  );
}
