"use client";
// ETUSIVUN ÄÄNIVISABANNERI (äänivisadesign 3a–3d, brief §4, 8.10.2026). Mittasuhteet kuten ruutana-
// bannerissa: desktop 1160 × 268 (sonogrammi oikealla 640 px), tabletti, mobiili 380 × 520.
// "Kuuntele" soittaa viikon 1. äänen bannerissa ja pyyhkii sonogrammin esiin; muu banneri ja
// "Viikon 41 äänet →" vievät äänivisaan. Lintua ei nimetä eikä näytetä. Vuorottelee ruutana-bannerin
// kanssa samalla paikalla (app/(tn20)/page.tsx).
import { aika } from "@/lib/aanivisat";
import { useNayte } from "./useNayte";

export type BanneriNayte = { href: string; viikko: number; audio: string; sono: string; jakso: number; tauko: number; kysymys: string };

const PLAY = "M7 4.5v15l12.5-7.5z";
const PAUSE = "M6 5h4v14H6zM14 5h4v14h-4z";

export default function AaniBanneri({ b }: { b: BanneriNayte }) {
  const { soi, p, t, toggle } = useNayte(b.audio, b.jakso, b.tauko);
  const nappi = (
    <button type="button" className="ab-kuuntele" onClick={toggle} aria-pressed={soi}>
      <span className="ab-kuuntele-pallo" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginLeft: soi ? 0 : 2 }}><path d={soi ? PAUSE : PLAY} fill="#0F0D07" /></svg>
      </span>
      {soi ? `Soi · ${aika(t)}` : "Kuuntele"}
    </button>
  );
  const sono = (
    <span className="ab-sono" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ab-sono-pohja" src={b.sono} alt="" loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ab-sono-vari" src={b.sono} alt="" loading="lazy" style={{ clipPath: `inset(0 ${100 - (soi ? p : 1) * 100}% 0 0)` }} />
      {soi && <span className="ab-sono-kohta" style={{ left: `${p * 100}%` }} />}
    </span>
  );
  return (
    <div className="ab-wrap">
      <section className="ab" aria-labelledby="ab-h">
        <a className="ab-linkki" href={b.href} aria-label={`${b.kysymys} Viikon ${b.viikko} äänivisa`} />
        <span className="ab-oikea">{sono}<span className="ab-varjo" aria-hidden="true" /></span>
        <div className="ab-teksti">
          <span className="ab-tagi">Luonto · Äänivisa</span>
          <h2 className="ab-h" id="ab-h">{b.kysymys}</h2>
          <span className="ab-mob-sono">{sono}</span>
          <div className="ab-rivi">
            {nappi}
            <a className="ab-cta" href={b.href}>Viikon {b.viikko} äänet <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
    </div>
  );
}
