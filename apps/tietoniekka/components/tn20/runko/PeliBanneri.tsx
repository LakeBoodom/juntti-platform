// V4 TUNNUSOSA, tyyppi 3: kokoelman ydinpelin kuvabanneri (Heikki 20.10.2026). Sallittu, kun banneri kertoo
// pelimuodosta paremmin kuin tavallinen pelikortti (Vaalit: Laita järjestykseen -kasvoketju, Luonto: äänivisa).
// Kokoelmalla on silti enintään yksi tunnusosa, ja peli pysyy myös pelihyllyssä (V6). Banneri itse on sivun
// antama (children); runko antaa vain paikan ja sisältöreunat.
import type { ReactNode } from "react";

export default function PeliBanneri({ children, nimi }: { children: ReactNode; nimi: string }) {
  return (
    <section className="rk-v4-banneri" aria-label={nimi}>
      {children}
    </section>
  );
}
