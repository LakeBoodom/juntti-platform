"use client";
// TÄNÄÄN — tulosnäkymä (CD Tulos.dc.html). Järjestys lukittu: tulos ja lause (+ putki) → Jakoalue → Nähdään huomenna →
// päivän lehti listana jatkokortteineen → muut päiväpelit (SeuraavaPeli). Tuloskortti (lööppi) ja tilastorivi tulevat
// vaiheessa 4; tilastoriville ei varata tyhjää tilaa (UI-sääntö 9). "Nähdään huomenna" ilman selitelausetta.
import { useEffect, useState } from "react";
import Jakoalue from "@/components/tn20/jako/Jakoalue";
import { SeuraavaPeli } from "@/components/tn20/pelikehys/PeliTulos";
import { tulosjakoteksti } from "@/lib/korttinimi";
import { MIKA_MAA_RIVI } from "@/lib/seuraavaksi/pelirivit";
import type { Pelimuoto } from "@/lib/pelimuodot";
import { pahkinanNimi, type Lehti, type PahkinanTila } from "@/lib/tanaan/tyypit";
import { Nuoli } from "./Pahkina";

/** Muut päiväpelit tuloksen lopussa. */
const PAIVAPELIT: Pelimuoto[] = [
  { slug: "mika-maa", nimi: "Mikä maa?", ikoni: "kartta", kuvaus: MIKA_MAA_RIVI, href: "/peli/mika-maa", tila: "pelattava", serves: [] },
  { slug: "kumpi-paivan", nimi: "Päivän Kumpi?", ikoni: "kumpi", kuvaus: "Uudet kymmenen kysymystä päivittäin", href: "/kumpi/paivan", tila: "pelattava", serves: [] },
  { slug: "junankuljettaja", nimi: "Junankuljettaja", ikoni: "ketju", kuvaus: "Järjestä asemat radan varrelle", href: "/peli/junankuljettaja", tila: "pelattava", serves: [] },
];

/** Yksi lause tuloksesta (CD Tulos.dc.html). */
function tuloslause(oikein: number, kaikki: number, pahkina: PahkinanTila | null): string {
  if (oikein === kaikki && pahkina === "ok") return "Täysi lehti ja pähkinä päälle. Harvinaisen hyvä aamu.";
  const L: Record<number, string> = {
    7: "Koko lehti hallussa kannesta kanteen.",
    6: "Yksi juttu jäi kiertämään, muuten lehti meni kuin aamukahvi.",
    5: "Hyvä aamu: suurin osa lehdestä meni oikein.",
    4: "Puolet ja vähän päälle. Huomenna uusi lehti.",
    3: "Lehti luettu, uutiset vähän kesken.",
  };
  return L[oikein] ?? (oikein > 0 ? "Tämä oli niitä aamuja. Huomenna paremmin." : "Lehti luettu. Huomenna uusi yritys.");
}

