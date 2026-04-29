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
import { RuleForm, type ContentOptionsMap, type RuleFormValue } from "./rule-form";
import { deleteRule, toggleRule, type ContentType } from "./actions";

const STRATEGY_LABELS: Record<string, string> = {
  date: "📅 Päivämäärä",
  tag: "🏷️ Tag",
  recurring_daily: "🔁 Joka päivä",
  random: "🎲 Random",
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  quiz: "Visa",
  celebrity: "Julkkis",
  countdown: "Countdown",
  kuvavisa: "Kuvavisa",
};

export function RuleRow({
  row,
  contentLabel,
  contentOptions,
  siteId,
}: {
  row: RuleFormValue;
  contentLabel: string;
  contentOptions: ContentOptionsMap;
  siteId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteRule(row.id!);
      if (!res.ok) setError(res.error);
      else setDelOpen(false);
    });
  }

  function doToggle() {
    startTransition(async () => {
      await toggleRule(row.id!, !row.active);
    });
  }

  const detail =
    row.strategy === "date"
      ? row.scheduled_date
      : row.strategy === "tag"
        ? `#${row.tag}`
        : row.strategy === "random"
          ? `paino ${row.weight}`
          : "—";

  return (
    <TableRow className={row.active ? "" : "opacity-50"}>
      <TableCell className="font-medium">
        {CONTENT_TYPE_LABELS[row.content_type as ContentType]}
      </TableCell>
      <TableCell>{contentLabel}</TableCell>
      <TableCell>{STRATEGY_LABELS[row.strategy] ?? row.strategy}</TableCell>
      <TableCell className="text-muted-foreground">{detail}</TableCell>
      <TableCell>
        <button
          type="button"
          onClick={doToggle}
          disabled={pending}
          className="text-xs underline-offset-2 hover:underline"
        >
          {row.active ? "✓ Aktiivinen" : "○ Pois käytöstä"}
        </button>
      </TableCell>
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
              <DialogTitle>Muokkaa sääntöä</DialogTitle>
              <DialogDescription>
                Muutokset tallentuvat heti kun klikkaat Tallenna.
              </DialogDescription>
            </DialogHeader>
            <RuleForm
              initial={row}
              onDone={() => setEditOpen(false)}
              siteId={siteId}
              contentOptions={contentOptions}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={delOpen} onOpenChange={setDelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Poistetaanko sääntö?</DialogTitle>
              <DialogDescription>
                Tätä ei voi perua. Sisältö pysyy tallessa, vain ajastus poistuu.
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
