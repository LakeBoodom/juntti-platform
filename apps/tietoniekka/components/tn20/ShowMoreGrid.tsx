"use client";
// Pitkien visalistojen pagination (11.8.2026, ensin urheiluhub): näytetään
// aluksi `initial` korttia ja loput avataan "Näytä lisää" -napilla. Sama
// periaate kuin Luonto-landingin ShowAllCards, mutta kaikilla leveyksillä
// ja geneerisenä (kortit tulevat palvelimelta children-propissa).

import { Children, useState, type ReactNode } from "react";

export function ShowMoreGrid({
  initial = 12,
  moreLabel,
  className = "tn-wide-grid",
  children,
}: {
  initial?: number;
  moreLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const items = Children.toArray(children);
  const shown = open ? items : items.slice(0, initial);
  const hidden = items.length - initial;

  return (
    <>
      <div className={className}>{shown}</div>
      {!open && hidden > 0 && (
        <button type="button" className="tn-showmore" onClick={() => setOpen(true)}>
          {moreLabel} ({hidden})
        </button>
      )}
    </>
  );
}
