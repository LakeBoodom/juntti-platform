"use client";
// S2: "Näytä kaikki N visaa" laajentaa osion paikallaan (aria-expanded). Piilotetut kortit ovat
// HTML:ssä (hakukone näkee ne) ja piilossa CSS:llä. Nappi näkyy vain leveydellä, jolla piiloon jää
// vähintään yksi visa (mobiili B + 6, desktop B + 8).
import { useState } from "react";

export default function RunkoNaytaKaikki({ maara, mobiili, desktop }: { maara: number; mobiili: boolean; desktop: boolean }) {
  const [auki, setAuki] = useState(false);
  if (!mobiili && !desktop) return null;
  return (
    <button
      type="button"
      className="rk-nayta"
      data-m={mobiili || undefined}
      data-d={desktop || undefined}
      aria-expanded={auki}
      onClick={(e) => {
        const osio = (e.currentTarget as HTMLElement).closest("[data-osio]");
        const uusi = !auki;
        setAuki(uusi);
        if (osio) osio.toggleAttribute("data-auki", uusi);
      }}
    >
      {auki ? "Näytä vähemmän" : `Näytä kaikki ${maara} visaa`}
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: auki ? "rotate(180deg)" : undefined }}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
