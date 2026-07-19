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
import { createSwipeDeck, updateSwipeDeck, type SwipeDeckInput, type SwipeCardInput } from "../actions";

export type DeckRow = {
  id: string;
  title: string;
  category: string;
  created_at: string | null;
  diggaa_swipe_cards: {
    id: string;
    position: number;
    card_type: string;
    kicker: string | null;
    title: string;
    subtitle: string | null;
    emblem: string | null;
  }[];
};

const CATEGORIES = ["ennuste", "mielipide", "brandi", "urheilu", "viihde"];

type CardDraft = SwipeCardInput;

function emptyCard(): CardDraft {
  return { card_type: "opinion", kicker: "", title: "", subtitle: "", emblem: "" };
}

function SwipeForm({ initial, onDone }: { initial?: DeckRow; onDone: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "viihde");
  const [cards, setCards] = useState<CardDraft[]>(
    initial
      ? initial.diggaa_swipe_cards.map((c) => ({
          id: c.id,
          card_type: (c.card_type as "opinion" | "visual") ?? "opinion",
          kicker: c.kicker ?? "",
          title: c.title,
          subtitle: c.subtitle ?? "",
          emblem: c.emblem ?? "",
        }))
      : [emptyCard(), emptyCard(), emptyCard()],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setCard(idx: number, patch: Partial<CardDraft>) {
    setCards((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: SwipeDeckInput = { title, category, cards };
    startTransition(async () => {
      const res = initial
        ? await updateSwipeDeck(initial.id, payload)
        : await createSwipeDeck(payload);
      if (!res.ok) setError(res.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-[1fr_10rem] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="deck-title">Kierroksen otsikko</Label>
          <Input
            id="deck-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="esim. Kesäpulssi"
            required
          />
        </div>
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
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Kortit ({cards.length})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCards((prev) => [...prev, emptyCard()])}
          >
            + Lisää kortti
          </Button>
        </div>
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {cards.map((c, idx) => (
            <div key={idx} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Kortti {idx + 1}</span>
                <Select
                  value={c.card_type}
                  onValueChange={(v) => setCard(idx, { card_type: v as "opinion" | "visual" })}
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opinion">opinion</SelectItem>
                    <SelectItem value="visual">visual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={c.kicker}
                  onChange={(e) => setCard(idx, { kicker: e.target.value })}
                  placeholder="Kicker (esim. KESÄ 2026)"
                />
                <Input
                  value={c.emblem}
                  onChange={(e) => setCard(idx, { emblem: e.target.value })}
                  placeholder="Emoji/emblem (visual-korteille)"
                />
              </div>
              <Input
                value={c.title}
                onChange={(e) => setCard(idx, { title: e.target.value })}
                placeholder="Otsikko"
                required
              />
              <Input
                value={c.subtitle}
                onChange={(e) => setCard(idx, { subtitle: e.target.value })}
                placeholder="Alaotsikko (valinnainen)"
              />
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Tallennetaan…" : initial ? "Tallenna" : "Luo kierros"}
      </Button>
    </form>
  );
}

export function SwipeSection({ rows }: { rows: DeckRow[] }) {
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<DeckRow | null>(null);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Swipe-kierrokset ({rows.length})</h2>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm">Uusi kierros</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Uusi Swipe-kierros</DialogTitle>
            </DialogHeader>
            <SwipeForm onDone={() => setOpenNew(false)} />
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
            <span className="flex-1 truncate text-sm font-medium">{r.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {r.diggaa_swipe_cards.length} korttia
            </span>
          </button>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-3 text-sm text-muted-foreground">Ei kierroksia vielä.</p>
        )}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Muokkaa kierrosta</DialogTitle>
          </DialogHeader>
          {editing && <SwipeForm initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