function useLaskuri() {
  const [teksti, setTeksti] = useState<string | null>(null);
  useEffect(() => {
    const laske = () => {
      // Keskiyö Suomen aikaa: minuutit Helsingin kellosta.
      const osat = new Intl.DateTimeFormat("fi-FI", { timeZone: "Europe/Helsinki", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
      const h = Number(osat.find((o) => o.type === "hour")?.value ?? 0), m = Number(osat.find((o) => o.type === "minute")?.value ?? 0);
      const jaljella = 24 * 60 - (h * 60 + m);
      setTeksti(`${Math.floor(jaljella / 60)} h ${jaljella % 60} min`);
    };
    laske();
    const t = setInterval(laske, 30_000);
    return () => clearInterval(t);
  }, []);
  return teksti;
}

export default function Tulos({ lehti, valinnat, pahkina, putki, arkisto, onRatkaise, jakoUrl }: {
  lehti: Lehti;
  valinnat: Array<number | null>;
  pahkina: PahkinanTila | null;
  putki: number;
  /** Menneen päivän lehti: ei laskuria. */
  arkisto: boolean;
  onRatkaise: () => void;
  jakoUrl: string | null;
}) {
  const n = lehti.jutut.length;
  const oikein = lehti.jutut.filter((j, i) => valinnat[i] === j.oikea).length;
  const pahkinaTeksti = pahkina === "ok" ? "+ pähkinä ✓" : pahkina === "fail" ? "· pähkinä ✗" : "· pähkinä auki";
  const laskuri = useLaskuri();
  const p = lehti.pahkina;
  const pahkinanOikea =
    p.muoto === "jarjesta" ? [...p.kohteet].sort((a, b) => a.sija - b.sija).map((k) => k.teksti).join(" → ")
      : p.muoto === "kumpi" ? (p.oikea === 0 ? p.a.teksti : p.b.teksti) : null;
  const jakoTulos = `sain ${oikein}/${n}${pahkina === "ok" ? " ja pähkinän" : ""}`;
  return (
    <div className="tv-tu">
      <div className="tv-tu-vasen">
        <section className="tv-tu-score" aria-labelledby="tv-tu-h">
          <h2 id="tv-tu-h" className="tv-sr" tabIndex={-1}>Tulos: {oikein}/{n} {pahkinaTeksti.replace("·", "").replace("+", "ja")}</h2>
          <div className="tv-tu-n" aria-hidden="true">
            <span className="tv-tu-big">{oikein}/{n}</span>
            <span className="tv-tu-nut">{pahkinaTeksti}</span>
          </div>
          <p className="tv-tu-lause">{tuloslause(oikein, n, pahkina)}</p>
          {putki >= 2 && (
            <span className="tv-tu-putki">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z" />
              </svg>
              {putki} päivän putki
            </span>
          )}
        </section>
        <Jakoalue
          className="tv-tu-jako"
          id="tv-jako-h"
          otsikko="Jaa tulos"
          waNappi="Jaa WhatsAppissa"
          teksti={tulosjakoteksti("Päivän visa", jakoTulos)}
          url={jakoUrl}
          natiiviOtsikko="Päivän visa"
        />
        {!arkisto && (
          <div className="tv-tu-huom">
            <h2 className="tv-tu-h2">Nähdään huomenna</h2>
            {laskuri && <span className="tv-tu-cd">{laskuri}</span>}
          </div>
        )}
      </div>
      <div className="tv-tu-oikea">
        <section className="tv-tu-list" aria-labelledby="tv-tu-lehti">
          <h2 className="tv-tu-h2" id="tv-tu-lehti">Päivän lehti</h2>
          <ol>
            {lehti.jutut.map((j, i) => {
              const v = valinnat[i];
              const ok = v === j.oikea;
              return (
                <li key={j.sivu} className="tv-tu-it">
                  <span className="tv-tu-k">{j.osasto}</span>
                  <span className={`tv-tu-m ${ok ? "ok" : "no"}`} aria-label={v == null ? "jäi vastaamatta" : ok ? "oikein" : "väärin"}>
                    {v == null ? "–" : ok ? "✓" : "✗"}
                  </span>
                  <p className="tv-tu-j">{j.juttu}</p>
                  <div className="tv-tu-a">
                    <div>Oikea: <b>{j.vaihtoehdot[j.oikea]}</b></div>
                    {!ok && <div>{v == null ? "Jäi vastaamatta" : `Sinä: ${j.vaihtoehdot[v]}`}</div>}
                  </div>
                  {j.jatko && (
                    <a className="tv-tu-x" href={j.jatko.url}>{j.jatko.teksti} <Nuoli /></a>
                  )}
                </li>
              );
            })}
            <li className="tv-tu-it">
              <span className="tv-tu-k">Päivän pähkinä</span>
              <span className={`tv-tu-m ${pahkina === "ok" ? "ok" : "no"}`} aria-label={pahkina === "ok" ? "oikein" : pahkina === "fail" ? "väärin" : "jäi auki"}>
                {pahkina === "ok" ? "✓" : pahkina === "fail" ? "✗" : "–"}
              </span>
              <p className="tv-tu-j">{p.muoto === "jarjesta" ? `${pahkinanNimi(p)}: ${p.saanto}` : p.muoto === "kumpi" ? `${p.kysymys} ${p.a.teksti} vai ${p.b.teksti}` : "Päivän Mikä maa?"}</p>
              {pahkina !== "skip" && pahkinanOikea && <div className="tv-tu-a"><div>Oikea: <b>{pahkinanOikea}</b></div></div>}
              {pahkina === "skip" && <button type="button" className="tv-tu-x" onClick={onRatkaise}>Ratkaise pähkinä</button>}
            </li>
          </ol>
        </section>
        <SeuraavaPeli seuraavat={PAIVAPELIT} />
      </div>
    </div>
  );
}
