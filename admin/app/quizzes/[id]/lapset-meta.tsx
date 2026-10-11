"use client";

// Kohderyhmä ja lasten visan asetukset (vaihe 6): target_age, lukija (juontaja) ja lasten_aihe.
// Lasten visa (4–7 / 8–12) näytetään sivustolla omalla pelinäkymällä ja /lapset-sivulla.
import { useState, useTransition } from "react";
import { Baby, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KOHDERYHMAT, LASTEN_AIHEET, LUKIJAT, onLastenVisa } from "@/lib/lapset";
import { updateLastenMeta } from "./actions";

const valinta =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LapsetMeta({
  id,
  initial,
}: {
  id: string;
  initial: { target_age: string | null; lukija: string | null; lasten_aihe: string | null };
}) {
  const [editing, setEditing] = useState(false);
  const [ika, setIka] = useState(initial.target_age ?? "kaikki");
  const [lukija, setLukija] = useState(initial.lukija ?? "");
  const [aihe, setAihe] = useState(initial.lasten_aihe ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const lapset = onLastenVisa(ika);
  const tunnettuAihe = LASTEN_AIHEET.some((a) => a.value === aihe);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateLastenMeta(id, { target_age: ika, lukija, lasten_aihe: aihe });
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  function cancel() {
    setEditing(false);
    setIka(initial.target_age ?? "kaikki");
    setLukija(initial.lukija ?? "");
    setAihe(initial.lasten_aihe ?? "");
    setError(null);
  }

  const ikaNimi = KOHDERYHMAT.find((k) => k.value === ika)?.label ?? ika;

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-md border p-4">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Baby className="h-4 w-4 text-muted-foreground" /> Kohderyhmä: {ikaNimi}
          </div>
          {lapset && (
            <div className="text-muted-foreground">
              Lukija: {LUKIJAT.find((l) => l.value === lukija)?.label ?? "—"} · Aihe:{" "}
              {LASTEN_AIHEET.find((a) => a.value === aihe)?.label ?? (aihe || "—")}
            </div>
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
        <Label htmlFor={`ika-${id}`}>Kohderyhmä</Label>
        <select id={`ika-${id}`} value={ika} onChange={(e) => setIka(e.target.value)} className={valinta}>
          {KOHDERYHMAT.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Lasten visa (4–7 tai 8–12) pelataan sivustolla lasten pelinäkymässä, ja se näkyy /lapset-sivulla.
        </p>
      </div>

      {lapset && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`lukija-${id}`}>Lukija</Label>
            <select id={`lukija-${id}`} value={lukija} onChange={(e) => setLukija(e.target.value)} className={valinta}>
              <option value="">Valitse…</option>
              {LUKIJAT.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Juontaja, joka lukee kysymykset, reaktiot ja tuloksen.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`aihe-${id}`}>Aihe /lapset-sivulla</Label>
            <select
              id={`aihe-${id}`}
              value={tunnettuAihe || !aihe ? aihe : "__muu"}
              onChange={(e) => setAihe(e.target.value === "__muu" ? aihe : e.target.value)}
              className={valinta}
            >
              <option value="">Ei aihetta</option>
              {LASTEN_AIHEET.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
              {!tunnettuAihe && aihe && <option value="__muu">{aihe}</option>}
            </select>
            <p className="text-xs text-muted-foreground">Joulu-aiheinen visa nostetaan sivuilla joulun alla.</p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={cancel}>
          <X /> Peruuta
        </Button>
        <Button onClick={save} disabled={pending}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
      </div>
    </div>
  );
}
