// VAALIPIIRIKETJU — päivän peli /peli/vaalipiiriketju (toteutusbrief 5.10.2026 §3, CD-pelinäkymä).
// Sama ketju kaikille tänään (siemen = Helsingin päivä). Kierros arvotaan palvelimella
// (lib/vaalipiiriketju/data.ts, data välimuistissa 1 h); "jo pelattu" -tila on selaimessa.
//   /peli/vaalipiiriketju              päivän ketju
//   /peli/vaalipiiriketju?ketju=x7k2   harjoitusketju ("Pelaa uusi ketju"), ei vaikuta päivän tulokseen

import type { Metadata } from "next";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta, jakoOsoite, pelituloksenOg } from "@/lib/jakoMeta";
import { helsinginPaiva } from "@/lib/aika";
import { VPK_NIMI, VPK_SIVU } from "@/lib/vaalipiiriketju";
import { harjoitusKierros, paivanKierros } from "@/lib/vaalipiiriketju/data";
import VpkClient from "@/components/tn20/vaalipiiriketju/VpkClient";
import "./vaalipiiriketju.css";

export const dynamic = "force-dynamic";

const KUVAUS = "Järjestä kahdeksan kansanedustajaa ketjuksi niin, että jokaisen vaalipiiri rajautuu edellisen vaalipiiriin. Uusi ketju joka päivä.";

/* Jaettu tulos (?tulos=n-6, 23.10.2026): og-kuvaus tuloksesta, og:url = jaettu linkki; canonical parametriton. */
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Vaalipiiriketju – päivän peli kansanedustajista ja vaalipiireistä | Tietoniekka",
    description: KUVAUS,
    alternates: { canonical: VPK_SIVU },
    ...jakoMeta({ ...(pelituloksenOg(sp, "oikein") ?? { title: "Vaalipiiriketju – päivän peli", description: KUVAUS }), url: jakoOsoite(VPK_SIVU, sp, ["tulos"]), kuva: "/og/sivu/vaalipiiriketju" }),
  };
}

const HUB = "/kokoelma/vaalit";
const LAHDE = "Kansanedustajat: eduskunnan avoin data (istuvat kansanedustajat). Vaalipiirien rajat: Tilastokeskus, CC BY 4.0.";

const SIEMEN = /^[a-z0-9]{3,16}$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function VaalipiiriketjuSivu({ searchParams }: Props) {
  const sp = await searchParams;
  const ketju = typeof sp.ketju === "string" && SIEMEN.test(sp.ketju) ? sp.ketju : null;
  const iso = helsinginPaiva().iso;
  const k = ketju ? await harjoitusKierros(iso, ketju) : await paivanKierros(iso);
  return (
    <>
      <JsonLd data={peliLd({ name: VPK_NIMI, url: VPK_SIVU, description: KUVAUS })} />
      {k ? (
        <VpkClient k={k} hubHref={HUB} lahde={LAHDE} />
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
