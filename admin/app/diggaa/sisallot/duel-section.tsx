"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDuel, updateDuel, type DuelInput } from "../actions";

export type DuelRow = {
  id: string;
  category: string;
  question: string;
  option_a: string;
  option_b: string;
  created_at: string | null;
};

const CATEGORIES = ["ennuste", "mielipide", "brandi", "urheilu", "viihde"];

function DuelForm({ initial, onDone }: { initial?: DuelRow; onDone: () => void }) {
  const [category, setCategory] = useState(initial?.category ?? "mielipide");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [optionA, setOptionA] = useState(initial?.option_a ?? "");
  const [optionB, setOptionB] = useState(initial?.option_b ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: DuelInput = {
      category,
      question,
      option_a: optionA,
      option_b: optionB,
    };
    startTransition(async () => {
      const res = initial ? await updateDuel(initial.id, payload) : await createDuel(payload);
      if (!res.ok) setError(res.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Kategoria</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="question">Kysymys</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="esim. Onko ananas hyväksyttävää pizzalla?"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="optionA">Vaihtoehto A</Label>
          <Input
            id="optionA"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder="Kyllä"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="optionB">Vaihtoehto B</Label>
          <Input
            id="optionB"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder="Ei"
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Tallennetaan…" : initial ? "Tallenna" : "Luo Duel"}
      </Button>
    </form>
  );
}

export function DuelSection({ rows }: { rows: DuelRow[] }) {
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<DuelRow | null>(null);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Duel ({rows.length})</h2>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm">Uusi Duel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uusi Duel</DialogTitle>
            </DialogHeader>
            <DuelForm onDone={() => setOpenNew(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="divide-y rounded-md border">
        {rows.map((r) => (
          <button
            key={r.id}
            onClick={() => setEditing(r)}
            className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-accent"
          >
            <span className="w-24 shrink-0 text-xs text-muted-foreground">{r.category}</span>
            <span className="flex-1 truncate text-sm font-medium">{r.question}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {r.option_a} vs {r.option_b}
            </span>
          </button>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-3 text-sm text-muted-foreground">Ei Dueleja vielä.</p>
        )}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Muokkaa Duelia</DialogTitle>
          </DialogHeader>
          {editing && <DuelForm initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
