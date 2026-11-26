// TÄNÄÄN — lehden kansi (CD Kansi.dc.html, toteutusbrief vaihe 2). Lehden ensimmäinen ruutu, tumma.
// Malli valitsee paikat datasta: taysi = pääjuttu + nauha + 2 laattaa, kaksi = pääjuttu + 1 leveä laatta,
// yksi = pääjuttu + Myös tänään. Tyhjä paikka jää pois ja pääjuttu ottaa tilan. Ilman pääkuvaa pääjuttu on kermalla.
// Pääotsikon koko pisimmästä rivistä (Spec): min(cap, 94 / (merkit × 0,56)) cqw, cap 19 kuvalla ja 27 ilman;
// korkeusraja 56 / 70 cqh jaettuna rivimäärällä. Kerroin 0,56 olettaa Archivon leveyden 62 (variaabeli fontti).
// Pelattu päivä: tulosleima tarran paikalla ja "Katso vastaukset" (reunaviiva, ei lime).
import type { CSSProperties } from "react";
import type { Kansi as KansiData } from "@/lib/tanaan/tyypit";
import { Nuoli } from "./Pahkina";

const pisinSana = (t: string) => Math.max(...t.split(/[\s\-–]+/).map((w) => w.length));

export default function Kansi({ kansi, pvLyhyt, juhla, julkaisija, arkisto, luonnos, leima, onPelaa, onVastaukset }: {
  kansi: KansiData;
  /** "SU 6.12." */
  pvLyhyt: string;
  juhla: string | null;
  julkaisija: string;
  arkisto: boolean;
  /** Esikatselu: luonnos. */
  luonnos: boolean;
  /** Pelatun päivän leima ("6/7 + pähkinä ✓"); null = pelaamaton. */
  leima: string | null;
  onPelaa: () => void;
  onVastaukset: () => void;
}) {
  const pj = kansi.paajuttu;
  const kuva = !!pj.kuva;
  const pisin = Math.max(...pj.rivit.map((r) => r.length));
  let leveys = Math.min(kuva ? 19 : 27, 94 / (pisin * 0.56));
  // Tarra peittää laatikon oikean alakulman: viimeinen rivi enintään 52 % leveydestä, ettei tarra peitä sitä
  // (mitattu 26.11. pisimmillä teksteillä; lyhyellä rivillä, kuten "LINNAA", raja ei pienennä otsikkoa).
  if (pj.tarra) leveys = Math.min(leveys, 52 / (pj.rivit[pj.rivit.length - 1].length * 0.56));
  // Korkeusraja: Spec 56/70 cqh; mitattu 26.11. pisimmillä teksteillä (kaksirivinen kärki) → 48/60, ettei viimeinen rivi
  // valu laatikon alle 375 × 667 -näkymässä.
  const korkeus = (kuva ? 48 : 60) / pj.rivit.length;
  const otsikko = { fontSize: `min(${leveys.toFixed(1)}cqw, ${korkeus.toFixed(1)}cqh)` } as CSSProperties;
  const laatat = kansi.malli === "yksi" ? [] : kansi.laatat.slice(0, kansi.malli === "kaksi" ? 1 : 2);
  const nauha = kansi.malli === "taysi" ? kansi.nauha : null;
  const myos = kansi.malli === "yksi" && kansi.myos?.length ? kansi.myos : null;
  const pelattu = leima != null;

  return (
    <section className="tv-kn" aria-labelledby="tv-kn-h">
      <div className="tv-kn-mast">
        <div className="tv-kn-mid">
          <span className="tv-kn-name" aria-hidden="true">TÄNÄÄN</span>
          <span className="tv-kn-pub">{julkaisija}{arkisto && " · Arkisto"}{luonnos && " · Luonnos"}</span>
        </div>
        <div className="tv-kn-date">
          <span className="tv-kn-dt"><span>{pvLyhyt}</span></span>
          {juhla && <span className="tv-kn-jh">{juhla}</span>}
        </div>
      </div>
      <div className="tv-kn-main">
        <div className={`tv-kn-lead${kuva ? "" : " noimg"}`}>
          {kuva && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="tv-kn-img" src={pj.kuva!} alt={pj.kuva_alt ?? ""} fetchPriority="high" decoding="async" />
          )}
          <div className="tv-kn-in">
            <p className="tv-kn-kick">{pj.karki}</p>
            <h2 className="tv-kn-hl" id="tv-kn-h" style={otsikko}>
              {pj.rivit.map((r, i) => <span key={i} className="tv-kn-ln">{r}</span>)}
            </h2>
          </div>
          {pj.tarra && !pelattu && <div className="tv-kn-tarra" style={{ "--lw": pisinSana(pj.tarra) } as CSSProperties}>{pj.tarra}</div>}
          {pelattu && <div className="tv-kn-leima" role="status">{leima}</div>}
        </div>
        <div className="tv-kn-side">
          {nauha && (
            <p className={`tv-kn-strip${kuva ? "" : " inv"}`}>
              <span className="tv-kn-sa">{nauha.a}</span> <span className="tv-kn-sb">{nauha.b}</span>
            </p>
          )}
          {myos && (
            <div className="tv-kn-myos">
              <b>Myös tänään</b>
              <ul>{myos.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          )}
          {laatat.length > 0 && (
            <div className={`tv-kn-tiles${laatat.length === 1 ? " one" : ""}`}>
              {laatat.map((t, i) => (
                <div key={i} className={`tv-kn-tile t${i}${t.kuva ? "" : " big"}`}>
                  {t.kuva && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="tv-kn-timg" src={t.kuva} alt={t.kuva_alt ?? ""} decoding="async" />
                  )}
                  <div className="tv-kn-tx">
                    <h3 className="tv-kn-tt" style={{ "--lw": pisinSana(t.otsikko) } as CSSProperties}>{t.otsikko}</h3>
                    <span className="tv-kn-ts">{t.alarivi}</span>
                    {t.koukku && <span className="tv-kn-hook" style={{ "--lw": pisinSana(t.koukku) } as CSSProperties}><span>{t.koukku}</span></span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="tv-kn-foot">
            <p className="tv-kn-nut">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l10 10-10 10L2 12z" /></svg>
              <b>Päivän pähkinä</b>
              <span>{kansi.pahkina}</span>
            </p>
            {pelattu ? (
              <button type="button" className="tv-kn-sec" onClick={onVastaukset}>Katso vastaukset <Nuoli /></button>
            ) : (
              <button type="button" className="tv-cta" onClick={onPelaa}>Pelaa päivän lehti <Nuoli /></button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
