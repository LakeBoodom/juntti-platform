"use client";
// JÄRJESTÄ-HUBIN HERO (CD "Järjestä yhtenäinen UX" v0.2 kierros 4, Heikki 3.11.2026): esimerkki on itse peli.
// Kolme vaihetta samassa laatikossa: Aloita → Lukitse valintasi → tulos. Sivu ei vaihdu missään vaiheessa.
// Sama rivikortti, siirtely ja paljastussarja kuin pelissä. Poikkeus UI-sääntöön 9 (Heikki): heron kappale, tehtävän
// kuvaus ja ohjerivi, koska peli pelataan suoraan hubissa. Tilastoon vain ensimmäinen yritys (taso "hubi").

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RankingCard, type RankingCardState } from "@/components/tn20/RankingCard";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import { useRiviPaljastus } from "@/components/tn20/RevealSequencer";
import RiviJatko from "@/components/tn20/jarjesta/RiviJatko";
import { tulosjakoteksti } from "@/lib/korttinimi";
import { oikeaJarjestys, type JarjestysKohde } from "@/lib/jarjesta/pakat";
import { arvioi, pisteet } from "@/lib/jarjesta/pisteytys";
import { VAIHTO_OHJE, vuosiTaiPaiva } from "@/lib/jarjesta/rivi";
import { kirjaaPelimuotoPeli } from "@/lib/pelimuotoPelit";

type Vaihe = "alku" | "pelaa" | "tulos";

/** Aloita ja Lukitse ovat samalla paikalla: tuplanapautus ei saa lukita riviä heti. */
const LUKITUS_VIIVE_MS = 400;

/** CD 5a (31.10.2026): "VÄÄRIN" korallina, kirjaimet sekaisin; sisääntulo kerran (transform, porrastettu). */
const SEKAISIN: Array<[string, string]> = [
  ["V", "translate(0, -.05em) rotate(-7deg)"],
  ["Ä", "translate(.02em, .09em) rotate(6deg)"],
  ["Ä", "translate(-.01em, -.11em) rotate(-4deg)"],
  ["R", "translate(.03em, .06em) rotate(10deg)"],
  ["I", "translate(0, -.07em) rotate(-12deg)"],
  ["N", "translate(.05em, .11em) rotate(5deg)"],
];

function Vaarin() {
  return (
    <span className="jh-vaarin">
      <span className="jh-sr">väärin</span>
      {SEKAISIN.map(([k, t], i) => (
        <span key={i} className="jh-vaarin-k" aria-hidden="true" style={{ "--jh-t": t, "--jh-i": i } as React.CSSProperties}>
          {k}
        </span>
      ))}
    </span>
  );
}

