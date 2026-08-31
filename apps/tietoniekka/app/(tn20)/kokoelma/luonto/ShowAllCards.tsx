"use client";
// LUONTO-landing (Heikki 8.8.2026): mobiilissa ruudukosta näytetään ensin
// 8 korttia ja loput avataan "Näytä kaikki N visaa" -napilla. Desktopilla
// nappi on CSS:llä piilossa ja kaikki kortit näkyvät aina — piilotus/näyttö
// on puhtaasti .tnl-gridwrap[data-open] + media queryn varassa (tn20.css).

import { useState, type ReactNode } from "react";

export function ShowAllCards({ total, children }: { total: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tnl-gridwrap" data-open={open || undefined}>
      <div className="tnl-grid">{children}</div>
      {!open && total > 8 && (
        <button type="button" className="tnl-showall" onClick={() => setOpen(true)}>
          Näytä kaikki {total} visaa
        </button>
      )}
    </div>
  );
}
