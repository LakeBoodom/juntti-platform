// RAJANAAPURIT-BANNERI etusivulle (CD "Rajanaapurit v0.2" 3f, 27.9.2026). Sama rakenne kuin
// Kuntaliitoksen 13a: vaalea pöytä, himmeä Keski-Euroopan kartta taustalla (pelin karttatyyli,
// scripts/rajanaapurit-banneri-kartta.mjs) ja ketju Itävalta – Unkari – ? (oikea maaraja).
// Desktop ja mobiili animoituja (8 s silmukka), tabletti staattinen, vähennetty liike → valmis ketju.
// CD 3f-b: julkaisuviikkoina oma banneri Kuntaliitoksen paikalla, myöhemmin yhteinen Karttapelit-nosto.
// Tekstimuutos: "Kuka seuraavaksi" → "Mikä seuraavaksi" (sama kuin Kuntaliitoksen bannerissa).

import { RN_SIVU } from "@/lib/rajanaapurit";

function Laatta({ nimi, koodi, luokka }: { nimi: string; koodi: string; luokka: string }) {
  return (
    <span className={`klb-laatta ${luokka}`}>
      <span className="klb-lippu">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/20/rajanaapurit/liput/${koodi}.webp`} alt="" loading="lazy" />
      </span>
      <span className="klb-nimi">{nimi}</span>
    </span>
  );
}

export function RajanaapuritBanneri() {
  return (
    <a className="klb klb--rn" href={RN_SIVU} aria-label="Rajanaapurit – uusi karttapeli: rakenna reitti naapurivaltioiden kautta">
      <span className="klb-ketju" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="klb-kartta klb-kartta--rn" src="/20/rajanaapurit/banneri-kartta.webp" alt="" loading="lazy" />
        <span className="klb-rivi">
          <Laatta nimi="Itävalta" koodi="aut" luokka="klb-l1 klb-anim klb-anim--1" />
          <span className="klb-liitos klb-anim klb-anim--kisko1">
            <i />
            <span className="klb-pill">
              <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              Maaraja
            </span>
          </span>
          <Laatta nimi="Unkari" koodi="hun" luokka="klb-l2 klb-anim klb-anim--2" />
          <span className="klb-katko klb-anim klb-anim--kisko2" />
          <span className="klb-kysymys klb-anim klb-anim--q">
            <b>?</b>
            <small>Mikä seuraavaksi</small>
          </span>
        </span>
        <span className="klb-tag klb-tag--m">Uusi peli</span>
      </span>
      <span className="klb-teksti">
        <span className="klb-tagit">
          <span className="klb-tag">Uusi peli</span>
          <span className="klb-meta">Karttapelit</span>
        </span>
        <span className="klb-h">Rajanaapurit</span>
        <span className="klb-s">Järjestä valtiot reitiksi, jossa jokainen rajaa seuraavaa.</span>
        <span className="klb-cta">Rakenna reitti <span aria-hidden="true">→</span></span>
      </span>
    </a>
  );
}