export default function JarjestaHero({
  rivi,
  slug,
  suunta,
  href,
  seuraava,
  jakoNimi,
}: {
  /** Päivän rivi väärässä järjestyksessä (sama kaikille koko päivän). */
  rivi: JarjestysKohde[];
  slug: string;
  suunta: "asc" | "desc";
  /** Pakan sivu: jaettu tulos avaa saman rivin siellä. */
  href: string;
  seuraava: string;
  jakoNimi: string;
}) {
  const [vaihe, setVaihe] = useState<Vaihe>("alku");
  const [order, setOrder] = useState(rivi);
  const aloitettu = useRef(0);
  const kirjattu = useRef(false);

  const oikea = useMemo(() => oikeaJarjestys(rivi, suunta), [rivi, suunta]);
  const arviot = useMemo(() => arvioi(order, oikea), [order, oikea]);
  const tulos = useMemo(() => pisteet(arviot), [arviot]);
  const kaikkiOikein = vaihe === "tulos" && tulos.correctCount === tulos.totalCount;
  const arvot = useMemo(() => vuosiTaiPaiva(order.map((k) => k.valueLabel)), [order]);

  const paljastettu = useRiviPaljastus(order.length, vaihe === "tulos");
  const valmis = vaihe === "tulos" && paljastettu >= order.length;

  /* Tekstit rivien yläpuolella vaihtuvat vaiheen mukana: rivit pysyvät silti samalla kohdalla ruudussa. */
  const rivitRef = useRef<HTMLDivElement>(null);
  const ankkuri = useRef<number | null>(null);
  const rivitNakyviin = useRef(false);
  useLayoutEffect(() => {
    const el = rivitRef.current;
    if (!el || ankkuri.current === null) return;
    const ero = el.getBoundingClientRect().top - ankkuri.current;
    ankkuri.current = null;
    if (ero) window.scrollBy({ top: ero, behavior: "instant" });
    if (rivitNakyviin.current) {
      rivitNakyviin.current = false;
      el.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
  }, [vaihe]);

  function vaihda(seuraavaVaihe: Vaihe) {
    ankkuri.current = rivitRef.current?.getBoundingClientRect().top ?? null;
    setVaihe(seuraavaVaihe);
  }

  function paaNappi(e: React.MouseEvent) {
    if (vaihe === "alku") {
      aloitettu.current = e.timeStamp;
      vaihda("pelaa");
      return;
    }
    if (e.timeStamp - aloitettu.current < LUKITUS_VIIVE_MS) return;
    if (!kirjattu.current) {
      kirjattu.current = true;
      void kirjaaPelimuotoPeli({ pelimuoto: "jarjesta", avain: slug, taso: "hubi", oikein: tulos.correctCount, yhteensa: tulos.totalCount, pisteet: tulos.score });
    }
    vaihda("tulos");
  }

  function yritaUudelleen() {
    setOrder(rivi);
    rivitNakyviin.current = true;
    vaihda("pelaa");
  }

  /* Lukitusnappi katoaa tuloksessa: näppäimistön ja ruudunlukijan kohdistus siirtyy tulokseen. */
  const lukuRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (valmis) lukuRef.current?.focus({ preventScroll: true });
  }, [valmis]);

  const jakoTiedot = () => ({
    url: `${location.origin}${href}?kohteet=${rivi.map((k) => k.id).join(",")}&tulos=${tulos.correctCount}-${tulos.totalCount}`,
    teksti: tulosjakoteksti(jakoNimi, `sain ${tulos.correctCount}/${tulos.totalCount} oikeille paikoille`),
    natiiviOtsikko: "Järjestä",
  });

  return (
    <section className="jh-hero" aria-labelledby="jh-h1">
      <header className="jh-intro">
        {/* Yläotsikko (brief 13.11.2026): pelimuodon nimi näkyvänä merkkinä, ei otsikko. Ruudunlukija saa nimen h1:n alusta. */}
        <p className="jh-ylaotsikko" aria-hidden="true">Järjestä</p>
        {kaikkiOikein ? (
          <h1 id="jh-h1" className="jh-h1"><span className="jh-sr">Järjestä – </span>Nyt rivi on <span className="jh-oikein">oikein</span>.</h1>
        ) : (
          <>
            <h1 id="jh-h1" className="jh-h1"><span className="jh-sr">Järjestä – </span>Tämä rivi on <span className="jh-eroton"><Vaarin />.</span></h1>
            <p className="jh-ala">Osaatko korjata sen?</p>
          </>
        )}
        <p className="jh-lause">Kuka tuli ensin? Mikä on suurin? Entä korkein? Presidentit, tunturit, järvet, puolueet ja tunnetut suomalaiset ovat menneet sekaisin – ja sinun tehtäväsi on laittaa ne järjestykseen. Näyttää helpolta, kunnes alat järjestää. Montako riviä saat oikein?</p>
      </header>

      <div className="jh-tehtava">
        <div className="jh-tehtava-teksti">
          <p className="jh-kicker">Ensimmäinen haaste</p>
          <h2 className="jh-tehtava-h">Kuka oli presidenttinä ensin?</h2>
          {vaihe !== "tulos" && <p className="jh-kuvaus">Suomen presidentit ovat menneet sekaisin! Laita nimet järjestykseen virkaanastumisen mukaan, varhaisimmasta uusimpaan.</p>}
          {vaihe === "pelaa" && <p className="jh-ohje">{VAIHTO_OHJE}</p>}
        </div>

        <div className="jh-rivit" ref={rivitRef} data-vaihe={vaihe}>
          {vaihe === "alku" && (
            <ol className="jh-rivilista" style={{ "--tk-n": order.length } as React.CSSProperties}>
              {order.map((k, i) => (
                <li key={k.id}>
                  <RankingCard person={k} position={i + 1} readOnly />
                </li>
              ))}
            </ol>
          )}
          {vaihe === "pelaa" && <ReorderableChainList items={order} onReorder={setOrder} />}
          {vaihe === "tulos" && (
            <div className="jh-rivilista" style={{ "--tk-n": order.length } as React.CSSProperties}>
              {order.map((k, i) => {
                const paljastui = i < paljastettu;
                const a = arviot[i];
                const ok = !a || a.oikein;
                const tila: RankingCardState = paljastui ? (ok ? "correct" : "wrong") : "idle";
                return (
                  <div key={k.id} className={`tk-reveal-row${paljastui ? " tk-reveal-row--revealed" : ""}`}>
                    <RankingCard
                      person={{ ...k, role: "" }}
                      position={i + 1}
                      state={tila}
                      note={paljastui && !ok ? `Kuuluu paikalle ${a.lahin + 1}.` : null}
                      value={paljastui ? arvot[i] : null}
                      readOnly
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="jh-toiminto">
          {vaihe !== "tulos" && (
            <button type="button" className="jr-nappi jh-paanappi" onClick={paaNappi}>
              {vaihe === "alku" ? "Aloita" : "Lukitse valintasi"}
            </button>
          )}
          {valmis && (
            <>
              <p className="jr-luku jh-luku" data-valmis ref={lukuRef} tabIndex={-1} role="status">
                <span className="jr-luku-n">
                  <span data-kaikki={kaikkiOikein || undefined}>{tulos.correctCount}</span>/{tulos.totalCount}
                </span>
                <span className="jr-luku-sana">oikealla paikalla</span>
              </p>
              <div className="jr-jatko">
                <RiviJatko seuraava={seuraava} uusi={{ teksti: "Yritä uudelleen", onClick: yritaUudelleen }} jako={jakoTiedot()} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
