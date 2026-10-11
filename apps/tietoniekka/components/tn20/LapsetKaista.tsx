// ETUSIVUN LASTEN VISAT -KAISTA (design v0.2 3e mobiili / 3f desktop, brief §7; 10.10.2026).
// Vaalea kaista heti Suositut kokoelmat -osion jälkeen. Ikävalinta vie /lapset?ika=…, jolloin /lapset
// muistaa valinnan. Juhla-aikaan (lib/lapset/nosto.ts, esim. joulu) "Nyt: lasten jouluvisat".
// Näkyy vain, kun lapsetNakyvissa() ja vähintään yksi lasten visa näkyy (etusivu hakee datan).
import { IKA_VALINTA, LASTEN_AIHEET } from "@/lib/lapset/juontajat";
import { LAPSET_SIVU, type LastenIka } from "@/lib/lapset/data";

const IAT: LastenIka[] = ["4-7", "8-12"];

export function LapsetKaista({ juhla, duo }: { juhla: string | null; duo: string }) {
  const j = juhla ? LASTEN_AIHEET[juhla] : null;
  /* "Lasten jouluvisat" → "jouluvisat" */
  const nyt = j ? j.nosto.otsikko.replace(/^Lasten /, "") : null;
  return (
    <section className="lk-wrap" aria-labelledby="lk-h">
      <div className="lk">
        <a className="lk-teksti" href={LAPSET_SIVU}>
          <span className="lk-pilleri">Tietoniekka lapsille</span>
          <h2 className="lk-h" id="lk-h">Lasten visat</h2>
          <p className="lk-p lk-p--mobiili">Laura ja Mikko lukevat kysymykset ääneen.{nyt ? ` Nyt ${nyt}!` : ""}</p>
          <p className="lk-p lk-p--desktop">Pelatkaa yhdessä tai pelaa itse. Laura ja Mikko lukevat kysymykset ääneen.</p>
          <span className="lk-cta">Lasten visoihin <span aria-hidden>→</span></span>
        </a>
        <div className="lk-duo" style={{ backgroundImage: `url(${duo})` }} aria-hidden />
        <div className="lk-iat">
          <span className="lk-nyt">{j && nyt ? `${j.emoji} Nyt: lasten ${nyt}` : "Kuka pelaa?"}</span>
          {IAT.map((i) => {
            const t = IKA_VALINTA[i];
            return (
              <a key={i} className="lk-ika" data-ika={i} href={`${LAPSET_SIVU}?ika=${i}`}>
                <span className="lk-ika-emoji" aria-hidden>{t.emoji}</span>
                <span className="lk-ika-teksti">
                  <span className="lk-ika-nimi">{t.nimi}</span>
                  <span className="lk-ika-tapa">{t.tapa}</span>
                </span>
                <span className="lk-nuoli" aria-hidden>→</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
