"use client";
// Etusivu v5 — Päivän visa -kortti. Sisältää samat toiminnot kuin vanha PaivanVisaCard (toteutusohje 19.9.2026):
//   · ajankohtaisuusteksti (paivan_visa.intro_headline / intro_text) aina, kun toimitus on sen kirjoittanut —
//     päiväleima "Tänään 28.10." + koukkurivi + selittävä virke (Heikki 28.10.: "pitää olla mukana aina")
//   · pelattu-tila (PAIVAN_VISA_KEY): leima "✓ Pelattu", nappi "Lisää visoja" kokoelmaan
//   · nostomittaus (luku 9): näyttö kerran ≥ 50 % näkyvissä + klikkaus.
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { paivanVisaTila, type PaivanVisaData } from "@/lib/paivanVisa";
import { kirjaaNosto, useNayttoMittaus } from "@/lib/nostoMittaus";
import { PAIVAN_VISA_KEY, localDateKey } from "@/components/tn20/PaivanVisaCard";

export default function PaivanVisaV5({ visa, lw }: { visa: PaivanVisaData; lw: number }) {
  const [pelattu, setPelattu] = useState(false);
  useEffect(() => {
    try {
      setPelattu(localStorage.getItem(PAIVAN_VISA_KEY) === localDateKey());
    } catch {
      /* no-op */
    }
  }, []);
  const tila = paivanVisaTila(visa);
  const mitta = { slotti: "paivan_visa" as const, quizId: visa.quizId, intro: tila, kategoria: visa.kategoria };
  const ref = useNayttoMittaus<HTMLAnchorElement>(() => kirjaaNosto({ ...mitta, tapahtuma: "naytto" }));

  return (
    <a
      ref={ref}
      className="tn-es-pv"
      href={pelattu ? visa.playedHref : visa.playHref}
      data-tn-entry="etusivu:paivan-visa"
      data-tila={tila}
      onClick={() => { if (!pelattu) kirjaaNosto({ ...mitta, tapahtuma: "klikkaus" }); }}
    >
      {visa.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tn-es-pv-kuva" src={visa.imageUrl} alt="" loading="eager" fetchPriority="high" style={{ objectPosition: visa.imagePos }} />
      )}
      <span className="tn-es-pv-varjo" aria-hidden="true" />
      <span className="tn-es-pv-sisus">
        <span className="tn-es-tagit">
          <span className="tn-es-tag tn-es-tag--kulta">{pelattu ? "✓ Pelattu" : "Päivän visa"}</span>
          <span className="tn-es-tag">{visa.badge.label}</span>
        </span>
        <span className="tn-es-pv-h" style={{ "--lw": lw } as CSSProperties}>{visa.title}</span>
        {visa.intro && (
          <span className="tn-es-pv-koukku">
            <span className="tn-es-pv-leima">{visa.stamp}</span>
            {visa.intro.headline && <span className="tn-es-pv-koukku-h">{visa.intro.headline}</span>}
            {visa.intro.text && <span className="tn-es-pv-koukku-t">{visa.intro.text}</span>}
          </span>
        )}
        <span className="tn-es-cta tn-cta-lime">{pelattu ? "Lisää visoja" : "Pelaa päivän visa"}</span>
      </span>
    </a>
  );
}
