// Etusivu — Päivän pelit, Mikä maa? -paikka (CD "Tietoniekka - Mika maa bannerit" v0.2, kierros 2, 2a "Jaettu: teksti
// vasemmalla, maa oikealla", Heikki 8.11.2026). Asettelu pysyy sovittuna: Päivän visa vasemmalla, Synttärit ja Mikä maa?
// oikealla allekkain; mobiilissa kaikki allekkain. "Mikä maa?" on kortin suurin elementti, päivän vihje 1 sen alla (kortti
// vaihtuu päivittäin ilman kuvatuotantoa) ja maa kohdistimessa oikealla, tekstin ulkopuolella. Nappi ääriviivana kuten
// Synttäreissä — lime on Päivän visan. CSS: app/(tn20)/etusivu-v5.css, luokat .tn-es-mmb-*.
import type { CSSProperties } from "react";
import { MAA } from "@/components/tn20/vihjepeli/MikaMaaTunnus";

/** Pisimmän sanan pituus lainausmerkkeineen (KORTTISÄÄNTÖ: --lw). */
const pisin = (t: string) => Math.max(4, ...t.split(/[\s-]+/).map((w) => w.length));

const TERRA = { stroke: "#F08A5D", strokeWidth: 5, strokeLinecap: "round" as const };

export default function MikaMaaBanneri({ href, vihje }: { href: string; vihje: string | null }) {
  const otsikko = vihje ? `”${vihje}”` : null;
  return (
    <div className="tn-es-mmb-paikka">
      <a className="tn-es-mmb" href={href} data-paivan-peli="slotti" data-tn-entry="etusivu:mika-maa">
        <svg className="tn-es-mmb-kuva" viewBox="0 0 400 400" aria-hidden="true">
          <circle cx={200} cy={200} r={190} fill="none" stroke="#24527A" strokeWidth={1.5} strokeDasharray="4 8" />
          <circle cx={200} cy={200} r={150} fill="none" stroke="#2A5A7E" strokeWidth={1.5} strokeDasharray="4 8" />
          <circle cx={200} cy={200} r={112} fill="none" stroke="#4F7EA2" strokeWidth={2} strokeDasharray="6 8" />
          {/* Tunnuksen maa on keskitetty pisteeseen (220, 138); bannerissa (200, 200). */}
          <path d={MAA} transform="translate(-20 62)" fill="#F2EDE2" stroke="#F2EDE2" strokeWidth={2} strokeLinejoin="round" fillRule="evenodd" />
          <line x1={200} y1={66} x2={200} y2={94} {...TERRA} />
          <line x1={200} y1={306} x2={200} y2={334} {...TERRA} />
          <line x1={66} y1={200} x2={94} y2={200} {...TERRA} />
          <line x1={306} y1={200} x2={334} y2={200} {...TERRA} />
          <circle cx={200} cy={200} r={24} fill="#F08A5D" stroke="#F2EDE2" strokeWidth={5} />
          <text x={200} y={211} textAnchor="middle" fontFamily="Archivo Variable, Archivo, sans-serif" fontWeight={900} fontSize={32} fill="#0E3A5C">?</text>
        </svg>
        <span className="tn-es-mmb-teksti">
          <span className="tn-es-mmb-nimi">
            <span>Mikä</span> <span>maa?</span>
          </span>
          {otsikko && (
            <span className="tn-es-mmb-vihje" data-pitka={vihje!.length > 50 ? "" : undefined} style={{ "--lw": pisin(otsikko) } as CSSProperties}>
              {otsikko}
            </span>
          )}
          <span className="tn-es-nappi tn-es-mmb-nappi">Pelaa Mikä maa?</span>
        </span>
      </a>
    </div>
  );
}
