"use client";
// "n/3 pelattu tänään" (etusivu v5, Päivän pelit). Luetaan localStoragesta:
//   Päivän visa: PAIVAN_VISA_KEY (pelattu ?paivan_visa=1 -linkistä) tai tn_pelattu_pvm[visaId] = tänään
//   Synttärit:   tn_pelattu_pvm[sankarin visan id] = tänään (GameClient kirjaa jokaisen pelatun visan päivän)
//   Slotti:      tn_paivan_slotti = "<tänään>|<avain>" — kirjataan, kun slottikorttia klikataan
// Palvelin renderöi 0/3; päivitys selaimessa ei siirrä mitään (kiinteä leveys).
import { useEffect, useState } from "react";
import { PAIVAN_VISA_KEY, localDateKey } from "@/components/tn20/PaivanVisaCard";

export const PELATTU_PVM = "tn_pelattu_pvm";
const SLOTTI = "tn_paivan_slotti";

function lue(visaId: string | null, sankariId: string | null, slotti: string | null, tanaan: string): number {
  try {
    const pvm = JSON.parse(localStorage.getItem(PELATTU_PVM) ?? "{}") as Record<string, string>;
    const visa = !!visaId && (localStorage.getItem(PAIVAN_VISA_KEY) === localDateKey() || pvm[visaId] === tanaan);
    const sankari = !!sankariId && pvm[sankariId] === tanaan;
    const slot = !!slotti && localStorage.getItem(SLOTTI) === `${tanaan}|${slotti}`;
    return Number(visa) + Number(sankari) + Number(slot);
  } catch {
    return 0;
  }
}

export default function PelattuTanaan({ visaId, sankariId, slotti, tanaan, maara }: {
  visaId: string | null; sankariId: string | null; slotti: string | null; tanaan: string; maara: number;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(lue(visaId, sankariId, slotti, tanaan));
    const klikki = (e: MouseEvent) => {
      if (!slotti || !(e.target as Element | null)?.closest?.('[data-paivan-peli="slotti"]')) return;
      try {
        localStorage.setItem(SLOTTI, `${tanaan}|${slotti}`);
      } catch {
        /* no-op */
      }
    };
    document.addEventListener("click", klikki, { capture: true });
    return () => document.removeEventListener("click", klikki, { capture: true });
  }, [visaId, sankariId, slotti, tanaan]);
  return (
    <div className="tn-es-pp-edistys" aria-label={`${n}/${maara} päivän peliä pelattu tänään`}>
      <span className="tn-es-pp-pisteet" aria-hidden="true">
        {Array.from({ length: maara }, (_, i) => (
          <i key={i} data-on={i < n || undefined} />
        ))}
      </span>
      <span aria-hidden="true">
        {n}/{maara}
        <span className="tn-es-vain-desk"> pelattu tänään</span>
      </span>
    </div>
  );
}

/** GameClient kutsuu pelatun visan jälkeen: tn_pelattu_pvm[quizId] = Helsingin päivä. Vanhat (> 7 pv) karsitaan. */
export function kirjaaPelattuTanaan(quizId: string) {
  try {
    const tanaan = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(new Date());
    const raja = new Date(Date.parse(tanaan) - 7 * 864e5).toISOString().slice(0, 10);
    const m = JSON.parse(localStorage.getItem(PELATTU_PVM) ?? "{}") as Record<string, string>;
    for (const [k, v] of Object.entries(m)) if (v < raja) delete m[k];
    m[quizId] = tanaan;
    localStorage.setItem(PELATTU_PVM, JSON.stringify(m));
  } catch {
    /* no-op */
  }
}
