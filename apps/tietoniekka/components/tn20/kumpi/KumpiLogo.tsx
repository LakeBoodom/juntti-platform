// KUMPI?-logo (Heikki 20.11.2026: CD:n "KUMP?", kultainen kysymysmerkki i-kirjaimen paikalla). SVG-merkki CD-paketista
// sellaisenaan. Logo on role="img" + aria-label "Kumpi?": tekstissä, otsikoissa ja jaoissa nimi on aina "Kumpi?".
import type { CSSProperties } from "react";

/** Logon ?-merkki (ikoni, favicon, kysymyksen taustamerkki). */
export function KumpiMerkki({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 100" fill="none" aria-hidden="true" className={className} style={style}>
      <path d="M10 32C10 15 20 8 31 8C43 8 52 16 52 28C52 40 44 46 38 50C33 54 31 58 31 66V71" stroke="#E8A320" strokeWidth="20" />
      <circle cx="31" cy="89" r="11" fill="#E8A320" />
    </svg>
  );
}

export default function KumpiLogo({ className }: { className?: string }) {
  return (
    <span className={`kp-logo${className ? ` ${className}` : ""}`} role="img" aria-label="Kumpi?">
      <span aria-hidden="true">KUMP</span>
      <KumpiMerkki className="kp-logo-merkki" />
    </span>
  );
}
