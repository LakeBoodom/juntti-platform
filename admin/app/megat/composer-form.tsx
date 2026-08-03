"use client";

// Koosta Mega -lomake: nimi + koko + aihe → automaatti täyttää draftin
// guardraileilla (max 2/lähdevisa, kokoelmat vuorotellen).

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { composeMega } from "./actions";

const SCOPES = [
  ["kaikki", "Kaikki kokoelmat"],
  ["tv", "TV & Suoratoisto"],
  ["urheilu", "Urheilu"],
  ["elokuvat", "Elokuvat"],
  ["musiikki", "Musiikki"],
  ["matkakohteet", "Matkakohteet"],
  ["yleistieto", "Yleistieto"],
  ["tunnetut-henkilot", "Tunnetut henkilöt"],
] as const;

export function ComposerForm() {
  const [title, setTitle] = useState("");
  const [size, setSize] = useState(50);
  const [scope, setScope] = useState("kaikki");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="rounded-md border p-4">
      <div className="mb-3 text-sm font-semibold">Koosta uusi Mega</div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Nimi
          <input
            className="h-9 w-64 rounded-md border bg-background px-3 text-sm text-foreground"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="esim. Urheilu Mega 50"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Koko
          <select className="h-9 rounded-md border bg-background px-2 text-sm text-foreground" value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {[20, 50, 100].map((s) => <option key={s} value={s}>{s} kysymystä</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Aihe
          <select className="h-9 rounded-md border bg-background px-2 text-sm text-foreground" value={scope} onChange={(e) => setScope(e.target.value)}>
            {SCOPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <Button
          disabled={pending || !title.trim()}
          onClick={() => {
            setError(null);
            start(async () => {
              const res = await composeMega({ title, size, scope });
              if (res && !res.ok) setError(res.error);
            });
          }}
        >
          {pending ? "Koostetaan…" : "Koosta ehdotus"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        Automaatti poimii kysymykset julkaistuista visoista: max 2 per lähdevisa, teemat sekoitettuna.
        Mega syntyy draftina — mitään ei julkaista ilman sinua.
      </p>
    </div>
  );
}
