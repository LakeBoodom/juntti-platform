// PELIKEHYKSEN KÄÄRE (§4): asettaa ihon (data-iho → pelikehys.css-muuttujat) ja rungon otsikkofontin
// (Barlow Condensed 800, runkoFontti). Pelipalkki, aloitus ja tulos ovat tämän sisällä; pelilauta (K3) on pelin oma.
import "@/app/(tn20)/pelikehys.css";
import type { CSSProperties, ReactNode } from "react";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import type { PeliIho } from "./Pelipalkki";

export default function PeliKehys({ iho = "tumma", children, className, style }: { iho?: PeliIho; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={[`pk ${runkoCond.variable}`, className].filter(Boolean).join(" ")} data-iho={iho} style={style}>
      {children}
    </div>
  );
}
