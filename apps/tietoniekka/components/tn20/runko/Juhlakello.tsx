// V4 TUNNUSOSA "vuosikiekko" + laskuri (runko vaihe 3, Juhlat; brief §3 V4: "Juhlat: laskuri + vuosikiekko,
// korvaa V3:n"). Ylhäällä lähin iso juhla päivämäärineen ja laskuri (NostoLaskuri, Suomen aikaa), alla vuosikello:
// kaikki juhlat tästä päivästä vuoden eteenpäin, joilla on julkaistu visa — myös juhla, jonka visa on yhteinen
// toisen kanssa (Äitienpäivä → isänpäivän osio; Heikki 20.10.2026). Juhlan nimi ei toistu otsikkona, koska
// heti alla on saman juhlan osio (tuplaotsikko pois, 20.10.2026). Metapelin "x/n pelattu" täyttää .rk-aika-maara.
import { katko, type RunkoData } from "@/lib/kokoelmat/data";
import { NostoLaskuri } from "@/components/tn20/juhlat/Laskurit";

export type JuhlakelloNosto = { pvm: string; kohde: number; otsikko: string };
export type JuhlakelloRivi = { slug: string; nimi: string; pvm: string; osio: string; maara: number };

export default function Juhlakello({ d, nosto, rivit }: { d: RunkoData; nosto: JuhlakelloNosto | null; rivit: JuhlakelloRivi[] }) {
  void d;
  return (
    <section id="osiot" className="rk-v4" aria-labelledby="rk-v4-h">
      <div className="rk-v4-in">
        {nosto && (
          <div className="rk-juhla">
            <span className="rk-v4-eyebrow">Seuraava juhla · {nosto.pvm}</span>
            <NostoLaskuri kohde={nosto.kohde} alkuNyt={Date.now()} otsikko={nosto.otsikko} />
          </div>
        )}
        <h2 id="rk-v4-h" className="rk-h2 rk-h2--pieni">Vuosikello</h2>
        <ol className="rk-aika" aria-label="Vuosikello: juhlat tästä päivästä vuoden eteenpäin">
          {rivit.map((r) => (
            <li key={r.slug}>
              <a href={`#osio-${r.osio}`} data-osio={r.osio === r.slug ? r.osio : undefined}>
                <span className="rk-aika-vuodet">{r.pvm}</span>
                <span className="rk-aika-nimi">{katko(r.nimi, true)}</span>
                <span className="rk-aika-maara">{r.maara === 1 ? "1 visa" : `${r.maara} visaa`}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
