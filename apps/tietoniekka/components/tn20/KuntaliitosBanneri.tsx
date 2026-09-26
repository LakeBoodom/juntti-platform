// KUNTALIITOS-BANNERI etusivulle (CD "Etusivun bannerit", kierros 12 / 13a, 26.9.2026).
// Pelin oma materiaali: vaalea pöytä, palapeli-Suomi taustalla ja päälle rakennettu ketju
// Kotka – Kouvola – ? (Kotka ja Kouvola ovat oikeat rajanaapurit). Koko banneri on yksi linkki.
// Sijainti: Tupla tai kuitti -bannerin alla (Heikki 26.9.2026).
// Tekstimuutokset designiin: "Maaraja" → "Yhteinen raja" (sama kuin pelissä) ja
// "Kuka seuraavaksi" → "Mikä seuraavaksi" (kunta ei ole kuka).

import { KL_SIVU } from "@/lib/kuntaliitos";

const VAAKUNA = "https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/kuntavaakunat";

function Laatta({ nimi, koodi, luokka }: { nimi: string; koodi: string; luokka: string }) {
  return (
    <span className={`klb-laatta ${luokka}`}>
      <span className="klb-kilpi">
        <span className="klb-kilpi-pohja">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${VAAKUNA}/${koodi}.png`} alt="" loading="lazy" />
        </span>
      </span>
      <span className="klb-nimi">{nimi}</span>
    </span>
  );
}

export function KuntaliitosBanneri() {
  return (
    <a className="klb" href={KL_SIVU} aria-label="Kuntaliitos – uusi karttapeli: rakenna reitti naapurikuntien kautta">
      <span className="klb-ketju" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="klb-kartta" src="/20/kuntaliitos/palapeli.webp" alt="" loading="lazy" />
        <svg className="klb-polku" viewBox="0 0 160 240" preserveAspectRatio="none">
          <path d="M30 222 C 54 178, 84 150, 72 110 S 104 44, 134 30" />
          <circle cx="30" cy="222" r="7" />
          <circle cx="72" cy="110" r="7" />
        </svg>
        <span className="klb-rivi">
          <Laatta nimi="Kotka" koodi="285" luokka="klb-l1" />
          <span className="klb-liitos">
            <i />
            <span className="klb-pill">
              <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              Yhteinen raja
            </span>
          </span>
          <Laatta nimi="Kouvola" koodi="286" luokka="klb-l2" />
          <span className="klb-katko" />
          <span className="klb-kysymys">
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
        <span className="klb-h">Kuntaliitos</span>
        <span className="klb-s">Järjestä kunnat ketjuksi, jossa jokainen on edellisen rajanaapuri.</span>
        <span className="klb-cta">Rakenna reitti <span aria-hidden="true">→</span></span>
      </span>
    </a>
  );
}
