// V4 TUNNUSOSA "vuosikiekko" + laskuri (runko vaihe 3, Juhlat; brief §3 V4: "Juhlat: laskuri + vuosikiekko,
// korvaa V3:n"). Ylhäällä lähin iso juhla ja laskuri (NostoLaskuri, Suomen aikaa), alla vuosikello: juhlat
// tästä päivästä vuoden eteenpäin päivämäärineen ja visamäärineen (sama .rk-aika-rivi kuin Historian
// aikajanassa, metapelin "x/n pelattu" toimii samoin). Linkit vievät juhlan osioon (#osio-<juhla>).
import { katko, type RunkoData } from "@/lib/kokoelmat/data";
import { NostoLaskuri } from "@/components/tn20/juhlat/Laskurit";

export type JuhlakelloNosto = { nimi: string; pvm: string; kohde: number; otsikko: string; osio: string };

export default function Juhlakello({ d, nosto, paivat }: { d: RunkoData; nosto: JuhlakelloNosto | null; paivat: Record<string, string> }) {
  return (
    <section id="osiot" className="rk-v4" aria-labelledby="rk-v4-h">
      <div className="rk-v4-in">
        {nosto && (
          <div className="rk-juhla">
            <div className="rk-juhla-teksti">
              <span className="rk-v4-eyebrow">Seuraava juhla · {nosto.pvm}</span>
              <h2 id="rk-v4-h" className="rk-h2">
                <a href={`#osio-${nosto.osio}`}>{nosto.nimi}</a>
              </h2>
            </div>
            <NostoLaskuri kohde={nosto.kohde} alkuNyt={Date.now()} otsikko={nosto.otsikko} />
          </div>
        )}
        {!nosto && <h2 id="rk-v4-h" className="rk-h2">Vuosikello</h2>}
        <ol className="rk-aika" aria-label="Vuosikello: juhlat tästä päivästä vuoden eteenpäin">
          {d.osiot.map((o) => (
            <li key={o.slug}>
              <a href={`#osio-${o.slug}`} data-osio={o.slug}>
                <span className="rk-aika-vuodet">{paivat[o.slug] ?? "Koko vuosi"}</span>
                <span className="rk-aika-nimi">{katko(o.chip ?? o.title, true)}</span>
                <span className="rk-aika-maara">{o.maara === 1 ? "1 visa" : `${o.maara} visaa`}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
