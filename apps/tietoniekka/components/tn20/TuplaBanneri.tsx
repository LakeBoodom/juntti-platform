// TUPLA TAI KUITTI -BANNERI etusivulle (CD v0.2, 3B "Banneri studiokuvalla", 26.9.2026).
// Mustavalkoinen studiokuva ja virallinen logo; kuvan taustan vanha kyltti on rajattu pois
// (kuvat rajattu valmiiksi: public/20/tupla/banneri-*.webp). Koko banneri on yksi linkki.
// Sijainti: heti Päivän visan alla (Heikki 26.9.2026).

import { TUPLA_SIVU } from "@/lib/tuplaTaiKuitti";

export function TuplaBanneri() {
  return (
    <a className="tkb" href={TUPLA_SIVU} aria-label="Tupla tai kuitti – testaa uusi pelimuoto">
      <span className="tkb-kuva" aria-hidden="true">
        <picture>
          <source media="(min-width: 980px)" srcSet="/20/tupla/banneri-desk.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/20/tupla/banneri-mob.webp" alt="" loading="lazy" />
        </picture>
      </span>
      <span className="tkb-tag tkb-tag--m">Uusi pelimuoto</span>
      <span className="tkb-teksti">
        <span className="tkb-tag tkb-tag--d">Uusi pelimuoto</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="tkb-logo" src="/20/tupla/logo.webp" alt="Tupla tai kuitti" width={640} height={374} loading="lazy" />
        <span className="tkb-rivi">
          <span className="tkb-s">Tietoniekan versio rakastetusta tietovisaklassikosta.</span>
          <span className="tkb-cta">
            <span className="tkb-cta-m">PELAA</span>
            <span className="tkb-cta-d">TESTAA UUSI PELIMUOTO</span>
          </span>
        </span>
      </span>
    </a>
  );
}
