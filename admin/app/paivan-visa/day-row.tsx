"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Calendar, Plus, Sparkles, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setQuizForDate, clearQuizForDate } from "./actions";

type QuizOption = { id: string; title: string; category: string; status: string };

const WEEKDAYS = ["su", "ma", "ti", "ke", "to", "pe", "la"];

export function DayRow({
  date,
  isoDate,
  siteId,
  currentQuiz,
  quizOptions,
}: {
  date: Date;
  isoDate: string;
  siteId: string;
  currentQuiz: { id: string; title: string; category: string } | null;
  quizOptions: QuizOption[];
}) {
  const [setOpen, setSetOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string>(currentQuiz?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    if (!selectedQuizId) {
      setError("Valitse visa");
      return;
    }
    startTransition(async () => {
      const res = await setQuizForDate(siteId, isoDate, selectedQuizId);
      if (!res.ok) setError(res.error);
      else setSetOpen(false);
    });
  }

  function doClear() {
    startTransition(async () => {
      await clearQuizForDate(siteId, isoDate);
    });
  }

  const isToday = isoDate === new Date().toISOString().slice(0, 10);
  const dayLabel = `${date.getDate()}.${date.getMonth() + 1}.`;
  const weekday = WEEKDAYS[date.getDay()];

  return (
    <TableRow className={isToday ? "bg-amber-50/30 dark:bg-amber-950/20" : ""}>
      <TableCell className="font-medium">
        <div>{dayLabel}</div>
        <div className="text-xs text-muted-foreground">
          {weekday}
          {isToday && <span className="ml-1 text-amber-600">tänään</span>}
        </div>
      </TableCell>
      <TableCell>
        {currentQuiz ? (
          <Link
            href={`/quizzes/${currentQuiz.id}`}
            className="font-medium hover:underline"
          >
            {currentQuiz.title}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground italic">— tyhjä —</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {currentQuiz?.category ?? ""}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex gap-1">
          <Button
            variant={currentQuiz ? "outline" : "default"}
            size="sm"
            onClick={() => setSetOpen(true)}
          >
            <Calendar className="h-3.5 w-3.5" />
            {currentQuiz ? "Vaihda" : "Aseta visa"}
          </Button>
          <Link href={`/quizzes/new?scheduled_for=${isoDate}`}>
            <Button variant="ghost" size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              Luo AI:lla
            </Button>
          </Link>
          {currentQuiz && (
            <Button
              variant="ghost"
              size="icon"
              onClick={doClear}
              disabled={pending}
              aria-label="Poista visa tältä päivältä"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <Dialog open={setOpen} onOpenChange={setSetOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aseta visa: {dayLabel}</DialogTitle>
              <DialogDescription>
                Valitse olemassa oleva visa joka näytetään tällä päivällä.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
                <SelectTrigger>
                  <SelectValue placeholder="Valitse visa..." />
                </SelectTrigger>
                <SelectContent>
                  {quizOptions.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      Ei visoja tällä sitellä
                    </SelectItem>
                  ) : (
                    quizOptions.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        [{q.status === "published" ? "✓" : "·"}] {q.title}{" "}
                        {q.category && (
                          <span className="text-muted-foreground">— {q.category}</span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                ✓ = julkaistu · · = draft. Voit valita myös draftin — julkaisu tehdään
                erikseen visan muokkaussivulla.
              </p>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSetOpen(false)}>
                Peruuta
              </Button>
              <Button onClick={save} disabled={pending || !selectedQuizId}>
                {pending ? "Tallennetaan…" : "Tallenna"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
