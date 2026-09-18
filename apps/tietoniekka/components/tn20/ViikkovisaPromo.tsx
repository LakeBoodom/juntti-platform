"use client";
// VIIKKOVISA — etusivun promo ja kokoelmasivun kapea kortti (10A Sinetti,
// kierros 4, 18.9.2026).
//
// Asiakaskomponentti vain yhdestä syystä: pelattu viikko luetaan selaimen
// localStoragesta (yksi yritys viikossa, selainkohtaisesti). Kaikki aikatieto
// (viikkonumero, päivämääräväli, jäljellä olevat päivät) tulee propseina
// palvelimelta — selaimen kelloon ei nojata.
//
// Pelattu tila (Heikin linjaus 4.6): oma tulos näkyviin, Aloita-napin tilalla
// "Tarkastele vastauksia" ja paluu kortistoihin. Ei uudelleenpeluunappia.
//
// Värisääntö (design): etusivulla promo on näkymän pääkutsu → lime täytetty
// nappi. Kokoelmasivulla lime kuuluu herolle, joten kortin nappi on syaani
// ääriviivanappi eikä kilpaile heron kanssa.

import { useEffect, useState } from "react";
import { lueViikkoTulos, viikkoNimi, type ViikkoInfo, type ViikkoTulos } from "@/lib/viikkovisa";
import { ViikkoMerkki, ViikkoMerkkirivi } from "./Viikkosinetti";

export type ViikkoPromoData = { info: ViikkoInfo; kuvia: number };

const PELI = "/peli?viikkovisa=1";
const TARKASTELE = "/peli?viikkovisa=1&tarkastele=1";
const KORTISTOT = "/kokoelma/kuvavisat";

function useViikkoTulos(avain: string): ViikkoTulos | null {
  const [t, setT] = useState<ViikkoTulos | null>(null);
  useEffect(() => { setT(lueViikkoTulos(avain)); }, [avain]);
  return t;
}

export function ViikkovisaEtusivu({ data }: { data: ViikkoPromoData }) {
  const { info, kuvia } = data;
  const tulos = useViikkoTulos(info.avain);
  return (
    <section className="vv-promo" aria-label={viikkoNimi(info.viikko, info.kategoria)} data-pelattu={tulos ? "1" : undefined}>
      <div className="vv-promo-text">
        <ViikkoMerkkirivi viikko={info.viikko} kategoria={info.kategoria} />
        {tulos ? (
          <>
            <h2 className="vv-promo-h">
              Sinun tuloksesi <span className="vv-tulos">{tulos.oikein}/{tulos.kysymyksia}</span>
            </h2>
            <p className="vv-promo-p">Yksi yritys viikossa. Uusi viikkovisa maanantaina.</p>
          </>
        ) : (
          <h2 className="vv-promo-h">Sama {kuvia} kuvaa kaikille koko viikon</h2>
        )}
        <div className="vv-promo-row">
          {tulos ? (
            <>
              <a className="vv-btn" href={TARKASTELE}>Tarkastele vastauksia</a>
              <a className="vv-link" href={KORTISTOT}>Takaisin kortistoihin <span aria-hidden="true">→</span></a>
            </>
          ) : (
            <>
              <a className="vv-btn" href={PELI}>Pelaa viikkovisa <span aria-hidden="true">→</span></a>
              <span className="vv-meta">{kuvia} kuvaa · kaikki kategoriat · {info.jaljellaTeksti}</span>
            </>
          )}
        </div>
      </div>
      {/* Viikkonumero on kortin kuva (design): viikkovisalla ei ole omaa
          kuva-aihetta, koska sisältö vaihtuu joka viikko. */}
      <div className="vv-promo-nro" aria-hidden="true">{info.viikko}</div>
    </section>
  );
}

export function ViikkovisaKortti({ data }: { data: ViikkoPromoData }) {
  const { info, kuvia } = data;
  const tulos = useViikkoTulos(info.avain);
  return (
    <aside className="vv-kortti" aria-label={viikkoNimi(info.viikko, info.kategoria)} data-pelattu={tulos ? "1" : undefined}>
      <ViikkoMerkki viikko={info.viikko} koko="s" />
      <p className="vv-kortti-h">{info.kategoria} · {kuvia} kysymystä</p>
      {tulos ? (
        <p className="vv-kortti-p">
          Sinun tuloksesi <b className="vv-tulos">{tulos.oikein}/{tulos.kysymyksia}</b>. Uusi viikkovisa maanantaina.
        </p>
      ) : (
        <p className="vv-kortti-p">Sama visa kaikille koko viikon. Kuvat kaikista kortistoista.</p>
      )}
      <p className="vv-kortti-meta">Voimassa {info.voimassaAsti} asti · {info.jaljellaTeksti}</p>
      <a className="vv-btn-outline" href={tulos ? TARKASTELE : PELI}>
        {tulos ? "Tarkastele vastauksia" : <>Pelaa viikkovisa <span aria-hidden="true">→</span></>}
      </a>
    </aside>
  );
}
