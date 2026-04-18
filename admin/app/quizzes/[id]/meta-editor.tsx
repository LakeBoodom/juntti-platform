"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateQuizMeta } from "./actions";

export function MetaEditor({
  id,
  initial,
}: {
  id: string;
  initial: { title: string; description: string | null };
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateQuizMeta(id, {
        title: title.trim(),
        description: description.trim(),
      });
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil /> Muokkaa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-4">
      <div className="space-y-1.5">
        <Label>Otsikko</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Kuvaus</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setEditing(false);
            setTitle(initial.title);
            setDescription(initial.description ?? "");
            setError(null);
          }}
        >
          <X /> Peruuta
        </Button>
        <Button onClick={save} disabled={pending}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
      </div>
    </div>
  );
}
