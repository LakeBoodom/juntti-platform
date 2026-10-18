"use client";
// Vaalit-hubin päivän peli -nosto Vaalipiiriketjulle. Numero samasta laskurista kuin pelinäkymä
// (vpkNumero), laskettuna selaimessa → ei jää hubin tunnin välimuistiin keskiyön yli. Pelattu-tila
// luetaan samasta selaintallenteesta kuin pelinäkymän "jo pelattu" (lueTallenne).
import { useEffect, useState } from "react";
import { helsinginIso, lueTallenne, vpkNumero, VPK_JARJESTETTAVIA, type VpkTallenne } from "@/lib/vaalipiiriketju";

export default function VpkHubKortti({ href, otsikko, meta, numero }: { href: string; otsikko: string; meta: string; numero: number }) {
  const [n, setN] = useState(numero);
  const [tulos, setTulos] = useState<VpkTallenne | null>(null);
  useEffect(() => {
    const iso = helsinginIso();
    setN(vpkNumero(iso));
    setTulos(lueTallenne(iso));
  }, []);
  return (
    <a className="vl-paivan-kortti vl-paivan-kortti--kuva" href={href}>
      {/* Valokuva (Heikki 18.10.2026): Eduskunnan täysistuntosali, krediitti lib/kuvalahteet.ts. */}
      <span className="vl-paivan-kuva" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/20/vaalit/vaalipiiriketju.webp" alt="" loading="lazy" />
      </span>
      <span className="vl-tagi vl-tagi--vahva">Päivän peli · #{n}</span>
      <span className="vl-paivan-otsikko">{otsikko}</span>
      {tulos ? (
        <span className="vl-paivan-pelattu">
          <span className="vl-kortti-meta">
            Pelattu tänään · {tulos.oikein}/{VPK_JARJESTETTAVIA} oikein
          </span>
          <span className="vl-paivan-ruudut" aria-hidden="true">
            {tulos.kortit.map((ok, i) => (
              <span key={i} data-ok={ok || undefined} />
            ))}
          </span>
        </span>
      ) : (
        <span className="vl-kortti-meta">{meta}</span>
      )}
      <span className="vl-cta">{tulos ? "Katso tulos" : "Pelaa"}</span>
    </a>
  );
}
