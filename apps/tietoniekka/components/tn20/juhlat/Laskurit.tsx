"use client";
// Juhlat-kokoelman laskurit (CD "Juhlat-kokoelma" + "Juhlat-banneri v0.2").
//  - NostoLaskuri: kokoelmasivun nosto, päivät/tunnit/minuutit juhlan alkuun (Suomen aikaa),
//    päivittyy puolen minuutin välein.
//  - Laskennat: etusivun bannerin päivämäärä, joka laskee nollasta oikeaan lukuun kerran
//    latauksessa (1,5 s viive, 1,1 s). Vähennetty liike → luku näkyy heti valmiina.
// Palvelin renderöi valmiin luvun, joten sivu toimii myös ilman JavaScriptiä.

import { useEffect, useRef, useState } from "react";

function osat(ms: number) {
  if (ms <= 0) return null;
  const m = Math.floor(ms / 6e4);
  return [
    { n: Math.floor(m / 1440), u: "päivää" },
    { n: Math.floor((m % 1440) / 60), u: "tuntia" },
    { n: m % 60, u: "min" },
  ];
}

export function NostoLaskuri({ kohde, alkuNyt, otsikko }: { kohde: number; alkuNyt: number; otsikko: string }) {
  const [nyt, setNyt] = useState(alkuNyt);
  useEffect(() => {
    setNyt(Date.now());
    const t = setInterval(() => setNyt(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const o = osat(kohde - nyt);
  return (
    <div className="ju-cd">
      <div className="ju-cd-label">{o ? otsikko : "Juhla on nyt"}</div>
      <div className="ju-cd-osat">
        {(o ?? [{ n: 0, u: "päivää" }]).map((p) => (
          <div key={p.u} className="ju-cd-osa">
            <span className="ju-cd-n" suppressHydrationWarning>{p.n}</span>
            <span className="ju-cd-u">{p.u}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Laskenta({ paivia }: { paivia: number }) {
  const [arvo, setArvo] = useState(paivia);
  const raf = useRef(0);
  useEffect(() => {
    if (paivia <= 0 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now() + 1500, kesto = 1100;
    setArvo(0);
    const askel = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / kesto));
      setArvo(Math.round(paivia * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(askel);
    };
    raf.current = requestAnimationFrame(askel);
    return () => cancelAnimationFrame(raf.current);
  }, [paivia]);
  return <>{paivia <= 0 ? "Nyt" : arvo}</>;
}
