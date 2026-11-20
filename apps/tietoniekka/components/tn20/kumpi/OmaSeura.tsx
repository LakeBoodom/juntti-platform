"use client";
// OMA SEURA (Heikki 20.11.2026): hubin jääkiekkoryhmän kolmas rivi. Ei peliä: napautus avaa seuravalinnan
// (mobiilissa alapaneeli, desktopilla ponnahdus), jossa 17 seuraa ilman logoja. Valinta muistetaan laitteelle
// (localStorage) ja näkyy seuraavalla kerralla rivin tietorivinä ("Tappara →"). Ilman JavaScriptiä rivi on linkki
// seuralistaan /kumpi/seura.
import { useEffect, useRef, useState } from "react";
import { plausible } from "@/lib/kumpi/kirjaus";

const AVAIN = "kumpi_oma_seura";

export default function OmaSeura({ seurat, kuva }: { seurat: Array<{ slug: string; nimi: string }>; kuva: string }) {
  const [auki, setAuki] = useState(false);
  const [oma, setOma] = useState<string | null>(null);
  const avaaja = useRef<HTMLAnchorElement>(null);
  const paneeli = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setOma(localStorage.getItem(AVAIN)); } catch { /* ei storagea */ }
  }, []);

  useEffect(() => {
    if (!auki) return;
    const ensimmainen = paneeli.current?.querySelector<HTMLElement>('a[aria-current="true"], a, button');
    ensimmainen?.focus();
    const nappi = (e: KeyboardEvent) => {
      if (e.key === "Escape") sulje();
      if (e.key === "Tab" && paneeli.current) {
        const f = Array.from(paneeli.current.querySelectorAll<HTMLElement>("a, button"));
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) { f[f.length - 1]?.focus(); e.preventDefault(); }
        else if (!e.shiftKey && i === f.length - 1) { f[0]?.focus(); e.preventDefault(); }
      }
    };
    document.addEventListener("keydown", nappi);
    const yliv = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", nappi); document.body.style.overflow = yliv; };
  }, [auki]);

  const sulje = () => { setAuki(false); avaaja.current?.focus(); };
  const omaNimi = seurat.find((s) => s.slug === oma)?.nimi ?? null;
  const jarjestys = omaNimi ? [...seurat.filter((s) => s.slug === oma), ...seurat.filter((s) => s.slug !== oma)] : seurat;

  return (
    <>
      <a
        ref={avaaja}
        className="sk-kortti"
        href="/kumpi/seura"
        aria-haspopup="dialog"
        onClick={(e) => { e.preventDefault(); setAuki(true); }}
      >
        <span className="sk-kuva" data-sovitus="contain">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={kuva} alt="" loading="lazy" decoding="async" width={320} height={200} />
        </span>
        <span className="sk-teksti">
          <span className="sk-nimi">Oma seura</span>
          <span className="sk-syy">{omaNimi ? `${omaNimi} →` : "Valitse seura"}</span>
          <span className="sk-cta">Valitse <span aria-hidden="true">→</span></span>
        </span>
      </a>
      {auki ? (
        <div className="kp-seuravalinta" onClick={sulje}>
          <div
            ref={paneeli}
            className="kp-seuravalinta-paneeli"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kp-seura-h"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="kp-seuravalinta-yla">
              <h2 id="kp-seura-h">Oma seura</h2>
              <button type="button" className="kp-sulje" aria-label="Sulje" onClick={sulje}>×</button>
            </div>
            <ul className="kp-seurat">
              {jarjestys.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`/kumpi/seura/${s.slug}`}
                    aria-current={s.slug === oma ? "true" : undefined}
                    onClick={() => {
                      try { localStorage.setItem(AVAIN, s.slug); } catch { /* ei storagea */ }
                      plausible("kumpi_seura_valinta", { seura: s.slug });
                    }}
                  >
                    {s.nimi}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
