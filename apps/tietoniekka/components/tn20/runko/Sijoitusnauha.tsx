// V4 TUNNUSOSA "sijoitusnauha" (runko vaihe 2, Euroviisut; data kannasta 28.11.2026): Suomen euroviisuvuodet yhdellä
// silmäyksellä (V4-sääntö 2: tietoa, jota sivulla ei muuten ole). Jokainen vuosi 1961–viimeisin: finaalisija pylväänä
// (mitä parempi sija, sitä korkeampi; CD: 8 + (27 − sija) / 26 × 96 px), semifinaaliin jääminen ("SF"), poissaolo ("–")
// ja peruttu kilpailu (2020, "×"). Voitto ja paras sija ennen voittoa erottuvat. Uusin vuosi oikealla, nauha alkaa
// vieritettynä uusimpaan (row-reverse). Ruudunlukija saa jokaisesta vuodesta oman rivin. Data: lib/kokoelmat/euroviisutNauha.ts.
import type { CSSProperties } from "react";
import { haeNauha, type NauhaVuosi } from "@/lib/kokoelmat/euroviisutNauha";

const korkeus = (sija: number) => Math.round(8 + ((27 - Math.min(sija, 26)) / 26) * 96);

function kuvaus(v: NauhaVuosi): string {
  switch (v.tila) {
    case "finaali":
      return `${v.vuosi}: finaalissa ${v.sija}. sija, ${v.esittaja} – ${v.kappale}`;
    case "semi":
      return `${v.vuosi}: jäi semifinaaliin, ${v.esittaja} – ${v.kappale}`;
    case "peruttu":
      return `${v.vuosi}: kilpailu peruttiin`;
    default:
      return `${v.vuosi}: Suomi ei osallistunut`;
  }
}

export default async function Sijoitusnauha() {
  const data = await haeNauha();
  if (!data.length) return null;
  const voitto = data.find((v) => v.tila === "finaali" && v.sija === 1)?.vuosi;
  /* Paras finaalisija ennen ensimmäistä voittoa (1973: 6.). Tasatilanteessa ensimmäinen vuosi. */
  const ennen = data.filter((v): v is Extract<NauhaVuosi, { tila: "finaali" }> => v.tila === "finaali" && (!voitto || v.vuosi < voitto));
  const parasEnnen = ennen.reduce<(typeof ennen)[number] | null>((p, v) => (!p || v.sija < p.sija ? v : p), null)?.vuosi;
  const finaaleja = data.filter((v) => v.tila === "finaali").length;
  const semeja = data.filter((v) => v.tila === "semi").length;
  const uusinEnsin = [...data].reverse();
  return (
    <section className="rk-v4" aria-labelledby="rk-v4-h">
      <div className="rk-v4-in">
        <span className="rk-v4-eyebrow">Suomi Euroviisuissa</span>
        <h2 id="rk-v4-h" className="rk-h2">Sijoitukset vuosittain</h2>
        <ol className="rk-nauha">
          {uusinEnsin.map((v) => (
            <li
              key={v.vuosi}
              data-tila={v.tila}
              data-voitto={v.vuosi === voitto || undefined}
              data-karki={v.vuosi === parasEnnen || undefined}
              aria-label={kuvaus(v)}
              title={kuvaus(v)}
              style={v.tila === "finaali" ? ({ "--h": `${korkeus(v.sija)}px` } as CSSProperties) : undefined}
            >
              <span className="rk-nauha-sija" aria-hidden="true">
                {v.tila === "finaali" ? `${v.sija}.` : v.tila === "semi" ? "SF" : v.tila === "peruttu" ? "×" : "–"}
              </span>
              <span className="rk-nauha-palkki" aria-hidden="true" />
              <span className="rk-nauha-vuosi" aria-hidden="true">{v.vuosi}</span>
            </li>
          ))}
        </ol>
        <ul className="rk-nauha-selite" aria-hidden="true">
          <li data-merkki="voitto">Voitto</li>
          <li data-merkki="karki">Paras sija ennen voittoa</li>
          <li><b>SF</b> Jäi semifinaaliin</li>
          <li><b>–</b> Ei mukana</li>
          <li><b>×</b> Kilpailu peruttiin</li>
        </ul>
        <span className="tn-card-meta">
          {finaaleja} finaalia ja {semeja} semifinaalia {data[0].vuosi}–{data[data.length - 1].vuosi}. Lähde: Wikipedia.
        </span>
      </div>
    </section>
  );
}
