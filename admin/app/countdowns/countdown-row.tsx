"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CountdownForm, type CountdownFormValue } from "./countdown-form";
import { deleteCountdown } from "./actions";

const MONTHS = [
  "tammi",
  "helmi",
  "maalis",
  "huhti",
  "touko",
  "kesä",
  "heinä",
  "elo",
  "syys",
  "loka",
  "marras",
  "joulu",
];

export function CountdownRow({ row }: { row: CountdownFormValue }) {
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCountdown(row.id!);
      if (!res.ok) setError(res.error);
      else setDelOpen(false);
    });
  }

  const platformLabel =
    row.platform === "juntti"
      ? "juntti.com"
      : row.platform === "tietovisa"
        ? "tietovisa.fi"
        : "molemmat";

  return (
    <TableRow>
      <TableCell className="font-medium">{row.name}</TableCell>
      <TableCell className="text-muted-foreground">{row.slug}</TableCell>
      <TableCell>
        {row.day}. {MONTHS[row.month - 1]}
      </TableCell>
      <TableCell>{row.object_type}</TableCell>
      <TableCell>{platformLabel}</TableCell>
      <TableCell className="text-right">
        <div className="inline-flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditOpen(true)}
            aria-label="Muokkaa"
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDelOpen(true)}
            aria-label="Poista"
          >
            <Trash2 />
          </Button>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Muokkaa countdownia</DialogTitle>
              <DialogDescription>
                Muutokset tallentuvat heti kun klikkaat Tallenna.
              </DialogDescription>
            </DialogHeader>
            <CountdownForm initial={row} onDone={() => setEditOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={delOpen} onOpenChange={setDelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Poistetaanko “{row.name}”?</DialogTitle>
              <DialogDescription>
                Tätä ei voi perua. Kaikki countdownin viittaukset katoavat.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDelOpen(false)}>
                Peruuta
              </Button>
              <Button
                variant="destructive"
                onClick={doDelete}
                disabled={pending}
              >
                {pending ? "Poistetaan…" : "Poista"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
