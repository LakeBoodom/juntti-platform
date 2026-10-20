// V4 TUNNUSOSA "aikajana" (runko vaihe 3, Historia; CD-arkki kierros 2, kohta 2): aikakaudet vaakarivinä —
// vuodet, lyhyt nimi ja visamäärä. Korvaa V3-osiochipit (signatureReplacesNav), joten osioiden lopun
// paluulinkki osoittaa tänne (#osiot). Metapelin "x/n pelattu" täyttää .rk-aika-maara-kentät (RunkoMetapeli).
import type { RunkoData } from "@/lib/kokoelmat/data";

export default function Aikajana({ d }: { d: RunkoData }) {
  const { k, osiot } = d;
  return (
    <section id="osiot" className="rk-v4" aria-labelledby="rk-v4-h">
      <div className="rk-v4-in">
        <span className="rk-v4-eyebrow">{k.tunnusosaTeksti?.eyebrow ?? "Aikajana"}</span>
        <h2 id="rk-v4-h" className="rk-h2">{k.tunnusosaTeksti?.otsikko ?? `${osiot.length} aikakautta`}</h2>
        <ol className="rk-aika">
          {osiot.map((o) => (
            <li key={o.slug}>
              <a href={`#osio-${o.slug}`} data-osio={o.slug}>
                {o.vuodet && <span className="rk-aika-vuodet">{o.vuodet}</span>}
                <span className="rk-aika-nimi">{o.chip ?? o.title}</span>
                <span className="rk-aika-maara">{o.maara} visaa</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
