// K1 PELIPALKKI (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys" §4, CD-arkki 5a, 20.10.2026).
// 56 px: tunnus · pelin nimi · (pelin tila) · (tasorengas METAPELI-lipun takana) + 44 px paluurivi kotikokoelmaan.
// Mobiilissa pelin aikana (pelissa) paluurivi piilotetaan ja tilalle tulee pelin oma tila ("Ketjussa 3/6");
// desktopilla tila ja paluu mahtuvat yhtä aikaa. Iho: tumma (oletus), kerma (reittipelit), violetti (Vaalipiiriketju).
// Sivuston yläpalkki on peleissä piilossa (lib/nav.ts isGameRoute), joten tämä on pelin ainoa navigaatio.
import "@/app/(tn20)/pelikehys.css";
import type { ReactNode } from "react";

export type PeliIho = "tumma" | "kerma" | "violetti";
export type PeliKoti = { href: string; nimi: string };

export default function Pelipalkki({
  peli,
  koti,
  iho = "tumma",
  muunnelma,
  tila,
  pelissa = false,
}: {
  peli: string;
  /** Pelin muunnelma: pakka, aihe tai teema ("Presidentit"). Desktopilla "Peli: muunnelma", mobiilissa omalla
      pienemmällä rivillään (pelimuotojen kehys 25.10.2026: muunnelman nimi yläpalkkiin, ei tuloksen yläotsikoksi). */
  muunnelma?: string;
  koti: PeliKoti;
  iho?: PeliIho;
  /** Pelin oma tila (role=status): "Kysymys 4/10", "Ketjussa 3/6". */
  tila?: ReactNode;
  /** Pelin aikana: mobiilissa paluurivi piiloon, tila näkyviin. */
  pelissa?: boolean;
}) {
  return (
    <header className="pk-palkki" data-iho={iho} data-pelissa={pelissa || undefined}>
      <div className="pk-palkki-rivi">
        <a className="pk-tunnus" href="/" aria-label="Tietoniekka etusivulle">
          <span>TIETO</span>NIEKKA
        </a>
        <span className="pk-erotin" aria-hidden="true" />
        <span className="pk-peli">
          <span>{peli}</span>
          {muunnelma && (
            <span className="pk-muunnelma">
              <span className="pk-kaksoispiste">: </span>
              {muunnelma}
            </span>
          )}
        </span>
        {tila != null && (
          <span className="pk-tila" role="status" aria-live="polite">
            {tila}
          </span>
        )}
      </div>
      <a className="pk-paluu" href={koti.href}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {koti.nimi}
      </a>
    </header>
  );
}
