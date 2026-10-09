"use client";
// LUONTO v3.0 (8.10.2026): ruudukosta näytetään ensin 8 korttia kaikilla leveyksillä (design 1a:
// "Näytä kaikki N visaa"), loput avataan napilla. Piilotetut kortit ovat DOMissa (CSS-piilotus),
// joten kaikki visalinkit ovat HTML:ssä hakukoneille.

import { useState, type ReactNode } from "react";

export function ShowAllCards({ total, children }: { total: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tnl3-gridwrap" data-open={open || undefined}>
      <div className="tnl3-grid">{children}</div>
      {!open && total > 8 && (
        <button type="button" className="tnl3-showall" onClick={() => setOpen(true)}>
          Näytä kaikki {total} visaa
        </button>
      )}
    </div>
  );
}
