// V4 TUNNUSOSA "sijoitusnauha" (runko vaihe 2, Euroviisut): Suomen finaalisijoitukset vuosittain yhdellä
// silmäyksellä (V4-sääntö 2: tietoa, jota sivulla ei muuten ole). Pylvään korkeus = mitä parempi sija, sitä
// korkeampi (CD: 8 + (27 − sija) / 26 × 96 px); kolme parasta teemavärillä. Uusin vuosi oikealla, ja
// nauha alkaa vieritettynä uusimpaan (row-reverse). Ruudunlukija saa jokaisesta vuodesta oman rivin.
import type { CSSProperties } from "react";
import { EUROVIISU_FINAALIT } from "@/lib/kokoelmat/euroviisut-sijoitukset";

export default function Sijoitusnauha() {
  const data = [...EUROVIISU_FINAALIT].sort((a, b) => b.vuosi - a.vuosi);
  const eka = data[data.length - 1]?.vuosi;
  const vika = data[0]?.vuosi;
  return (
    <section className="rk-v4" aria-labelledby="rk-v4-h">
      <div className="rk-v4-in">
        <span className="rk-v4-eyebrow">Suomi finaalissa</span>
        <h2 id="rk-v4-h" className="rk-h2">Sijoitukset vuosittain</h2>
        <ol className="rk-nauha">
          {data.map((f) => (
            <li
              key={f.vuosi}
              data-karki={f.sija <= 3 || undefined}
              aria-label={`${f.vuosi}: ${f.sija}. sija, ${f.esittaja} – ${f.kappale}`}
              title={`${f.vuosi}: ${f.esittaja} – ${f.kappale}`}
              style={{ "--h": `${Math.round(8 + ((27 - Math.min(f.sija, 26)) / 26) * 96)}px` } as CSSProperties}
            >
              <span className="rk-nauha-sija" aria-hidden="true">{f.sija}.</span>
              <span className="rk-nauha-palkki" aria-hidden="true" />
              <span className="rk-nauha-vuosi" aria-hidden="true">{f.vuosi}</span>
            </li>
          ))}
        </ol>
        <span className="tn-card-meta">
          {data.length} finaalia {eka}–{vika}. Lähde: Wikipedia.
        </span>
      </div>
    </section>
  );
}
