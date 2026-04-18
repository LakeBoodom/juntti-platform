"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { deleteScheduleRow } from "./actions";

export function ScheduleRow({
  id,
  dateIso,
  weekdayLabel,
  platform,
  quizTitle,
  quizCategory,
  isToday,
}: {
  id: string;
  dateIso: string;
  weekdayLabel: string;
  platform: string;
  quizTitle: string;
  quizCategory: string;
  isToday: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteScheduleRow(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <TableRow>
      <TableCell className={isToday ? "font-semibold text-primary" : ""}>
        {weekdayLabel}
        {isToday && (
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            tänään
          </span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{dateIso}</TableCell>
      <TableCell>{platform}</TableCell>
      <TableCell>
        {quizTitle}
        <span className="ml-2 text-xs text-muted-foreground">
          {quizCategory}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={doDelete}
          disabled={pending}
          aria-label="Poista"
        >
          <Trash2 />
        </Button>
        {error && (
          <span className="ml-2 text-xs text-destructive">{error}</span>
        )}
      </TableCell>
    </TableRow>
  );
}
