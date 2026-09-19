"use client";

import Link from "next/link";
import { useTransition } from "react";
import { AlertTriangle, Bot, Cake, Flower2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { paivaTeksti, type Paiva } from "@/lib/paivan-visa-yhteiset";
import { poistaPaiva } from "./actions";

/** Tilamerkit: automaattivalinta, intro (A/C) tai ei introa, varoitukset. */
export function Merkit({ paiva }: { paiva: Paiva }) {
  const s = paiva.saanto;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {s?.auto_filled && (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
          <Bot className="h-3 w-3" /> Automaattivalinta — ei toimitettu
        </span>
      )}
      {s && (s.intro_text ? (
        <span className="rounded bg-lime-100 px-1.5 py-0.5 text-lime-800">
          Intro {s.intro_headline ? "A" : "C"}
        </span>
      ) : (
        <span className="rounded border px-1.5 py-0.5 text-muted-foreground">Ei introa</span>
      ))}
      {paiva.varoitukset.length > 0 && (
        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
          <AlertTriangle className="h-3 w-3" /> {paiva.varoitukset.length}
        </span>
      )}
    </div>
  );
}

export function DayRow({ paiva, siteId, tanaan }: { paiva: Paiva; siteId: string; tanaan: string }) {
  const [pending, startTransition] = useTransition();
  const { lyhyt, vp } = paivaTeksti(paiva.iso);
  const isToday = paiva.iso === tanaan;

  function poista() {
    if (!confirm(`Poistetaanko ${lyhyt} valinta? Automaatti valitsee päivälle uuden visan.`)) return;
    startTransition(async () => {
      await poistaPaiva(siteId, paiva.iso);
    });
  }

  return (
    <TableRow className={isToday ? "bg-amber-50/30 dark:bg-amber-950/20" : ""}>
      <TableCell className="align-top font-medium">
        <div>{lyhyt}</div>
        <div className="text-xs text-muted-foreground">
          {vp}
          {isToday && <span className="ml-1 text-amber-600">tänään</span>}
        </div>
      </TableCell>
      <TableCell className="align-top">
        {paiva.visa ? (
          <Link href={`/paivan-visa/${paiva.iso}`} className="font-medium hover:underline">
            {paiva.visa.title}
          </Link>
        ) : (
          <span className="text-sm italic text-muted-foreground">— automaatti valitsee —</span>
        )}
        {paiva.saanto?.intro_headline && (
          <div className="mt-0.5 text-xs text-muted-foreground">“{paiva.saanto.intro_headline}”</div>
        )}
        <div className="mt-1">
          <Merkit paiva={paiva} />
        </div>
        {paiva.varoitukset.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {paiva.varoitukset.map((v, i) => (
              <li key={i} className="flex gap-1 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {v.teksti}
              </li>
            ))}
          </ul>
        )}
      </TableCell>
      <TableCell className="align-top text-sm text-muted-foreground">{paiva.visa?.kokoelma ?? ""}</TableCell>
      <TableCell className="align-top text-sm">
        {paiva.sankari ? (
          <span className="inline-flex items-center gap-1">
            {paiva.sankari.death_date ? (
              <Flower2 className="h-3.5 w-3.5 text-sky-700" aria-label="Muistopäivä" />
            ) : (
              <Cake className="h-3.5 w-3.5 text-lime-700" aria-label="Synttärit" />
            )}
            {paiva.sankari.name}
            <span className="text-xs text-muted-foreground">{paiva.sankari.ika} v</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">ei sankaria</span>
        )}
      </TableCell>
      <TableCell className="align-top text-right">
        <div className="inline-flex gap-1">
          <Link href={`/paivan-visa/${paiva.iso}`}>
            <Button variant={paiva.saanto && !paiva.saanto.auto_filled ? "outline" : "default"} size="sm">
              <Pencil className="h-3.5 w-3.5" />
              {paiva.saanto && !paiva.saanto.auto_filled ? "Muokkaa" : "Toimita"}
            </Button>
          </Link>
          {paiva.saanto && (
            <Button variant="ghost" size="icon" onClick={poista} disabled={pending} aria-label="Poista päivän valinta">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
