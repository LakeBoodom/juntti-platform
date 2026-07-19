"use client";

import { useMemo, useState, useTransition } from "react";
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
import { createPublication, type PublicationInput } from "../actions";
import type { DiggaaContentSummary, DiggaaContentType } from "@/lib/diggaa";

const FORMAT_NAMES: Record<string, string> = {
  duel: "Duel",
  swipe_deck: "Swipe-kierros",
  knockout: "Knockout",
};

const PRESETS = [
  { key: "1h", label: "1 tunti" },
  { key: "6h", label: "6 tuntia" },
  { key: "24h", label: "Vuorokausi" },
  { key: "7d", label: "Viikko" },
  { key: "custom", label: "Oma aikaväli" },
];

/** datetime-local-kentän oletusarvo: nyt lähimpään varttiin pyöristettynä */
function defaultLocal(): string {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NewPublicationButton({ content }: { content: DiggaaContentSummary[] }) {
  const [open, setOpen] = useState(false);
  const [contentKey, setContentKey] = useState<string>("");
  const [opensAt, setOpensAt] = useState<string>(defaultLocal());
  const [preset, setPreset] = useState("24h");
  const [closesAt, setClosesAt] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "scheduled">("scheduled");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<string, DiggaaContentSummary[]>();
    for (const c of content) {
      const arr = map.get(c.type) ?? [];
      arr.push(c);
      map.set(c.type, arr);
    }
    return map;
  }, [content]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const [type, id] = contentKey.split("|");
    const selected = content.find((c) => c.type === type && c.id === id);
    if (!selected) {
      setError("Valitse sisältö");
      return;
    }
    const payload: PublicationInput = {
      content_type: type as DiggaaContentType,
      content_id: id,
      title: selected.title,
      opens_at: new Date(opensAt).toISOString(),
      duration_preset: preset,
      closes_at: preset === "custom" && closesAt ? new Date(closesAt).toISOString() : null,
      status,
    };
    startTransition(async () => {
      const res = await createPublication(payload);
      if (!res.ok) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Uusi julkaisu</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uusi julkaisu</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Sisältö</Label>
            <Select value={contentKey} onValueChange={setContentKey}>
              <SelectTrigger>
                <SelectValue placeholder="Valitse sisältö…" />
              </SelectTrigger>
              <SelectContent>
                {[...grouped.entries()].map(([type, items]) => (
                  <div key={type}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {FORMAT_NAMES[type] ?? type}
                    </div>
                    {items.map((c) => (
                      <SelectItem key={c.id} value={`${c.type}|${c.id}`}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opens">Avautuu</Label>
            <Input
              id="opens"
              type="datetime-local"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Äänestys auki</Label>
              <Select value={preset} onValueChange={setPreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESETS.map((p) => (
                    <SelectItem key={p.key} value={p.key}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {preset === "custom" && (
              <div className="space-y-1.5">
                <Label htmlFor="closes">Sulkeutuu</Label>
                <Input
                  id="closes"
                  type="datetime-local"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Tila</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "scheduled")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Ajastettu (menee liveksi ajallaan)</SelectItem>
                <SelectItem value="draft">Luonnos (ei mene liveksi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Tallennetaan…" : "Luo julkaisu"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
