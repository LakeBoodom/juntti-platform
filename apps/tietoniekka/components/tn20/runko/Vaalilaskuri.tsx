// V4 TUNNUSOSA "laskuri" (runko vaihe 3, Vaalit; brief §3: "Vaalit: laskuri vaaleihin"). Päivät
// eduskuntavaaleihin Suomen ajan päivästä + vaalien vaiheet. Vaalien jälkeen: "Uusi eduskunta on valittu".
import { VAALIEN_VAIHEET, VAALIPAIVA } from "@/lib/vaalit/data";
import { helsinginPaiva } from "@/lib/aika";

export default function Vaalilaskuri() {
  const t = helsinginPaiva();
  const nyt = Date.UTC(t.vuosi, t.kk - 1, t.pv);
  const paiva = Date.UTC(VAALIPAIVA.y, VAALIPAIVA.m - 1, VAALIPAIVA.d);
  const paivia = Math.round((paiva - nyt) / 864e5);
  return (
    <section className="rk-v4" aria-labelledby="rk-v4-h">
      <div className="rk-v4-in">
        <span className="rk-v4-eyebrow">
          Eduskuntavaalit {VAALIPAIVA.d}.{VAALIPAIVA.m}.{VAALIPAIVA.y}
        </span>
        <div className="rk-laskuri">
          {paivia >= 0 ? (
            <>
              <span className="rk-laskuri-luku">{paivia}</span>
              <h2 id="rk-v4-h" className="rk-h2">{paivia === 1 ? "päivä vaaleihin" : "päivää vaaleihin"}</h2>
            </>
          ) : (
            <h2 id="rk-v4-h" className="rk-h2">Uusi eduskunta on valittu — tunnetko sen?</h2>
          )}
        </div>
        <ol className="rk-aika" aria-label="Vaalien vaiheet">
          {VAALIEN_VAIHEET.map((v) => (
            <li key={v.nimi}>
              <span className="rk-aika-kohta">
                <span className="rk-aika-vuodet">{v.milloin}</span>
                <span className="rk-aika-nimi">{v.nimi}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
