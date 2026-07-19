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
import { createKnockout, updateKnockout, type KnockoutInput } from "../actions";

export type KnockoutRow = {
  id: string;
  category: string;
  question: string;
  created_at: string | null;
  diggaa_knockout_options: {
    id: string;
    position: number;
    label: string;
    label_genitive: string | null;
  }[];
};

const CATEGORIES = ["ennuste", "mielipide", "brandi", "urheilu", "viihde"];

type OptionDraft = { id?: string; label: string; label_genitive: string };

function emptyOptions(): OptionDraft[] {
  return Array.from({ length: 8 }, () => ({ label: "", label_genitive: "" }));
}

function KnockoutForm({ initial, onDone }: { initial?: KnockoutRow; onDone: () => void }) {
  const [category, setCategory] = useState(initial?.category ?? "brandi");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [options, setOptions] = useState<OptionDraft[]>(
    initial
      ? initial.diggaa_knockout_options.map((o) => ({
          id: o.id,
          label: o.label,
          label_genitive: o.label_genitive ?? "",
        }))
      : emptyOptions(),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setOption(idx: number, patch: Partial<OptionDraft>) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: KnockoutInput = { category, question, options };
    startTransition(async () => {
      const res = initial
        ? await updateKnockout(initial.id, payload)
        : await createKnockout(payload);
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
        <Label htmlFor="ko-question">Kysymys</Label>
        <Input
          id="ko-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="esim. Mikä on paras Fazerin Sininen -maku?"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>
          8 vaihtoehtoa{" "}
          <span className="font-normal text-muted-foreground">
            (genetiivi recap-tekstiin: &quot;voitti Mintun&quot;)
          </span>
        </Label>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {options.map((o, idx) => (
            <div key={idx} className="grid grid-cols-[1.2rem_1fr_1fr] items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground">{idx + 1}.</span>
              <Input
                value={o.label}
                onChange={(e) => setOption(idx, { label: e.target.value })}
                placeholder="Nimi (esim. Minttu)"
                required
              />
              <Input
                value={o.label_genitive}
                onChange={(e) => setOption(idx, { label_genitive: e.target.value })}
                placeholder="Genetiivi (esim. Mintun)"
                required
              />
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Tallennetaan…" : initial ? "Tallenna" : "Luo Knockout"}
      </Button>
    </form>
  );
}

export function KnockoutSection({ rows }: { rows: KnockoutRow[] }) {
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<KnockoutRow | null>(null);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Knockout ({rows.length})</h2>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm">Uusi Knockout</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Uusi Knockout</DialogTitle>
            </DialogHeader>
            <KnockoutForm onDone={() => setOpenNew(false)} />
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
              {r.diggaa_knockout_options.length} vaihtoehtoa
            </span>
          </button>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-3 text-sm text-muted-foreground">Ei Knockouteja vielä.</p>
        )}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Muokkaa Knockoutia</DialogTitle>
          </DialogHeader>
          {editing && <KnockoutForm initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
