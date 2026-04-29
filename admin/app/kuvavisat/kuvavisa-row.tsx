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
import { KuvavisaForm, type KuvavisaFormValue } from "./kuvavisa-form";
import { deleteKuvavisa, type KuvavisaType } from "./actions";

export function KuvavisaRow({
  row,
  siteId,
  siteSlug,
}: {
  row: KuvavisaFormValue;
  siteId: string;
  siteSlug: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteKuvavisa(row.id!);
      if (!res.ok) setError(res.error);
      else setDelOpen(false);
    });
  }

  return (
    <TableRow className={row.active ? "" : "opacity-50"}>
      <TableCell>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={row.image_url}
          alt=""
          className="h-12 w-16 rounded border object-cover"
        />
      </TableCell>
      <TableCell className="font-medium max-w-md">
        <div className="line-clamp-1">{row.question}</div>
        <div className="text-xs text-muted-foreground">→ {row.correct_option}</div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {row.difficulty} · paino {row.weight}
        {row.tag ? ` · #${row.tag}` : ""}
      </TableCell>
      <TableCell>{row.active ? "✓ Aktiivinen" : "○ Pois"}</TableCell>
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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Muokkaa kuvavisaa</DialogTitle>
              <DialogDescription>
                Muutokset tallentuvat heti kun klikkaat Tallenna.
              </DialogDescription>
            </DialogHeader>
            <KuvavisaForm
              initial={row}
              onDone={() => setEditOpen(false)}
              siteId={siteId}
              siteSlug={siteSlug}
              defaultType={row.type as KuvavisaType}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={delOpen} onOpenChange={setDelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Poistetaanko kuvavisa?</DialogTitle>
              <DialogDescription>
                Kuva pysyy Storage:ssa, mutta kysymys-rivi poistetaan.
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
              <Button variant="destructive" onClick={doDelete} disabled={pending}>
                {pending ? "Poistetaan…" : "Poista"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
