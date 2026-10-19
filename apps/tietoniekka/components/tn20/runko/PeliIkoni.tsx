// Pelimuotojen ikonit (CD-arkki "Kokoelmarunko ja pelikehys v2", TN-Pelikortti). 24 × 24, viiva.
import type { PeliIkoni } from "@/lib/pelimuodot";

const POLUT: Record<PeliIkoni, string[]> = {
  kuva: ["M3.5 5h17v14h-17z", "M3.5 16l5-5 4 4 2.5-2.5 5 5", "M15.5 8.6a1.4 1.4 0 1 0 0 .01"],
  aani: ["M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"],
  ika: ["M4 20h16", "M6 20v-5M10 20v-8M14 20v-11M18 20v-15"],
  jarjestys: ["M4 6h10M4 12h10M4 18h10", "M18 5v14", "M15.5 16.5L18 19l2.5-2.5"],
  kartta: ["M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z", "M12 7.6a2.4 2.4 0 1 0 0 4.8a2.4 2.4 0 1 0 0-4.8z"],
  tupla: ["M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z", "M8.5 9l3.5 6M12 9l-3.5 6", "M14.5 9.5c.4-.6 1.1-1 1.9-1c1.1 0 2 .8 2 1.8c0 1.8-3.9 3-3.9 4.7h3.9"],
  kumpi: ["M3.5 5h7v14h-7z", "M13.5 5h7v14h-7z", "M12 9v6"],
  ketju: ["M9.5 14.5l5-5", "M8 11l-2 2a3.5 3.5 0 0 0 5 5l2-2", "M16 13l2-2a3.5 3.5 0 0 0-5-5l-2 2"],
};

export function PeliIkoniSvg({ ikoni }: { ikoni: PeliIkoni }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {POLUT[ikoni].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
