// TIETOKETJU: IKÄJÄRJESTYS — SuuntaindikaattoriBadge.
// Konfiguroitava suuntamerkintä ("VANHIMMASTA NUORIMPAAN" / "NUORIMMASTA
// VANHIMPAAN"). Väri LUKITTU CSS:ään (tietoketju.css: .tk-directionbadge) —
// neutraali tausta (ink.surface-2-perhe, ~#1F1B12) + teksti #A79E8C. EI lime,
// EI amber, EI violetti. Komponentti ei ota vastaan inline-väriprooppeja
// tarkoituksella, jotta lukitus ei voi vahingossa rikkoutua kutsupaikalla.

import type { ChainDirection } from "@/lib/ikajarjestysConstants";

const DIRECTION_LABEL: Record<ChainDirection, string> = {
  "vanhin-nuorin": "VANHIMMASTA NUORIMPAAN",
  "nuorin-vanhin": "NUORIMMASTA VANHIMPAAN",
};

export function SuuntaindikaattoriBadge({
  direction = "vanhin-nuorin",
  label,
  className,
}: {
  direction?: ChainDirection;
  /** Ohittaa oletustekstin — käytä vain jos tarvitset muun sanamuodon samalla suunnalla. */
  label?: string;
  className?: string;
}) {
  const flipped = direction === "nuorin-vanhin";
  return (
    <span className={["tk-directionbadge", className ?? ""].join(" ").trim()}>
      <svg
        viewBox="0 0 20 20"
        width="13"
        height="13"
        aria-hidden="true"
        focusable="false"
        style={flipped ? { transform: "scaleY(-1)" } : undefined}
      >
        <path
          d="M10 3 v13 M5.5 12 10 16.5 14.5 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label ?? DIRECTION_LABEL[direction]}
    </span>
  );
}
