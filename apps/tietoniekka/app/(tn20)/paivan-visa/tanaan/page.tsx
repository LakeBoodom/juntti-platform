// TÄNÄÄN · PÄIVÄN VISA 7+1 — lehden sivu (toteutusbrief 22.11.2026, vaihe 1: testivaihe esikatselussa).
// Lehti vaihtuu keskiyöllä Suomen aikaa. Esikatselussa (ei tuotannossa) ?pvm=YYYY-MM-DD avaa minkä tahansa päivän,
// myös luonnoksen. Noindex, kunnes Heikki päättää, korvaako Tänään nykyisen Päivän visan (vaihe 4).
import type { Metadata } from "next";
import Link from "next/link";
import { helsinginPaiva } from "@/lib/aika";
import { haeLehti, tanaanEsikatselu } from "@/lib/tanaan/data";
import { JULKAISIJA, TANAAN_POLKU } from "@/lib/tanaan/asetukset";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import TanaanLehti from "@/components/tn20/tanaan/TanaanLehti";
import "@/components/tn20/tanaan/tanaan.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Päivän visa · Tänään",
  robots: { index: false, follow: false },
  alternates: { canonical: TANAAN_POLKU },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TanaanSivu({ searchParams }: Props) {
  const sp = await searchParams;
  const tanaan = helsinginPaiva().iso;
  const pyydetty = typeof sp.pvm === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.pvm) ? sp.pvm : null;
  const pvm = tanaanEsikatselu() && pyydetty ? pyydetty : tanaan;
  const lehti = await haeLehti(pvm);

  if (!lehti) {
    return (
      <div className="tv" data-iho="kerma">
        <Pelipalkki peli="Päivän visa" iho="kerma" koti={{ href: "/", nimi: "Etusivu" }} />
        <main id="main" className="tv-tyhja">
          <h1>Päivän lehti ei ole vielä ilmestynyt.</h1>
          <Link className="tv-cta" href="/">Etusivulle</Link>
        </main>
      </div>
    );
  }

  return (
    <TanaanLehti
      lehti={lehti}
      julkaisija={JULKAISIJA}
      arkisto={lehti.pvm < tanaan}
      jakoPolku={pvm === tanaan ? TANAAN_POLKU : `${TANAAN_POLKU}?pvm=${pvm}`}
    />
  );
}
