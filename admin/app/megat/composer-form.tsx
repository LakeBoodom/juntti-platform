"use client";

// Koosta Mega -lomake (Heikki 4.8.2026): nimi + koko + TEEMAVALINNAT —
// valintaruuduilla mukaan otettavat visakokoelmat ja kuvakortistot.
// Esim. "Viihteen Mega" = Henkilöt + TV + Elokuvat (+ vaikka Liput).

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { composeMega } from "./actions";

const COLLECTIONS: Array<[string, string]> = [
  ["tv", "TV & Suoratoisto"],
  ["urheilu", "Urheilu"],
  ["elokuvat", "Elokuvat"],
  ["musiikki", "Musiikki"],
  ["matkakohteet", "Matkakohteet"],
  ["yleistieto", "Yleistieto"],
  ["tunnetut-henkilot", "Tunnetut henkilöt"],
];
const DECKS: Array<[string, string]> = [
  ["liput", "🖼 Liput"],
  ["vaakunat", "🖼 Vaakunat"],
  ["linnut", "🖼 Linnut"],
  ["elaimet", "🖼 Eläimet"],
];

export function ComposerForm() {
  const [title, setTitle] = useState("");
  const [size, setSize] = useState(50);
  const [collections, setCollections] = useState<Set<string>>(new Set(COLLECTIONS.map(([v]) => v)));
  const [decks, setDecks] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, v: string) {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setter(next);
  }

  const nothingSelected = collections.size + decks.size === 0;

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
            placeholder="esim. Viihteen Mega"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Koko
          <select className="h-9 rounded-md border bg-background px-2 text-sm text-foreground" value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {[20, 50, 100].map((s) => <option key={s} value={s}>{s} kysymystä</option>)}
          </select>
        </label>
        <Button
          disabled={pending || !title.trim() || nothingSelected}
          onClick={() => {
            setError(null);
            start(async () => {
              const res = await composeMega({ title, size, collections: [...collections], decks: [...decks] });
              if (res && !res.ok) setError(res.error);
            });
          }}
        >
          {pending ? "Koostetaan…" : "Koosta ehdotus"}
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">Teemat mukaan</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {COLLECTIONS.map(([v, l]) => (
            <label key={v} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input type="checkbox" checked={collections.has(v)} onChange={() => toggle(collections, setCollections, v)} />
              {l}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {DECKS.map(([v, l]) => (
            <label key={v} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input type="checkbox" checked={decks.has(v)} onChange={() => toggle(decks, setDecks, v)} />
              {l}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        Automaatti poimii valituista teemoista: max 2 per lähdevisa/kortisto, teemat vuorotellen.
        Mega syntyy draftina — mitään ei julkaista ilman sinua. Voit muokata rivejä editorissa vapaasti.
      </p>
    </div>
  );
}
