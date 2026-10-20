// K2 ALOITUS (§4, CD 5b–5c): h1 → yksi lause → valinta → yksi pääpainike → ohjeet ja tausta avattavina
// (<details>). Valinta ja nappi näkyvät 390 × 844:ssä ilman vieritystä. Pelikohtainen sisältö tulee propseina;
// iho periytyy kääreestä (data-iho).
import type { CSSProperties, ReactNode } from "react";

export default function PeliAloitus({
  otsikko,
  lause,
  valinta,
  toiminto,
  alarivi,
  ohjeet,
  pisinSana,
}: {
  otsikko: ReactNode;
  /** KORTTISÄÄNTÖ: h1:n koko pisimmästä sanasta (merkkiä). Merkkijono-otsikolle lasketaan itse. */
  pisinSana?: number;
  lause: ReactNode;
  /** Valinta (fieldset) — aihe, alue tai pakka. */
  valinta?: ReactNode;
  /** Yksi pääpainike. */
  toiminto: ReactNode;
  /** Pieni rivi napin alla (päivän sarja, paras tulos). Ei nappi. */
  alarivi?: ReactNode;
  ohjeet: Array<{ otsikko: string; sisalto: ReactNode }>;
}) {
  const lw = pisinSana ?? (typeof otsikko === "string" ? Math.max(...otsikko.split(/\s+/).map((w) => w.length)) : undefined);
  return (
    <section className="pk-aloitus">
      <h1 className="pk-h1" style={lw ? ({ "--pk-lw": lw } as CSSProperties) : undefined}>{otsikko}</h1>
      <p className="pk-lause">{lause}</p>
      {valinta}
      <div className="pk-toiminto">
        {toiminto}
        {alarivi && <div className="pk-alarivi">{alarivi}</div>}
      </div>
      <div className="pk-ohjeet">
        {ohjeet.map((o) => (
          <details key={o.otsikko} className="pk-ohje">
            <summary>
              {o.otsikko}
              <span aria-hidden="true">+</span>
            </summary>
            <div className="pk-ohje-sisalto">{o.sisalto}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
