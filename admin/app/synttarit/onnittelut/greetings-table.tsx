"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RECIPIENTS, STATUS_LABEL, TONES, type Recipient, type Status, type Tone } from "@/lib/synttarit";
import { saveGreeting, setGreetingStatus } from "./actions";

export type GreetingRow = {
  id: string;
  age: number | null;
  tone: Tone;
  recipient: Recipient;
  text: string;
  sort: number;
  status: Status;
};

const SELECT =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function GreetingForm({ initial, onDone }: { initial: Partial<GreetingRow>; onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [age, setAge] = useState(initial.age != null ? String(initial.age) : "");
  const [tone, setTone] = useState<Tone>(initial.tone ?? "lämmin");
  const [recipient, setRecipient] = useState<Recipient>(initial.recipient ?? "kaikille");
  const [text, setText] = useState(initial.text ?? "");
  const [sort, setSort] = useState(String(initial.sort ?? 0));
  const [status, setStatus] = useState<Status>(initial.status ?? "draft");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveGreeting(initial.id ?? null, {
        age: age.trim() === "" ? null : Number(age),
        tone,
        recipient,
        text,
        sort: Number(sort) || 0,
        status,
      });
      if (!res.ok) setError(res.error ?? "Tuntematon virhe");
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="g-text">Onnitteluteksti *</Label>
        <Textarea id="g-text" value={text} onChange={(e) => setText(e.target.value)} rows={5} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="g-age">Ikä</Label>
          <Input id="g-age" type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Tyhjä = yleinen" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-sort">Järjestys</Label>
          <Input id="g-sort" type="number" value={sort} onChange={(e) => setSort(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-tone">Sävy</Label>
          <select id="g-tone" className={`${SELECT} w-full`} value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
            {TONES.map((t) => <option key={t} value={t}>{cap(t)}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-rec">Vastaanottaja</Label>
          <select id="g-rec" className={`${SELECT} w-full`} value={recipient} onChange={(e) => setRecipient(e.target.value as Recipient)}>
            {RECIPIENTS.map((r) => <option key={r} value={r}>{cap(r)}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g-status">Tila</Label>
          <select id="g-status" className={`${SELECT} w-full`} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="draft">Luonnos</option>
            <option value="published">Julkaistu</option>
          </select>
        </div>
      </div>
      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Peruuta</Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>{pending ? "Tallennetaan…" : "Tallenna"}</Button>
      </DialogFooter>
    </form>
  );
}

function StatusToggle({ row }: { row: GreetingRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: Status = row.status === "published" ? "draft" : "published";
  return (
    <button
      type="button"
      disabled={pending}
      title={next === "published" ? "Julkaise" : "Palauta luonnokseksi"}
      onClick={() =>
        startTransition(async () => {
          await setGreetingStatus(row.id, next);
          router.refresh();
        })
      }
      className={`rounded px-2 py-0.5 text-xs font-semibold ${
        row.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
      } ${pending ? "opacity-50" : ""}`}
    >
      {STATUS_LABEL[row.status]}
    </button>
  );
}

export function GreetingsTable({
  rows,
  ages,
  filters,
}: {
  rows: GreetingRow[];
  ages: number[];
  filters: { ika: string; savy: string; vastaanottaja: string };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<GreetingRow> | null>(null);

  function setFilter(key: keyof typeof filters, value: string) {
    const next = { ...filters, [key]: value };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v)).toString();
    router.push(`/synttarit/onnittelut${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="block text-xs font-medium">Ikä</span>
          <select className={SELECT} value={filters.ika} onChange={(e) => setFilter("ika", e.target.value)}>
            <option value="">Kaikki</option>
            <option value="yleinen">Yleiset</option>
            {ages.map((a) => <option key={a} value={a}>{a} v</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="block text-xs font-medium">Sävy</span>
          <select className={SELECT} value={filters.savy} onChange={(e) => setFilter("savy", e.target.value)}>
            <option value="">Kaikki</option>
            {TONES.map((t) => <option key={t} value={t}>{cap(t)}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="block text-xs font-medium">Vastaanottaja</span>
          <select className={SELECT} value={filters.vastaanottaja} onChange={(e) => setFilter("vastaanottaja", e.target.value)}>
            <option value="">Kaikki</option>
            {RECIPIENTS.map((r) => <option key={r} value={r}>{cap(r)}</option>)}
          </select>
        </label>
        <span className="pb-2 text-sm text-muted-foreground">{rows.length} onnittelua</span>
        <div className="ml-auto">
          <Button
            onClick={() =>
              setEditing({
                age: /^\d+$/.test(filters.ika) ? Number(filters.ika) : null,
                tone: (filters.savy as Tone) || undefined,
                recipient: (filters.vastaanottaja as Recipient) || undefined,
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Uusi onnittelu
          </Button>
        </div>
      </div>

      {!rows.length ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Ei onnitteluja näillä valinnoilla.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ikä</TableHead>
                <TableHead>Teksti</TableHead>
                <TableHead className="w-24">Sävy</TableHead>
                <TableHead className="w-28">Kenelle</TableHead>
                <TableHead className="w-24">Tila</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{r.age ?? "–"}</TableCell>
                  <TableCell className="whitespace-pre-line text-sm">{r.text}</TableCell>
                  <TableCell className="text-sm">{cap(r.tone)}</TableCell>
                  <TableCell className="text-sm">{cap(r.recipient)}</TableCell>
                  <TableCell><StatusToggle row={r} /></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" aria-label="Muokkaa" onClick={() => setEditing(r)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Muokkaa onnittelua" : "Uusi onnittelu"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <GreetingForm
              key={editing.id ?? "uusi"}
              initial={editing}
              onDone={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
