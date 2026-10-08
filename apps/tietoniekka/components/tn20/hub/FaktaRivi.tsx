// Aihesivujen yhteinen faktalohko (erä B4, design 3a–3c): iso luku vasemmalla, tietorivit oikealla.
// Henkilöllä iso luku = ikä tai elinvuodet; aihesivulla esim. rakennusvuosi. Ei lue kantaa.
import type { ReactNode } from "react";

export type FaktaChip = { teksti: string; tyyli: "kulta" | "neutraali" };

export default function FaktaRivi({
  suuri,
  yksikko,
  suuriAla,
  rivit,
  korostus = false,
}: {
  /** "46" tai "1930–2001". */
  suuri: string;
  /** Pieni kultainen pääte isoon lukuun ("v"). */
  yksikko?: string;
  /** Pieni kultainen rivi ison luvun alla ("71 vuotta"). */
  suuriAla?: string;
  rivit: ReactNode[];
  /** Syntymäpäivä: kultainen korostus (henkilösivu 8.10.2026, Päivän sankarin synttärityyli). */
  korostus?: boolean;
}) {
  const vali = suuri.includes("–");
  return (
    <div className={korostus ? "hub-fakta hub-fakta--synttarit" : "hub-fakta"}>
      <div className="hub-fakta-suuri">
        <div className={vali ? "hub-fakta-luku hub-fakta-luku--vali" : "hub-fakta-luku"}>
          {vali ? (
            <>
              {suuri.split("–")[0]}–<br />
              {suuri.split("–")[1]}
            </>
          ) : (
            suuri
          )}
          {yksikko && <span className="hub-fakta-yks"> {yksikko}</span>}
        </div>
        {suuriAla && <span className="hub-fakta-ala">{suuriAla}</span>}
      </div>
      <div className="hub-fakta-rivit">
        {rivit.map((r, i) => (
          <div key={i}>{r}</div>
        ))}
      </div>
    </div>
  );
}

export function Chip({ chip }: { chip: FaktaChip }) {
  return <span className={`hub-chip hub-chip--${chip.tyyli}`}>{chip.teksti}</span>;
}
