"use client";
// Aluevalinta (CD "Reittipelit intro v0.2" 3c): korvaa natiivin pudotusvalikon. Modaali dialogi: mobiilissa alapaneeli
// (2 saraketta), desktopilla 4 sarakkeen ruudukko; kaikki vaihtoehdot kerralla, valinta ≥ 44 px. Valittu oranssilla
// (lime vain Aloitukselle). Esc ja taustan napautus sulkevat, fokus palaa nappiin. Tyylit: reittihero.css.

import { useRef } from "react";

const Kuvake = ({ d, w }: { d: string; w: number }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AlueValinta({ kaikki, alueet, valittu, nappi, osoite, kuvaus }: {
  /** Koko alueen rivi: "Koko Suomi". */
  kaikki: string;
  alueet: Array<{ nimi: string; tunnus: string }>;
  valittu: string | null;
  nappi: string;
  osoite: (tunnus: string | null) => string;
  kuvaus?: string;
}) {
  const ikkuna = useRef<HTMLDialogElement>(null);
  const sulje = () => ikkuna.current?.close();
  const vaihtoehto = (nimi: string, tunnus: string | null, koko = false) => (
    <li key={tunnus ?? "kaikki"} className={koko ? "rv-kaikki" : undefined}>
      <a href={osoite(tunnus)} aria-current={valittu === tunnus ? "true" : undefined}>
        {valittu === tunnus && <Kuvake d="M4 12.6 9.2 18 20 6.6" w={3} />}
        {nimi}
      </a>
    </li>
  );
  return (
    <>
      <button type="button" className="rv-nappi" aria-haspopup="dialog" aria-describedby={kuvaus} onClick={() => ikkuna.current?.showModal()}>
        {nappi}
        <Kuvake d="M6 9l6 6 6-6" w={2.4} />
      </button>
      <dialog ref={ikkuna} className="rv" aria-labelledby="rv-h" onClick={(e) => { if (e.target === ikkuna.current) sulje(); }}>
        <div className="rv-sisus">
          <div className="rv-yla">
            <h2 id="rv-h">Valitse alue</h2>
            <button type="button" className="rv-sulje" aria-label="Sulje" onClick={sulje}><Kuvake d="M6 6l12 12M18 6 6 18" w={2.4} /></button>
          </div>
          <ul className="rv-lista">
            {vaihtoehto(kaikki, null, true)}
            {alueet.map((m) => vaihtoehto(m.nimi, m.tunnus))}
          </ul>
        </div>
      </dialog>
    </>
  );
}

/** Sama valinta palvelinsivulta (Karttapelit-sivu): osoite parametrista, koska funktio ei ylitä palvelimen rajaa. */
export function AlueLinkit({ sivu, param, kaikki, alueet, nappi }: { sivu: string; param: string; kaikki: string; alueet: Array<{ nimi: string; tunnus: string }>; nappi: string }) {
  return <AlueValinta kaikki={kaikki} alueet={alueet} valittu={null} nappi={nappi} osoite={(t) => (t ? `${sivu}?${param}=${t}` : sivu)} />;
}
