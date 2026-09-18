// ETUSIVUN PROMOBANNERIT — Claude Design "TN Etusivun bannerit", kierros 12
// (toteutettu 18.9.2026). Kaksi banneria samalla rakenteella: vasemmalla
// otsikko + meta + CTA, oikealla kuvatodiste pelimuodosta. Ero tehdään
// aksenttivärillä: kuvavisoissa syaani viikkovisamerkki, ikäjärjestyksessä
// violetti duotone. Matala korkeus, tasainen tausta, yksi ensisijainen CTA.
//
// Sijoittelu (Heikki 18.9.): 12A korvaa etusivun lippuvisa-heron JA sen alla
// olleen viikkovisapromon; 12B tulee ennen "Laura ja Mikko" -osiota.
//
// Poikkeamat designista:
//  - Viikkovisamerkissä lukee VIIKKOVISA ilman vinoviivaa. Heikin päätös
//    kierroksella 5 (V3): viiva luettiin irralliseksi kauttaviivaksi.
//  - Luvut kannasta: kategoriat ja pyöristetty kuvamäärä (lib/etusivunBannerit),
//    viikkonumero ja viikon kuvamäärä viikkovisasta. Designin "9 kategoriaa"
//    oli esimerkki.
//  - Henkilökuvat kannasta (design: "oikeat kasvokuvat kannasta tuotannossa").
//
// Kolme asettelua yhdestä DOMista banneri-kontin leveyden mukaan
// (container query, ks. etusivun-bannerit.css): desktop ≥ 980, tabletti
// 600–979, mobiili < 600. Server-komponentti — ei JavaScriptiä.

import { ROUND_SIZE } from "@/lib/ikajarjestysConstants";
import type { BanneriHenkilo, KuvavisaYhteenveto } from "@/lib/etusivunBannerit";

const KUVA = "/20/etusivu/banneri-kuvavisat-";

