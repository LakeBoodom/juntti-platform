"use client";

import { useState, useTransition } from "react";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setCountdownQuizzes } from "./actions";

export type AttachableQuiz = {
  id: string;
  title: string;
  category: string;
};

/**
 * Pinnalla nyt: tapahtumaan tägätyt visat.
 * Valintajärjestys = rotaatiojärjestys (päivä 1 → visa 1, päivä 2 → visa 2, ...).
 */
export function QuizAttach({
  countdownId,
  countdownName,
  allQuizzes,
  attachedIds,
}: {
  countdownId: string;
  countdownName: string;
  allQuizzes: AttachableQuiz[];
  attachedIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(attachedIds);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await setCountdownQuizzes(countdownId, selected);
      if (!res.ok) setError(res.error);
      else setOpen(false);
    });
  }

  const visible = filter
    ? allQuizzes.filter(
        (q) =>
          q.title.toLowerCase().includes(filter.toLowerCase()) ||
          q.category.toLowerCase().includes(filter.toLowerCase()),
      )
    : allQuizzes;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setSelected(attachedIds); setOpen(true); }}>
        <ListChecks className="mr-1 h-4 w-4" />
        {attachedIds.length > 0 ? `${attachedIds.length} visaa` : "Tägää visat"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Visat: {countdownName}</DialogTitle>
            <DialogDescription>
              Valitse tapahtumaan kuuluvat visat. Rotaatio näyttää joka päivä eri visan
              valintajärjestyksessä.
            </DialogDescription>
          </DialogHeader>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Suodata otsikolla tai kategorialla…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="max-h-80 space-y-1 overflow-y-auto rounded-md border p-2">
            {visible.length === 0 && (
              <p className="p-2 text-sm text-muted-foreground">Ei osumia.</p>
            )}
            {visible.map((q) => {
              const idx = selected.indexOf(q.id);
              return (
                <label
                  key={q.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={idx >= 0}
                    onChange={() => toggle(q.id)}
                  />
                  <span className="flex-1">{q.title}</span>
                  <span className="text-xs text-muted-foreground">{q.category}</span>
                  {idx >= 0 && (
                    <span className="rounded-full bg-muted px-1.5 text-xs font-semibold">
                      {idx + 1}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Peruuta
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? "Tallennetaan…" : `Tallenna (${selected.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
