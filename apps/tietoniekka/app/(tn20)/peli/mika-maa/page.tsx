// MIKÄ MAA? — päivän vihjepeli /peli/mika-maa (toteutusbrief 25.–28.10.2026, CD-paketti 7.11.2026, vaihe M-C).
// Sama maa kaikille tänään (Helsingin päivä, toistosuoja 60 pv, lib/vihjepeli/arvonta.ts). Vihjeet 1–3 tulevat
// kannasta (vihjepeli_vihjeet, vain tarkistetut), siluetti, maanosa ja pääkaupunki aineistosta (maat.json).
//   /peli/mika-maa             päivän maa
//   /peli/mika-maa?kohde=x7k2  arvottu maa ("Arvo uusi maa", 98 muuta maata), ei vaikuta päivän tulokseen
// Julkaistu 7.11.2026 (MM_JULKAISU): päivän maan historia ja toistosuoja alkavat siitä, ks. arvonta.historia().

import type { Metadata } from "next";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta, jakoOsoite } from "@/lib/jakoMeta";
import { esikatselu } from "@/lib/esikatselu";
import { helsinginPaiva } from "@/lib/aika";
import { maaKierros } from "@/lib/vihjepeli/data";
import { MAA_JULKAISU } from "@/lib/vihjepeli/aiheet/maa";
import { MM_KOTI, MM_NIMI, MM_SIVU } from "@/lib/vihjepeli/mikamaa";
import VihjepeliClient from "@/components/tn20/vihjepeli/VihjepeliClient";
import "./mikamaa.css";

export const dynamic = "force-dynamic";

const KUVAUS = "Tunnista päivän maa vihjeistä. Jokainen väärä arvaus avaa uuden vihjeen, ja etäisyys ja suunta kertovat, kuinka lähellä olit.";
const SIEMEN = /^[a-z0-9]{3,16}$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const iso = helsinginPaiva().iso;
  const k = await maaKierros(iso, null);
  return {
    /* Ei hakukoneisiin ennen julkaisua (sivukartta lisää sivun samana päivänä). */
    ...(iso < MAA_JULKAISU ? { robots: { index: false, follow: false } } : {}),
    title: "Mikä maa? – arvaa päivän maa vihjeistä | Tietoniekka",
    description: KUVAUS,
    alternates: { canonical: MM_SIVU },
    /* Esikatselukortti (v4 §4, CD §5): koukku = päivän vihje 1, ei maata eikä tulosta; kuva vaihtuu päivittäin (?p=). */
    ...jakoMeta({ ...esikatselu({ nimi: MM_NIMI, muoto: "vihjepeli", koukku: k?.vihjeet[0] }), url: jakoOsoite(MM_SIVU, sp, ["tulos"]), kuva: `/og/sivu/mika-maa?p=${iso}` }),
  };
}

export default async function MikaMaaSivu({ searchParams }: Props) {
  const sp = await searchParams;
  const siemen = typeof sp.kohde === "string" && SIEMEN.test(sp.kohde) ? sp.kohde : null;
  const k = await maaKierros(helsinginPaiva().iso, siemen);
  return (
    <>
      <JsonLd data={peliLd({ name: MM_NIMI, url: MM_SIVU, description: KUVAUS })} />
      {k ? (
        <VihjepeliClient k={k} />
      ) : (
        <div className="mm">
          <div className="mm-main">
            <div className="mm-virhe" role="alert">
              <b>Päivän maata ei saatu haettua.</b>
              <span>Kokeile hetken päästä uudelleen.</span>
              <a href={MM_KOTI.href}>← {MM_KOTI.nimi}</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
