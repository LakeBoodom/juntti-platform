"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntityForm, type Def, type EntityValue } from "./entity-form";
import { deleteEntity } from "./actions";

const STATUS: Record<string, string> = {
  published: "Julkaistu",
  draft: "Luonnos",
  hidden: "Piilotettu",
};

export function EntityRow({ row, defs }: { row: EntityValue & { id: string }; defs: Def[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const attrs = row.fact_attributes ?? [];

  function remove() {
    if (!confirm(`Poistetaanko ${row.name}? Tämä poistaa myös sen attribuutit.`)) return;
    startTransition(async () => {
      await deleteEntity(row.id);
      router.refresh();
    });
  }

  return (
    <>
      <TableRow>
        <TableCell>
          {row.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.image_url} alt="" className="h-9 w-9 rounded object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              —
            </div>
          )}
        </TableCell>
        <TableCell className="font-medium">
          {row.name}
          {row.role_label && (
            <span className="ml-2 text-xs text-muted-foreground">
              {row.role_label}
              {!row.show_role && " (piilotettu)"}
            </span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">{row.kind}</TableCell>
        <TableCell className="text-sm">
          {attrs.length ? (
            attrs.map((a) => (
              <span key={a.attr_key} className="mr-2 inline-block rounded bg-muted px-1.5 py-0.5 text-xs">
                {a.attr_key}: {a.display_value ?? a.num_value}
              </span>
            ))
          ) : (
            <span className="text-destructive">ei attribuutteja</span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">{STATUS[row.status] ?? row.status}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="sm" onClick={remove} disabled={pending}>
            <Trash2 />
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{row.name}</DialogTitle>
          </DialogHeader>
          <EntityForm initial={row} defs={defs} onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
