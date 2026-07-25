"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveDef, type DefInput } from "./actions";
import type { Def } from "./entity-form";

const EMPTY: Def = {
  attr_key: "",
  kind: "person",
  theme: "sekoitus",
  subject_label: "KUMPI",
  question_text: "",
  winner: "high",
  easy_gap: 0.45,
  mid_gap: 0.15,
  unit_label: "",
  enabled: true,
};

function DefForm({ initial, isNew, onDone }: { initial: Def; isNew: boolean; onDone: () => void }) {
  const [f, setF] = useState<Def>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const set = (k: keyof Def, v: any) => setF({ ...f, [k]: v });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveDef(f as DefInput, isNew);
      if (!res.ok) setError(res.error);
      else {
        onDone();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-md border bg-muted/30 p-3 text-center">
        <div className="text-xs tracking-[0.3em] text-muted-foreground">
          {f.subject_label || "KUMPI"}
        </div>
        <div className="text-xl font-semibold uppercase">
          {f.question_text || "kysymysteksti tähän"}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Näin kysymys näkyy pelaajalle</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Avain</Label>
          <Input value={f.attr_key} disabled={!isNew} onChange={(e) => set("attr_key", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Laji</Label>
          <Input value={f.kind} onChange={(e) => set("kind", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Otsikon alkuosa</Label>
          <Input
            value={f.subject_label}
            onChange={(e) => set("subject_label", e.target.value.toUpperCase())}
            placeholder="KUMPI KAUPUNKI"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Teema</Label>
          <Input value={f.theme} onChange={(e) => set("theme", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Kysymysteksti (ilman sanaa &quot;kumpi&quot;)</Label>
        <Input
          value={f.question_text}
          onChange={(e) => set("question_text", e.target.value)}
          placeholder="on lähempänä Helsinkiä?"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Voittaja</Label>
          <Select value={f.winner} onValueChange={(v) => set("winner", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Suurempi arvo</SelectItem>
              <SelectItem value="low">Pienempi arvo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Helppo, kun ero ≥</Label>
          <Input
            type="number"
            step="any"
            value={f.easy_gap}
            onChange={(e) => set("easy_gap", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Keski, kun ero ≥</Label>
          <Input
            type="number"
            step="any"
            value={f.mid_gap}
            onChange={(e) => set("mid_gap", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Yksikkö</Label>
          <Input value={f.unit_label ?? ""} onChange={(e) => set("unit_label", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Käytössä</Label>
          <Select value={f.enabled ? "1" : "0"} onValueChange={(v) => set("enabled", v === "1")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Kyllä</SelectItem>
              <SelectItem value="0">Ei</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
      </div>
    </form>
  );
}

export function DefRow({ row, pairs }: { row: Def; pairs: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow className={row.enabled ? "" : "opacity-50"}>
        <TableCell className="font-mono text-xs">{row.attr_key}</TableCell>
        <TableCell>
          <span className="text-xs tracking-widest text-muted-foreground">{row.subject_label}</span>{" "}
          <span className="font-medium">{row.question_text}</span>
        </TableCell>
        <TableCell className="text-muted-foreground">{row.theme}</TableCell>
        <TableCell className="text-muted-foreground">
          {row.winner === "high" ? "suurempi" : "pienempi"}
        </TableCell>
        <TableCell className="text-right tabular-nums">{pairs.toLocaleString("fi-FI")}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            <Pencil />
          </Button>
        </TableCell>
      </TableRow>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{row.attr_key}</DialogTitle>
          </DialogHeader>
          <DefForm initial={row} isNew={false} onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function NewDefButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus /> Uusi attribuutti
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi attribuutti</DialogTitle>
            <DialogDescription>
              Yksi attribuutti = kokonainen uusi kysymyssarja.
            </DialogDescription>
          </DialogHeader>
          <DefForm initial={EMPTY} isNew onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
