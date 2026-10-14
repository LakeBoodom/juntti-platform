// ETUSIVUN ÄÄNIVISABANNERI (CD "TN Aanivisat – bannerit ja hero" 2a, Heikki 14.10.2026; korvasi 8.10.
// sonogrammibannerin). Mitat designista: desktop 1160 × 268, tabletti 760 × 230, mobiili 380 (pystykuva
// ylhäällä, teksti alla). Kuvituksena sama kuva kuin äänivisan herossa (RyhmaMeta.hero), kuplien tekstit
// HTML:ää kuvan päällä. Koko banneri on linkki äänivisaan. Etusivu ei soi (designin suositus), joten
// Kuuntele-nappi ja sonogrammi poistuivat. Vuorottelee ruutana-bannerin kanssa (app/(tn20)/page.tsx).
import type { KuvaKuplat } from "@/lib/aanivisat";

export type AaniBanneriData = { href: string; otsikko: string; ingressi: string; levea: KuvaKuplat; pysty: KuvaKuplat };

const leveys = (k: KuvaKuplat) => k.pieni.match(/-(\d+)\.webp$/)?.[1] ?? k.leveys;

function Kuva({ k, luokka, sizes }: { k: KuvaKuplat; luokka: string; sizes: string }) {
  return (
    <span className={`ab-kuva ${luokka}`} style={{ aspectRatio: `${k.leveys} / ${k.korkeus}` }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={k.pieni} srcSet={`${k.pieni} ${leveys(k)}w, ${k.src} ${k.leveys}w`} sizes={sizes} alt="" loading="lazy" />
      {k.kuplat.map((b) => (
        <span key={b.teksti} className="ab-kupla" style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, fontSize: `max(${b.fs}cqw, 8px)` }}>
          {b.teksti}
        </span>
      ))}
    </span>
  );
}

export default function AaniBanneri({ b }: { b: AaniBanneriData }) {
  return (
    <div className="ab-wrap">
      <a className="ab" href={b.href} aria-label={`Äänivisa: ${b.otsikko} ${b.ingressi}`}>
        {/* Leveä kuva: korkeus = bannerin korkeus (268 / 230 px) → leveys ≈ 625 / 540 px */}
        <Kuva k={b.levea} luokka="ab-kuva--levea" sizes="640px" />
        <span className="ab-varjo" aria-hidden="true" />
        <span className="ab-mob">
          <Kuva k={b.pysty} luokka="ab-kuva--pysty" sizes="(max-width: 520px) 100vw, 520px" />
          <span className="ab-mob-tagi"><span className="ab-piste" aria-hidden="true" />Äänivisa</span>
        </span>
        <span className="ab-teksti">
          <span className="ab-tagi"><span className="ab-piste" aria-hidden="true" />Luonto · Äänivisa</span>
          <span className="ab-h">{b.otsikko}</span>
          <span className="ab-ingressi">{b.ingressi}</span>
          <span className="ab-cta">Kuuntele ja vastaa <span aria-hidden="true">→</span></span>
        </span>
      </a>
    </div>
  );
}
