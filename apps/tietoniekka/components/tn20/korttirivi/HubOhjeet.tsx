// HUB-SIVUN LISÄTIEDOT (Heikki 11.11.2026; 22.11.2026 alkaen vain lisätiedot): "Pelin tausta", "Lähteet ja rajaukset"
// suljettuina (<details>). Näin pelaat on aina auki kolmena korttina: components/tn20/ohjeet/NainPelaat.tsx.
// Sama ulkoasu kuin pelien aloitusnäkymän ohjeissa (pelikehys.css .pk-ohje); data-iho antaa tumman ihon muuttujat.
import type { ReactNode } from "react";
import "@/app/(tn20)/pelikehys.css";

export default function HubOhjeet({ kohdat, className }: { kohdat: Array<{ otsikko: string; sisalto: ReactNode }>; className?: string }) {
  return (
    <div className={`pk-ohjeet hub-ohjeet${className ? ` ${className}` : ""}`} data-iho="tumma">
      {kohdat.map((o) => (
        <details key={o.otsikko} className="pk-ohje">
          <summary>
            {o.otsikko}
            <span aria-hidden="true">+</span>
          </summary>
          <div className="pk-ohje-sisalto">{o.sisalto}</div>
        </details>
      ))}
    </div>
  );
}
