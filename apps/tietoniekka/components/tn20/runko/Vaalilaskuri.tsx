// Vaalilaskuri heron sisällä (Heikki 20.10.2026): Vaalien V4 on Laita järjestykseen -kasvoketjubanneri, joten
// laskuri siirtyi heroon — molemmat näkyvät, tunnusosia on yksi. Päivät eduskuntavaaleihin Suomen ajan päivästä;
// vaalien jälkeen "Uusi eduskunta on valittu".
import { VAALIPAIVA } from "@/lib/vaalit/data";
import { helsinginPaiva } from "@/lib/aika";

export default function Vaalilaskuri() {
  const t = helsinginPaiva();
  const nyt = Date.UTC(t.vuosi, t.kk - 1, t.pv);
  const paiva = Date.UTC(VAALIPAIVA.y, VAALIPAIVA.m - 1, VAALIPAIVA.d);
  const paivia = Math.round((paiva - nyt) / 864e5);
  return (
    <p className="rk-laskuri">
      {paivia >= 0 ? (
        <>
          <span className="rk-laskuri-luku">{paivia}</span>
          <span className="rk-laskuri-teksti">
            {paivia === 1 ? "päivä" : "päivää"} eduskuntavaaleihin
            <span className="rk-laskuri-pvm">
              su {VAALIPAIVA.d}.{VAALIPAIVA.m}.{VAALIPAIVA.y}
            </span>
          </span>
        </>
      ) : (
        <span className="rk-laskuri-teksti">Uusi eduskunta on valittu — tunnetko sen?</span>
      )}
    </p>
  );
}
