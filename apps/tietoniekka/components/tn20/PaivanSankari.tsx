"use client";
// PÄIVÄN SANKARI -RIVI (Design v0.3 14b/14c, toteutusohje 19.9.2026 luku 4).
// Rivi, ei kortti: kevyempi kuin Päivän visa, sivun taustalla. Osion otsikko
// on aina neutraali "Päivän sankari" — tapauksen kertoo kicker.
// Muistopäivänä (death_date) viileä teräksensininen aksentti samalla
// kirkkaudella kuin synttäririvi, elinvuodet nimen perässä omana elementtinään.
// Lohkoa ei renderöidä lainkaan, jos päivälle ei ole sankaria (page.tsx).
//
// Client-komponentti vain kuvan virhetilan takia: jos kuva ei lataudu,
// näytetään nimikirjaimet. Kaikilla sankareilla on kuva, joten nimikirjainten
// näkyminen tuotannossa on datavirhe.

import { useState } from "react";
import type { PaivanSankariData } from "@/lib/paivanSankari";
import { pisinSana } from "@/components/tn20/PaivanVisaCard";
import { kirjaaNosto, useNayttoMittaus } from "@/lib/nostoMittaus";

function nimikirjaimet(nimi: string) {
  return nimi
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((o) => Array.from(o)[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PaivanSankari({ data }: { data: PaivanSankariData }) {
  const [kuvaOk, setKuvaOk] = useState(Boolean(data.kuva));
  /* Mittaus (luku 9): kategoriana sankarin tapaus (vakio / pyorea / muisto). */
  const mitta = { slotti: "paivan_sankari" as const, quizId: data.quizId, kategoria: data.tapaus };
  const nayttoRef = useNayttoMittaus<HTMLAnchorElement>(() => kirjaaNosto({ ...mitta, tapahtuma: "naytto" }));
  return (
    <section
      className="tn-es-sank"
      aria-labelledby="paivan-sankari-h"
      data-tapaus={data.tapaus}
      style={{ ["--sank-lw" as string]: pisinSana(data.nimi) }}
    >
      <div className="tn-es-sank-head">
        <h2 className="tn-es-sank-h" id="paivan-sankari-h">Päivän sankari</h2>
        <i aria-hidden />
      </div>
      <a ref={nayttoRef} className="tn-es-sank-row" href={data.playHref} onClick={() => kirjaaNosto({ ...mitta, tapahtuma: "klikkaus" })}>
        <span className="tn-es-sank-img" aria-hidden>
          {kuvaOk && data.kuva ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.kuva} alt="" style={{ objectPosition: data.kuvaPos }} onError={() => setKuvaOk(false)} />
          ) : (
            <span className="tn-es-sank-initials">{nimikirjaimet(data.nimi)}</span>
          )}
        </span>
        <span className="tn-es-sank-body">
          <span className="tn-es-sank-kicker">
            <span className="tn-es-v-desk">{data.kicker.desktop}</span>
            <span className="tn-es-v-mob">{data.kicker.mobile}</span>
          </span>
          <span className="tn-es-sank-namerow">
            <span className="tn-es-sank-name">{data.nimi}</span>
            {data.elinvuodet && <span className="tn-es-sank-years">{data.elinvuodet}</span>}
          </span>
          <span className="tn-es-sank-text">
            <span className="tn-es-v-desk">{data.teksti.desktop}</span>
            <span className="tn-es-v-mob">{data.teksti.mobile}</span>
          </span>
          <span className="tn-es-sank-cta tn-es-sank-cta--mob" aria-hidden>
            Pelaa visa <span>→</span>
          </span>
        </span>
        <span className="tn-es-sank-cta tn-es-sank-cta--desk">
          Pelaa visa <span aria-hidden>→</span>
        </span>
      </a>
    </section>
  );
}
