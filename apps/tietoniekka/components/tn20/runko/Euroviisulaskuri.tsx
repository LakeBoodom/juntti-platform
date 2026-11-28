// Euroviisulaskurit heron sisällä (Heikki 28.11.2026): päivät UMK-finaaliin ja Euroviisujen finaaliin Suomen ajan
// päivästä, sama malli kuin Vaalilaskuri. Mennyt tapahtuma putoaa pois; kun molemmat ovat ohi, laskuria ei näytetä.
// Päivät lib/kokoelmat/euroviisut.ts (EUROVIISU_LASKURIT), päivitetään syksyisin. Sivu on ISR 5 min, joten luku pysyy ajan tasalla.
import { EUROVIISU_LASKURIT } from "@/lib/kokoelmat/euroviisut";
import { helsinginPaiva } from "@/lib/aika";

export default function Euroviisulaskuri() {
  const t = helsinginPaiva();
  const nyt = Date.UTC(t.vuosi, t.kk - 1, t.pv);
  const tulevat = EUROVIISU_LASKURIT.map((l) => ({ ...l, paivia: Math.round((Date.UTC(l.pvm.y, l.pvm.m - 1, l.pvm.d) - nyt) / 864e5) }))
    .filter((l) => l.paivia >= 0);
  if (!tulevat.length) return null;
  return (
    <ul className="rk-laskurit">
      {tulevat.map((l) => (
        <li key={l.avain} className="rk-laskuri">
          {l.paivia === 0 ? (
            <span className="rk-laskuri-teksti">
              Tänään: {l.avain === "umk" ? "UMK-finaali" : "Euroviisujen finaali"}
              <span className="rk-laskuri-pvm">{`${l.vkp} ${l.pvm.d}.${l.pvm.m}.${l.pvm.y}`}</span>
            </span>
          ) : (
            <>
              <span className="rk-laskuri-luku">{l.paivia}</span>
              <span className="rk-laskuri-teksti">
                {l.paivia === 1 ? "päivä" : "päivää"} {l.teksti}
                <span className="rk-laskuri-pvm">{`${l.vkp} ${l.pvm.d}.${l.pvm.m}.${l.pvm.y}`}</span>
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