export function KuvavisatBanneri({
  yhteenveto,
  viikko,
}: {
  yhteenveto: KuvavisaYhteenveto | null;
  /** Kuluvan viikon viikkovisa; null → merkki ja "Viikon setti" jäävät pois. */
  viikko: { viikko: number; kuvia: number } | null;
}) {
  const meta = yhteenveto
    ? [`${yhteenveto.kategorioita} kategoriaa`, yhteenveto.kuviaAlaraja >= 100 ? `${yhteenveto.kuviaAlaraja}+ kuvaa` : null]
    : [null, null];
  return (
    <section className="eb eb--kv" aria-labelledby="eb-kv-h">
      <div className="eb-in">
      {/* Mobiilin kuvakaista (380): kolme kuvaa rinnakkain, tagi päällä */}
      <div className="eb-strip" aria-hidden="true">
        <div className="eb-strip-kuvat">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${KUVA}rakennus.webp`} alt="" loading="lazy" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${KUVA}maalaukset.webp`} alt="" loading="lazy" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${KUVA}elaimet.webp`} alt="" loading="lazy" />
        </div>
        <span className="eb-strip-varjo" />
        <span className="eb-tag eb-tag--amber eb-strip-tag">Uusi kokoelma</span>
      </div>

      <div className="eb-text">
        <div className="eb-tags">
          <span className="eb-tag eb-tag--amber">Uusi kokoelma</span>
          {meta[0] && (
            <span className="eb-meta">
              {meta[0]}
              {meta[1] && <span className="eb-vain-desk"> · {meta[1]}</span>}
            </span>
          )}
        </div>
        {/* Etusivun ainoa h1: banneri korvasi lippuvisa-heron, jonka otsikko
            oli sivun h1. */}
        <h1 className="eb-h" id="eb-kv-h">
          Tunnistatko <span className="eb-rivi">kuvasta?</span>
        </h1>
        {meta[0] && <p className="eb-mmeta">{meta.filter(Boolean).join(" · ")}</p>}
        <div className="eb-row">
          <a className="eb-btn" href="/kokoelma/kuvavisat">
            Selaa kuvavisoja <span aria-hidden="true">→</span>
          </a>
          {viikko && (
            <a className="eb-vv" href="/peli?viikkovisa=1" aria-label={`Viikkovisa ${viikko.viikko}, uusi maanantaina — pelaa`}>
              <span className="eb-vv-nro">{viikko.viikko}</span>
              <span className="eb-vv-t">
                <span className="eb-vv-nimi">Viikkovisa</span>
                <span className="eb-vv-uusi">Uusi maanantaina</span>
              </span>
              <span className="eb-vv-pelaa">Pelaa →</span>
            </a>
          )}
        </div>
      </div>

      {/* Kuvatodiste (desktop + tabletti). Kuvat eivät ole kannan kuvia vaan
          designin kuvitusta, joten ne eivät paljasta minkään visan vastauksia. */}
      <div className="eb-visual" aria-hidden="true">
        <span className="eb-visual-varjo" />
        <figure className="eb-kortti eb-kortti--rakennus">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${KUVA}rakennus.webp`} alt="" loading="lazy" />
        </figure>
        <figure className="eb-kortti eb-kortti--liput">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${KUVA}liput.webp`} alt="" loading="lazy" />
        </figure>
        <figure className="eb-kortti eb-kortti--maalaukset">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${KUVA}maalaukset.webp`} alt="" loading="lazy" />
        </figure>
        <figure className="eb-kortti eb-kortti--elaimet">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${KUVA}elaimet.webp`} alt="" loading="lazy" />
          <span className="eb-kortti-savy" />
          {viikko && (
            <span className="eb-setti">
              <span className="eb-setti-l">Viikon setti</span>
              <span className="eb-setti-n">{viikko.kuvia}</span>
            </span>
          )}
        </figure>
      </div>
      </div>
    </section>
  );
}

export function IkajarjestysBanneri({ henkilot }: { henkilot: BanneriHenkilo[] }) {
  const href = "/peli/ikajarjestys?category=kaikki&autostart=1";
  /* Desktopissa neljä kasvoa (1, 2, Raahaa, 4), tabletissa ja mobiilissa
     kolme (1, Raahaa, 3) — toinen kortti piilotetaan CSS:llä ja viimeisen
     numero vaihtuu. Loput kierroksen kasvoista "+N kasvoa" -laatassa. */
  const [a, b, c, d] = henkilot;
  const kasvo = (h: BanneriHenkilo | undefined, luokka: string, merkki: React.ReactNode) =>
    h ? (
      <figure className={`eb-kasvo ${luokka}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={h.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
        <span className="eb-kasvo-savy" />
        {merkki}
      </figure>
    ) : null;
  return (
    <section className="eb eb--ika" aria-labelledby="eb-ika-h">
      <div className="eb-in">
      <div className="eb-text">
        <div className="eb-tags">
          <span className="eb-tag eb-tag--violet">Uusi pelimuoto</span>
          <span className="eb-meta eb-vain-desk">Tunnetut henkilöt</span>
        </div>
        <h2 className="eb-h" id="eb-ika-h">
          Kuka on <span className="eb-rivi">vanhin?</span>
        </h2>
        <p className="eb-sub eb-sub--kapea">
          Järjestä {ROUND_SIZE} tunnettua kasvoa syntymäpäivän mukaan<span className="eb-vain-mob"> · 2&nbsp;min</span>
        </p>
        <div className="eb-row">
          <a className="eb-btn" href={href}>
            Arvo kierros <span aria-hidden="true">→</span>
          </a>
          <p className="eb-sub eb-sub--desk">
            Järjestä {ROUND_SIZE} tunnettua kasvoa
            <br />
            syntymäpäivän mukaan · 2&nbsp;min
          </p>
        </div>
      </div>

      {henkilot.length >= 3 && (
        <div className="eb-ketju" aria-hidden="true">
          <span className="eb-ketju-varjo" />
          <span className="eb-ketju-viiva" />
          <span className="eb-ketju-akseli">
            <span>Vanhin</span>
            <span>Nuorin</span>
          </span>
          <div className="eb-ketju-rivi">
            {kasvo(a, "", <span className="eb-kasvo-nro">1</span>)}
            {kasvo(b, "eb-kasvo--vain-desk", <span className="eb-kasvo-nro">2</span>)}
            {kasvo(c, "eb-kasvo--raahaa", <span className="eb-kasvo-raahaa">Raahaa</span>)}
            {kasvo(
              d,
              "",
              <span className="eb-kasvo-nro">
                <span className="eb-vain-desk">4</span>
                <span className="eb-vain-kapea">3</span>
              </span>,
            )}
            <span className="eb-lisaa">
              <span className="eb-lisaa-n">
                <span className="eb-vain-desk">+{ROUND_SIZE - 4}</span>
                <span className="eb-vain-kapea">+{ROUND_SIZE - 3}</span>
              </span>
              <span className="eb-lisaa-l eb-vain-desk">kasvoa</span>
            </span>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
