"use client";
// VIIKKOVISA — promo etusivulle ja kokoelmasivulle (10A Sinetti).
//
// Asiakaskomponentti vain yhdestä syystä: pelattu viikko luetaan selaimen
// localStoragesta (yksi yritys viikossa, selainkohtaisesti). Kaikki aikatieto
// (viikkonumero, voimassaolo, jäljellä olevat päivät) tulee propseina
// palvelimelta — selaimen kelloon ei nojata.
//
// Kierros 5 (V1, 18.9.2026): kokoelmasivun kapea kortti poistettiin. Kategoria-
// ruudukon ensimmäisenä ruutuna se luettiin yhdeksänneksi kategoriaksi ja oli
// kirkkaiden kuvakorttien vieressä sivun huomaamattomin elementti. Nyt sama
// promo palvelee molempia sivuja samassa kokoluokassa: merkki, yksi väite-
// otsikko, voimassaolo, nappi ja suuri viikkonumero.
//
// Pelattu tila (Heikin linjaus 4.6): oma tulos näkyviin, Aloita-napin tilalla
// "Tarkastele vastauksia". Ei uudelleenpeluunappia.
//
// Värisääntö (design): etusivulla promo on näkymän pääkutsu → lime täytetty
// nappi. Kokoelmasivulla lime kuuluu herolle, joten nappi on syaani
// ääriviivanappi — sama kokoluokka, eri painoarvo.

import { useEffect, useState } from "react";
import { lueViikkoTulos, viikkoNimi, type ViikkoInfo, type ViikkoTulos } from "@/lib/viikkovisa";
import { ViikkoMerkkirivi } from "./Viikkosinetti";

export type ViikkoPromoData = { info: ViikkoInfo; kuvia: number };

const PELI = "/peli?viikkovisa=1";
const TARKASTELE = "/peli?viikkovisa=1&tarkastele=1";
const KORTISTOT = "/kokoelma/kuvavisat";

function useViikkoTulos(avain: string): ViikkoTulos | null {
  const [t, setT] = useState<ViikkoTulos | null>(null);
  useEffect(() => { setT(lueViikkoTulos(avain)); }, [avain]);
  return t;
}

export function ViikkovisaPromo({ data, sijainti }: { data: ViikkoPromoData; sijainti: "etusivu" | "kokoelma" }) {
  const { info, kuvia } = data;
  const tulos = useViikkoTulos(info.avain);
  const kokoelma = sijainti === "kokoelma";
  const nappi = kokoelma ? "vv-btn-outline vv-btn-outline--l" : "vv-btn";
  /* Etusivulla väite on osion otsikko; kokoelmasivulla osiolla on oma
     h2 ("Tämän viikon visa"), joten väite on tavallinen kappale. */
  const Otsikko = kokoelma ? "p" : "h2";
  return (
    <div
      className="vv-promo"
      data-sijainti={sijainti}
      data-pelattu={tulos ? "1" : undefined}
      role="group"
      aria-label={viikkoNimi(info.viikko, info.kategoria)}
    >
      <div className="vv-promo-text">
        <ViikkoMerkkirivi viikko={info.viikko} kategoria={info.kategoria} />
        {tulos ? (
          <>
            <Otsikko className="vv-promo-h">
              Sinun tuloksesi <span className="vv-tulos">{tulos.oikein}/{tulos.kysymyksia}</span>
            </Otsikko>
            <p className="vv-promo-p">Yksi yritys viikossa. Uusi viikkovisa maanantaina.</p>
          </>
        ) : (
          <Otsikko className="vv-promo-h">Sama {kuvia} kuvaa kaikille koko viikon</Otsikko>
        )}
        <div className="vv-promo-row">
          {tulos ? (
            <>
              <a className={nappi} href={TARKASTELE}>Tarkastele vastauksia</a>
              {!kokoelma && (
                <a className="vv-link" href={KORTISTOT}>Takaisin kortistoihin <span aria-hidden="true">→</span></a>
              )}
            </>
          ) : (
            <a className={nappi} href={PELI}>Pelaa viikkovisa <span aria-hidden="true">→</span></a>
          )}
          <span className="vv-meta">
            {kuvia} kuvaa · voimassa {info.voimassaAsti} asti · {info.jaljellaTeksti}
          </span>
        </div>
      </div>
      {/* Viikkonumero on promon kuva (design): viikkovisalla ei ole omaa
          kuva-aihetta, koska sisältö vaihtuu joka viikko. */}
      <div className="vv-promo-nro" aria-hidden="true">{info.viikko}</div>
    </div>
  );
}
